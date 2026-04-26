const Cart = require('../models/Cart');
const Product = require('../models/Product');

const getCart = async (req, res, next) => {
  try {
    let cart = await Cart.findOne({ user: req.userId }).populate('items.product');
    
    if (!cart) {
      cart = await Cart.create({ user: req.userId, items: [] });
    }

    res.success(cart);
  } catch (error) {
    next(error);
  }
};

const addToCart = async (req, res, next) => {
  try {
    const { productId, quantity } = req.body;

    // Validate product exists and is active
    const product = await Product.findOne({ _id: productId, isActive: true });
    
    if (!product) {
      return res.error('Product not found or inactive', 404);
    }

    // Get or create cart
    let cart = await Cart.findOne({ user: req.userId });
    
    if (!cart) {
      cart = await Cart.create({ user: req.userId, items: [] });
    }

    // Check if product already in cart
    const existingItemIndex = cart.items.findIndex(
      item => item.product.toString() === productId
    );

    if (existingItemIndex >= 0) {
      // Update quantity
      cart.items[existingItemIndex].quantity += quantity;
      cart.items[existingItemIndex].totalPrice = cart.items[existingItemIndex].unitPrice * cart.items[existingItemIndex].quantity;
    } else {
      // Add new item
      cart.items.push({
        product: productId,
        productName: product.name,
        productSku: product.sku,
        quantity,
        unitPrice: product.price,
        totalPrice: product.price * quantity
      });
    }

    await cart.save();
    await cart.populate('items.product');

    res.success(cart, 'Item added to cart');
  } catch (error) {
    next(error);
  }
};

const updateCartItem = async (req, res, next) => {
  try {
    const { productId, quantity } = req.body;

    if (quantity < 1) {
      return res.error('Quantity must be at least 1', 400);
    }

    const cart = await Cart.findOne({ user: req.userId });
    
    if (!cart) {
      return res.error('Cart not found', 404);
    }

    const itemIndex = cart.items.findIndex(
      item => item.product.toString() === productId
    );

    if (itemIndex < 0) {
      return res.error('Item not found in cart', 404);
    }

    cart.items[itemIndex].quantity = quantity;
    cart.items[itemIndex].totalPrice = cart.items[itemIndex].unitPrice * quantity;

    await cart.save();
    await cart.populate('items.product');

    res.success(cart, 'Cart item updated');
  } catch (error) {
    next(error);
  }
};

const removeFromCart = async (req, res, next) => {
  try {
    const { productId } = req.params;

    const cart = await Cart.findOne({ user: req.userId });
    
    if (!cart) {
      return res.error('Cart not found', 404);
    }

    cart.items = cart.items.filter(
      item => item.product.toString() !== productId
    );

    await cart.save();
    await cart.populate('items.product');

    res.success(cart, 'Item removed from cart');
  } catch (error) {
    next(error);
  }
};

const clearCart = async (req, res, next) => {
  try {
    const cart = await Cart.findOne({ user: req.userId });
    
    if (!cart) {
      return res.error('Cart not found', 404);
    }

    cart.items = [];
    await cart.save();

    res.success(cart, 'Cart cleared');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart
};
