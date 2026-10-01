const { body } = require('express-validator');

const createProductValidator = [
  body('itemName').notEmpty().withMessage('Item name is required').trim(),
  body('itemCode').notEmpty().withMessage('Item code is required').trim(),
  body('mrp').isFloat({ min: 0 }).withMessage('MRP must be a positive number'),
  body('bestPrice').isFloat({ min: 0 }).withMessage('Best price must be a positive number'),
  body('description').optional().isString(),
  body('weight').optional().isString(),
  body('benefits').optional().isString(),
  body('category').optional().isString(),
  body('stock').optional().isInt({ min: 0 }),
  body('active').optional().isBoolean(),
];

const updateProductValidator = [
  body('itemName').optional().notEmpty().trim(),
  body('itemCode').optional().notEmpty().trim(),
  body('mrp').optional().isFloat({ min: 0 }),
  body('bestPrice').optional().isFloat({ min: 0 }),
  body('description').optional().isString(),
  body('weight').optional().isString(),
  body('benefits').optional().isString(),
  body('category').optional().isString(),
  body('stock').optional().isInt({ min: 0 }),
  body('active').optional().isBoolean(),
];

module.exports = { createProductValidator, updateProductValidator };
