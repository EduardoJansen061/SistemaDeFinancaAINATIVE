const jwt = require('jsonwebtoken');
const { User } = require('../models');

/**
 * Middleware de autenticação JWT.
 * Valida o token Bearer e injeta req.user.
 */
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Token de autenticação não fornecido.' });
    }

    const token = authHeader.split(' ')[1];

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        return res.status(401).json({ error: 'Token expirado. Faça login novamente.' });
      }
      return res.status(401).json({ error: 'Token inválido.' });
    }

    const user = await User.findByPk(decoded.id, {
      attributes: ['id', 'name', 'email', 'currency'],
    });

    if (!user) {
      return res.status(401).json({ error: 'Usuário não encontrado.' });
    }

    req.user = user;
    next();
  } catch (err) {
    console.error('Auth middleware error:', err.message);
    res.status(500).json({ error: 'Erro interno de autenticação.' });
  }
};

module.exports = { authenticate };
