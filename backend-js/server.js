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

// Carregar variáveis de ambiente
dotenv.config();

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

// CORS
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
    maxAge: 3600,
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

// Variáveis globais para status
let searchStatus = {
  running: false,
  phase: "",
  progress: 0,
  total: 0,
  found: 0,
  current_item: "",
  elapsed_time: 0,
  results: [],
  current_nicho: "",
};

// Armazenamento de todas as buscas realizadas
let allSearches = {
  searches: [],
  total_leads: 0,
  segments: {},
};

// Cache para evitar duplicatas por nicho/cidade
let searchCache = {
  // Formato: "nicho_cidade" => [empresas já coletadas]
};

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

    // Reset status
    searchStatus = {
      running: true,
      phase: "Iniciando busca...",
      progress: 0,
      total: 0,
      found: 0,
      current_item: "",
      elapsed_time: 0,
      results: [],
      current_nicho: nicho,
    };

    console.log("✅ Status resetado, iniciando busca");

    // Executar busca em background
    realSearch(nicho, cidade);

    console.log("🚀 Busca iniciada");
    res.json({ message: "Busca iniciada", status: "running" });
  } catch (error) {
    console.error("❌ Erro ao iniciar busca:", error);
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/status", statusLimiter, (req, res) => {
  res.json(searchStatus);
});

app.post("/api/stop", (req, res) => {
  console.log("⏹️ Parando busca atual...");

  searchStatus.running = false;
  searchStatus.phase = "Busca interrompida pelo usuário";
  searchStatus.progress = 0;

  console.log("✅ Busca interrompida com sucesso");

  res.json({
    message: "Busca interrompida",
    status: "stopped",
    phase: searchStatus.phase,
  });
});

app.get("/api/download", async (req, res) => {
  try {
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
      `attachment; filename=leads_${Date.now()}.xlsx`
    );
    res.send(buffer);
  } catch (error) {
    console.error("❌ Erro no download:", error);
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/dashboard-data", (req, res) => {
  res.json(allSearches);
});

app.get("/api/whatsapp-leads", (req, res) => {
  const whatsappLeads = searchStatus.results
    .filter((lead) => lead.whatsapp)
    .map((lead) => ({
      ...lead,
      empresa: lead.nome,
      segmento: searchStatus.current_nicho || "Geral",
    }));

  res.json({
    total_whatsapp_leads: whatsappLeads.length,
    leads: whatsappLeads,
  });
});

app.get("/api/download-whatsapp-leads", async (req, res) => {
  try {
    const whatsappLeads = searchStatus.results.filter((lead) => lead.whatsapp);

    if (whatsappLeads.length === 0) {
      return res
        .status(400)
        .json({ error: "Nenhum lead com WhatsApp encontrado" });
    }

    const buffer = await generateExcelFile(whatsappLeads, "whatsapp_leads");

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
async function realSearch(nicho, cidade) {
  try {
    if (!process.env.GOOGLE_PLACES_API_KEY) {
      searchStatus.phase = "Erro: Chave da API do Google não configurada";
      searchStatus.running = false;
      return;
    }

    // Criar chave do cache
    const cacheKey = `${nicho.toLowerCase()}_${cidade.toLowerCase()}`;
    const existingCompanies = searchCache[cacheKey] || [];

    console.log(
      `📋 Cache encontrado para "${cacheKey}": ${existingCompanies.length} empresas já coletadas`
    );

    searchStatus.phase = "Fase 1: Buscando empresas via Google Places API";
    searchStatus.progress = 10;

    // Buscar empresas via Google Places API
    const businesses = await searchGooglePlaces(nicho, cidade);

    if (!businesses || businesses.length === 0) {
      searchStatus.phase = "Nenhuma empresa encontrada";
      searchStatus.running = false;
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
      searchStatus.progress = 100;
      searchStatus.running = false;
      return;
    }

    searchStatus.total = Math.min(newBusinesses.length, 20);
    searchStatus.progress = 30;
    searchStatus.phase = `Fase 2: Enriquecendo dados de ${Math.min(newBusinesses.length, 20)} empresas (limitado para velocidade)`;

    // Enriquecer dados com scraping (limitado a 20 empresas para velocidade)
    const enrichedResults = [];
    const maxBusinesses = Math.min(newBusinesses.length, 20);
    
    for (let i = 0; i < maxBusinesses; i++) {
      // Verificar se a busca foi interrompida
      if (!searchStatus.running) {
        console.log("⏹️ Busca interrompida durante o scraping");
        searchStatus.phase = "Busca interrompida pelo usuário";
        break;
      }

      const business = newBusinesses[i];
      searchStatus.current_item = business.nome || "Empresa";
      searchStatus.progress = 30 + (i / maxBusinesses) * 60;

      console.log(
        `🔍 Processando ${i + 1}/${maxBusinesses}: ${
          business.nome || "Empresa"
        }`
      );

      // Enriquecer com scraping
      const enrichedBusiness = await enrichDataWithScraping(business);
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
    searchStatus.progress = 100;
    searchStatus.phase = `Busca concluída! ${enrichedResults.length} novas empresas adicionadas`;

    // Atualizar estatísticas globais
    updateGlobalStatistics(nicho, enrichedResults);
  } catch (error) {
    searchStatus.phase = `Erro na busca: ${error.message}`;
    console.error("❌ Erro na busca real:", error);
  } finally {
    searchStatus.running = false;
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

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor backend rodando em: http://localhost:${PORT}`);
  console.log(`📱 API Health: http://localhost:${PORT}/api/health`);
});
