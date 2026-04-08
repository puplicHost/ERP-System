const mongoose = require('mongoose');
const RoleModel = require('../models/RoleModel');
const PermissionModel = require('../models/PermissionModel');
const dotenv = require('dotenv');

dotenv.config();

// الاتصال بقاعدة البيانات
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.DB_URI);
        console.log('Database connected successfully');
    } catch (error) {
        console.error('Database connection failed:', error.message);
        process.exit(1);
    }
};

// الصلاحيات الافتراضية
const defaultPermissions = [
    { name: 'CREATE_USER', description: 'إنشاء مستخدم جديد' },
    { name: 'READ_USER', description: 'قراءة بيانات المستخدمين' },
    { name: 'UPDATE_USER', description: 'تحديث بيانات المستخدمين' },
    { name: 'DELETE_USER', description: 'حذف المستخدمين' },
    { name: 'CREATE_PRODUCT', description: 'إنشاء منتج جديد' },
    { name: 'READ_PRODUCT', description: 'قراءة بيانات المنتجات' },
    { name: 'UPDATE_PRODUCT', description: 'تحديث بيانات المنتجات' },
    { name: 'DELETE_PRODUCT', description: 'حذف المنتجات' },
    { name: 'CREATE_WAREHOUSE', description: 'إنشاء مخزن جديد' },
    { name: 'READ_WAREHOUSE', description: 'قراءة بيانات المخازن' },
    { name: 'UPDATE_WAREHOUSE', description: 'تحديث بيانات المخازن' },
    { name: 'DELETE_WAREHOUSE', description: 'حذف المخازن' },
    { name: 'MANAGE_INVENTORY', description: 'إدارة المخزون' },
    { name: 'CREATE_ROLE', description: 'إنشاء دور جديد' },
    { name: 'READ_ROLE', description: 'قراءة الأدوار' },
    { name: 'UPDATE_ROLE', description: 'تحديث الأدوار' },
    { name: 'DELETE_ROLE', description: 'حذف الأدوار' },
    { name: 'CREATE_PERMISSION', description: 'إنشاء صلاحية جديدة' },
    { name: 'READ_PERMISSION', description: 'قراءة الصلاحيات' },
    { name: 'UPDATE_PERMISSION', description: 'تحديث الصلاحيات' },
    { name: 'DELETE_PERMISSION', description: 'حذف الصلاحيات' }
];

// الأدوار الافتراضية
const defaultRoles = [
    {
        name: 'SuperAdmin',
        description: 'مدير النظام - كل الصلاحيات'
    },
    {
        name: 'Admin',
        description: 'مدير فرعي - معظم الصلاحيات'
    },
    {
        name: 'Warehouse_Manager',
        description: 'مدير مخزن - صلاحيات المخازن والمنتجات'
    },
    {
        name: 'Distributor',
        description: 'موزع - صلاحيات محدودة'
    },
    {
        name: 'Customer',
        description: 'عميل - صلاحيات قراءة فقط'
    }
];

// تشغيل Seeder
const runSeeder = async () => {
    await connectDB();

    try {
        // حذف البيانات القديمة
        await PermissionModel.deleteMany();
        await RoleModel.deleteMany();
        console.log('Old data cleared');

        // إضافة الصلاحيات
        const createdPermissions = await PermissionModel.insertMany(defaultPermissions);
        console.log(`${createdPermissions.length} permissions created`);

        // إضافة الأدوار مع الصلاحيات
        const rolesWithPermissions = defaultRoles.map(role => {
            let permissions = [];

            switch (role.name) {
                case 'SuperAdmin':
                    // كل الصلاحيات
                    permissions = createdPermissions.map(p => p._id);
                    break;
                case 'Admin':
                    // كل الصلاحيات ما عدا حذف المستخدمين والأدوار
                    permissions = createdPermissions
                        .filter(p => !['DELETE_USER', 'DELETE_ROLE'].includes(p.name))
                        .map(p => p._id);
                    break;
                case 'Warehouse_Manager':
                    // صلاحيات المخازن والمنتجات والمخزون
                    permissions = createdPermissions
                        .filter(p =>
                            p.name.includes('PRODUCT') ||
                            p.name.includes('WAREHOUSE') ||
                            p.name.includes('INVENTORY') ||
                            p.name === 'READ_USER'
                        )
                        .map(p => p._id);
                    break;
                case 'Distributor':
                    // صلاحيات قراءة فقط + إدارة مخزون
                    permissions = createdPermissions
                        .filter(p =>
                            p.name.startsWith('READ_') ||
                            p.name === 'MANAGE_INVENTORY'
                        )
                        .map(p => p._id);
                    break;
                case 'Customer':
                    // قراءة فقط
                    permissions = createdPermissions
                        .filter(p => p.name.startsWith('READ_'))
                        .map(p => p._id);
                    break;
            }

            return { ...role, permissions };
        });

        const createdRoles = await RoleModel.insertMany(rolesWithPermissions);
        console.log(`${createdRoles.length} roles created`);

        console.log('\n✅ Seeder completed successfully!');
        console.log('\nCreated Roles:');
        createdRoles.forEach(role => {
            console.log(`  - ${role.name}: ${role.permissions.length} permissions`);
        });

        process.exit(0);
    } catch (error) {
        console.error('Seeder failed:', error.message);
        process.exit(1);
    }
};

runSeeder();
