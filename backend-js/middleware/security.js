const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const xss = require("xss-clean");
const hpp = require("hpp");

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

// Sanitização de input
function sanitizeInput(input) {
  if (typeof input !== "string") return input;

  return input
    .replace(/[<>]/g, "") // Remove < e >
    .replace(/javascript:/gi, "") // Remove javascript:
    .replace(/data:/gi, "") // Remove data:
    .replace(/vbscript:/gi, "") // Remove vbscript:
    .replace(/on\w+=/gi, "") // Remove event handlers
    .trim();
}

// Validação de email
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Validação de URL
function isValidUrl(url) {
  try {
    const urlObj = new URL(url);
    return ["http:", "https:"].includes(urlObj.protocol);
  } catch {
    return false;
  }
}

// Middleware de validação
function validateInput(req, res, next) {
  const { nicho, cidade } = req.body;

  // Sanitizar inputs
  req.body.nicho = sanitizeInput(nicho);
  req.body.cidade = sanitizeInput(cidade);

  // Validar tamanho
  if (nicho && nicho.length > 100) {
    return res.status(400).json({ error: "Nicho muito longo" });
  }

  if (cidade && cidade.length > 100) {
    return res.status(400).json({ error: "Cidade muito longa" });
  }

  next();
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
