const Product = require('../models/Product');
const paginate = require('../utils/pagination');

const createProduct = async (req, res, next) => {
  try {
    const product = await Product.create(req.body);
    res.success(product, 'Product created successfully', 201);
  } catch (error) {
    next(error);
  }
};

const listProducts = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const query = {};

    // Filters
    if (req.query.category) query.category = req.query.category;
    if (req.query.isActive !== undefined) query.isActive = req.query.isActive === 'true';
    if (req.query.minPrice) query.price = { $gte: parseFloat(req.query.minPrice) };
    if (req.query.maxPrice) {
      if (query.price) query.price.$lte = parseFloat(req.query.maxPrice);
      else query.price = { $lte: parseFloat(req.query.maxPrice) };
    }

    const result = await paginate(Product, query, page, limit);
    
    const products = await Product.find(query)
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ createdAt: -1 });

    res.success({
      products,
      pagination: result.pagination
    });
  } catch (error) {
    next(error);
  }
};

const getProductById = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.error('Product not found', 404);
    }

    res.success(product);
  } catch (error) {
    next(error);
  }
};

const updateProduct = async (req, res, next) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!product) {
      return res.error('Product not found', 404);
    }

    res.success(product, 'Product updated successfully');
  } catch (error) {
    next(error);
  }
};

const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!product) {
      return res.error('Product not found', 404);
    }

    res.success(product, 'Product deactivated successfully');
  } catch (error) {
    next(error);
  }
};

const searchProducts = async (req, res, next) => {
  try {
    const { q, category, minPrice, maxPrice, sortBy, sortOrder } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const query = { isActive: true };

    // Text search
    if (q) {
      query.$or = [
        { name: { $regex: q, $options: 'i' } },
        { sku: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } },
        { tags: { $in: [new RegExp(q, 'i')] } }
      ];
    }

    // Category filter
    if (category) query.category = category;

    // Price range filter
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = parseFloat(minPrice);
      if (maxPrice) query.price.$lte = parseFloat(maxPrice);
    }

    // Sorting
    let sort = { createdAt: -1 };
    if (sortBy) {
      const sortDirection = sortOrder === 'asc' ? 1 : -1;
      sort = { [sortBy]: sortDirection };
    }

    const result = await paginate(Product, query, page, limit);
    
    const products = await Product.find(query)
      .skip((page - 1) * limit)
      .limit(limit)
      .sort(sort);

    res.success({
      products,
      pagination: result.pagination
    });
  } catch (error) {
    next(error);
  }
};

const getProductInventory = async (req, res, next) => {
  try {
    const Inventory = require('../models/Inventory');
    
    const inventory = await Inventory.find({ product: req.params.id })
      .populate('warehouse', 'code name')
      .sort({ quantity: -1 });

    res.success({ inventory });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createProduct,
  listProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  searchProducts,
  getProductInventory
};
