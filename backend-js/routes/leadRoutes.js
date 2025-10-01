const express = require("express");
const router = express.Router();
const apiKeyAuth = require("../middleware/apiKeyAuth");
const { searchGooglePlaces } = require("../services/googlePlaces");
const { enrichDataWithScraping } = require("../services/scraper");

/**
 * Endpoint POST /scrape
 * Executa scraping de leads baseado em termo de busca e cidade
 * Requer autenticação via X-API-Key
 */
router.post("/scrape", apiKeyAuth, async (req, res) => {
  try {
    const { termo_busca, cidade } = req.body;

    // Validar parâmetros obrigatórios
    if (!termo_busca || !cidade) {
      return res.status(400).json({
        error: "Parâmetros obrigatórios ausentes",
        message: 'Os campos "termo_busca" e "cidade" são obrigatórios',
        required_fields: ["termo_busca", "cidade"],
      });
    }

    // Validar se os parâmetros não estão vazios
    if (termo_busca.trim() === "" || cidade.trim() === "") {
      return res.status(400).json({
        error: "Parâmetros inválidos",
        message: 'Os campos "termo_busca" e "cidade" não podem estar vazios',
      });
    }

    console.log(`🔍 Iniciando scraping para: "${termo_busca}" em "${cidade}"`);

    // Verificar se a API do Google Places está configurada
    if (!process.env.GOOGLE_PLACES_API_KEY) {
      return res.status(500).json({
        error: "Configuração de API ausente",
        message: "Chave da API do Google Places não configurada",
      });
    }

    // Buscar empresas via Google Places API
    console.log("📋 Fase 1: Buscando empresas via Google Places API");
    const businesses = await searchGooglePlaces(termo_busca, cidade);

    if (!businesses || businesses.length === 0) {
      return res.status(200).json({
        success: true,
        message: "Nenhuma empresa encontrada para os parâmetros fornecidos",
        leads: [],
        total_leads: 0,
        search_params: {
          termo_busca,
          cidade,
        },
      });
    }

    console.log(
      `📊 Encontradas ${businesses.length} empresas, iniciando enriquecimento...`
    );

    // Enriquecer dados com scraping (limitado a 20 empresas para o MVP)
    const maxBusinesses = Math.min(businesses.length, 20);
    const enrichedLeads = [];

    for (let i = 0; i < maxBusinesses; i++) {
      const business = businesses[i];
      console.log(
        `🔍 Processando ${i + 1}/${maxBusinesses}: ${
          business.nome || "Empresa"
        }`
      );

      try {
        // Enriquecer com scraping
        const enrichedBusiness = await enrichDataWithScraping(business);

        // Adicionar metadados da busca
        enrichedBusiness.termo_busca = termo_busca;
        enrichedBusiness.cidade = cidade;
        enrichedBusiness.processado_em = new Date().toISOString();

        enrichedLeads.push(enrichedBusiness);

        // Pequena pausa para não sobrecarregar
        await new Promise((resolve) => setTimeout(resolve, 100));
      } catch (scrapingError) {
        console.error(
          `❌ Erro no scraping de ${business.nome}:`,
          scrapingError.message
        );
        // Adicionar lead básico mesmo com erro de scraping
        enrichedLeads.push({
          ...business,
          termo_busca,
          cidade,
          processado_em: new Date().toISOString(),
          scraping_error: scrapingError.message,
        });
      }
    }

    console.log(
      `✅ Scraping concluído: ${enrichedLeads.length} leads processados`
    );

    // Retornar resultado
    res.status(200).json({
      success: true,
      message: `Scraping concluído com sucesso`,
      leads: enrichedLeads,
      total_leads: enrichedLeads.length,
      search_params: {
        termo_busca,
        cidade,
      },
      processing_info: {
        empresas_encontradas: businesses.length,
        empresas_processadas: enrichedLeads.length,
        limite_mvp: 20,
      },
    });
  } catch (error) {
    console.error("❌ Erro no endpoint /scrape:", error);
    res.status(500).json({
      error: "Erro interno do servidor",
      message: error.message,
      timestamp: new Date().toISOString(),
    });
  }
});

module.exports = router;
