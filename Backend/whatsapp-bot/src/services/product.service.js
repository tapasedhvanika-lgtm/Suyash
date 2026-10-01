// // const Product = require('../models/Product');
// // const ApiError = require('../utils/apiError');

// // const createProduct = async (payload) => Product.create(payload);

// // const listProducts = async ({ page = 1, limit = 20, active, category, search } = {}) => {
// //   const filter = {};
// //   if (active !== undefined) filter.active = active;
// //   if (category) filter.category = category;
// //   if (search) filter.$text = { $search: search };

// //   const skip = (Number(page) - 1) * Number(limit);

// //   const [items, total] = await Promise.all([
// //     Product.find(filter).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
// //     Product.countDocuments(filter),
// //   ]);

// //   return { items, total, page: Number(page), limit: Number(limit) };
// // };

// // const getActiveProducts = async () => Product.find({ active: true }).sort({ itemName: 1 });

// // const getProductById = async (id) => {
// //   const product = await Product.findById(id);
// //   if (!product) throw new ApiError(404, 'Product not found');
// //   return product;
// // };

// // const updateProduct = async (id, updates) => {
// //   const product = await Product.findByIdAndUpdate(id, updates, { new: true, runValidators: true });
// //   if (!product) throw new ApiError(404, 'Product not found');
// //   return product;
// // };

// // const deleteProduct = async (id) => {
// //   const product = await Product.findByIdAndDelete(id);
// //   if (!product) throw new ApiError(404, 'Product not found');
// //   return product;
// // };

// // /** Simple keyword search used to ground the AI layer in real product data. */
// // const searchProductsByKeyword = async (query, limit = 5) => {
// //   if (!query) return [];
// //   const results = await Product.find(
// //     { $text: { $search: query }, active: true },
// //     { score: { $meta: 'textScore' } }
// //   )
// //     .sort({ score: { $meta: 'textScore' } })
// //     .limit(limit);

// //   if (results.length > 0) return results;

// //   // Fallback: loose regex match on item name if the text index finds nothing
// //   const regex = new RegExp(query.split(/\s+/).filter(Boolean).join('|'), 'i');
// //   return Product.find({ itemName: regex, active: true }).limit(limit);
// // };

// // module.exports = {
// //   createProduct,
// //   listProducts,
// //   getActiveProducts,
// //   getProductById,
// //   updateProduct,
// //   deleteProduct,
// //   searchProductsByKeyword,
// // };
// const Product = require('../models/product');

// const { ApiError } = require('../utils/apiError');

// /**
//  * List products with filtering, pagination, and search
//  * @param {Object} filter - Filter parameters
//  * @param {number} filter.page - Page number
//  * @param {number} filter.limit - Items per page
//  * @param {boolean} filter.active - Filter by active status
//  * @param {string} filter.category - Filter by category
//  * @param {string} filter.search - Search term for itemName and description
//  * @param {string} filter.name - Specific product name search (searches itemName)
//  */
// const listProducts = async (filter = {}) => {
//   const {
//     page = 1,
//     limit = 10,
//     active,
//     category,
//     search,
//     name
//   } = filter;

//   // Build query
//   const query = {};

//   // Filter by active status
//   if (active !== undefined) {
//     query.active = active === 'true' || active === true;
//   }

//   // Filter by category
//   if (category) {
//     query.category = { $regex: category, $options: 'i' };
//   }

//   // Search by name (specific product name search) - uses itemName
//   if (name) {
//     query.itemName = { $regex: name, $options: 'i' };
//   }

//   // Search by itemName OR description (general search)
//   if (search) {
//     query.$or = [
//       { itemName: { $regex: search, $options: 'i' } },
//       { description: { $regex: search, $options: 'i' } },
//       { benefits: { $regex: search, $options: 'i' } } // Also search in benefits
//     ];
//   }

//   // Pagination
//   const skip = (parseInt(page) - 1) * parseInt(limit);
//   const limitNum = parseInt(limit);

//   // Execute queries
//   const [products, total] = await Promise.all([
//     Product.find(query)
//       .skip(skip)
//       .limit(limitNum)
//       .sort({ createdAt: -1 }),
//     Product.countDocuments(query)
//   ]);

//   return {
//     products,
//     pagination: {
//       page: parseInt(page),
//       limit: limitNum,
//       total,
//       pages: Math.ceil(total / limitNum)
//     }
//   };
// };

// // Get product by ID
// const getProductById = async (id) => {
//   const product = await Product.findById(id);
//   if (!product) {
//     throw new ApiError(404, 'Product not found');
//   }
//   return product;
// };

// // Create product
// const createProduct = async (payload) => {
//   const product = new Product(payload);
//   await product.save();
//   return product;
// };

// // Update product
// const updateProduct = async (id, payload) => {
//   const product = await Product.findByIdAndUpdate(
//     id,
//     payload,
//     { new: true, runValidators: true }
//   );
//   if (!product) {
//     throw new ApiError(404, 'Product not found');
//   }
//   return product;
// };

// // Delete product
// const deleteProduct = async (id) => {
//   const product = await Product.findByIdAndDelete(id);
//   if (!product) {
//     throw new ApiError(404, 'Product not found');
//   }
//   return product;
// };

// // Additional: Search products by keyword (useful for AI/chat features)
// const searchProductsByKeyword = async (query, limit = 5) => {
//   if (!query) return [];
  
//   // Use text search if available
//   const results = await Product.find(
//     { 
//       $text: { $search: query },
//       active: true 
//     },
//     { score: { $meta: 'textScore' } }
//   )
//     .sort({ score: { $meta: 'textScore' } })
//     .limit(limit);

//   if (results.length > 0) return results;

//   // Fallback: loose regex match
//   const regex = new RegExp(query.split(/\s+/).filter(Boolean).join('|'), 'i');
//   return Product.find({ 
//     $or: [
//       { itemName: regex },
//       { description: regex },
//       { benefits: regex }
//     ],
//     active: true 
//   }).limit(limit);
// };

// module.exports = {
//   listProducts,
//   getProductById,
//   createProduct,
//   updateProduct,
//   deleteProduct,
//   searchProductsByKeyword
// };

// const Product = require('../models/Product');
// const ApiError = require('../utils/apiError');

// const createProduct = async (payload) => Product.create(payload);

// const listProducts = async ({ page = 1, limit = 20, active, category, search } = {}) => {
//   const filter = {};
//   if (active !== undefined) filter.active = active;
//   if (category) filter.category = category;
//   if (search) filter.$text = { $search: search };

//   const skip = (Number(page) - 1) * Number(limit);

//   const [items, total] = await Promise.all([
//     Product.find(filter).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
//     Product.countDocuments(filter),
//   ]);

//   return { items, total, page: Number(page), limit: Number(limit) };
// };

// const getActiveProducts = async () => Product.find({ active: true }).sort({ itemName: 1 });

// const getProductById = async (id) => {
//   const product = await Product.findById(id);
//   if (!product) throw new ApiError(404, 'Product not found');
//   return product;
// };

// const updateProduct = async (id, updates) => {
//   const product = await Product.findByIdAndUpdate(id, updates, { new: true, runValidators: true });
//   if (!product) throw new ApiError(404, 'Product not found');
//   return product;
// };

// const deleteProduct = async (id) => {
//   const product = await Product.findByIdAndDelete(id);
//   if (!product) throw new ApiError(404, 'Product not found');
//   return product;
// };

// /** Simple keyword search used to ground the AI layer in real product data. */
// const searchProductsByKeyword = async (query, limit = 5) => {
//   if (!query) return [];
//   const results = await Product.find(
//     { $text: { $search: query }, active: true },
//     { score: { $meta: 'textScore' } }
//   )
//     .sort({ score: { $meta: 'textScore' } })
//     .limit(limit);

//   if (results.length > 0) return results;

//   // Fallback: loose regex match on item name if the text index finds nothing
//   const regex = new RegExp(query.split(/\s+/).filter(Boolean).join('|'), 'i');
//   return Product.find({ itemName: regex, active: true }).limit(limit);
// };

// module.exports = {
//   createProduct,
//   listProducts,
//   getActiveProducts,
//   getProductById,
//   updateProduct,
//   deleteProduct,
//   searchProductsByKeyword,
// };
const Product = require('../models/Product');

const ApiError = require('../utils/apiError');

/**
 * List products with filtering, pagination, and search
 * @param {Object} filter - Filter parameters
 * @param {number} filter.page - Page number
 * @param {number} filter.limit - Items per page
 * @param {boolean} filter.active - Filter by active status
 * @param {string} filter.category - Filter by category
 * @param {string} filter.search - Search term for itemName and description
 * @param {string} filter.name - Specific product name search (searches itemName)
 */
const listProducts = async (filter = {}) => {
  const {
    page = 1,
    limit = 10,
    active,
    category,
    search,
    name
  } = filter;

  // Build query
  const query = {};

  // Filter by active status
  if (active !== undefined) {
    query.active = active === 'true' || active === true;
  }

  // Filter by category
  if (category) {
    query.category = { $regex: category, $options: 'i' };
  }

  // Search by name (specific product name search) - uses itemName
  if (name) {
    query.itemName = { $regex: name, $options: 'i' };
  }

  // Search by itemName OR description (general search)
  if (search) {
    query.$or = [
      { itemName: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
      { benefits: { $regex: search, $options: 'i' } } // Also search in benefits
    ];
  }

  // Pagination
  const skip = (parseInt(page) - 1) * parseInt(limit);
  const limitNum = parseInt(limit);

  // Execute queries
  const [products, total] = await Promise.all([
    Product.find(query)
      .skip(skip)
      .limit(limitNum)
      .sort({ createdAt: -1 }),
    Product.countDocuments(query)
  ]);

  return {
    products,
    pagination: {
      page: parseInt(page),
      limit: limitNum,
      total,
      pages: Math.ceil(total / limitNum)
    }
  };
};

// Get all active products (used by the WhatsApp greeting flow to show the catalog)
const getActiveProducts = async () => Product.find({ active: true }).sort({ itemName: 1 });

// Get product by ID
const getProductById = async (id) => {
  const product = await Product.findById(id);
  if (!product) {
    throw new ApiError(404, 'Product not found');
  }
  return product;
};

// Create product
const createProduct = async (payload) => {
  const product = new Product(payload);
  await product.save();
  return product;
};

// Update product
const updateProduct = async (id, payload) => {
  const product = await Product.findByIdAndUpdate(
    id,
    payload,
    { new: true, runValidators: true }
  );
  if (!product) {
    throw new ApiError(404, 'Product not found');
  }
  return product;
};

// Delete product
const deleteProduct = async (id) => {
  const product = await Product.findByIdAndDelete(id);
  if (!product) {
    throw new ApiError(404, 'Product not found');
  }
  return product;
};

// Additional: Search products by keyword (useful for AI/chat features)
const searchProductsByKeyword = async (query, limit = 5) => {
  if (!query) return [];
  
  // Use text search if available
  const results = await Product.find(
    { 
      $text: { $search: query },
      active: true 
    },
    { score: { $meta: 'textScore' } }
  )
    .sort({ score: { $meta: 'textScore' } })
    .limit(limit);

  if (results.length > 0) return results;

  // Fallback: loose regex match
  const regex = new RegExp(query.split(/\s+/).filter(Boolean).join('|'), 'i');
  return Product.find({ 
    $or: [
      { itemName: regex },
      { description: regex },
      { benefits: regex }
    ],
    active: true 
  }).limit(limit);
};

module.exports = {
  listProducts,
  getActiveProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  searchProductsByKeyword
};