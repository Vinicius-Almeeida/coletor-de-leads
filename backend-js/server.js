const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const helmet = require("helmet");
const {
  limiter,
  searchLimiter,
  statusLimiter,
  validateInput,
} = require("./middleware/security");
const { searchGooglePlaces } = require("./services/googlePlaces");
const { enrichDataWithScraping } = require("./services/scraper");
const { generateExcelFile } = require("./services/excelGenerator");
const Lead = require("./models/Lead");
const { Op } = require("sequelize"); // Op (Operadores) é necessário para filtros avançados

// Importa e inicializa a conexão com o banco de dados
const sequelize = require("./db/connection");

const app = express();
const PORT = process.env.PORT || 3001;

// Security middleware
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    crossOriginEmbedderPolicy: false,
  })
);
app.use(limiter);

// Configuração CORS simplificada para resolver problemas de produção
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "OPTIONS", "PUT", "DELETE"],
    allowedHeaders: [
      "Content-Type",
      "Accept",
      "Authorization",
      "X-Requested-With",
    ],
    credentials: true,
  })
);

app.use(express.json({ limit: "10mb" }));

// Headers CORS para todas as respostas
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Content-Type,Authorization,X-Requested-With"
  );
  res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE,OPTIONS");
  res.header("Access-Control-Allow-Credentials", "true");
  res.header("Cache-Control", "no-cache, no-store, must-revalidate");
  res.header("Pragma", "no-cache");
  res.header("Expires", "0");
  next();
});

// Sistema multi-usuário
const activeSearches = new Map(); // searchId -> searchStatus
const searchCache = {}; // Cache global compartilhado
const allSearches = {
  searches: [],
  total_leads: 0,
  segments: {},
};

// Gerar ID único para busca
function generateSearchId() {
  return `search_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Limpar buscas antigas (mais de 1 hora)
function cleanupOldSearches() {
  const oneHourAgo = Date.now() - 60 * 60 * 1000;
  for (const [searchId, searchStatus] of activeSearches.entries()) {
    if (searchStatus.timestamp < oneHourAgo) {
      activeSearches.delete(searchId);
      console.log(`🧹 Busca antiga removida: ${searchId}`);
    }
  }
}

// Limpar buscas antigas a cada 30 minutos
setInterval(cleanupOldSearches, 30 * 60 * 1000);

// Remover variáveis globais antigas - agora usando sistema multi-usuário

// Endpoints
app.get("/api/health", (req, res) => {
  res.json({
    status: "healthy",
    message: "Coletor de Leads funcionando!",
    timestamp: new Date().toISOString(),
    api_key_configured: !!process.env.GOOGLE_PLACES_API_KEY,
  });
});

app.get("/api/test", (req, res) => {
  res.json({
    message: "Backend funcionando!",
    timestamp: new Date().toISOString(),
    user_agent: req.headers["user-agent"] || "Unknown",
    origin: req.headers["origin"] || "Unknown",
    host: req.headers["host"] || "Unknown",
    cors_headers: {
      "Access-Control-Allow-Origin": res.getHeader(
        "Access-Control-Allow-Origin"
      ),
      "Access-Control-Allow-Methods": res.getHeader(
        "Access-Control-Allow-Methods"
      ),
      "Access-Control-Allow-Headers": res.getHeader(
        "Access-Control-Allow-Headers"
      ),
    },
    active_searches: activeSearches.size,
  });
});

app.post("/api/search", searchLimiter, validateInput, async (req, res) => {
  try {
    console.log("🔍 Recebida requisição de busca:", req.body);
    const { nicho, cidade } = req.body;

    console.log(`📋 Nicho: ${nicho}, Cidade: ${cidade}`);

    if (!nicho || !cidade) {
      console.log("❌ Nicho ou cidade não fornecidos");
      return res.status(400).json({ error: "Nicho e cidade são obrigatórios" });
    }

    // Gerar ID único para esta busca
    const searchId = generateSearchId();

    // Criar status único para esta busca
    const searchStatus = {
      searchId,
      running: true,
      phase: "Iniciando busca...",
      progress: 0.0,
      total: 0,
      found: 0,
      current_item: "",
      elapsed_time: 0,
      results: [],
      current_nicho: nicho,
      timestamp: Date.now(),
    };

    // Armazenar busca ativa
    activeSearches.set(searchId, searchStatus);

    console.log(`✅ Busca ${searchId} iniciada para: ${nicho} em ${cidade}`);
    console.log(`📊 Buscas ativas: ${activeSearches.size}`);

    // Executar busca em background
    realSearch(searchId, nicho, cidade);

    console.log("🚀 Busca iniciada");
    res.json({
      message: "Busca iniciada",
      status: "running",
      searchId: searchId,
    });
  } catch (error) {
    console.error("❌ Erro ao iniciar busca:", error);
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/status", statusLimiter, (req, res) => {
  const { searchId } = req.query;

  if (!searchId) {
    return res.status(400).json({
      error: "searchId é obrigatório",
      activeSearches: Array.from(activeSearches.keys()),
    });
  }

  const searchStatus = activeSearches.get(searchId);

  if (!searchStatus) {
    return res.status(404).json({
      error: "Busca não encontrada",
      searchId: searchId,
      activeSearches: Array.from(activeSearches.keys()),
    });
  }

  res.json(searchStatus);
});

app.post("/api/stop", (req, res) => {
  const { searchId } = req.body;

  if (!searchId) {
    return res.status(400).json({ error: "searchId é obrigatório" });
  }

  console.log(`⏹️ Parando busca ${searchId}...`);

  const searchStatus = activeSearches.get(searchId);

  if (!searchStatus) {
    return res.status(404).json({ error: "Busca não encontrada" });
  }

  searchStatus.running = false;
  searchStatus.phase = "Busca interrompida pelo usuário";
  searchStatus.progress = 0;

  console.log(`✅ Busca ${searchId} interrompida com sucesso`);

  res.json({
    message: "Busca interrompida",
    status: "stopped",
    phase: searchStatus.phase,
    searchId: searchId,
  });
});

app.get("/api/download", async (req, res) => {
  try {
    const { searchId } = req.query;

    if (!searchId) {
      return res.status(400).json({ error: "searchId é obrigatório" });
    }

    const searchStatus = activeSearches.get(searchId);

    if (!searchStatus) {
      return res.status(404).json({ error: "Busca não encontrada" });
    }

    if (!searchStatus.results || searchStatus.results.length === 0) {
      return res.status(400).json({ error: "Nenhum resultado para download" });
    }

    const buffer = await generateExcelFile(searchStatus.results, "leads");

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=leads_${searchId}_${Date.now()}.xlsx`
    );
    res.send(buffer);
  } catch (error) {
    console.error("❌ Erro no download:", error);
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/dashboard-data", async (req, res) => {
  try {
    // 1. Contar o total de leads na tabela
    const totalLeads = await Lead.count();

    // 2. Buscar os nichos distintos e contar quantos leads cada um tem
    const segmentsData = await Lead.findAll({
      attributes: [
        "nicho",
        [sequelize.fn("COUNT", sequelize.col("nicho")), "count"],
      ],
      group: ["nicho"],
      where: {
        nicho: {
          [Op.ne]: null, // Filtra para garantir que não contamos nichos nulos
        },
      },
    });

    // 3. Contar o número de segmentos (nichos) distintos
    const totalSegments = segmentsData.length;

    // 4. Montar o objeto de resposta final para o frontend
    // Converter array para objeto para compatibilidade com o frontend existente
    const segmentsObject = {};
    segmentsData.forEach((item) => {
      const plainItem = item.get({ plain: true });
      segmentsObject[plainItem.nicho] = parseInt(plainItem.count, 10);
    });

    const dashboardData = {
      total_leads: totalLeads,
      total_segments: totalSegments,
      segments: segmentsObject, // Agora é um objeto {segmento: total}
      // A métrica 'total_searches' ficará como 0 por enquanto, pois é um cálculo mais complexo
      total_searches: 0,
    };

    res.status(200).json(dashboardData);
  } catch (error) {
    console.error("❌ Erro ao buscar dados para o dashboard:", error);
    res
      .status(500)
      .json({ error: "Ocorreu um erro ao buscar os dados do dashboard." });
  }
});

app.get("/api/whatsapp-leads", (req, res) => {
  // Coletar todos os leads com WhatsApp de todas as buscas ativas e cache
  let allWhatsappLeads = [];

  // Buscar leads com WhatsApp das buscas ativas
  for (const [searchId, searchStatus] of activeSearches.entries()) {
    if (searchStatus.results && searchStatus.results.length > 0) {
      const whatsappLeads = searchStatus.results
        .filter((lead) => lead.whatsapp)
        .map((lead) => ({
          ...lead,
          empresa: lead.nome,
          segmento: searchStatus.current_nicho || "Geral",
        }));

      allWhatsappLeads = [...allWhatsappLeads, ...whatsappLeads];
    }
  }

  // Buscar leads com WhatsApp do cache global (para compatibilidade)
  Object.entries(searchCache).forEach(([cacheKey, companies]) => {
    const nicho = cacheKey.split("_")[0]; // Extrair nicho da chave do cache
    const whatsappLeads = companies
      .filter((lead) => lead.whatsapp)
      .map((lead) => ({
        ...lead,
        empresa: lead.nome,
        segmento: nicho || "Geral",
      }));

    allWhatsappLeads = [...allWhatsappLeads, ...whatsappLeads];
  });

  // Remover duplicatas baseado no nome da empresa
  const uniqueLeads = allWhatsappLeads.filter(
    (lead, index, self) => index === self.findIndex((l) => l.nome === lead.nome)
  );

  res.json({
    total_whatsapp_leads: uniqueLeads.length,
    leads: uniqueLeads,
  });
});

app.get("/api/download-whatsapp-leads", async (req, res) => {
  try {
    // Coletar todos os leads com WhatsApp de todas as buscas ativas e cache
    let allWhatsappLeads = [];

    // Buscar leads com WhatsApp das buscas ativas
    for (const [searchId, searchStatus] of activeSearches.entries()) {
      if (searchStatus.results && searchStatus.results.length > 0) {
        const whatsappLeads = searchStatus.results
          .filter((lead) => lead.whatsapp)
          .map((lead) => ({
            ...lead,
            empresa: lead.nome,
            segmento: searchStatus.current_nicho || "Geral",
          }));

        allWhatsappLeads = [...allWhatsappLeads, ...whatsappLeads];
      }
    }

    // Buscar leads com WhatsApp do cache global (para compatibilidade)
    Object.entries(searchCache).forEach(([cacheKey, companies]) => {
      const nicho = cacheKey.split("_")[0]; // Extrair nicho da chave do cache
      const whatsappLeads = companies
        .filter((lead) => lead.whatsapp)
        .map((lead) => ({
          ...lead,
          empresa: lead.nome,
          segmento: nicho || "Geral",
        }));

      allWhatsappLeads = [...allWhatsappLeads, ...whatsappLeads];
    });

    // Remover duplicatas baseado no nome da empresa
    const uniqueLeads = allWhatsappLeads.filter(
      (lead, index, self) =>
        index === self.findIndex((l) => l.nome === lead.nome)
    );

    if (uniqueLeads.length === 0) {
      return res
        .status(400)
        .json({ error: "Nenhum lead com WhatsApp encontrado" });
    }

    const buffer = await generateExcelFile(uniqueLeads, "whatsapp_leads");

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=whatsapp_leads_${Date.now()}.xlsx`
    );
    res.send(buffer);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Função principal de busca
async function realSearch(searchId, nicho, cidade) {
  try {
    const searchStatus = activeSearches.get(searchId);
    if (!searchStatus) {
      console.log(`❌ Busca ${searchId} não encontrada`);
      return;
    }

    if (!process.env.GOOGLE_PLACES_API_KEY) {
      searchStatus.phase = "Erro: Chave da API do Google não configurada";
      searchStatus.running = false;
      activeSearches.set(searchId, searchStatus);
      return;
    }

    // Criar chave do cache
    const cacheKey = `${nicho.toLowerCase()}_${cidade.toLowerCase()}`;
    const existingCompanies = searchCache[cacheKey] || [];

    console.log(
      `📋 Cache encontrado para "${cacheKey}": ${existingCompanies.length} empresas já coletadas`
    );

    searchStatus.phase = "Fase 1: Buscando empresas via Google Places API";
    searchStatus.progress = 10.0;

    // Buscar empresas via Google Places API
    const businesses = await searchGooglePlaces(nicho, cidade);

    if (!businesses || businesses.length === 0) {
      searchStatus.phase = "Nenhuma empresa encontrada";
      searchStatus.running = false;
      activeSearches.set(searchId, searchStatus);
      return;
    }

    // Filtrar empresas já coletadas
    const newBusinesses = businesses.filter((business) => {
      const businessName = business.nome?.toLowerCase() || "";
      const businessPhone = business.telefone || "";

      return !existingCompanies.some(
        (existing) =>
          existing.nome?.toLowerCase() === businessName ||
          existing.telefone === businessPhone
      );
    });

    console.log(
      `🔍 Empresas encontradas: ${businesses.length}, Novas: ${newBusinesses.length}`
    );

    if (newBusinesses.length === 0) {
      searchStatus.phase = "Todas as empresas já foram coletadas anteriormente";
      searchStatus.results = existingCompanies;
      searchStatus.progress = 100.0;
      searchStatus.running = false;
      activeSearches.set(searchId, searchStatus);
      return;
    }

    searchStatus.total = Math.min(newBusinesses.length, 50);
    searchStatus.progress = 30.0;
    searchStatus.phase = `Fase 2: Enriquecendo dados de ${Math.min(
      newBusinesses.length,
      50
    )} empresas`;

    // Enriquecer dados com scraping (limitado a 50 empresas)
    const enrichedResults = [];
    const maxBusinesses = Math.min(newBusinesses.length, 50);

    for (let i = 0; i < maxBusinesses; i++) {
      // Verificar se a busca foi interrompida
      if (!searchStatus.running) {
        console.log(`⏹️ Busca ${searchId} interrompida durante o scraping`);
        searchStatus.phase = "Busca interrompida pelo usuário";
        break;
      }

      const business = newBusinesses[i];
      searchStatus.current_item = business.nome || "Empresa";
      searchStatus.progress =
        Math.round((30 + (i / maxBusinesses) * 60) * 100) / 100;

      console.log(
        `🔍 [${searchId}] Processando ${i + 1}/${maxBusinesses}: ${
          business.nome || "Empresa"
        }`
      );

      // Enriquecer com scraping
      const enrichedBusiness = await enrichDataWithScraping(business);

      // Salvar o lead enriquecido no banco de dados, incluindo o nicho
      try {
        await Lead.create({
          ...enrichedBusiness, // Copia todos os dados do lead
          nicho: nicho, // Adiciona o nicho da busca atual
        });
        console.log(
          `💾 Lead "${
            enrichedBusiness.nome || "Empresa"
          }" (Nicho: ${nicho}) salvo no banco de dados.`
        );
      } catch (dbError) {
        console.error(
          `❌ Erro ao salvar o lead "${
            enrichedBusiness.nome || "Empresa"
          }" no banco:`,
          dbError
        );
      }

      enrichedResults.push(enrichedBusiness);

      searchStatus.found = enrichedResults.length;
      searchStatus.elapsed_time = Date.now();

      // Pausa mínima para não sobrecarregar
      await new Promise((resolve) => setTimeout(resolve, 50));
    }

    // Combinar resultados existentes com novos
    const allResults = [...existingCompanies, ...enrichedResults];

    // Atualizar cache
    searchCache[cacheKey] = allResults;

    // Atualizar resultados
    searchStatus.results = allResults;
    searchStatus.progress = 100.0;
    searchStatus.phase = `Busca concluída! ${enrichedResults.length} novas empresas adicionadas`;

    // Atualizar estatísticas globais
    updateGlobalStatistics(nicho, enrichedResults);

    // Atualizar busca ativa
    activeSearches.set(searchId, searchStatus);

    console.log(
      `✅ Busca ${searchId} concluída com ${enrichedResults.length} novas empresas`
    );
  } catch (error) {
    const searchStatus = activeSearches.get(searchId);
    if (searchStatus) {
      searchStatus.phase = `Erro na busca: ${error.message}`;
      searchStatus.running = false;
      activeSearches.set(searchId, searchStatus);
    }
    console.error(`❌ Erro na busca ${searchId}:`, error);
  } finally {
    const searchStatus = activeSearches.get(searchId);
    if (searchStatus) {
      searchStatus.running = false;
      activeSearches.set(searchId, searchStatus);
    }
  }
}

function updateGlobalStatistics(nicho, results) {
  // Adicionar busca atual
  const searchInfo = {
    nicho,
    timestamp: new Date().toISOString(),
    total_leads: results.length,
    whatsapp_leads: results.filter((r) => r.whatsapp).length,
  };

  allSearches.searches.push(searchInfo);
  allSearches.total_leads += results.length;

  // Atualizar segmentos
  if (!allSearches.segments[nicho]) {
    allSearches.segments[nicho] = 0;
  }
  allSearches.segments[nicho] += results.length;
}

// Endpoint para buscar leads (com filtro opcional por nicho)
app.get("/api/leads", async (req, res) => {
  try {
    const { nicho } = req.query; // Pega o 'nicho' da URL (ex: /api/leads?nicho=restaurante)

    const options = {
      order: [["createdAt", "DESC"]], // Ordena os leads do mais recente para o mais antigo
    };

    // Se um nicho foi fornecido na URL, adiciona um filtro à busca
    if (nicho) {
      options.where = {
        nicho: nicho,
      };
    }

    // Busca os leads no banco de dados usando as opções definidas
    const leads = await Lead.findAll(options);

    console.log(`🔍 Foram encontrados ${leads.length} leads.`);
    res.status(200).json(leads);
  } catch (error) {
    console.error("❌ Erro ao buscar leads:", error);
    res.status(500).json({ error: "Ocorreu um erro ao buscar os leads." });
  }
});

// Endpoint SECRETO para forçar a sincronização do banco de dados em produção
app.get("/api/sync-db", async (req, res) => {
  // Uma chave secreta simples para proteger o endpoint
  const secret = req.query.secret;
  if (secret !== process.env.SYNC_SECRET) {
    return res.status(401).json({ error: "Não autorizado" });
  }

  try {
    console.log("🔄 Iniciando sincronização manual do banco de dados...");
    await sequelize.sync({ alter: true });
    console.log(
      "✅ Sincronização manual do banco de dados concluída com sucesso."
    );
    res
      .status(200)
      .json({ message: "Banco de dados sincronizado com sucesso!" });
  } catch (error) {
    console.error("❌ Erro na sincronização manual do banco:", error);
    res.status(500).json({
      error: "Falha ao sincronizar o banco de dados.",
      details: error.message,
    });
  }
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor backend rodando em: http://localhost:${PORT}`);
  console.log(`📱 API Health: http://localhost:${PORT}/api/health`);
});
