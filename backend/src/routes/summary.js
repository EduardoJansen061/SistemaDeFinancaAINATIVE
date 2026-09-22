const express = require('express');
const router = express.Router();
const { getSummary } = require('../controllers/summaryController');
const { authenticate } = require('../middleware/auth');
const { apiLimiter } = require('../middleware/rateLimiter');

router.use(authenticate, apiLimiter);

router.get('/:year/:month', getSummary);

module.exports = router;
