const Payment = require('../models/Payment');
const Invoice = require('../models/Invoice');
const Order = require('../models/Order');

const generatePaymentNumber = () => {
  const date = new Date();
  const year = date.getFullYear().toString().slice(-2);
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `PAY-${year}${month}-${random}`;
};

const recordPayment = async (req, res, next) => {
  try {
    const { invoiceId, amount, paymentMethod, transactionId, notes } = req.body;

    const invoice = await Invoice.findById(invoiceId).populate('order');

    if (!invoice) {
      return res.error('Invoice not found', 404);
    }

    if (invoice.status === 'paid') {
      return res.error('Invoice is already paid', 400);
    }

    if (amount > invoice.totalAmount) {
      return res.error('Payment amount exceeds invoice total', 400);
    }

    const payment = await Payment.create({
      paymentNumber: generatePaymentNumber(),
      invoice: invoiceId,
      order: invoice.order._id,
      customer: invoice.customer,
      amount,
      paymentMethod,
      status: 'completed',
      transactionId,
      paidDate: new Date(),
      notes
    });

    // Check if invoice is fully paid
    const totalPaid = await Payment.aggregate([
      { $match: { invoice: invoiceId, status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    const paidAmount = totalPaid[0]?.total || 0;

    if (paidAmount >= invoice.totalAmount) {
      invoice.status = 'paid';
      invoice.paidDate = new Date();
      await invoice.save();

      // Update order payment status
      const order = await Order.findById(invoice.order._id);
      if (order) {
        order.paymentStatus = 'paid';
        await order.save();
      }
    } else {
      invoice.status = 'partial';
      await invoice.save();
    }

    const populatedPayment = await Payment.findById(payment._id)
      .populate('customer', 'firstName lastName email')
      .populate('invoice', 'invoiceNumber')
      .populate('order', 'orderNumber');

    res.success(populatedPayment, 'Payment recorded successfully', 201);
  } catch (error) {
    next(error);
  }
};

const listPayments = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const query = {};
    
    // Customers can only see their own payments
    if (req.user.role.code === 'customer') {
      query.customer = req.userId;
    }

    if (req.query.status) query.status = req.query.status;

    const [payments, total] = await Promise.all([
      Payment.find(query)
        .skip(skip)
        .limit(limit)
        .populate('customer', 'firstName lastName email')
        .populate('invoice', 'invoiceNumber')
        .populate('order', 'orderNumber')
        .sort({ createdAt: -1 }),
      Payment.countDocuments(query)
    ]);

    res.success({
      payments,
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

const getPaymentById = async (req, res, next) => {
  try {
    const payment = await Payment.findById(req.params.id)
      .populate('customer', 'firstName lastName email')
      .populate('invoice', 'invoiceNumber')
      .populate('order', 'orderNumber');

    if (!payment) {
      return res.error('Payment not found', 404);
    }

    // Customers can only view their own payments
    if (req.user.role.code === 'customer' && payment.customer._id.toString() !== req.userId) {
      return res.error('Access denied', 403);
    }

    res.success(payment);
  } catch (error) {
    next(error);
  }
};

const refundPayment = async (req, res, next) => {
  try {
    const { reason } = req.body;
    const payment = await Payment.findById(req.params.id).populate('invoice');

    if (!payment) {
      return res.error('Payment not found', 404);
    }

    if (payment.status !== 'completed') {
      return res.error('Payment cannot be refunded', 400);
    }

    if (payment.status === 'refunded') {
      return res.error('Payment is already refunded', 400);
    }

    payment.status = 'refunded';
    payment.refundDate = new Date();
    payment.refundReason = reason;
    await payment.save();

    // Update invoice status
    const invoice = payment.invoice;
    if (invoice) {
      const totalPaid = await Payment.aggregate([
        { $match: { invoice: invoice._id, status: 'completed' } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]);

      const paidAmount = totalPaid[0]?.total || 0;

      if (paidAmount >= invoice.totalAmount) {
        invoice.status = 'paid';
      } else if (paidAmount > 0) {
        invoice.status = 'partial';
      } else {
        invoice.status = 'sent';
      }
      await invoice.save();
    }

    const populatedPayment = await Payment.findById(payment._id)
      .populate('customer', 'firstName lastName email')
      .populate('invoice', 'invoiceNumber')
      .populate('order', 'orderNumber');

    res.success(populatedPayment, 'Payment refunded successfully');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  recordPayment,
  listPayments,
  getPaymentById,
  refundPayment
};
