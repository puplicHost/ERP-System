require('dotenv').config();
const mongoose = require('mongoose');
const Order = require('../src/models/Order');
const User = require('../src/models/User');
const Product = require('../src/models/Product');
const Warehouse = require('../src/models/Warehouse');

const generateOrderNumber = () => {
  const date = new Date();
  const year = date.getFullYear().toString().slice(-2);
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `ORD-${year}${month}-${random}`;
};

const seedOrders = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB Connected');

    await Order.deleteMany({});
    console.log('Cleared existing orders');

    const customers = await User.find({ 'role.code': 'customer' });
    const products = await Product.find({ isActive: true });
    const warehouses = await Warehouse.find({ isActive: true });

    if (customers.length === 0 || products.length === 0) {
      console.log('Please run user and product seeders first');
      process.exit(1);
    }

    const statuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];
    const paymentStatuses = ['pending', 'partial', 'paid', 'refunded'];

    const orders = [];

    for (let i = 0; i < 20; i++) {
      const customer = customers[Math.floor(Math.random() * customers.length)];
      const warehouse = warehouses[Math.floor(Math.random() * warehouses.length)];
      
      // Random number of items (1-4)
      const numItems = Math.floor(Math.random() * 4) + 1;
      const items = [];
      
      for (let j = 0; j < numItems; j++) {
        const product = products[Math.floor(Math.random() * products.length)];
        const quantity = Math.floor(Math.random() * 5) + 1;
        
        items.push({
          product: product._id,
          productName: product.name,
          productSku: product.sku,
          quantity,
          unitPrice: product.price,
          totalPrice: product.price * quantity
        });
      }

      const totalAmount = items.reduce((sum, item) => sum + item.totalPrice, 0);

      orders.push({
        orderNumber: generateOrderNumber(),
        customer: customer._id,
        items,
        totalAmount,
        discountAmount: Math.random() > 0.7 ? Math.floor(Math.random() * 50) : 0,
        taxAmount: totalAmount * 0.14,
        shippingAddress: {
          fullName: `${customer.firstName} ${customer.lastName}`,
          phone: customer.phone || '+20 123 456 7890',
          address: `${Math.floor(Math.random() * 999) + 1} Main Street`,
          city: 'Cairo',
          state: 'Cairo Governorate',
          country: 'Egypt',
          zipCode: '11511'
        },
        billingAddress: {
          fullName: `${customer.firstName} ${customer.lastName}`,
          phone: customer.phone || '+20 123 456 7890',
          address: `${Math.floor(Math.random() * 999) + 1} Main Street`,
          city: 'Cairo',
          state: 'Cairo Governorate',
          country: 'Egypt',
          zipCode: '11511'
        },
        status: statuses[Math.floor(Math.random() * statuses.length)],
        paymentStatus: paymentStatuses[Math.floor(Math.random() * paymentStatuses.length)],
        paymentMethod: ['cash', 'card', 'bank_transfer'][Math.floor(Math.random() * 3)],
        notes: Math.random() > 0.5 ? 'Please deliver between 9 AM and 5 PM' : '',
        assignedWarehouse: warehouse._id,
        estimatedDelivery: new Date(Date.now() + Math.random() * 7 * 24 * 60 * 60 * 1000),
        actualDelivery: Math.random() > 0.5 ? new Date(Date.now() + Math.random() * 7 * 24 * 60 * 60 * 1000) : null
      });
    }

    const insertedOrders = await Order.insertMany(orders);
    console.log(`Seeded ${insertedOrders.length} orders`);

    console.log('Order seeding completed');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding orders:', error);
    process.exit(1);
  }
};

seedOrders();
