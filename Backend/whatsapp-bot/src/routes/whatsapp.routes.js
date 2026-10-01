// const express = require('express');
// const router = express.Router();

// const whatsappController = require('../controllers/whatsapp.controller');
// const { generalLimiter } = require('../middlewares/rateLimiter.middleware');

// // Meta calls GET once to verify the webhook subscription
// router.get('/webhook', whatsappController.verifyWebhook);

// // Meta calls POST for every inbound message/status update
// router.post('/webhook', generalLimiter, whatsappController.receiveWebhook);

// module.exports = router;

const express = require('express');
const router = express.Router();

const whatsappController = require('../controllers/whatsapp.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validate.middleware');
const upload = require('../middlewares/upload.middleware');
const { generalLimiter } = require('../middlewares/rateLimiter.middleware');
const {
  sendTextValidator,
  sendImageValidator,
  sendListValidator,
  sendButtonsValidator,
  sendTemplateValidator,
  markReadValidator,
} = require('../validators/Whatsapp.validator');

// Meta calls GET once to verify the webhook subscription (public, no auth)
router.get('/webhook', whatsappController.verifyWebhook);

// Meta calls POST for every inbound message/status update (public, no auth)
router.post('/webhook', generalLimiter, whatsappController.receiveWebhook);

// --- Outbound / test-sending endpoints (admin-authenticated) ---
router.use(authenticate);

router.post('/send-text', sendTextValidator, validate, whatsappController.sendText);
router.post('/send-image', upload.single('image'), sendImageValidator, validate, whatsappController.sendImage);
router.post('/send-list', sendListValidator, validate, whatsappController.sendList);
router.post('/send-buttons', sendButtonsValidator, validate, whatsappController.sendButtons);
router.post('/send-template', sendTemplateValidator, validate, whatsappController.sendTemplate);
router.post('/mark-read', markReadValidator, validate, whatsappController.markRead);

module.exports = router;
