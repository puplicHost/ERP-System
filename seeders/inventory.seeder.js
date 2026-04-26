require('dotenv').config();
const mongoose = require('mongoose');
const Inventory = require('../src/models/Inventory');
const Product = require('../src/models/Product');
const Warehouse = require('../src/models/Warehouse');

const seedInventory = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB Connected');

    await Inventory.deleteMany({});
    console.log('Cleared existing inventory');

    const products = await Product.find({});
    const warehouses = await Warehouse.find({});

    if (products.length === 0 || warehouses.length === 0) {
      console.log('Please run product and warehouse seeders first');
      process.exit(1);
    }

    const inventoryData = [];

    // Create inventory entries for each product in each warehouse
    products.forEach(product => {
      warehouses.forEach(warehouse => {
        // Random quantity between 0 and 200
        const quantity = Math.floor(Math.random() * 200);
        
        if (quantity > 0) {
          inventoryData.push({
            product: product._id,
            warehouse: warehouse._id,
            quantity,
            reservedQuantity: 0,
            lastMovement: new Date()
          });
        }
      });
    });

    const insertedInventory = await Inventory.insertMany(inventoryData);
    console.log(`Seeded ${insertedInventory.length} inventory records`);

    console.log('Inventory seeding completed');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding inventory:', error);
    process.exit(1);
  }
};

seedInventory();
