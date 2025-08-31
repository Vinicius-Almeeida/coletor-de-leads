const axios = require("axios");

/**
 * Busca empresas usando Google Places API (New)
 * @param {string} nicho - Nicho de mercado
 * @param {string} cidade - Cidade para busca
 * @returns {Array} Lista de empresas encontradas
 */
async function searchGooglePlaces(nicho, cidade) {
  try {
    const allBusinesses = [];
    const seenNames = new Set(); // Para evitar duplicatas

    // Lista de variações de busca para encontrar mais empresas
    const searchVariations = [
      `${nicho} ${cidade}`,
      `${nicho} em ${cidade}`,
      `distribuidora ${nicho} ${cidade}`,
      `comercio ${nicho} ${cidade}`,
      `loja ${nicho} ${cidade}`,
      `empresa ${nicho} ${cidade}`,
    ];

    for (let i = 0; i < searchVariations.length; i++) {
      const query = searchVariations[i];
      console.log(`🔍 Busca ${i + 1}/${searchVariations.length}: ${query}`);

      try {
        // URL da Places API (New)
        const url = "https://places.googleapis.com/v1/places:searchText";

        const headers = {
          "Content-Type": "application/json",
          "X-Goog-Api-Key": process.env.GOOGLE_PLACES_API_KEY,
          "X-Goog-FieldMask":
            "places.displayName,places.formattedAddress,places.internationalPhoneNumber,places.websiteUri,places.types",
        };

        const payload = {
          textQuery: query,
          languageCode: "pt-BR",
          regionCode: "BR",
          maxResultCount: 20, // Máximo permitido por busca
        };

        const response = await axios.post(url, payload, {
          headers,
          timeout: 30000,
        });

        if (!response.data.places) {
          console.log(`⚠️ Nenhum resultado para: ${query}`);
          continue;
        }

        // Processar resultados
        for (const place of response.data.places) {
          const displayName = place.displayName || {};
          const businessName = displayName.text || "";

          // Evitar duplicatas
          if (seenNames.has(businessName.toLowerCase())) {
            continue;
          }

          seenNames.add(businessName.toLowerCase());

          const business = {
            nome: businessName,
            telefone: place.internationalPhoneNumber || "",
            site: place.websiteUri || "",
            endereco: place.formattedAddress || "",
            email: "",
            linkedin: "",
            facebook: "",
            whatsapp: "",
          };

          allBusinesses.push(business);
        }

        // Pequena pausa entre buscas para não sobrecarregar a API
        if (i < searchVariations.length - 1) {
          await new Promise((resolve) => setTimeout(resolve, 1000));
        }
      } catch (error) {
        console.error(`❌ Erro na busca "${query}":`, error.message);
        continue; // Continuar com a próxima busca
      }
    }

    console.log(
      `✅ Encontradas ${allBusinesses.length} empresas únicas via Places API (New)`
    );
    return allBusinesses;
  } catch (error) {
    console.error("❌ Erro na busca Places API (New):", error);
    return [];
  }
}

/**
 * Valida se a API key está funcionando
 * @param {string} apiKey - Chave da API para validar
 * @returns {boolean} True se a API key for válida
 */
async function validateApiKey(apiKey) {
  if (!apiKey || apiKey === "SUA_CHAVE_API_AQUI") {
    return false;
  }

  try {
    // Teste simples com uma busca
    const testData = await searchGooglePlaces("restaurante", "São Paulo");
    return testData.length > 0;
  } catch (error) {
    console.error("❌ Erro ao validar API key:", error);
    return false;
  }
}

module.exports = {
  searchGooglePlaces,
  validateApiKey,
};
