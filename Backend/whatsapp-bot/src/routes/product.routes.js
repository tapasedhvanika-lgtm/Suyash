const express = require('express');
const router = express.Router();

const productController = require('../controllers/product.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validate.middleware');
const upload = require('../middlewares/upload.middleware');
const { createProductValidator, updateProductValidator } = require('../validators/product.validator');

// All product management routes are admin-only
router.use(authenticate);

router.post('/', upload.single('image'), createProductValidator, validate, productController.createProduct);
router.get('/', productController.listProducts);
router.get('/:id', productController.getProduct);
router.put('/:id', upload.single('image'), updateProductValidator, validate, productController.updateProduct);
router.delete('/:id', productController.deleteProduct);

module.exports = router;
