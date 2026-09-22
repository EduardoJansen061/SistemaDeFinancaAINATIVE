const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const ctrl = require('../controllers/categoriesController');
const { authenticate } = require('../middleware/auth');
const { validate } = require('../middleware/validate');

router.use(authenticate);

router.get('/', ctrl.list);
router.post('/', [
  body('name').trim().isLength({ min: 2, max: 100 }),
  body('color').optional().matches(/^#[0-9A-Fa-f]{6}$/).withMessage('Cor deve ser hexadecimal.'),
], validate, ctrl.create);
router.put('/:id', ctrl.update);
router.delete('/:id', ctrl.remove);

module.exports = router;
