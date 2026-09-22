const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const ctrl = require('../controllers/expensesController');
const { authenticate } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const { apiLimiter } = require('../middleware/rateLimiter');

router.use(authenticate, apiLimiter);

const createRules = [
  body('description').trim().isLength({ min: 2, max: 200 }).withMessage('Descrição inválida.'),
  body('amount').isFloat({ min: 0.01 }).withMessage('Valor deve ser positivo.'),
  body('currency').optional().isIn(['BRL', 'USD', 'EUR']),
  body('month').isInt({ min: 1, max: 12 }).withMessage('Mês inválido.'),
  body('year').isInt({ min: 2000, max: 2100 }).withMessage('Ano inválido.'),
  body('total_installments').optional().isInt({ min: 2, max: 360 }).withMessage('Parcelas: 2 a 360.'),
  body('due_day').optional().isInt({ min: 1, max: 31 }).withMessage('Dia de vencimento: 1 a 31.'),
];

router.get('/upcoming', ctrl.upcoming);
router.get('/', ctrl.list);
router.post('/', createRules, validate, ctrl.create);
router.get('/:id', ctrl.getOne);
router.put('/:id', ctrl.update);
router.delete('/:id', ctrl.remove);
router.patch('/:id/pay', ctrl.markPaid);

module.exports = router;
