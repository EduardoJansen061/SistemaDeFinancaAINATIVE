const express = require('express');
const router = express.Router();
const { testWebhook, getLogs } = require('../controllers/webhooksController');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);

router.post('/test', testWebhook);
router.get('/logs', getLogs);

module.exports = router;
