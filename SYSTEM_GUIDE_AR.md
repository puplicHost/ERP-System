# دليل نظام ERP-AI

## نظرة عامة

نظام ERP-AI هو نظام تخطيط موارد المؤسسات شامل مبني باستخدام Node.js و Express.js و MongoDB. يوفر النظام حلاً متكاملاً لإدارة المخزون، الطلبات، الفواتير، الدفعات، والتقارير مع نظام إدارة صلاحيات متطور.

## التقنيات المستخدمة

- **Backend:** Node.js, Express.js
- **Database:** MongoDB مع Mongoose ODM
- **Authentication:** JWT (Access Tokens & Refresh Tokens)
- **Security:** bcrypt, express-rate-limit
- **Validation:** express-validator

## هيكل المشروع

```
ERP-AI/
├── src/
│   ├── config/          # إعدادات النظام (قاعدة البيانات، JWT)
│   ├── controllers/     # منطق التحكم في البيانات
│   ├── middleware/      # البرمجيات الوسيطة (المصادقة، التفويض)
│   ├── models/          # نماذج قاعدة البيانات
│   ├── routes/          # تعريف المسارات API
│   └── utils/           # أدوات مساعدة
├── seeders/             # بيانات تجريبية
├── Postman/             # مجموعات Postman للاختبار
├── Project-Phases/       # وثائق المراحل
├── server.js            # نقطة الدخول الرئيسية
├── .env                 # متغيرات البيئة
└── docker-compose.yml   # إعداد MongoDB
```

## المراحل المكتملة

### المرحلة 01: الأدوار والصلاحيات
- نظام إدارة الأدوار (SuperAdmin, Distributor, Customer)
- نظام الصلاحيات التفصيلي
- المصادقة والتفويض المستند على الأدوار

### المرحلة 01b: تحسين الأمان
- Refresh Tokens لتجديد الجلسات
- Rate Limiting على تسجيل الدخول
- Pagination للقوائم الطويلة
- معالجة الأخطاء المركزية

### المرحلة 02: المنتجات والمستودعات
- إدارة المنتجات (SKU، التصنيف، الأسعار)
- إدارة المستودعات (الموقع، السعة)
- إدارة المخزون (الكميات، الحجوزات)
- حركات المخزون (دخول، خروج، نقل)

### المرحلة 03: الطلبات (جانب العميل)
- سلة التسوق
- إنشاء الطلبات
- إلغاء الطلبات
- حجز المخزون تلقائياً

### المرحلة 04: عمليات الموزع
- قبول/رفض الطلبات
- تجهيز الطلبات
- شحن الطلبات
- تأكيد التسليم
- تخصيص المستودعات للموزعين

### المرحلة 05: الفواتير والدفعات
- إنشاء الفواتير تلقائياً
- تسجيل الدفعات
- استرداد المدفوعات
- حساب الضرائب (14%)

### المرحلة 06: الإدارة والتقارير
- لوحة معلومات (Dashboard)
- تقارير المبيعات
- تقارير المخزون
- تقارير الأرباح
- سجل التدقيق (Audit Logs)

### المرحلة 07: التحسين والتوسع
- نظام الإشعارات
- البحث المتقدم
- فهارس قاعدة البيانات للأداء

## نقاط النهاية الرئيسية (API Endpoints)

### المصادقة
- `POST /api/auth/register` - تسجيل مستخدم جديد
- `POST /api/auth/login` - تسجيل الدخول
- `POST /api/auth/refresh` - تجديد التوكن
- `POST /api/auth/logout` - تسجيل الخروج
- `GET /api/auth/userdata` - بيانات المستخدم

### المنتجات
- `POST /api/products` - إنشاء منتج
- `GET /api/products` - قائمة المنتجات
- `GET /api/products/search` - البحث في المنتجات
- `GET /api/products/:id` - تفاصيل المنتج
- `PUT /api/products/:id` - تحديث المنتج
- `DELETE /api/products/:id` - حذف المنتج (soft delete)

### المستودعات
- `POST /api/warehouses` - إنشاء مستودع
- `GET /api/warehouses` - قائمة المستودعات
- `GET /api/warehouses/:id` - تفاصيل المستودع
- `PUT /api/warehouses/:id/assign` - تعيين موزع للمستودع
- `GET /api/warehouses/:id/inventory` - مخزون المستودع

### المخزون
- `POST /api/inventory/adjust` - تعديل المخزون
- `GET /api/inventory/low-stock` - تنبيهات المخزون المنخفض
- `POST /api/inventory/transfer` - نقل المخزون

### السلة
- `GET /api/cart` - عرض السلة
- `POST /api/cart/add` - إضافة للسلة
- `PUT /api/cart/update` - تحديث العنصر
- `DELETE /api/cart/:productId` - حذف من السلة
- `DELETE /api/cart` - تفريغ السلة

### الطلبات
- `POST /api/orders` - إنشاء طلب
- `GET /api/orders` - قائمة الطلبات
- `GET /api/orders/:id` - تفاصيل الطلب
- `PUT /api/orders/:id/cancel` - إلغاء الطلب
- `PUT /api/orders/:id/accept` - قبول الطلب (موزع)
- `PUT /api/orders/:id/reject` - رفض الطلب (موزع)
- `PUT /api/orders/:id/prepare` - تجهيز الطلب (موزع)
- `PUT /api/orders/:id/ship` - شحن الطلب (موزع)
- `PUT /api/orders/:id/deliver` - تأكيد التسليم (موزع)

### الفواتير
- `POST /api/invoices/generate` - إنشاء فاتورة
- `GET /api/invoices` - قائمة الفواتير
- `GET /api/invoices/:id` - تفاصيل الفاتورة
- `PUT /api/invoices/:id/mark-paid` - تعليم كمدفوع

### الدفعات
- `POST /api/payments/record` - تسجيل دفع
- `GET /api/payments` - قائمة الدفعات
- `GET /api/payments/:id` - تفاصيل الدفع
- `PUT /api/payments/:id/refund` - استرداد الدفع

### التقارير
- `GET /api/reports/dashboard` - لوحة المعلومات
- `GET /api/reports/sales` - تقرير المبيعات
- `GET /api/reports/stock` - تقرير المخزون
- `GET /api/reports/profit` - تقرير الأرباح

### سجل التدقيق
- `GET /api/audit-logs` - قائمة سجل التدقيق
- `GET /api/audit-logs/:id` - تفاصيل السجل

### الإشعارات
- `GET /api/notifications` - قائمة الإشعارات
- `PUT /api/notifications/:id/read` - تعليم كمقروء
- `PUT /api/notifications/read-all` - تعليم الكل كمقروء
- `DELETE /api/notifications/:id` - حذف إشعار

## الأدوار والصلاحيات

### SuperAdmin
- صلاحيات كاملة على النظام
- إدارة المستخدمين والأدوار
- الوصول لجميع التقارير
- إدارة المنتجات والمستودعات

### Distributor
- إدارة الطلبات المخصصة لمستودعه
- تجهيز وشحن الطلبات
- عرض مخزون المستودع
- تعديل مخزون المستودع

### Customer
- إنشاء الطلبات
- إدارة سلة التسوق
- عرض طلباته وفواتيره
- عرض إشعاراته

## التشغيل

### المتطلبات
- Node.js (v14 أو أحدث)
- MongoDB
- npm أو yarn

### التثبيت
```bash
npm install
```

### إعداد البيئة
```bash
cp .env.example .env
# عدل الملف .env بإعداداتك
```

### تشغيل MongoDB (Docker)
```bash
docker-compose up -d
```

### تشغيل السيرفر
```bash
npm run dev
```

### تشغيل البذور (Seeders)
```bash
npm run seed:permissions
npm run seed:roles
npm run seed:products
npm run seed:warehouses
npm run seed:inventory
npm run seed:order
npm run seed:invoice
```

## الاختبار

استخدم مجموعات Postman الموجودة في مجلد `Postman/` لاختبار كل مرحلة:
- `Phase-01-ERP-AI.postman_collection.json`
- `Phase-01b-Security-Refactoring.postman_collection.json`
- `Phase-02-Products-Warehouses.postman_collection.json`
- `Phase-03-Orders.postman_collection.json`
- `Phase-04-Distributor-Operations.postman_collection.json`
- `Phase-05-Invoices-Payments.postman_collection.json`
- `Phase-06-Admin-Reports.postman_collection.json`
- `Phase-07-Polish-Scale.postman_collection.json`

## الأمان

- JWT Tokens مع Access و Refresh Tokens
- تشفير كلمات المرور باستخدام bcrypt (12 rounds)
- Rate Limiting على تسجيل الدخول (5 محاولات كل 15 دقيقة)
- التحقق من الصلاحيات لكل مسار
- معالجة أخطاء مركزية

## الأداء

- فهارس قاعدة البيانات للاستعلامات الشائعة
- Pagination للقوائم الكبيرة
- استعلامات محسنة مع aggregation

## دعم العمل

للدعم والاستفسارات، راجع وثائق المراحل في مجلد `Project-Phases/`.

## الترخيص

هذا المشروع مملوك لـ ERP-AI System.
