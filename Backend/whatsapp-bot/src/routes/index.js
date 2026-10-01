const express = require('express');
const router = express.Router();

router.use('/admin/products', require('./product.routes'));
router.use('/admin', require('./admin.routes'));
router.use('/whatsapp', require('./whatsapp.routes'));

module.exports = router;
