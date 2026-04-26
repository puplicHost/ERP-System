# Phase 06 – Admin & Reports

## 🎯 Goals

Implement comprehensive administrative tools and reporting capabilities for the ERP system. This phase provides SuperAdmin users with business intelligence, audit trails, and system oversight features.

**Key Outcomes:**
- Sales reporting with time-series analytics
- Stock reports with inventory valuation
- Profit calculation and margin analysis
- Complete audit logging for compliance
- Admin dashboard with key metrics
- User activity tracking
- Data export capabilities

---

## ✅ Backend Tasks

- [x] Create AuditLog schema for action tracking
- [x] Implement sales reports API (daily, weekly, monthly)
- [x] Create stock reports with valuation
- [x] Build profit calculation engine
- [x] Implement admin dashboard metrics
- [x] Create user activity tracking
- [x] Add audit log querying endpoints
- [x] Implement data export (CSV/JSON)
- [x] Create system health monitoring
- [x] Add top products/distributors reports

---

## 🗂️ Database Schemas

### AuditLog Schema

| Field | Type | Required | Default | Notes |
|-------|------|----------|---------|-------|
| _id | ObjectId | Auto | - | MongoDB document ID |
| action | String | Yes | - | Action performed (e.g., "order:created") |
| entity | String | Yes | - | Entity type (order, product, user, etc.) |
| entityId | ObjectId | Yes | - | Reference to affected entity |
| user | ObjectId | Yes | - | User who performed action |
| userRole | String | Yes | - | Role at time of action |
| timestamp | Date | Yes | Date.now | When action occurred |
| ipAddress | String | No | null | Client IP for security |
| userAgent | String | No | null | Browser/client info |
| changes | Object | No | {} | Before/after values |
| metadata | Object | No | {} | Additional context |
| severity | String | No | "info" | Enum: info, warning, error, critical |

### SalesReport (Virtual/Calculated)

| Field | Type | Notes |
|-------|------|-------|
| period | String | Time period identifier |
| totalOrders | Number | Count of orders |
| totalRevenue | Number | Sum of order totals |
| totalCost | Number | Sum of product costs |
| grossProfit | Number | revenue - cost |
| averageOrderValue | Number | revenue / orders |
| topProducts | Array | Best selling products |
| topCustomers | Array | Highest value customers |

### StockReport (Virtual/Calculated)

| Field | Type | Notes |
|-------|------|-------|
| warehouse | ObjectId | Warehouse reference |
| totalProducts | Number | Distinct SKUs |
| totalQuantity | Number | Total units in stock |
| totalValue | Number | Sum(costPrice × quantity) |
| lowStockCount | Number | Items below threshold |
| outOfStockCount | Number | Zero quantity items |
| categoryBreakdown | Object | Stock by category |

---

## 🔌 API Endpoints

| Method | Endpoint | Description | Permission Required |
|--------|----------|-------------|-------------------|
| GET | `/admin/dashboard` | Admin dashboard metrics | admin:dashboard |
| GET | `/admin/reports/sales` | Sales reports | report:sales |
| GET | `/admin/reports/sales/by-product` | Sales by product | report:sales |
| GET | `/admin/reports/sales/by-customer` | Sales by customer | report:sales |
| GET | `/admin/reports/stock` | Stock valuation report | report:stock |
| GET | `/admin/reports/stock/low` | Low stock report | report:stock |
| GET | `/admin/reports/profit` | Profit analysis | report:profit |
| GET | `/admin/reports/distributor-performance` | Distributor metrics | report:distributor |
| GET | `/admin/audit-logs` | Query audit logs | audit:read |
| GET | `/admin/audit-logs/:entity/:id` | Entity audit history | audit:read |
| GET | `/admin/users/activity` | User activity report | user:read |
| POST | `/admin/export/sales` | Export sales data | report:export |
| POST | `/admin/export/inventory` | Export inventory data | report:export |
| GET | `/admin/system/health` | System health check | admin:system |
| GET | `/admin/top-products` | Top selling products | report:sales |
| GET | `/admin/top-distributors` | Top distributors | report:distributor |

---

## 🧪 Postman Testing Guide

### Get Admin Dashboard
- **Method:** GET
- **URL:** `http://localhost:5000/api/admin/dashboard`
- **Headers:**
  - Content-Type: application/json
  - Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... (SuperAdmin token)
- **Body:** None
- **Expected Success Response (200):**
```json
{
  "status": "success",
  "data": {
    "overview": {
      "totalUsers": 156,
      "totalCustomers": 120,
      "totalDistributors": 15,
      "totalProducts": 450,
      "totalWarehouses": 8
    },
    "orders": {
      "today": {
        "count": 24,
        "revenue": 28450.50,
        "pending": 8,
        "delivered": 16
      },
      "thisWeek": {
        "count": 168,
        "revenue": 186750.25
      },
      "thisMonth": {
        "count": 652,
        "revenue": 742350.00
      }
    },
    "inventory": {
      "totalStockValue": 1250000.00,
      "lowStockItems": 23,
      "outOfStock": 5
    },
    "financials": {
      "outstandingInvoices": 156,
      "overdueAmount": 45600.00,
      "totalRevenueYTD": 2450000.00,
      "totalProfitYTD": 892500.00
    },
    "recentActivity": [
      {
        "action": "order:created",
        "user": "Mohamed Ali",
        "entity": "Order ORD-2026-0056",
        "timestamp": "2026-04-26T14:30:00.000Z"
      },
      {
        "action": "payment:received",
        "user": "Ahmed Hassan",
        "entity": "Invoice INV-2026-0042",
        "timestamp": "2026-04-26T14:15:00.000Z"
      }
    ]
  }
}
```
- **Expected Error Responses:**
  - `401` – Authentication required
  - `403` – Admin access required

### Get Sales Report
- **Method:** GET
- **URL:** `http://localhost:5000/api/admin/reports/sales?period=monthly&startDate=2026-01-01&endDate=2026-04-30`
- **Headers:**
  - Content-Type: application/json
  - Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
- **Query Parameters:**
  - `period` (required): daily, weekly, monthly, yearly
  - `startDate` (optional): Filter start date
  - `endDate` (optional): Filter end date
  - `warehouseId` (optional): Filter by warehouse
- **Expected Success Response (200):**
```json
{
  "status": "success",
  "data": {
    "period": "monthly",
    "range": {
      "start": "2026-01-01",
      "end": "2026-04-30"
    },
    "summary": {
      "totalOrders": 2456,
      "totalRevenue": 2450000.00,
      "totalCost": 1557500.00,
      "grossProfit": 892500.00,
      "profitMargin": 36.43,
      "averageOrderValue": 997.56
    },
    "breakdown": [
      {
        "period": "2026-01",
        "orders": 523,
        "revenue": 520000.00,
        "cost": 332800.00,
        "profit": 187200.00,
        "margin": 36.0
      },
      {
        "period": "2026-02",
        "orders": 612,
        "revenue": 610000.00,
        "cost": 390400.00,
        "profit": 219600.00,
        "margin": 36.0
      },
      {
        "period": "2026-03",
        "orders": 689,
        "revenue": 685000.00,
        "cost": 438400.00,
        "profit": 246600.00,
        "margin": 36.0
      },
      {
        "period": "2026-04",
        "orders": 632,
        "revenue": 635000.00,
        "cost": 395900.00,
        "profit": 239100.00,
        "margin": 37.65
      }
    ],
    "trends": {
      "revenueGrowth": "+22%",
      "orderGrowth": "+21%"
    }
  }
}
```
- **Expected Error Responses:**
  - `400` – Invalid period specified
  - `401` – Authentication required
  - `403` – Report access required

### Get Sales by Product
- **Method:** GET
- **URL:** `http://localhost:5000/api/admin/reports/sales/by-product?limit=10&startDate=2026-04-01&endDate=2026-04-30`
- **Headers:**
  - Content-Type: application/json
  - Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
- **Query Parameters:**
  - `limit` (optional): Number of products to return
  - `startDate` (optional): Date range start
  - `endDate` (optional): Date range end
- **Expected Success Response (200):**
```json
{
  "status": "success",
  "data": {
    "period": {
      "start": "2026-04-01",
      "end": "2026-04-30"
    },
    "products": [
      {
        "_id": "507f1f77bcf86cd799439100",
        "sku": "LAPTOP-DEL-001",
        "name": "Dell Latitude 5420 Laptop",
        "quantitySold": 145,
        "revenue": 130499.55,
        "cost": 94250.00,
        "profit": 36249.55,
        "margin": 27.78
      },
      {
        "_id": "507f1f77bcf86cd799439101",
        "sku": "PHONE-IPH-001",
        "name": "iPhone 15 Pro",
        "quantitySold": 98,
        "revenue": 107799.02,
        "cost": 83300.00,
        "profit": 24499.02,
        "margin": 22.73
      }
    ],
    "summary": {
      "totalProducts": 45,
      "totalQuantity": 1256,
      "totalRevenue": 635000.00,
      "totalProfit": 239100.00
    }
  }
}
```

### Get Stock Report
- **Method:** GET
- **URL:** `http://localhost:5000/api/admin/reports/stock?warehouseId=507f1f77bcf86cd799439200`
- **Headers:**
  - Content-Type: application/json
  - Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
- **Query Parameters:**
  - `warehouseId` (optional): Filter by specific warehouse
- **Expected Success Response (200):**
```json
{
  "status": "success",
  "data": {
    "generatedAt": "2026-04-26T15:00:00.000Z",
    "warehouse": {
      "_id": "507f1f77bcf86cd799439200",
      "code": "WH-CAI-01",
      "name": "Cairo Main Distribution Center"
    },
    "summary": {
      "totalProducts": 156,
      "totalQuantity": 8540,
      "totalValue": 425000.00,
      "reservedQuantity": 320,
      "availableQuantity": 8220
    },
    "alerts": {
      "lowStock": 12,
      "outOfStock": 3,
      "overstocked": 5
    },
    "categoryBreakdown": [
      {
        "category": "Electronics",
        "productCount": 45,
        "totalQuantity": 2340,
        "totalValue": 185000.00
      },
      {
        "category": "Office Supplies",
        "productCount": 67,
        "totalQuantity": 4560,
        "totalValue": 85000.00
      },
      {
        "category": "Furniture",
        "productCount": 44,
        "totalQuantity": 1640,
        "totalValue": 155000.00
      }
    ],
    "valuation": {
      "byCostPrice": 425000.00,
      "byRetailPrice": 689500.00,
      "potentialProfit": 264500.00
    }
  }
}
```

### Get Profit Analysis
- **Method:** GET
- **URL:** `http://localhost:5000/api/admin/reports/profit?startDate=2026-01-01&endDate=2026-04-30&groupBy=month`
- **Headers:**
  - Content-Type: application/json
  - Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
- **Query Parameters:**
  - `startDate` (required): Analysis start date
  - `endDate` (required): Analysis end date
  - `groupBy` (optional): day, week, month, distributor
- **Expected Success Response (200):**
```json
{
  "status": "success",
  "data": {
    "period": {
      "start": "2026-01-01",
      "end": "2026-04-30"
    },
    "summary": {
      "totalRevenue": 2450000.00,
      "totalCost": 1557500.00,
      "grossProfit": 892500.00,
      "operatingCosts": 150000.00,
      "netProfit": 742500.00,
      "profitMargin": 30.31
    },
    "byDistributor": [
      {
        "distributor": {
          "_id": "507f1f77bcf86cd799439050",
          "name": "Ahmed Hassan"
        },
        "orders": 892,
        "revenue": 890000.00,
        "cost": 569600.00,
        "profit": 320400.00,
        "margin": 36.0
      },
      {
        "distributor": {
          "_id": "507f1f77bcf86cd799439051",
          "name": "Fatima Omar"
        },
        "orders": 756,
        "revenue": 755000.00,
        "cost": 483200.00,
        "profit": 271800.00,
        "margin": 36.0
      }
    ],
    "byMonth": [
      {
        "month": "2026-01",
        "revenue": 520000.00,
        "cost": 332800.00,
        "profit": 187200.00
      }
    ]
  }
}
```

### Query Audit Logs
- **Method:** GET
- **URL:** `http://localhost:5000/api/admin/audit-logs?page=1&limit=20&entity=order&severity=critical`
- **Headers:**
  - Content-Type: application/json
  - Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
- **Query Parameters:**
  - `page` (optional): Page number
  - `limit` (optional): Items per page
  - `entity` (optional): Filter by entity type
  - `userId` (optional): Filter by user
  - `severity` (optional): Filter by severity
  - `startDate` (optional): Date range start
  - `endDate` (optional): Date range end
- **Expected Success Response (200):**
```json
{
  "status": "success",
  "data": [
    {
      "_id": "507f1f77bcf86cd799439a00",
      "action": "order:deleted",
      "entity": "order",
      "entityId": "507f1f77bcf86cd799439600",
      "user": {
        "_id": "507f1f77bcf86cd799439020",
        "firstName": "System",
        "lastName": "Administrator"
      },
      "userRole": "superadmin",
      "timestamp": "2026-04-26T13:45:00.000Z",
      "ipAddress": "192.168.1.100",
      "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
      "changes": {
        "before": {
          "status": "pending",
          "totalAmount": 2899.97
        },
        "after": null
      },
      "severity": "critical",
      "metadata": {
        "reason": "Test data cleanup"
      }
    },
    {
      "_id": "507f1f77bcf86cd799439a01",
      "action": "inventory:adjusted",
      "entity": "inventory",
      "entityId": "507f1f77bcf86cd799439300",
      "user": {
        "_id": "507f1f77bcf86cd799439050",
        "firstName": "Ahmed",
        "lastName": "Hassan"
      },
      "userRole": "distributor",
      "timestamp": "2026-04-26T12:30:00.000Z",
      "changes": {
        "before": {
          "quantity": 150,
          "reservedQuantity": 2
        },
        "after": {
          "quantity": 148,
          "reservedQuantity": 0
        }
      },
      "severity": "info"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 4567,
    "last_page": 229
  }
}
```

### Get Entity Audit History
- **Method:** GET
- **URL:** `http://localhost:5000/api/admin/audit-logs/order/507f1f77bcf86cd799439600`
- **Headers:**
  - Content-Type: application/json
  - Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
- **Expected Success Response (200):**
```json
{
  "status": "success",
  "data": {
    "entity": "order",
    "entityId": "507f1f77bcf86cd799439600",
    "history": [
      {
        "action": "order:created",
        "user": "Mohamed Ali",
        "timestamp": "2026-04-25T11:30:00.000Z",
        "changes": {
          "status": "pending",
          "totalAmount": 2899.97
        }
      },
      {
        "action": "order:accepted",
        "user": "Ahmed Hassan",
        "timestamp": "2026-04-25T14:00:00.000Z",
        "changes": {
          "status": "accepted"
        }
      },
      {
        "action": "order:prepared",
        "user": "Ahmed Hassan",
        "timestamp": "2026-04-25T15:00:00.000Z",
        "changes": {
          "status": "preparing"
        }
      },
      {
        "action": "order:delivered",
        "user": "Omar Ibrahim",
        "timestamp": "2026-04-26T15:00:00.000Z",
        "changes": {
          "status": "delivered"
        }
      }
    ]
  }
}
```

### Export Sales Data
- **Method:** POST
- **URL:** `http://localhost:5000/api/admin/export/sales`
- **Headers:**
  - Content-Type: application/json
  - Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
- **Body (JSON):**
```json
{
  "format": "csv",
  "startDate": "2026-04-01",
  "endDate": "2026-04-30",
  "fields": ["orderNumber", "customerName", "totalAmount", "status", "createdAt"]
}
```
- **Expected Success Response (200):**
```json
{
  "status": "success",
  "message": "Export generated successfully",
  "data": {
    "downloadUrl": "/exports/sales_2026-04-26_150000.csv",
    "format": "csv",
    "recordCount": 632,
    "fileSize": "45.2 KB",
    "expiresAt": "2026-04-27T15:00:00.000Z"
  }
}
```
- **Expected Error Responses:**
  - `400` – Invalid format (must be csv or json)
  - `400` – No fields specified
  - `401` – Authentication required
  - `403` – Export permission required

### Get Top Products
- **Method:** GET
- **URL:** `http://localhost:5000/api/admin/top-products?limit=5&period=thisMonth`
- **Headers:**
  - Content-Type: application/json
  - Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
- **Query Parameters:**
  - `limit` (optional): Number of products, default 10
  - `period` (optional): today, thisWeek, thisMonth, thisYear
- **Expected Success Response (200):**
```json
{
  "status": "success",
  "data": {
    "period": "thisMonth",
    "topProducts": [
      {
        "rank": 1,
        "_id": "507f1f77bcf86cd799439100",
        "sku": "LAPTOP-DEL-001",
        "name": "Dell Latitude 5420 Laptop",
        "quantitySold": 145,
        "revenue": 130499.55,
        "ordersCount": 89
      },
      {
        "rank": 2,
        "_id": "507f1f77bcf86cd799439101",
        "sku": "PHONE-IPH-001",
        "name": "iPhone 15 Pro",
        "quantitySold": 98,
        "revenue": 107799.02,
        "ordersCount": 67
      }
    ]
  }
}
```

---

## 🌱 Seeders

### AuditLog Seeder
- **File:** `seeders/auditLog.seeder.js`
- **Run command:** `node seeders/auditLog.seeder.js`
- **Seeds:** 1000 sample audit log entries

**Example audit entries:**
```javascript
const auditLogs = [
  {
    action: "order:created",
    entity: "order",
    user: "customer_user_id",
    userRole: "customer",
    severity: "info"
  },
  {
    action: "payment:received",
    entity: "payment",
    user: "distributor_user_id",
    userRole: "distributor",
    severity: "info"
  },
  {
    action: "user:deleted",
    entity: "user",
    user: "admin_user_id",
    userRole: "superadmin",
    severity: "critical"
  }
];
```

---

## 📦 Phase Summary

The Admin & Reports phase has been completed, providing comprehensive business intelligence, audit trails, and administrative oversight capabilities.

### Schemas Created

1. **AuditLog Schema** – Complete action tracking for compliance and security
2. **SalesReport (Virtual)** – Calculated sales analytics
3. **StockReport (Virtual)** – Inventory valuation and analysis

### Endpoints Built

**Dashboard & Overview:**
- `GET /admin/dashboard` – Key metrics and recent activity
- `GET /admin/system/health` – System health monitoring

**Sales Reports:**
- `GET /admin/reports/sales` – Time-series sales analysis
- `GET /admin/reports/sales/by-product` – Product performance
- `GET /admin/reports/sales/by-customer` – Customer analysis
- `GET /admin/top-products` – Best sellers ranking

**Inventory Reports:**
- `GET /admin/reports/stock` – Stock valuation by warehouse
- `GET /admin/reports/stock/low` – Low stock alerts

**Financial Reports:**
- `GET /admin/reports/profit` – Profit analysis with margin calculations
- `GET /admin/reports/distributor-performance` – Distributor metrics
- `GET /admin/top-distributors` – Top performing distributors

**Audit & Compliance:**
- `GET /admin/audit-logs` – Query all audit logs with filters
- `GET /admin/audit-logs/:entity/:id` – Complete history for entity
- `GET /admin/users/activity` – User activity report

**Data Export:**
- `POST /admin/export/sales` – CSV/JSON export
- `POST /admin/export/inventory` – Inventory export

### Business Logic

**Profit Calculation:**
```javascript
profit = revenue - cost
margin = (profit / revenue) × 100
```

**Stock Valuation:**
```javascript
stockValue = sum(inventory.quantity × product.costPrice)
potentialProfit = sum(inventory.quantity × (product.price - product.costPrice))
```

**Audit Logging Middleware:**
```javascript
// Automatically logs all critical actions
actionsToLog = [
  'order:created', 'order:deleted', 'order:status_changed',
  'payment:received', 'payment:refunded',
  'inventory:adjusted', 'user:deleted',
  'product:deleted', 'invoice:cancelled'
];
```

### Security Implementation

- All admin endpoints require `admin:*` or `report:*` permissions
- Audit logs immutable (no update/delete endpoints)
- IP tracking for critical actions
- Data export requires explicit permission
- Reports filtered by user warehouse access (distributors see their data only)

### Testable via Postman

- [x] View admin dashboard with all metrics
- [x] Get sales report by various periods
- [x] Get profit analysis by distributor
- [x] View stock valuation report
- [x] Query audit logs with filters
- [x] Get complete audit history for an order
- [x] Export data in CSV format
- [x] View top products ranking
- [x] View top distributors
- [x] Check system health status

### Important Architectural Decisions

- **Virtual Report Models:** Reports calculated on-demand from base collections
- **Immutable Audit Logs:** No modification allowed after creation
- **Automatic Audit Middleware:** Critical actions logged automatically
- **Export Expiration:** Generated files expire after 24 hours
- **Granular Report Permissions:** Separate permissions for sales, stock, profit reports
- **Calculated Profit Margins:** Real-time calculation from order and product data
- **Severity Levels:** Critical actions (deletes) logged with higher severity

---

## ✔️ Phase Done When:

- [x] All endpoints return correct responses
- [x] Postman tests pass for all scenarios
- [x] Admin dashboard shows key metrics
- [x] Sales reports calculate correctly by period
- [x] Stock reports show valuation and category breakdown
- [x] Profit analysis includes margin calculations
- [x] Audit logs capture critical actions
- [x] Entity audit history shows complete timeline
- [x] Data export generates downloadable files
- [x] Top products/distributors ranking works
- [x] System health check endpoint functional
- [x] Reports respect user permissions
- [x] Audit logs include IP and user agent for security
