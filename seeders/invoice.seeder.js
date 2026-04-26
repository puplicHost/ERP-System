require('dotenv').config();
const mongoose = require('mongoose');
const Invoice = require('../src/models/Invoice');
const Payment = require('../src/models/Payment');
const Order = require('../src/models/Order');

const generateInvoiceNumber = () => {
  const date = new Date();
  const year = date.getFullYear().toString().slice(-2);
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `INV-${year}${month}-${random}`;
};

const generatePaymentNumber = () => {
  const date = new Date();
  const year = date.getFullYear().toString().slice(-2);
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `PAY-${year}${month}-${random}`;
};

const seedInvoices = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB Connected');

    await Invoice.deleteMany({});
    await Payment.deleteMany({});
    console.log('Cleared existing invoices and payments');

    const orders = await Order.find({ status: { $ne: 'cancelled' } })
      .populate('customer')
      .populate('items.product');

    if (orders.length === 0) {
      console.log('No orders found. Please run order seeder first');
      process.exit(1);
    }

    const invoiceStatuses = ['sent', 'paid', 'overdue'];
    const paymentMethods = ['cash', 'card', 'bank_transfer', 'online'];
    const paymentStatuses = ['completed', 'completed', 'completed', 'pending'];

    const invoices = [];
    const payments = [];

    for (const order of orders) {
      // Generate invoice for each order
      const subtotal = order.items.reduce((sum, item) => sum + item.totalPrice, 0);
      const taxAmount = subtotal * 0.14;
      const totalAmount = subtotal - order.discountAmount + taxAmount;

      const status = invoiceStatuses[Math.floor(Math.random() * invoiceStatuses.length)];
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 30);

      const invoice = {
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
        status,
        dueDate,
        paidDate: status === 'paid' ? new Date() : null,
        billingAddress: order.billingAddress
      };

      invoices.push(invoice);

      // Generate payment for paid invoices
      if (status === 'paid') {
        const payment = {
          paymentNumber: generatePaymentNumber(),
          invoice: null, // Will be set after invoice creation
          order: order._id,
          customer: order.customer._id,
          amount: totalAmount,
          paymentMethod: paymentMethods[Math.floor(Math.random() * paymentMethods.length)],
          status: 'completed',
          transactionId: `TXN-${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
          paidDate: new Date(),
          notes: 'Full payment'
        };
        payments.push(payment);
      }
    }

    const insertedInvoices = await Invoice.insertMany(invoices);
    console.log(`Seeded ${insertedInvoices.length} invoices`);

    // Link payments to invoices
    for (let i = 0; i < payments.length; i++) {
      payments[i].invoice = insertedInvoices[i]._id;
    }

    const insertedPayments = await Payment.insertMany(payments);
    console.log(`Seeded ${insertedPayments.length} payments`);

    console.log('Invoice and payment seeding completed');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding invoices:', error);
    process.exit(1);
  }
};

seedInvoices();
