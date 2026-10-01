// const express = require('express');
// const router = express.Router();
// const webhookController = require('../controllers/webhook.controller');

// // GET /webhook - Verification endpoint (WhatsApp requires this)
// router.get('/', webhookController.verifyWebhook);

// // POST /webhook - Event receiving endpoint
// router.post('/', webhookController.handleWebhook);

// module.exports = router;

const express = require('express');
const router = express.Router();
const webhookController = require('../controllers/webhook.controller');

// GET /webhook - Verification endpoint (WhatsApp requires this)
router.get('/', webhookController.verifyWebhook);

// POST /webhook - Event receiving endpoint
router.post('/', webhookController.handleWebhook);

// POST /webhook/send - Test endpoint to send messages
router.post('/send', webhookController.sendTestMessage);

// GET /webhook/customer/:phoneNumber - Get customer info
router.get('/customer/:phoneNumber', webhookController.getCustomerInfo);

module.exports = router;