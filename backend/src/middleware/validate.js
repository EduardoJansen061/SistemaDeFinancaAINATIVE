const { validationResult } = require('express-validator');

/**
 * Middleware que processa os erros do express-validator.
 * Deve ser usado após as regras de validação.
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).json({
      error: 'Dados inválidos.',
      details: errors.array().map(e => ({
        field: e.path,
        message: e.msg,
      })),
    });
  }

  next();
};

module.exports = { validate };
