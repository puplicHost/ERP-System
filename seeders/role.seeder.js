require('dotenv').config();
const mongoose = require('mongoose');
const Role = require('../src/models/Role');
const Permission = require('../src/models/Permission');

const seedRoles = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB Connected');

    // Get all permissions
    const allPermissions = await Permission.find({});
    const permissionMap = {};
    allPermissions.forEach(p => {
      permissionMap[p.code] = p._id;
    });

    // Clear existing roles
    await Role.deleteMany({});
    console.log('Cleared existing roles');

    // Define roles with their permissions
    const roles = [
      {
        name: 'SuperAdmin',
        code: 'superadmin',
        description: 'Full system access and control',
        level: 0,
        permissions: Object.values(permissionMap) // All permissions
      },
      {
        name: 'Distributor',
        code: 'distributor',
        description: 'Warehouse and order management',
        level: 1,
        permissions: [
          permissionMap['product:read'],
          permissionMap['product:list'],
          permissionMap['warehouse:read'],
          permissionMap['warehouse:list'],
          permissionMap['inventory:read'],
          permissionMap['inventory:update'],
          permissionMap['order:read'],
          permissionMap['order:list'],
          permissionMap['order:update'],
          permissionMap['order:accept'],
          permissionMap['order:reject'],
          permissionMap['invoice:read'],
          permissionMap['invoice:list'],
          permissionMap['payment:read'],
          permissionMap['payment:create'],
          permissionMap['payment:list']
        ]
      },
      {
        name: 'Customer',
        code: 'customer',
        description: 'Product browsing and ordering',
        level: 2,
        isDefault: true,
        permissions: [
          permissionMap['product:read'],
          permissionMap['product:list'],
          permissionMap['order:create'],
          permissionMap['order:read_own'],
          permissionMap['order:list_own'],
          permissionMap['order:update_own'],
          permissionMap['invoice:read_own'],
          permissionMap['invoice:list_own'],
          permissionMap['payment:create_own'],
          permissionMap['payment:list_own']
        ]
      }
    ];

    // Insert roles
    const insertedRoles = await Role.insertMany(roles);
    console.log(`Seeded ${insertedRoles.length} roles`);

    insertedRoles.forEach(role => {
      console.log(`- ${role.name} (${role.code}): ${role.permissions.length} permissions`);
    });

    console.log('Role seeding completed');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding roles:', error);
    process.exit(1);
  }
};

seedRoles();
