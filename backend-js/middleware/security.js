const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const xss = require("xss-clean");
const hpp = require("hpp");
const validator = require("validator");
const createDOMPurify = require("dompurify");
const { JSDOM } = require("jsdom");

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 1000, // máximo 1000 requests por IP (aumentado)
  message: "Muitas requisições deste IP, tente novamente em 15 minutos",
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiting específico para busca
const searchLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minuto
  max: 50, // máximo 50 buscas por minuto
  message: "Muitas buscas, aguarde um momento",
});

// Rate limiting específico para status (mais permissivo)
const statusLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minuto
  max: 5000, // máximo 5000 verificações de status por minuto (muito permissivo)
  message: "Muitas verificações de status, aguarde um momento",
});

// Configurar DOMPurify para Node.js
const window = new JSDOM('').window;
const DOMPurify = createDOMPurify(window);

// Sanitização de input robusta
function sanitizeInput(input) {
  if (typeof input !== "string") return input;

  // Sanitizar HTML/XSS
  let sanitized = DOMPurify.sanitize(input, {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: [],
    KEEP_CONTENT: true
  });

  // Remover padrões de SQL injection
  sanitized = sanitized
    .replace(/('|\\'|;|--|\/\*|\*\/|\||&|union|select|insert|update|delete|drop|create|alter|exec|execute)/gi, '')
    .replace(/['";\\]/g, '')
    .replace(/\b(OR|AND)\s+\d+\s*=\s*\d+/gi, '')
    .replace(/\b(OR|AND)\s+['"]\s*=\s*['"]/gi, '');

  // Remover padrões de NoSQL injection
  sanitized = sanitized
    .replace(/\$gt|\$lt|\$gte|\$lte|\$ne|\$in|\$nin|\$exists|\$regex|\$where|\$or|\$and/gi, '')
    .replace(/\{[^}]*\$[^}]*\}/g, '')
    .replace(/\$\w+/g, '');

  // Remover padrões de XSS
  sanitized = sanitized
    .replace(/javascript:/gi, '')
    .replace(/data:/gi, '')
    .replace(/vbscript:/gi, '')
    .replace(/on\w+\s*=/gi, '')
    .replace(/<script[^>]*>.*?<\/script>/gi, '')
    .replace(/<iframe[^>]*>.*?<\/iframe>/gi, '')
    .replace(/<object[^>]*>.*?<\/object>/gi, '')
    .replace(/<embed[^>]*>.*?<\/embed>/gi, '')
    .replace(/<link[^>]*>.*?<\/link>/gi, '')
    .replace(/<meta[^>]*>.*?<\/meta>/gi, '')
    .replace(/<style[^>]*>.*?<\/style>/gi, '');

  return sanitized.trim();
}

// Validação de email robusta
function isValidEmail(email) {
  if (!email || typeof email !== 'string') return false;
  
  // Usar validator.js para validação robusta
  return validator.isEmail(email) && 
         email.length <= 254 && 
         !email.includes('..') && 
         !email.startsWith('.') && 
         !email.endsWith('.');
}

// Validação de URL robusta
function isValidUrl(url) {
  if (!url || typeof url !== 'string') return false;
  
  try {
    // Usar validator.js para validação robusta
    const isValid = validator.isURL(url, {
      protocols: ['http', 'https'],
      require_protocol: true,
      require_valid_protocol: true,
      allow_underscores: false,
      allow_trailing_dot: false,
      allow_protocol_relative_urls: false
    });
    
    // Verificações adicionais de segurança
    if (isValid) {
      const urlObj = new URL(url);
      // Rejeitar URLs maliciosas
      if (urlObj.protocol === 'javascript:' || 
          urlObj.protocol === 'data:' || 
          urlObj.protocol === 'vbscript:' ||
          urlObj.hostname.includes('localhost') ||
          urlObj.hostname.includes('127.0.0.1') ||
          urlObj.hostname.includes('0.0.0.0')) {
        return false;
      }
    }
    
    return isValid;
  } catch {
    return false;
  }
}

// Middleware de validação robusta
function validateInput(req, res, next) {
  try {
    const { nicho, cidade } = req.body;

    // Validar se os campos obrigatórios estão presentes e não vazios
    if (!nicho || !cidade || nicho.trim() === '' || cidade.trim() === '') {
      return res.status(400).json({ 
        error: "Nicho e cidade são obrigatórios e não podem estar vazios" 
      });
    }

    // Sanitizar inputs
    req.body.nicho = sanitizeInput(nicho);
    req.body.cidade = sanitizeInput(cidade);

    // Validar tamanho
    if (req.body.nicho.length > 100) {
      return res.status(400).json({ error: "Nicho muito longo" });
    }

    if (req.body.cidade.length > 100) {
      return res.status(400).json({ error: "Cidade muito longa" });
    }

    // Validar se após sanitização ainda há conteúdo válido
    if (req.body.nicho.trim() === '' || req.body.cidade.trim() === '') {
      return res.status(400).json({ 
        error: "Dados inválidos após sanitização" 
      });
    }

    next();
  } catch (error) {
    console.error("❌ Erro na validação:", error);
    return res.status(500).json({ error: "Erro na validação dos dados" });
  }
}

module.exports = {
  limiter,
  searchLimiter,
  statusLimiter,
  sanitizeInput,
  isValidEmail,
  isValidUrl,
  validateInput,
};
