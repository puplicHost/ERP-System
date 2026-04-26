require('dotenv').config();
const mongoose = require('mongoose');
const Warehouse = require('../src/models/Warehouse');

const warehouses = [
  {
    code: 'WH-CAI-01',
    name: 'Cairo Main Distribution Center',
    location: {
      address: '15 Ramses Street',
      city: 'Cairo',
      state: 'Cairo Governorate',
      country: 'Egypt',
      zipCode: '11511',
      coordinates: { lat: 30.0444, lng: 31.2357 }
    },
    contactPhone: '+20 2 2396 1234',
    email: 'cairo.wh@erp-system.com',
    capacity: 5000,
    operatingHours: 'Sunday-Thursday 08:00-18:00'
  },
  {
    code: 'WH-ALX-01',
    name: 'Alexandria Warehouse',
    location: {
      address: '45 Port Said Street',
      city: 'Alexandria',
      state: 'Alexandria Governorate',
      country: 'Egypt',
      zipCode: '21500',
      coordinates: { lat: 31.2001, lng: 29.9187 }
    },
    contactPhone: '+20 3 487 6543',
    email: 'alex.wh@erp-system.com',
    capacity: 3500,
    operatingHours: 'Sunday-Thursday 09:00-17:00'
  },
  {
    code: 'WH-GIZ-01',
    name: 'Giza Storage Facility',
    location: {
      address: '78 Pyramids Road',
      city: 'Giza',
      state: 'Giza Governorate',
      country: 'Egypt',
      zipCode: '12511',
      coordinates: { lat: 30.0131, lng: 31.2089 }
    },
    contactPhone: '+20 2 3388 9876',
    email: 'giza.wh@erp-system.com',
    capacity: 4000,
    operatingHours: 'Saturday-Thursday 08:00-20:00'
  },
  {
    code: 'WH-MNS-01',
    name: 'Mansoura Distribution Hub',
    location: {
      address: '22 Suez Canal Street',
      city: 'Mansoura',
      state: 'Dakahlia Governorate',
      country: 'Egypt',
      zipCode: '35516',
      coordinates: { lat: 31.0379, lng: 31.3785 }
    },
    contactPhone: '+20 50 223 4455',
    email: 'mansoura.wh@erp-system.com',
    capacity: 2500,
    operatingHours: 'Sunday-Thursday 08:30-17:30'
  },
  {
    code: 'WH-TAN-01',
    name: 'Tanta Regional Warehouse',
    location: {
      address: '90 Gamal Abdel Nasser Street',
      city: 'Tanta',
      state: 'Gharbia Governorate',
      country: 'Egypt',
      zipCode: '31527',
      coordinates: { lat: 30.7885, lng: 31.0019 }
    },
    contactPhone: '+20 40 334 5566',
    email: 'tanta.wh@erp-system.com',
    capacity: 2000,
    operatingHours: 'Sunday-Thursday 09:00-17:00'
  }
];

const seedWarehouses = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB Connected');

    await Warehouse.deleteMany({});
    console.log('Cleared existing warehouses');

    const insertedWarehouses = await Warehouse.insertMany(warehouses);
    console.log(`Seeded ${insertedWarehouses.length} warehouses`);

    insertedWarehouses.forEach(wh => {
      console.log(`- ${wh.code}: ${wh.name} (${wh.location.city})`);
    });

    console.log('Warehouse seeding completed');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding warehouses:', error);
    process.exit(1);
  }
};

seedWarehouses();
