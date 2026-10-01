// const asyncHandler = require('../utils/asyncHandler');
// const ApiResponse = require('../utils/apiResponse');
// const productService = require('../services/product.service');

// // POST /api/admin/products
// const createProduct = asyncHandler(async (req, res) => {
//   const payload = { ...req.body };
//   if (req.file) payload.image = `/uploads/${req.file.filename}`;
//   const product = await productService.createProduct(payload);
//   res.status(201).json(new ApiResponse(201, product, 'Product created successfully'));
// });

// // GET /api/admin/products
// const listProducts = asyncHandler(async (req, res) => {
//   const { page, limit, active, category, search } = req.query;
//   const filter = { page, limit, category, search };
//   if (active !== undefined) filter.active = active === 'true';
//   const result = await productService.listProducts(filter);
//   res.status(200).json(new ApiResponse(200, result, 'Products fetched successfully'));
// });

// // GET /api/admin/products/:id
// const getProduct = asyncHandler(async (req, res) => {
//   const product = await productService.getProductById(req.params.id);
//   res.status(200).json(new ApiResponse(200, product, 'Product fetched successfully'));
// });

// // PUT /api/admin/products/:id
// const updateProduct = asyncHandler(async (req, res) => {
//   const payload = { ...req.body };
//   if (req.file) payload.image = `/uploads/${req.file.filename}`;
//   const product = await productService.updateProduct(req.params.id, payload);
//   res.status(200).json(new ApiResponse(200, product, 'Product updated successfully'));
// });

// // DELETE /api/admin/products/:id
// const deleteProduct = asyncHandler(async (req, res) => {
//   await productService.deleteProduct(req.params.id);
//   res.status(200).json(new ApiResponse(200, null, 'Product deleted successfully'));
// });

// module.exports = { createProduct, listProducts, getProduct, updateProduct, deleteProduct };
const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/apiResponse');
const productService = require('../services/product.service');

// POST /api/admin/products
const createProduct = asyncHandler(async (req, res) => {
  const payload = { ...req.body };
  if (req.file) payload.image = `/uploads/${req.file.filename}`;
  const product = await productService.createProduct(payload);
  res.status(201).json(new ApiResponse(201, product, 'Product created successfully'));
});

// GET /api/admin/products
const listProducts = asyncHandler(async (req, res) => {
  const { page, limit, active, category, search, name } = req.query;
  
  const filter = { 
    page, 
    limit, 
    category, 
    search, 
    name 
  };
  
  // Handle active filter
  if (active !== undefined) {
    filter.active = active === 'true';
  }
  
  const result = await productService.listProducts(filter);
  res.status(200).json(new ApiResponse(200, result, 'Products fetched successfully'));
});

// GET /api/admin/products/:id
const getProduct = asyncHandler(async (req, res) => {
  const product = await productService.getProductById(req.params.id);
  res.status(200).json(new ApiResponse(200, product, 'Product fetched successfully'));
});

// PUT /api/admin/products/:id
const updateProduct = asyncHandler(async (req, res) => {
  const payload = { ...req.body };
  if (req.file) payload.image = `/uploads/${req.file.filename}`;
  const product = await productService.updateProduct(req.params.id, payload);
  res.status(200).json(new ApiResponse(200, product, 'Product updated successfully'));
});

// DELETE /api/admin/products/:id
const deleteProduct = asyncHandler(async (req, res) => {
  await productService.deleteProduct(req.params.id);
  res.status(200).json(new ApiResponse(200, null, 'Product deleted successfully'));
});

module.exports = { 
  createProduct, 
  listProducts, 
  getProduct, 
  updateProduct, 
  deleteProduct 
};