// const puppeteer = require("puppeteer"); // Temporariamente desabilitado para deploy
const cheerio = require("cheerio");
const axios = require("axios");

/**
 * Enriquece dados de uma empresa com scraping
 * @param {Object} business - Dados básicos da empresa
 * @returns {Object} Dados enriquecidos
 */
async function enrichDataWithScraping(business) {
  const enrichedBusiness = { ...business };

  try {
    // Se tem site, tentar fazer scraping
    if (business.site && isValidUrl(business.site)) {
      console.log(`🔍 Fazendo scraping do site: ${business.site}`);

      const scrapedData = await scrapeWebsite(business.site);

      // Mesclar dados encontrados
      if (scrapedData.email) {
        enrichedBusiness.email = scrapedData.email;
      }
      if (scrapedData.linkedin) {
        enrichedBusiness.linkedin = scrapedData.linkedin;
      }
      if (scrapedData.facebook) {
        enrichedBusiness.facebook = scrapedData.facebook;
      }
      if (scrapedData.whatsapp) {
        enrichedBusiness.whatsapp = scrapedData.whatsapp;
      }
    }

    // Tentar encontrar WhatsApp no telefone
    if (business.telefone && !enrichedBusiness.whatsapp) {
      const whatsappNumber = extractWhatsAppNumber(business.telefone);
      if (whatsappNumber) {
        enrichedBusiness.whatsapp = whatsappNumber;
      }
    }
  } catch (error) {
    console.error(`❌ Erro no scraping de ${business.nome}:`, error.message);
  }

  return enrichedBusiness;
}

/**
 * Faz scraping de um website
 * @param {string} url - URL do site
 * @returns {Object} Dados extraídos
 */
async function scrapeWebsite(url) {
  const data = {
    email: "",
    linkedin: "",
    facebook: "",
    whatsapp: "",
  };

  try {
    // Primeiro tentar com axios (mais rápido)
    const response = await axios.get(url, {
      timeout: 10000,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
      },
    });

    const html = response.data;
    const $ = cheerio.load(html);

    // Extrair email
    data.email = extractEmail($, html);

    // Extrair redes sociais
    data.linkedin = extractLinkedIn($, html);
    data.facebook = extractFacebook($, html);

    // Extrair WhatsApp
    data.whatsapp = extractWhatsApp($, html);
  } catch (error) {
    console.log(`⚠️ Erro com axios, tentando Puppeteer para: ${url}`);

    // Temporariamente desabilitado Puppeteer para deploy
    // Se axios falhar, tentar com Puppeteer
    /*
    try {
      const browser = await puppeteer.launch({
        headless: true,
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
      });

      const page = await browser.newPage();
      await page.setUserAgent(
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
      );
      await page.setViewport({ width: 1280, height: 720 });

      await page.goto(url, { waitUntil: "networkidle2", timeout: 15000 });

      const pageData = await page.evaluate(() => {
        const html = document.documentElement.outerHTML;
        const text = document.body.innerText;

        return { html, text };
      });

      const $ = cheerio.load(pageData.html);

      // Extrair dados
      data.email = extractEmail($, pageData.html);
      data.linkedin = extractLinkedIn($, pageData.html);
      data.facebook = extractFacebook($, pageData.html);
      data.whatsapp = extractWhatsApp($, pageData.html);

      await browser.close();
    } catch (puppeteerError) {
      console.error(
        `❌ Erro com Puppeteer para ${url}:`,
        puppeteerError.message
      );
    }
    */
  }

  return data;
}

/**
 * Extrai email do HTML
 * @param {Object} $ - Cheerio object
 * @param {string} html - HTML completo
 * @returns {string} Email encontrado
 */
function extractEmail($, html) {
  // Buscar em atributos href
  const emailLinks = $('a[href^="mailto:"]');
  if (emailLinks.length > 0) {
    const email = emailLinks.first().attr("href").replace("mailto:", "");
    if (isValidEmail(email)) {
      return email;
    }
  }

  // Buscar em texto usando regex
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
  const emails = html.match(emailRegex);

  if (emails && emails.length > 0) {
    for (const email of emails) {
      if (isValidEmail(email)) {
        return email;
      }
    }
  }

  return "";
}

/**
 * Extrai LinkedIn do HTML
 * @param {Object} $ - Cheerio object
 * @param {string} html - HTML completo
 * @returns {string} LinkedIn encontrado
 */
function extractLinkedIn($, html) {
  // Buscar em links
  const linkedinLinks = $('a[href*="linkedin.com"]');
  if (linkedinLinks.length > 0) {
    return linkedinLinks.first().attr("href");
  }

  // Buscar em texto
  const linkedinRegex = /https?:\/\/(www\.)?linkedin\.com\/[^\s"']+/g;
  const linkedins = html.match(linkedinRegex);

  return linkedins && linkedins.length > 0 ? linkedins[0] : "";
}

/**
 * Extrai Facebook do HTML
 * @param {Object} $ - Cheerio object
 * @param {string} html - HTML completo
 * @returns {string} Facebook encontrado
 */
function extractFacebook($, html) {
  // Buscar em links
  const facebookLinks = $('a[href*="facebook.com"]');
  if (facebookLinks.length > 0) {
    return facebookLinks.first().attr("href");
  }

  // Buscar em texto
  const facebookRegex = /https?:\/\/(www\.)?facebook\.com\/[^\s"']+/g;
  const facebooks = html.match(facebookRegex);

  return facebooks && facebooks.length > 0 ? facebooks[0] : "";
}

/**
 * Extrai WhatsApp do HTML
 * @param {Object} $ - Cheerio object
 * @param {string} html - HTML completo
 * @returns {string} WhatsApp encontrado
 */
function extractWhatsApp($, html) {
  // Buscar em links
  const whatsappLinks = $('a[href*="wa.me"], a[href*="whatsapp.com"]');
  if (whatsappLinks.length > 0) {
    const href = whatsappLinks.first().attr("href");
    return extractWhatsAppNumber(href);
  }

  // Buscar em texto
  const whatsappRegex = /(?:wa\.me|whatsapp\.com)\/(\d+)/g;
  const whatsapps = html.match(whatsappRegex);

  if (whatsapps && whatsapps.length > 0) {
    return extractWhatsAppNumber(whatsapps[0]);
  }

  return "";
}

/**
 * Extrai número do WhatsApp de uma string
 * @param {string} text - Texto contendo WhatsApp
 * @returns {string} Número do WhatsApp
 */
function extractWhatsAppNumber(text) {
  if (!text) return "";

  // Remover caracteres não numéricos
  const numbers = text.replace(/\D/g, "");

  // Verificar se é um número brasileiro válido
  if (numbers.length >= 10 && numbers.length <= 13) {
    // Se começa com 55 (Brasil), remover
    if (numbers.startsWith("55")) {
      return numbers.substring(2);
    }
    return numbers;
  }

  return "";
}

/**
 * Valida se uma URL é válida
 * @param {string} url - URL para validar
 * @returns {boolean} True se válida
 */
function isValidUrl(url) {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Valida se um email é válido
 * @param {string} email - Email para validar
 * @returns {boolean} True se válido
 */
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

module.exports = {
  enrichDataWithScraping,
};
