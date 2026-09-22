const express = require('express');
const { body, query } = require('express-validator');
const router = express.Router();
const ctrl = require('../controllers/incomesController');
const { authenticate } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const { apiLimiter } = require('../middleware/rateLimiter');

router.use(authenticate, apiLimiter);

const createRules = [
  body('type').isIn(['salary', 'extra', 'other']).withMessage('Tipo inválido.'),
  body('description').trim().isLength({ min: 2, max: 200 }).withMessage('Descrição inválida.'),
  body('amount').isFloat({ min: 0.01 }).withMessage('Valor deve ser positivo.'),
  body('currency').optional().isIn(['BRL', 'USD', 'EUR']).withMessage('Moeda inválida.'),
  body('exchange_rate').optional().isFloat({ min: 0.0001 }).withMessage('Taxa de câmbio inválida.'),
  body('month').isInt({ min: 1, max: 12 }).withMessage('Mês inválido.'),
  body('year').isInt({ min: 2000, max: 2100 }).withMessage('Ano inválido.'),
];

router.get('/', ctrl.list);
router.post('/', createRules, validate, ctrl.create);
router.get('/:id', ctrl.getOne);
router.put('/:id', ctrl.update);
router.delete('/:id', ctrl.remove);
router.patch('/:id/receive', ctrl.markReceived);

module.exports = router;
