const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const Inventory = require('../models/Inventory');
const Warehouse = require('../models/Warehouse');
const StockMovement = require('../models/StockMovement');

const generateOrderNumber = () => {
  const date = new Date();
  const year = date.getFullYear().toString().slice(-2);
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `ORD-${year}${month}-${random}`;
};

const createOrder = async (req, res, next) => {
  try {
    const { shippingAddress, billingAddress, notes, paymentMethod } = req.body;

    // Get user's cart
    const cart = await Cart.findOne({ user: req.userId }).populate('items.product');
    
    if (!cart || cart.items.length === 0) {
      return res.error('Cart is empty', 400);
    }

    // Check stock availability
    for (const item of cart.items) {
      const product = item.product;
      if (!product.isActive) {
        return res.error(`Product ${product.name} is not available`, 400);
      }

      // Find warehouse with stock
      const inventory = await Inventory.findOne({ product: product._id })
        .sort({ availableQuantity: -1 });

      if (!inventory || inventory.availableQuantity < item.quantity) {
        return res.error(`Insufficient stock for ${product.name}`, 400);
      }
    }

    // Assign warehouse (closest with stock)
    const warehouse = await Warehouse.findOne({ isActive: true });
    
    // Create order
    const order = await Order.create({
      orderNumber: generateOrderNumber(),
      customer: req.userId,
      items: cart.items.map(item => ({
        product: item.product._id,
        productName: item.product.name,
        productSku: item.product.sku,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        totalPrice: item.totalPrice
      })),
      shippingAddress,
      billingAddress: billingAddress || shippingAddress,
      notes,
      paymentMethod,
      assignedWarehouse: warehouse ? warehouse._id : null,
      status: 'pending',
      paymentStatus: 'pending'
    });

    // Reserve stock
    for (const item of cart.items) {
      const inventory = await Inventory.findOne({ product: item.product._id })
        .sort({ availableQuantity: -1 });

      if (inventory) {
        inventory.reservedQuantity += item.quantity;
        await inventory.save();

        // Create stock movement
        await StockMovement.create({
          product: item.product._id,
          warehouse: inventory.warehouse,
          type: 'out',
          quantity: 0,
          reason: `Reserved for order ${order.orderNumber}`,
          performedBy: req.userId,
          previousQuantity: inventory.quantity,
          newQuantity: inventory.quantity
        });
      }
    }

    // Clear cart
    cart.items = [];
    await cart.save();

    const populatedOrder = await Order.findById(order._id)
      .populate('customer', 'firstName lastName email')
      .populate('items.product')
      .populate('assignedWarehouse', 'code name');

    res.success(populatedOrder, 'Order created successfully', 201);
  } catch (error) {
    next(error);
  }
};

const listOrders = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const query = {};
    
    // Customers can only see their own orders
    if (req.user.role.code === 'customer') {
      query.customer = req.userId;
    }
    
    // Distributors can only see orders assigned to their warehouse
    if (req.user.role.code === 'distributor') {
      const warehouse = await Warehouse.findOne({ manager: req.userId });
      if (warehouse) {
        query.assignedWarehouse = warehouse._id;
      } else {
        query.assignedWarehouse = null; // No orders if no warehouse assigned
      }
    }

    // Status filter
    if (req.query.status) query.status = req.query.status;

    // Order number search
    if (req.query.orderNumber) {
      query.orderNumber = { $regex: req.query.orderNumber, $options: 'i' };
    }

    // Date range filter
    if (req.query.startDate || req.query.endDate) {
      query.createdAt = {};
      if (req.query.startDate) query.createdAt.$gte = new Date(req.query.startDate);
      if (req.query.endDate) query.createdAt.$lte = new Date(req.query.endDate);
    }

    // Customer name search (for admins)
    if (req.query.customerName && req.user.role.code === 'superadmin') {
      const customers = await User.find({
        $or: [
          { firstName: { $regex: req.query.customerName, $options: 'i' } },
          { lastName: { $regex: req.query.customerName, $options: 'i' } }
        ]
      }).select('_id');
      query.customer = { $in: customers.map(c => c._id) };
    }

    // Sorting
    let sort = { createdAt: -1 };
    if (req.query.sortBy) {
      const sortDirection = req.query.sortOrder === 'asc' ? 1 : -1;
      sort = { [req.query.sortBy]: sortDirection };
    }

    const [orders, total] = await Promise.all([
      Order.find(query)
        .skip(skip)
        .limit(limit)
        .populate('customer', 'firstName lastName email')
        .populate('items.product')
        .populate('assignedWarehouse', 'code name')
        .sort(sort),
      Order.countDocuments(query)
    ]);

    res.success({
      orders,
      pagination: {
        page,
        limit,
        total,
        last_page: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    next(error);
  }
};

const getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('customer', 'firstName lastName email')
      .populate('items.product')
      .populate('assignedWarehouse', 'code name')
      .populate('assignedDistributor', 'firstName lastName email');

    if (!order) {
      return res.error('Order not found', 404);
    }

    // Customers can only view their own orders
    if (req.user.role.code === 'customer' && order.customer._id.toString() !== req.userId) {
      return res.error('Access denied', 403);
    }

    // Distributors can only view orders assigned to their warehouse
    if (req.user.role.code === 'distributor') {
      const warehouse = await Warehouse.findOne({ manager: req.userId });
      if (!warehouse || order.assignedWarehouse._id.toString() !== warehouse._id.toString()) {
        return res.error('Access denied', 403);
      }
    }

    res.success(order);
  } catch (error) {
    next(error);
  }
};

const cancelOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.error('Order not found', 404);
    }

    // Customers can only cancel their own orders
    if (req.user.role.code === 'customer' && order.customer.toString() !== req.userId) {
      return res.error('Access denied', 403);
    }

    // Can only cancel pending or confirmed orders
    if (!['pending', 'confirmed'].includes(order.status)) {
      return res.error('Order cannot be cancelled at this stage', 400);
    }

    // Release reserved stock
    for (const item of order.items) {
      const inventory = await Inventory.findOne({ product: item.product });
      if (inventory) {
        inventory.reservedQuantity -= item.quantity;
        await inventory.save();
      }
    }

    order.status = 'cancelled';
    await order.save();

    const populatedOrder = await Order.findById(order._id)
      .populate('customer', 'firstName lastName email')
      .populate('items.product');

    res.success(populatedOrder, 'Order cancelled successfully');
  } catch (error) {
    next(error);
  }
};

const acceptOrder = async (req, res, next) => {
  try {
    const { reason } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.error('Order not found', 404);
    }

    // Verify distributor manages the assigned warehouse
    const warehouse = await Warehouse.findOne({ manager: req.userId });
    if (!warehouse || order.assignedWarehouse.toString() !== warehouse._id.toString()) {
      return res.error('Access denied', 403);
    }

    // Can only accept pending orders
    if (order.status !== 'pending') {
      return res.error('Order cannot be accepted at this stage', 400);
    }

    order.status = 'confirmed';
    order.assignedDistributor = req.userId;
    order.estimatedDelivery = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000); // 3 days
    await order.save();

    const populatedOrder = await Order.findById(order._id)
      .populate('customer', 'firstName lastName email')
      .populate('items.product')
      .populate('assignedWarehouse', 'code name')
      .populate('assignedDistributor', 'firstName lastName email');

    res.success(populatedOrder, 'Order accepted successfully');
  } catch (error) {
    next(error);
  }
};

const rejectOrder = async (req, res, next) => {
  try {
    const { reason } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.error('Order not found', 404);
    }

    // Verify distributor manages the assigned warehouse
    const warehouse = await Warehouse.findOne({ manager: req.userId });
    if (!warehouse || order.assignedWarehouse.toString() !== warehouse._id.toString()) {
      return res.error('Access denied', 403);
    }

    // Can only reject pending orders
    if (order.status !== 'pending') {
      return res.error('Order cannot be rejected at this stage', 400);
    }

    // Release reserved stock
    for (const item of order.items) {
      const inventory = await Inventory.findOne({ product: item.product });
      if (inventory) {
        inventory.reservedQuantity -= item.quantity;
        await inventory.save();
      }
    }

    order.status = 'cancelled';
    order.notes = order.notes + (reason ? ` | Rejection: ${reason}` : ' | Rejected by distributor');
    await order.save();

    const populatedOrder = await Order.findById(order._id)
      .populate('customer', 'firstName lastName email')
      .populate('items.product');

    res.success(populatedOrder, 'Order rejected successfully');
  } catch (error) {
    next(error);
  }
};

const prepareOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.error('Order not found', 404);
    }

    // Verify distributor manages the assigned warehouse
    const warehouse = await Warehouse.findOne({ manager: req.userId });
    if (!warehouse || order.assignedWarehouse.toString() !== warehouse._id.toString()) {
      return res.error('Access denied', 403);
    }

    // Can only prepare confirmed orders
    if (order.status !== 'confirmed') {
      return res.error('Order cannot be prepared at this stage', 400);
    }

    // Deduct actual stock from inventory
    for (const item of order.items) {
      const inventory = await Inventory.findOne({ 
        product: item.product, 
        warehouse: warehouse._id 
      });

      if (!inventory || inventory.quantity < item.quantity) {
        return res.error(`Insufficient stock for ${item.productName}`, 400);
      }

      inventory.quantity -= item.quantity;
      inventory.reservedQuantity -= item.quantity;
      await inventory.save();

      // Create stock movement
      await StockMovement.create({
        product: item.product,
        warehouse: warehouse._id,
        type: 'out',
        quantity: -item.quantity,
        reason: `Order ${order.orderNumber} preparation`,
        performedBy: req.userId,
        previousQuantity: inventory.quantity + item.quantity,
        newQuantity: inventory.quantity
      });
    }

    order.status = 'processing';
    await order.save();

    const populatedOrder = await Order.findById(order._id)
      .populate('customer', 'firstName lastName email')
      .populate('items.product')
      .populate('assignedWarehouse', 'code name')
      .populate('assignedDistributor', 'firstName lastName email');

    res.success(populatedOrder, 'Order prepared successfully');
  } catch (error) {
    next(error);
  }
};

const shipOrder = async (req, res, next) => {
  try {
    const { trackingNumber } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.error('Order not found', 404);
    }

    // Verify distributor manages the assigned warehouse
    const warehouse = await Warehouse.findOne({ manager: req.userId });
    if (!warehouse || order.assignedWarehouse.toString() !== warehouse._id.toString()) {
      return res.error('Access denied', 403);
    }

    // Can only ship processing orders
    if (order.status !== 'processing') {
      return res.error('Order cannot be shipped at this stage', 400);
    }

    order.status = 'shipped';
    order.estimatedDelivery = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000); // 2 days
    await order.save();

    const populatedOrder = await Order.findById(order._id)
      .populate('customer', 'firstName lastName email')
      .populate('items.product')
      .populate('assignedWarehouse', 'code name')
      .populate('assignedDistributor', 'firstName lastName email');

    res.success(populatedOrder, 'Order shipped successfully');
  } catch (error) {
    next(error);
  }
};

const confirmDelivery = async (req, res, next) => {
  try {
    const { notes } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.error('Order not found', 404);
    }

    // Verify distributor manages the assigned warehouse
    const warehouse = await Warehouse.findOne({ manager: req.userId });
    if (!warehouse || order.assignedWarehouse.toString() !== warehouse._id.toString()) {
      return res.error('Access denied', 403);
    }

    // Can only confirm delivery for shipped orders
    if (order.status !== 'shipped') {
      return res.error('Order cannot be marked as delivered at this stage', 400);
    }

    order.status = 'delivered';
    order.actualDelivery = new Date();
    if (notes) order.notes = order.notes + ` | Delivery notes: ${notes}`;
    await order.save();

    const populatedOrder = await Order.findById(order._id)
      .populate('customer', 'firstName lastName email')
      .populate('items.product')
      .populate('assignedWarehouse', 'code name')
      .populate('assignedDistributor', 'firstName lastName email');

    res.success(populatedOrder, 'Delivery confirmed successfully');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createOrder,
  listOrders,
  getOrderById,
  cancelOrder,
  acceptOrder,
  rejectOrder,
  prepareOrder,
  shipOrder,
  confirmDelivery
};
