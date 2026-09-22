const rateLimit = require('express-rate-limit');

/**
 * Rate limiter geral para a API
 */
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Muitas requisições. Tente novamente em 15 minutos.' },
});

/**
 * Rate limiter estrito para rotas de autenticação
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Muitas tentativas de login. Tente novamente em 15 minutos.' },
  skipSuccessfulRequests: true, // Não conta requisições bem-sucedidas
});

module.exports = { apiLimiter, authLimiter };
