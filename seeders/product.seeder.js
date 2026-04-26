require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('../src/models/Product');

const products = [
  {
    sku: 'LAPTOP-DEL-001',
    name: 'Dell Latitude 5420 Laptop',
    description: '14-inch business laptop with Intel Core i7, 16GB RAM, 512GB SSD',
    category: 'Electronics',
    price: 899.99,
    costPrice: 650.00,
    unit: 'piece',
    weight: 1.53,
    dimensions: { length: 32.3, width: 21.6, height: 2.0 },
    barcode: '1234567890123',
    minStockLevel: 5,
    maxStockLevel: 200,
    reorderPoint: 20,
    tags: ['laptop', 'dell', 'business', 'electronics']
  },
  {
    sku: 'PHONE-IPH-001',
    name: 'iPhone 15 Pro',
    description: 'Latest iPhone with A17 chip, titanium design, 256GB storage',
    category: 'Electronics',
    price: 1099.99,
    costPrice: 850.00,
    unit: 'piece',
    weight: 0.22,
    dimensions: { length: 14.7, width: 7.1, height: 0.85 },
    barcode: '1234567890124',
    minStockLevel: 10,
    maxStockLevel: 150,
    reorderPoint: 30,
    tags: ['phone', 'apple', 'iphone', 'electronics']
  },
  {
    sku: 'CHAIR-ERG-001',
    name: 'Ergonomic Office Chair',
    description: 'Adjustable mesh office chair with lumbar support',
    category: 'Furniture',
    price: 299.99,
    costPrice: 180.00,
    unit: 'piece',
    weight: 15.5,
    dimensions: { length: 65, width: 65, height: 120 },
    barcode: '1234567890125',
    minStockLevel: 8,
    maxStockLevel: 100,
    reorderPoint: 25,
    tags: ['chair', 'furniture', 'office', 'ergonomic']
  },
  {
    sku: 'PAPER-A4-001',
    name: 'A4 Copy Paper (500 sheets)',
    description: 'Standard A4 white copy paper, 80gsm',
    category: 'Office Supplies',
    price: 4.99,
    costPrice: 2.50,
    unit: 'ream',
    weight: 2.5,
    dimensions: { length: 29.7, width: 21, height: 5 },
    barcode: '1234567890126',
    minStockLevel: 50,
    maxStockLevel: 500,
    reorderPoint: 100,
    tags: ['paper', 'office', 'a4', 'supplies']
  },
  {
    sku: 'MON-SAM-001',
    name: 'Samsung 27" Monitor',
    description: '27-inch IPS monitor, 144Hz, 2560x1440 resolution',
    category: 'Electronics',
    price: 349.99,
    costPrice: 250.00,
    unit: 'piece',
    weight: 5.2,
    dimensions: { length: 61.4, width: 21.5, height: 45.7 },
    barcode: '1234567890127',
    minStockLevel: 5,
    maxStockLevel: 80,
    reorderPoint: 15,
    tags: ['monitor', 'samsung', 'electronics', 'display']
  },
  {
    sku: 'KEYB-LOG-001',
    name: 'Logitech MX Keys Keyboard',
    description: 'Wireless illuminated keyboard, multi-device',
    category: 'Electronics',
    price: 99.99,
    costPrice: 65.00,
    unit: 'piece',
    weight: 0.81,
    dimensions: { length: 43.2, width: 13.2, height: 2.2 },
    barcode: '1234567890128',
    minStockLevel: 15,
    maxStockLevel: 120,
    reorderPoint: 40,
    tags: ['keyboard', 'logitech', 'wireless', 'electronics']
  },
  {
    sku: 'MOUSE-LOG-001',
    name: 'Logitech MX Master 3',
    description: 'Advanced wireless mouse, ergonomic design',
    category: 'Electronics',
    price: 79.99,
    costPrice: 50.00,
    unit: 'piece',
    weight: 0.14,
    dimensions: { length: 8.5, width: 5, height: 5 },
    barcode: '1234567890129',
    minStockLevel: 20,
    maxStockLevel: 150,
    reorderPoint: 50,
    tags: ['mouse', 'logitech', 'wireless', 'electronics']
  },
  {
    sku: 'DESK-OFF-001',
    name: 'Office Desk 120x60cm',
    description: 'Modern office desk with cable management',
    category: 'Furniture',
    price: 199.99,
    costPrice: 120.00,
    unit: 'piece',
    weight: 25,
    dimensions: { length: 120, width: 60, height: 75 },
    barcode: '1234567890130',
    minStockLevel: 5,
    maxStockLevel: 50,
    reorderPoint: 15,
    tags: ['desk', 'furniture', 'office']
  },
  {
    sku: 'PEN-BLK-001',
    name: 'Ballpoint Pens (Black, 12-pack)',
    description: 'Smooth writing ballpoint pens, black ink',
    category: 'Office Supplies',
    price: 3.99,
    costPrice: 1.50,
    unit: 'pack',
    weight: 0.15,
    dimensions: { length: 15, width: 8, height: 2 },
    barcode: '1234567890131',
    minStockLevel: 100,
    maxStockLevel: 1000,
    reorderPoint: 200,
    tags: ['pen', 'office', 'supplies', 'black']
  },
  {
    sku: 'HEADSET-JBL-001',
    name: 'JBL Tune 760NC Headphones',
    description: 'Wireless noise-cancelling headphones',
    category: 'Electronics',
    price: 129.99,
    costPrice: 85.00,
    unit: 'piece',
    weight: 0.25,
    dimensions: { length: 18, width: 16, height: 8 },
    barcode: '1234567890132',
    minStockLevel: 10,
    maxStockLevel: 100,
    reorderPoint: 30,
    tags: ['headphones', 'jbl', 'wireless', 'electronics']
  }
];

const seedProducts = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB Connected');

    await Product.deleteMany({});
    console.log('Cleared existing products');

    const insertedProducts = await Product.insertMany(products);
    console.log(`Seeded ${insertedProducts.length} products`);

    console.log('Product seeding completed');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding products:', error);
    process.exit(1);
  }
};

seedProducts();
