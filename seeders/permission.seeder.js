require('dotenv').config();
const mongoose = require('mongoose');
const Permission = require('../src/models/Permission');

const permissions = [
  // User permissions
  { name: 'Create Users', code: 'user:create', resource: 'user', action: 'create', description: 'Ability to create new users' },
  { name: 'Read Users', code: 'user:read', resource: 'user', action: 'read', description: 'Ability to view user information' },
  { name: 'Update Users', code: 'user:update', resource: 'user', action: 'update', description: 'Ability to update user profiles' },
  { name: 'Delete Users', code: 'user:delete', resource: 'user', action: 'delete', description: 'Ability to delete users' },
  { name: 'List Users', code: 'user:list', resource: 'user', action: 'list', description: 'Ability to list all users' },
  
  // Role permissions
  { name: 'Create Roles', code: 'role:create', resource: 'role', action: 'create', description: 'Ability to create new roles' },
  { name: 'Read Roles', code: 'role:read', resource: 'role', action: 'read', description: 'Ability to view role information' },
  { name: 'Update Roles', code: 'role:update', resource: 'role', action: 'update', description: 'Ability to update roles' },
  { name: 'Delete Roles', code: 'role:delete', resource: 'role', action: 'delete', description: 'Ability to delete roles' },
  { name: 'List Roles', code: 'role:list', resource: 'role', action: 'list', description: 'Ability to list all roles' },
  
  // Permission permissions
  { name: 'Read Permissions', code: 'permission:read', resource: 'permission', action: 'read', description: 'Ability to view permissions' },
  { name: 'List Permissions', code: 'permission:list', resource: 'permission', action: 'list', description: 'Ability to list all permissions' },
  
  // Product permissions
  { name: 'Create Products', code: 'product:create', resource: 'product', action: 'create', description: 'Ability to add products to catalog' },
  { name: 'Read Products', code: 'product:read', resource: 'product', action: 'read', description: 'Ability to view product details' },
  { name: 'Update Products', code: 'product:update', resource: 'product', action: 'update', description: 'Ability to update product information' },
  { name: 'Delete Products', code: 'product:delete', resource: 'product', action: 'delete', description: 'Ability to delete products' },
  { name: 'List Products', code: 'product:list', resource: 'product', action: 'list', description: 'Ability to list all products' },
  
  // Warehouse permissions
  { name: 'Create Warehouses', code: 'warehouse:create', resource: 'warehouse', action: 'create', description: 'Ability to create warehouses' },
  { name: 'Read Warehouses', code: 'warehouse:read', resource: 'warehouse', action: 'read', description: 'Ability to view warehouse details' },
  { name: 'Update Warehouses', code: 'warehouse:update', resource: 'warehouse', action: 'update', description: 'Ability to update warehouse information' },
  { name: 'Delete Warehouses', code: 'warehouse:delete', resource: 'warehouse', action: 'delete', description: 'Ability to delete warehouses' },
  { name: 'List Warehouses', code: 'warehouse:list', resource: 'warehouse', action: 'list', description: 'Ability to list all warehouses' },
  { name: 'Assign Warehouse', code: 'warehouse:assign', resource: 'warehouse', action: 'assign', description: 'Ability to assign distributors to warehouses' },
  
  // Inventory permissions
  { name: 'Read Inventory', code: 'inventory:read', resource: 'inventory', action: 'read', description: 'Ability to view inventory levels' },
  { name: 'Update Inventory', code: 'inventory:update', resource: 'inventory', action: 'update', description: 'Ability to adjust inventory' },
  { name: 'Transfer Inventory', code: 'inventory:transfer', resource: 'inventory', action: 'transfer', description: 'Ability to transfer stock between warehouses' },
  
  // Order permissions
  { name: 'Create Orders', code: 'order:create', resource: 'order', action: 'create', description: 'Ability to create orders' },
  { name: 'Read Orders', code: 'order:read', resource: 'order', action: 'read', description: 'Ability to view order details' },
  { name: 'Update Orders', code: 'order:update', resource: 'order', action: 'update', description: 'Ability to update order information' },
  { name: 'Delete Orders', code: 'order:delete', resource: 'order', action: 'delete', description: 'Ability to delete orders' },
  { name: 'List Orders', code: 'order:list', resource: 'order', action: 'list', description: 'Ability to list all orders' },
  { name: 'Accept Orders', code: 'order:accept', resource: 'order', action: 'accept', description: 'Ability to accept orders' },
  { name: 'Reject Orders', code: 'order:reject', resource: 'order', action: 'reject', description: 'Ability to reject orders' },
  { name: 'Read Own Orders', code: 'order:read_own', resource: 'order', action: 'read_own', description: 'Ability to view own orders' },
  { name: 'List Own Orders', code: 'order:list_own', resource: 'order', action: 'list_own', description: 'Ability to list own orders' },
  { name: 'Update Own Orders', code: 'order:update_own', resource: 'order', action: 'update_own', description: 'Ability to cancel own orders' },
  
  // Invoice permissions
  { name: 'Create Invoices', code: 'invoice:create', resource: 'invoice', action: 'create', description: 'Ability to generate invoices' },
  { name: 'Read Invoices', code: 'invoice:read', resource: 'invoice', action: 'read', description: 'Ability to view invoice details' },
  { name: 'Update Invoices', code: 'invoice:update', resource: 'invoice', action: 'update', description: 'Ability to update invoices' },
  { name: 'Cancel Invoices', code: 'invoice:cancel', resource: 'invoice', action: 'cancel', description: 'Ability to cancel invoices' },
  { name: 'List Invoices', code: 'invoice:list', resource: 'invoice', action: 'list', description: 'Ability to list all invoices' },
  { name: 'Read Own Invoices', code: 'invoice:read_own', resource: 'invoice', action: 'read_own', description: 'Ability to view own invoices' },
  { name: 'List Own Invoices', code: 'invoice:list_own', resource: 'invoice', action: 'list_own', description: 'Ability to list own invoices' },
  
  // Payment permissions
  { name: 'Create Payments', code: 'payment:create', resource: 'payment', action: 'create', description: 'Ability to record payments' },
  { name: 'Read Payments', code: 'payment:read', resource: 'payment', action: 'read', description: 'Ability to view payment details' },
  { name: 'Update Payments', code: 'payment:update', resource: 'payment', action: 'update', description: 'Ability to update payments' },
  { name: 'Refund Payments', code: 'payment:refund', resource: 'payment', action: 'refund', description: 'Ability to process refunds' },
  { name: 'List Payments', code: 'payment:list', resource: 'payment', action: 'list', description: 'Ability to list all payments' },
  { name: 'Create Own Payments', code: 'payment:create_own', resource: 'payment', action: 'create_own', description: 'Ability to make own payments' },
  { name: 'List Own Payments', code: 'payment:list_own', resource: 'payment', action: 'list_own', description: 'Ability to list own payments' },
  
  // Report permissions
  { name: 'Read Reports', code: 'report:read', resource: 'report', action: 'read', description: 'Ability to view reports' },
  { name: 'Sales Reports', code: 'report:sales', resource: 'report', action: 'sales', description: 'Ability to view sales reports' },
  { name: 'Stock Reports', code: 'report:stock', resource: 'report', action: 'stock', description: 'Ability to view stock reports' },
  { name: 'Profit Reports', code: 'report:profit', resource: 'report', action: 'profit', description: 'Ability to view profit reports' },
  { name: 'Distributor Reports', code: 'report:distributor', resource: 'report', action: 'distributor', description: 'Ability to view distributor reports' },
  { name: 'Export Reports', code: 'report:export', resource: 'report', action: 'export', description: 'Ability to export report data' },
  
  // Admin permissions
  { name: 'Admin Dashboard', code: 'admin:dashboard', resource: 'admin', action: 'dashboard', description: 'Ability to access admin dashboard' },
  { name: 'Admin System', code: 'admin:system', resource: 'admin', action: 'system', description: 'Ability to manage system settings' },
  
  // Audit permissions
  { name: 'Read Audit Logs', code: 'audit:read', resource: 'audit', action: 'read', description: 'Ability to view audit logs' }
];

const seedPermissions = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB Connected');

    // Clear existing permissions
    await Permission.deleteMany({});
    console.log('Cleared existing permissions');

    // Insert new permissions
    const insertedPermissions = await Permission.insertMany(permissions);
    console.log(`Seeded ${insertedPermissions.length} permissions`);

    console.log('Permission seeding completed');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding permissions:', error);
    process.exit(1);
  }
};

seedPermissions();
