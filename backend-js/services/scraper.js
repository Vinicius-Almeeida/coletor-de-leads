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

      // Priorizar emails e WhatsApp
      if (scrapedData.email) {
        enrichedBusiness.email = scrapedData.email;
        console.log(`✅ Email encontrado: ${scrapedData.email}`);
      }
      if (scrapedData.whatsapp) {
        enrichedBusiness.whatsapp = scrapedData.whatsapp;
        console.log(`✅ WhatsApp encontrado: ${scrapedData.whatsapp}`);
      }

      // Outros dados
      if (scrapedData.linkedin) {
        enrichedBusiness.linkedin = scrapedData.linkedin;
      }
      if (scrapedData.facebook) {
        enrichedBusiness.facebook = scrapedData.facebook;
      }
      if (scrapedData.instagram) {
        enrichedBusiness.instagram = scrapedData.instagram;
      }
    }

    // Tentar encontrar WhatsApp no telefone (prioridade)
    if (business.telefone && !enrichedBusiness.whatsapp) {
      const whatsappNumber = extractWhatsAppNumber(business.telefone);
      if (whatsappNumber) {
        enrichedBusiness.whatsapp = whatsappNumber;
        console.log(`✅ WhatsApp extraído do telefone: ${whatsappNumber}`);
      }
    }

    // Log dos dados encontrados
    const foundData = [];
    if (enrichedBusiness.email) foundData.push("Email");
    if (enrichedBusiness.whatsapp) foundData.push("WhatsApp");
    if (enrichedBusiness.linkedin) foundData.push("LinkedIn");
    if (enrichedBusiness.facebook) foundData.push("Facebook");
    if (enrichedBusiness.instagram) foundData.push("Instagram");

    if (foundData.length > 0) {
      console.log(
        `📊 Dados encontrados para ${business.nome}: ${foundData.join(", ")}`
      );
    } else {
      console.log(`⚠️ Nenhum dado encontrado para ${business.nome}`);
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
    instagram: "",
    whatsapp: "",
  };

  try {
    // Primeiro tentar com axios (mais rápido)
    const response = await axios.get(url, {
      timeout: 2000, // Reduzido para 2 segundos
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
    data.instagram = extractInstagram($, html);

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
 * Extrai email do HTML com prioridade
 * @param {Object} $ - Cheerio object
 * @param {string} html - HTML completo
 * @returns {string} Email encontrado
 */
function extractEmail($, html) {
  const foundEmails = [];

  // 1. Prioridade: Buscar em atributos href mailto
  const emailLinks = $('a[href^="mailto:"]');
  if (emailLinks.length > 0) {
    const email = emailLinks.first().attr("href").replace("mailto:", "");
    if (isValidEmail(email)) {
      foundEmails.push({ email, priority: 1, source: "mailto" });
    }
  }

  // 2. Buscar em elementos com classes/ids relacionados a email
  const emailElements = $(
    '[class*="email"], [id*="email"], [class*="mail"], [id*="mail"], [class*="contato"], [id*="contato"], [class*="contact"], [id*="contact"]'
  );
  for (let i = 0; i < emailElements.length; i++) {
    const element = emailElements.eq(i);
    const text = element.text();
    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
    const emails = text.match(emailRegex);
    if (emails && emails.length > 0) {
      for (const email of emails) {
        if (isValidEmail(email)) {
          foundEmails.push({ email, priority: 2, source: "email-element" });
        }
      }
    }
  }

  // 3. Buscar em elementos de contato
  const contactElements = $(
    'p, span, div, td, th, li, address, [class*="footer"], [class*="header"], [class*="sidebar"]'
  );
  for (let i = 0; i < contactElements.length; i++) {
    const element = contactElements.eq(i);
    const text = element.text();
    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
    const emails = text.match(emailRegex);
    if (emails && emails.length > 0) {
      for (const email of emails) {
        if (isValidEmail(email)) {
          foundEmails.push({ email, priority: 3, source: "contact-element" });
        }
      }
    }
  }

  // 4. Buscar em todo o HTML usando regex (última opção)
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
  const emails = html.match(emailRegex);
  if (emails && emails.length > 0) {
    for (const email of emails) {
      if (isValidEmail(email)) {
        foundEmails.push({ email, priority: 4, source: "html-regex" });
      }
    }
  }

  // Filtrar e priorizar emails
  if (foundEmails.length > 0) {
    // Remover duplicatas
    const uniqueEmails = [];
    const seenEmails = new Set();

    for (const item of foundEmails) {
      if (!seenEmails.has(item.email.toLowerCase())) {
        seenEmails.add(item.email.toLowerCase());
        uniqueEmails.push(item);
      }
    }

    // Priorizar emails corporativos (não genéricos)
    const corporateEmails = uniqueEmails.filter(
      (item) =>
        !item.email.includes("noreply") &&
        !item.email.includes("no-reply") &&
        !item.email.includes("donotreply") &&
        !item.email.includes("info@") &&
        !item.email.includes("admin@") &&
        !item.email.includes("webmaster@") &&
        !item.email.includes("postmaster@") &&
        !item.email.includes("abuse@") &&
        !item.email.includes("support@") &&
        !item.email.includes("help@") &&
        !item.email.includes("sales@") &&
        !item.email.includes("contact@") &&
        !item.email.includes("hello@") &&
        !item.email.includes("noreply@") &&
        !item.email.includes("no-reply@") &&
        !item.email.includes("donotreply@") &&
        !item.email.includes("webmaster@") &&
        !item.email.includes("postmaster@") &&
        !item.email.includes("abuse@") &&
        !item.email.includes("support@") &&
        !item.email.includes("help@") &&
        !item.email.includes("sales@") &&
        !item.email.includes("contact@") &&
        !item.email.includes("hello@")
    );

    // Retornar o melhor email encontrado
    if (corporateEmails.length > 0) {
      // Ordenar por prioridade e retornar o primeiro
      corporateEmails.sort((a, b) => a.priority - b.priority);
      console.log(
        `📧 Email corporativo encontrado: ${corporateEmails[0].email} (${corporateEmails[0].source})`
      );
      return corporateEmails[0].email;
    }

    if (uniqueEmails.length > 0) {
      // Ordenar por prioridade e retornar o primeiro
      uniqueEmails.sort((a, b) => a.priority - b.priority);
      console.log(
        `📧 Email encontrado: ${uniqueEmails[0].email} (${uniqueEmails[0].source})`
      );
      return uniqueEmails[0].email;
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
  const foundLinkedIns = [];

  // 1. Prioridade: Buscar em links
  const linkedinLinks = $('a[href*="linkedin.com"]');
  if (linkedinLinks.length > 0) {
    const href = linkedinLinks.first().attr("href");
    if (href && href.includes("linkedin.com")) {
      foundLinkedIns.push({ url: href, priority: 1, source: "linkedin-link" });
    }
  }

  // 2. Buscar em elementos com classes/ids relacionados
  const socialElements = $(
    '[class*="linkedin"], [id*="linkedin"], [class*="social"], [id*="social"], [class*="redes"], [id*="redes"]'
  );
  for (let i = 0; i < socialElements.length; i++) {
    const element = socialElements.eq(i);
    const text = element.text();
    const linkedinRegex = /https?:\/\/(www\.)?linkedin\.com\/[^\s"']+/g;
    const linkedins = text.match(linkedinRegex);
    if (linkedins && linkedins.length > 0) {
      for (const linkedin of linkedins) {
        foundLinkedIns.push({
          url: linkedin,
          priority: 2,
          source: "social-element",
        });
      }
    }
  }

  // 3. Buscar em todo o HTML
  const linkedinRegex = /https?:\/\/(www\.)?linkedin\.com\/[^\s"']+/g;
  const linkedins = html.match(linkedinRegex);
  if (linkedins && linkedins.length > 0) {
    for (const linkedin of linkedins) {
      foundLinkedIns.push({ url: linkedin, priority: 3, source: "html-regex" });
    }
  }

  // Retornar o primeiro encontrado
  if (foundLinkedIns.length > 0) {
    foundLinkedIns.sort((a, b) => a.priority - b.priority);
    console.log(
      `💼 LinkedIn encontrado: ${foundLinkedIns[0].url} (${foundLinkedIns[0].source})`
    );
    return foundLinkedIns[0].url;
  }

  return "";
}

/**
 * Extrai Facebook do HTML
 * @param {Object} $ - Cheerio object
 * @param {string} html - HTML completo
 * @returns {string} Facebook encontrado
 */
function extractFacebook($, html) {
  const foundFacebooks = [];

  // 1. Prioridade: Buscar em links
  const facebookLinks = $('a[href*="facebook.com"]');
  if (facebookLinks.length > 0) {
    const href = facebookLinks.first().attr("href");
    if (href && href.includes("facebook.com")) {
      foundFacebooks.push({ url: href, priority: 1, source: "facebook-link" });
    }
  }

  // 2. Buscar em elementos com classes/ids relacionados
  const socialElements = $(
    '[class*="facebook"], [id*="facebook"], [class*="social"], [id*="social"], [class*="redes"], [id*="redes"], [class*="fb"], [id*="fb"]'
  );
  for (let i = 0; i < socialElements.length; i++) {
    const element = socialElements.eq(i);
    const text = element.text();
    const facebookRegex = /https?:\/\/(www\.)?facebook\.com\/[^\s"']+/g;
    const facebooks = text.match(facebookRegex);
    if (facebooks && facebooks.length > 0) {
      for (const facebook of facebooks) {
        foundFacebooks.push({
          url: facebook,
          priority: 2,
          source: "social-element",
        });
      }
    }
  }

  // 3. Buscar em todo o HTML
  const facebookRegex = /https?:\/\/(www\.)?facebook\.com\/[^\s"']+/g;
  const facebooks = html.match(facebookRegex);
  if (facebooks && facebooks.length > 0) {
    for (const facebook of facebooks) {
      foundFacebooks.push({ url: facebook, priority: 3, source: "html-regex" });
    }
  }

  // Retornar o primeiro encontrado
  if (foundFacebooks.length > 0) {
    foundFacebooks.sort((a, b) => a.priority - b.priority);
    console.log(
      `📘 Facebook encontrado: ${foundFacebooks[0].url} (${foundFacebooks[0].source})`
    );
    return foundFacebooks[0].url;
  }

  return "";
}

/**
 * Extrai Instagram do HTML
 * @param {Object} $ - Cheerio object
 * @param {string} html - HTML completo
 * @returns {string} Instagram encontrado
 */
function extractInstagram($, html) {
  const foundInstagrams = [];

  // 1. Prioridade: Buscar em links
  const instagramLinks = $('a[href*="instagram.com"]');
  if (instagramLinks.length > 0) {
    const href = instagramLinks.first().attr("href");
    if (href && href.includes("instagram.com")) {
      foundInstagrams.push({
        url: href,
        priority: 1,
        source: "instagram-link",
      });
    }
  }

  // 2. Buscar em elementos com classes/ids relacionados
  const socialElements = $(
    '[class*="instagram"], [id*="instagram"], [class*="social"], [id*="social"], [class*="redes"], [id*="redes"], [class*="ig"], [id*="ig"]'
  );
  for (let i = 0; i < socialElements.length; i++) {
    const element = socialElements.eq(i);
    const text = element.text();
    const instagramRegex = /https?:\/\/(www\.)?instagram\.com\/[^\s"']+/g;
    const instagrams = text.match(instagramRegex);
    if (instagrams && instagrams.length > 0) {
      for (const instagram of instagrams) {
        foundInstagrams.push({
          url: instagram,
          priority: 2,
          source: "social-element",
        });
      }
    }
  }

  // 3. Buscar em todo o HTML
  const instagramRegex = /https?:\/\/(www\.)?instagram\.com\/[^\s"']+/g;
  const instagrams = html.match(instagramRegex);
  if (instagrams && instagrams.length > 0) {
    for (const instagram of instagrams) {
      foundInstagrams.push({
        url: instagram,
        priority: 3,
        source: "html-regex",
      });
    }
  }

  // Retornar o primeiro encontrado
  if (foundInstagrams.length > 0) {
    foundInstagrams.sort((a, b) => a.priority - b.priority);
    console.log(
      `📸 Instagram encontrado: ${foundInstagrams[0].url} (${foundInstagrams[0].source})`
    );
    return foundInstagrams[0].url;
  }

  return "";
}

/**
 * Extrai WhatsApp do HTML com prioridade
 * @param {Object} $ - Cheerio object
 * @param {string} html - HTML completo
 * @returns {string} WhatsApp encontrado
 */
function extractWhatsApp($, html) {
  const foundWhatsApps = [];

  // 1. Prioridade: Buscar em links WhatsApp
  const whatsappLinks = $('a[href*="wa.me"], a[href*="whatsapp.com"]');
  if (whatsappLinks.length > 0) {
    const href = whatsappLinks.first().attr("href");
    const number = extractWhatsAppNumber(href);
    if (number) {
      foundWhatsApps.push({ number, priority: 1, source: "whatsapp-link" });
    }
  }

  // 2. Buscar em elementos com classes/ids relacionados a WhatsApp
  const whatsappElements = $(
    '[class*="whatsapp"], [id*="whatsapp"], [class*="wa"], [id*="wa"], [class*="contato"], [id*="contato"], [class*="contact"], [id*="contact"], [class*="telefone"], [id*="telefone"], [class*="phone"], [id*="phone"]'
  );
  for (let i = 0; i < whatsappElements.length; i++) {
    const element = whatsappElements.eq(i);
    const text = element.text();

    // Buscar links WhatsApp
    const whatsappRegex = /(?:wa\.me|whatsapp\.com)\/(\d+)/g;
    const whatsapps = text.match(whatsappRegex);
    if (whatsapps && whatsapps.length > 0) {
      for (const whatsapp of whatsapps) {
        const number = extractWhatsAppNumber(whatsapp);
        if (number) {
          foundWhatsApps.push({
            number,
            priority: 2,
            source: "whatsapp-element",
          });
        }
      }
    }

    // Buscar números de telefone
    const phoneRegex = /(?:\+55|55)?\s*(?:\(?\d{2}\)?)\s*(?:9?\d{4})-?\d{4}/g;
    const phones = text.match(phoneRegex);
    if (phones && phones.length > 0) {
      for (const phone of phones) {
        const number = extractWhatsAppNumber(phone);
        if (number && number.length >= 10) {
          foundWhatsApps.push({ number, priority: 3, source: "phone-element" });
        }
      }
    }
  }

  // 3. Buscar em elementos de contato
  const contactElements = $(
    'p, span, div, td, th, li, address, [class*="footer"], [class*="header"], [class*="sidebar"]'
  );
  for (let i = 0; i < contactElements.length; i++) {
    const element = contactElements.eq(i);
    const text = element.text();

    // Buscar links WhatsApp
    const whatsappRegex = /(?:wa\.me|whatsapp\.com)\/(\d+)/g;
    const whatsapps = text.match(whatsappRegex);
    if (whatsapps && whatsapps.length > 0) {
      for (const whatsapp of whatsapps) {
        const number = extractWhatsAppNumber(whatsapp);
        if (number) {
          foundWhatsApps.push({
            number,
            priority: 4,
            source: "contact-element",
          });
        }
      }
    }

    // Buscar números de telefone
    const phoneRegex = /(?:\+55|55)?\s*(?:\(?\d{2}\)?)\s*(?:9?\d{4})-?\d{4}/g;
    const phones = text.match(phoneRegex);
    if (phones && phones.length > 0) {
      for (const phone of phones) {
        const number = extractWhatsAppNumber(phone);
        if (number && number.length >= 10) {
          foundWhatsApps.push({ number, priority: 5, source: "contact-phone" });
        }
      }
    }
  }

  // 4. Buscar em todo o HTML usando regex WhatsApp
  const whatsappRegex = /(?:wa\.me|whatsapp\.com)\/(\d+)/g;
  const whatsapps = html.match(whatsappRegex);
  if (whatsapps && whatsapps.length > 0) {
    for (const whatsapp of whatsapps) {
      const number = extractWhatsAppNumber(whatsapp);
      if (number) {
        foundWhatsApps.push({ number, priority: 6, source: "html-regex" });
      }
    }
  }

  // 5. Buscar números de telefone em todo o HTML
  const phoneRegex = /(?:\+55|55)?\s*(?:\(?\d{2}\)?)\s*(?:9?\d{4})-?\d{4}/g;
  const phones = html.match(phoneRegex);
  if (phones && phones.length > 0) {
    for (const phone of phones) {
      const number = extractWhatsAppNumber(phone);
      if (number && number.length >= 10) {
        foundWhatsApps.push({ number, priority: 7, source: "html-phone" });
      }
    }
  }

  // Filtrar e priorizar WhatsApp
  if (foundWhatsApps.length > 0) {
    // Remover duplicatas
    const uniqueWhatsApps = [];
    const seenNumbers = new Set();

    for (const item of foundWhatsApps) {
      if (!seenNumbers.has(item.number)) {
        seenNumbers.add(item.number);
        uniqueWhatsApps.push(item);
      }
    }

    // Ordenar por prioridade e retornar o primeiro
    uniqueWhatsApps.sort((a, b) => a.priority - b.priority);
    console.log(
      `📱 WhatsApp encontrado: ${uniqueWhatsApps[0].number} (${uniqueWhatsApps[0].source})`
    );
    return uniqueWhatsApps[0].number;
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
