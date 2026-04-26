const Invoice = require('../models/Invoice');
const Order = require('../models/Order');
const Payment = require('../models/Payment');

const generateInvoiceNumber = () => {
  const date = new Date();
  const year = date.getFullYear().toString().slice(-2);
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `INV-${year}${month}-${random}`;
};

const generateInvoice = async (req, res, next) => {
  try {
    const { orderId } = req.body;

    const order = await Order.findById(orderId)
      .populate('customer', 'firstName lastName email')
      .populate('items.product');

    if (!order) {
      return res.error('Order not found', 404);
    }

    // Check if invoice already exists for this order
    const existingInvoice = await Invoice.findOne({ order: orderId });
    if (existingInvoice) {
      return res.error('Invoice already exists for this order', 400);
    }

    // Calculate amounts
    const subtotal = order.items.reduce((sum, item) => sum + item.totalPrice, 0);
    const taxAmount = subtotal * 0.14; // 14% tax
    const totalAmount = subtotal - order.discountAmount + taxAmount;

    // Set due date (30 days from now)
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 30);

    const invoice = await Invoice.create({
      invoiceNumber: generateInvoiceNumber(),
      order: order._id,
      customer: order.customer._id,
      items: order.items.map(item => ({
        product: item.product._id,
        productName: item.productName,
        productSku: item.productSku,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        totalPrice: item.totalPrice
      })),
      subtotal,
      discountAmount: order.discountAmount,
      taxAmount,
      totalAmount,
      status: 'sent',
      dueDate,
      billingAddress: order.billingAddress
    });

    // Update order payment status
    order.paymentStatus = 'pending';
    await order.save();

    const populatedInvoice = await Invoice.findById(invoice._id)
      .populate('customer', 'firstName lastName email')
      .populate('order', 'orderNumber')
      .populate('items.product');

    res.success(populatedInvoice, 'Invoice generated successfully', 201);
  } catch (error) {
    next(error);
  }
};

const listInvoices = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const query = {};
    
    // Customers can only see their own invoices
    if (req.user.role.code === 'customer') {
      query.customer = req.userId;
    }

    if (req.query.status) query.status = req.query.status;

    const [invoices, total] = await Promise.all([
      Invoice.find(query)
        .skip(skip)
        .limit(limit)
        .populate('customer', 'firstName lastName email')
        .populate('order', 'orderNumber')
        .sort({ createdAt: -1 }),
      Invoice.countDocuments(query)
    ]);

    res.success({
      invoices,
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

const getInvoiceById = async (req, res, next) => {
  try {
    const invoice = await Invoice.findById(req.params.id)
      .populate('customer', 'firstName lastName email')
      .populate('order', 'orderNumber')
      .populate('items.product');

    if (!invoice) {
      return res.error('Invoice not found', 404);
    }

    // Customers can only view their own invoices
    if (req.user.role.code === 'customer' && invoice.customer._id.toString() !== req.userId) {
      return res.error('Access denied', 403);
    }

    res.success(invoice);
  } catch (error) {
    next(error);
  }
};

const markAsPaid = async (req, res, next) => {
  try {
    const invoice = await Invoice.findById(req.params.id);

    if (!invoice) {
      return res.error('Invoice not found', 404);
    }

    if (invoice.status === 'paid') {
      return res.error('Invoice is already paid', 400);
    }

    invoice.status = 'paid';
    invoice.paidDate = new Date();
    await invoice.save();

    // Update order payment status
    const order = await Order.findById(invoice.order);
    if (order) {
      order.paymentStatus = 'paid';
      await order.save();
    }

    const populatedInvoice = await Invoice.findById(invoice._id)
      .populate('customer', 'firstName lastName email')
      .populate('order', 'orderNumber');

    res.success(populatedInvoice, 'Invoice marked as paid');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  generateInvoice,
  listInvoices,
  getInvoiceById,
  markAsPaid
};
