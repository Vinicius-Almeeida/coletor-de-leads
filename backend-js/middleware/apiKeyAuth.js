/**
 * Middleware de autenticação via X-API-Key
 * Valida se a chave fornecida no header X-API-Key corresponde à variável de ambiente INTERNAL_API_KEY
 */

function apiKeyAuth(req, res, next) {
  const apiKey = req.headers['x-api-key'];
  const expectedApiKey = process.env.INTERNAL_API_KEY;

  // Verificar se a chave foi fornecida
  if (!apiKey) {
    return res.status(401).json({
      error: 'X-API-Key header é obrigatório',
      message: 'Forneça a chave de API no header X-API-Key'
    });
  }

  // Verificar se a chave está configurada no ambiente
  if (!expectedApiKey) {
    console.error('❌ INTERNAL_API_KEY não configurada no ambiente');
    return res.status(500).json({
      error: 'Configuração de API inválida',
      message: 'Chave de API não configurada no servidor'
    });
  }

  // Verificar se a chave fornecida corresponde à esperada
  if (apiKey !== expectedApiKey) {
    return res.status(401).json({
      error: 'Chave de API inválida',
      message: 'A chave fornecida não é válida'
    });
  }

  // Se chegou até aqui, a autenticação foi bem-sucedida
  next();
}

module.exports = apiKeyAuth;
