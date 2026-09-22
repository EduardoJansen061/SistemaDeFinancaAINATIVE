const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const ctrl = require('../controllers/investmentsController');
const { authenticate } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const { apiLimiter } = require('../middleware/rateLimiter');

router.use(authenticate, apiLimiter);

const createRules = [
  body('name').trim().isLength({ min: 2, max: 200 }).withMessage('Nome inválido.'),
  body('type').isIn(['stocks', 'crypto', 'fixed_income', 'savings', 'real_estate', 'other']),
  body('amount_invested').isFloat({ min: 0.01 }).withMessage('Valor deve ser positivo.'),
  body('currency').optional().isIn(['BRL', 'USD', 'EUR']),
  body('month').isInt({ min: 1, max: 12 }),
  body('year').isInt({ min: 2000, max: 2100 }),
];

router.get('/', ctrl.list);
router.post('/', createRules, validate, ctrl.create);
router.get('/:id', ctrl.getOne);
router.put('/:id', ctrl.update);
router.delete('/:id', ctrl.remove);

module.exports = router;
