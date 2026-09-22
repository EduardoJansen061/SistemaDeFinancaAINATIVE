const express = require('express');
const { body } = require('express-validator');
const router = express.Router();

const { register, login, me, updateProfile } = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const { authLimiter } = require('../middleware/rateLimiter');

// === Validation Rules ===
const registerRules = [
  body('name').trim().isLength({ min: 2, max: 100 }).withMessage('Nome deve ter entre 2 e 100 caracteres.'),
  body('email').isEmail().normalizeEmail().withMessage('E-mail inválido.'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Senha deve ter no mínimo 8 caracteres.')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Senha deve conter letras maiúsculas, minúsculas e números.'),
];

const loginRules = [
  body('email').isEmail().normalizeEmail().withMessage('E-mail inválido.'),
  body('password').notEmpty().withMessage('Senha obrigatória.'),
];

// === Routes ===
router.post('/register', authLimiter, registerRules, validate, register);
router.post('/login', authLimiter, loginRules, validate, login);
router.get('/me', authenticate, me);
router.put('/profile', authenticate, [
  body('name').trim().isLength({ min: 2, max: 100 }).optional(),
  body('currency').isIn(['BRL', 'USD', 'EUR']).optional(),
], validate, updateProfile);

module.exports = router;
