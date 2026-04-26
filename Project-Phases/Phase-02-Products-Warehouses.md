# Phase 02 – Products & Warehouses

## 🎯 Goals

Build the complete inventory management layer including product catalog, warehouse management, and inventory tracking. This phase establishes the core ERP entities that enable order processing and stock control.

**Key Outcomes:**
- Full product catalog with CRUD operations
- Warehouse management system with distributor assignments
- Real-time inventory tracking across all locations
- Stock quantity management with automatic calculations
- Product availability based on warehouse location

---

## ✅ Backend Tasks

- [x] Create Product model with comprehensive fields
- [x] Implement Product CRUD APIs
- [x] Create Warehouse model
- [x] Implement Warehouse CRUD APIs
- [x] Assign warehouse to distributor functionality
- [x] Create Inventory schema linking products, warehouses, and quantities
- [x] Implement stock quantity tracking
- [x] Add stock movement logging
- [x] Create inventory adjustment APIs
- [x] Add product search and filtering

---

## 🗂️ Database Schemas

### Product Schema

| Field | Type | Required | Default | Notes |
|-------|------|----------|---------|-------|
| _id | ObjectId | Auto | - | MongoDB document ID |
| sku | String | Yes | - | Unique stock keeping unit |
| name | String | Yes | - | Product name |
| description | String | No | "" | Product description |
| category | String | Yes | - | Product category |
| price | Number | Yes | 0 | Base price |
| costPrice | Number | Yes | 0 | Purchase cost (for profit calc) |
| unit | String | Yes | "piece" | Unit of measurement |
| weight | Number | No | null | Weight in kg |
| dimensions | Object | No | {} | {length, width, height} in cm |
| barcode | String | No | null | EAN/UPC barcode |
| isActive | Boolean | No | true | Product availability |
| minStockLevel | Number | No | 10 | Alert threshold |
| maxStockLevel | Number | No | 1000 | Maximum stock limit |
| reorderPoint | Number | No | 50 | Auto-reorder threshold |
| supplier | ObjectId | No | null | Supplier reference |
| images | [String] | No | [] | Product image URLs |
| tags | [String] | No | [] | Search tags |
| createdAt | Date | Auto | Date.now | Creation timestamp |
| updatedAt | Date | Auto | Date.now | Update timestamp |

### Warehouse Schema

| Field | Type | Required | Default | Notes |
|-------|------|----------|---------|-------|
| _id | ObjectId | Auto | - | MongoDB document ID |
| code | String | Yes | - | Unique warehouse code (e.g., "WH-CAI-01") |
| name | String | Yes | - | Warehouse name |
| location | Object | Yes | - | {address, city, state, country, zipCode, coordinates} |
| manager | ObjectId | No | null | Reference to User (distributor) |
| contactPhone | String | No | null | Warehouse contact |
| email | String | No | null | Warehouse email |
| isActive | Boolean | No | true | Warehouse status |
| capacity | Number | No | null | Storage capacity |
| operatingHours | String | No | null | Business hours |
| createdAt | Date | Auto | Date.now | Creation timestamp |
| updatedAt | Date | Auto | Date.now | Update timestamp |

### Inventory Schema

| Field | Type | Required | Default | Notes |
|-------|------|----------|---------|-------|
| _id | ObjectId | Auto | - | MongoDB document ID |
| product | ObjectId | Yes | - | Reference to Product |
| warehouse | ObjectId | Yes | - | Reference to Warehouse |
| quantity | Number | Yes | 0 | Current stock quantity |
| reservedQuantity | Number | No | 0 | Stock reserved for orders |
| availableQuantity | Number | No | 0 | Calculated: quantity - reserved |
| lastMovement | Date | No | null | Last stock change |
| createdAt | Date | Auto | Date.now | Creation timestamp |
| updatedAt | Date | Auto | Date.now | Update timestamp |

**Indexes:**
- Unique compound index: `{ product: 1, warehouse: 1 }`

### StockMovement Schema

| Field | Type | Required | Default | Notes |
|-------|------|----------|---------|-------|
| _id | ObjectId | Auto | - | MongoDB document ID |
| product | ObjectId | Yes | - | Reference to Product |
| warehouse | ObjectId | Yes | - | Reference to Warehouse |
| type | String | Yes | - | Enum: in, out, adjustment, transfer |
| quantity | Number | Yes | - | Positive for in, negative for out |
| reason | String | No | "" | Reason for movement |
| reference | String | No | null | Order ID or reference number |
| performedBy | ObjectId | Yes | - | User who made the change |
| previousQuantity | Number | Yes | - | Quantity before movement |
| newQuantity | Number | Yes | - | Quantity after movement |
| createdAt | Date | Auto | Date.now | Movement timestamp |

---

## 🔌 API Endpoints

| Method | Endpoint | Description | Permission Required |
|--------|----------|-------------|-------------------|
| POST | `/products` | Create new product | product:create |
| GET | `/products` | List all products (paginated, filterable) | product:list |
| GET | `/products/:id` | Get product by ID | product:read |
| PUT | `/products/:id` | Update product | product:update |
| DELETE | `/products/:id` | Delete product (soft delete) | product:delete |
| GET | `/products/search` | Search products by name/sku | product:list |
| GET | `/products/:id/inventory` | Get product inventory across warehouses | product:read |
| POST | `/warehouses` | Create new warehouse | warehouse:create |
| GET | `/warehouses` | List all warehouses (paginated) | warehouse:list |
| GET | `/warehouses/:id` | Get warehouse by ID | warehouse:read |
| PUT | `/warehouses/:id` | Update warehouse | warehouse:update |
| DELETE | `/warehouses/:id` | Delete warehouse | warehouse:delete |
| PUT | `/warehouses/:id/assign` | Assign distributor to warehouse | warehouse:assign |
| GET | `/warehouses/:id/inventory` | Get warehouse inventory | warehouse:read |
| POST | `/inventory/adjust` | Adjust inventory quantity | inventory:update |
| GET | `/inventory/low-stock` | Get low stock alerts | inventory:read |
| POST | `/inventory/transfer` | Transfer stock between warehouses | inventory:transfer |

---

## 🧪 Postman Testing Guide

### Create Product
- **Method:** POST
- **URL:** `http://localhost:5000/api/products`
- **Headers:**
  - Content-Type: application/json
  - Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
- **Body (JSON):**
```json
{
  "sku": "LAPTOP-DEL-001",
  "name": "Dell Latitude 5420 Laptop",
  "description": "14-inch business laptop with Intel Core i7, 16GB RAM, 512GB SSD",
  "category": "Electronics",
  "price": 899.99,
  "costPrice": 650.00,
  "unit": "piece",
  "weight": 1.53,
  "dimensions": {
    "length": 32.3,
    "width": 21.6,
    "height": 2.0
  },
  "barcode": "1234567890123",
  "minStockLevel": 5,
  "maxStockLevel": 200,
  "reorderPoint": 20,
  "tags": ["laptop", "dell", "business", "electronics"]
}
```
- **Expected Success Response (201):**
```json
{
  "status": "success",
  "message": "Product created successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439100",
    "sku": "LAPTOP-DEL-001",
    "name": "Dell Latitude 5420 Laptop",
    "description": "14-inch business laptop with Intel Core i7, 16GB RAM, 512GB SSD",
    "category": "Electronics",
    "price": 899.99,
    "costPrice": 650.00,
    "unit": "piece",
    "weight": 1.53,
    "dimensions": {
      "length": 32.3,
      "width": 21.6,
      "height": 2.0
    },
    "barcode": "1234567890123",
    "minStockLevel": 5,
    "maxStockLevel": 200,
    "reorderPoint": 20,
    "tags": ["laptop", "dell", "business", "electronics"],
    "isActive": true,
    "createdAt": "2026-04-25T10:30:00.000Z"
  }
}
```
- **Expected Error Responses:**
  - `400` – Missing required fields (sku, name, category)
  - `400` – SKU already exists
  - `400` – Invalid price/cost values
  - `401` – No token / invalid token
  - `403` – Permission denied (product:create required)

### List Products (Paginated & Filtered)
- **Method:** GET
- **URL:** `http://localhost:5000/api/products?page=1&limit=10&category=Electronics&isActive=true`
- **Headers:**
  - Content-Type: application/json
  - Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
- **Query Parameters:**
  - `page` (optional): Page number
  - `limit` (optional): Items per page
  - `category` (optional): Filter by category
  - `isActive` (optional): Filter by status
  - `minPrice` (optional): Minimum price
  - `maxPrice` (optional): Maximum price
- **Expected Success Response (200):**
```json
{
  "status": "success",
  "data": [
    {
      "_id": "507f1f77bcf86cd799439100",
      "sku": "LAPTOP-DEL-001",
      "name": "Dell Latitude 5420 Laptop",
      "category": "Electronics",
      "price": 899.99,
      "isActive": true
    },
    {
      "_id": "507f1f77bcf86cd799439101",
      "sku": "PHONE-IPH-001",
      "name": "iPhone 15 Pro",
      "category": "Electronics",
      "price": 1099.99,
      "isActive": true
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 45,
    "last_page": 5
  }
}
```
- **Expected Error Responses:**
  - `401` – Authentication required
  - `403` – Insufficient permissions

### Get Product by ID
- **Method:** GET
- **URL:** `http://localhost:5000/api/products/507f1f77bcf86cd799439100`
- **Headers:**
  - Content-Type: application/json
  - Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
- **Body:** None
- **Expected Success Response (200):**
```json
{
  "status": "success",
  "data": {
    "_id": "507f1f77bcf86cd799439100",
    "sku": "LAPTOP-DEL-001",
    "name": "Dell Latitude 5420 Laptop",
    "description": "14-inch business laptop with Intel Core i7, 16GB RAM, 512GB SSD",
    "category": "Electronics",
    "price": 899.99,
    "costPrice": 650.00,
    "unit": "piece",
    "weight": 1.53,
    "dimensions": {
      "length": 32.3,
      "width": 21.6,
      "height": 2.0
    },
    "barcode": "1234567890123",
    "minStockLevel": 5,
    "maxStockLevel": 200,
    "reorderPoint": 20,
    "tags": ["laptop", "dell", "business", "electronics"],
    "images": [],
    "isActive": true,
    "createdAt": "2026-04-25T10:30:00.000Z",
    "updatedAt": "2026-04-25T10:30:00.000Z"
  }
}
```
- **Expected Error Responses:**
  - `401` – Authentication required
  - `403` – Insufficient permissions
  - `404` – Product not found

### Update Product
- **Method:** PUT
- **URL:** `http://localhost:5000/api/products/507f1f77bcf86cd799439100`
- **Headers:**
  - Content-Type: application/json
  - Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
- **Body (JSON):**
```json
{
  "price": 849.99,
  "description": "14-inch business laptop - Updated with new specs",
  "minStockLevel": 10
}
```
- **Expected Success Response (200):**
```json
{
  "status": "success",
  "message": "Product updated successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439100",
    "sku": "LAPTOP-DEL-001",
    "name": "Dell Latitude 5420 Laptop",
    "price": 849.99,
    "minStockLevel": 10,
    "updatedAt": "2026-04-25T14:45:00.000Z"
  }
}
```
- **Expected Error Responses:**
  - `400` – Invalid field values
  - `401` – Authentication required
  - `403` – Permission denied
  - `404` – Product not found

### Create Warehouse
- **Method:** POST
- **URL:** `http://localhost:5000/api/warehouses`
- **Headers:**
  - Content-Type: application/json
  - Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
- **Body (JSON):**
```json
{
  "code": "WH-CAI-01",
  "name": "Cairo Main Distribution Center",
  "location": {
    "address": "15 Ramses Street",
    "city": "Cairo",
    "state": "Cairo Governorate",
    "country": "Egypt",
    "zipCode": "11511",
    "coordinates": {
      "lat": 30.0444,
      "lng": 31.2357
    }
  },
  "contactPhone": "+20 2 2396 1234",
  "email": "cairo.wh@erp-system.com",
  "capacity": 5000,
  "operatingHours": "Sunday-Thursday 08:00-18:00"
}
```
- **Expected Success Response (201):**
```json
{
  "status": "success",
  "message": "Warehouse created successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439200",
    "code": "WH-CAI-01",
    "name": "Cairo Main Distribution Center",
    "location": {
      "address": "15 Ramses Street",
      "city": "Cairo",
      "state": "Cairo Governorate",
      "country": "Egypt",
      "zipCode": "11511",
      "coordinates": {
        "lat": 30.0444,
        "lng": 31.2357
      }
    },
    "contactPhone": "+20 2 2396 1234",
    "email": "cairo.wh@erp-system.com",
    "capacity": 5000,
    "operatingHours": "Sunday-Thursday 08:00-18:00",
    "isActive": true,
    "createdAt": "2026-04-25T11:00:00.000Z"
  }
}
```
- **Expected Error Responses:**
  - `400` – Warehouse code already exists
  - `400` – Missing required fields
  - `401` – Authentication required
  - `403` – Permission denied

### Assign Distributor to Warehouse
- **Method:** PUT
- **URL:** `http://localhost:5000/api/warehouses/507f1f77bcf86cd799439200/assign`
- **Headers:**
  - Content-Type: application/json
  - Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
- **Body (JSON):**
```json
{
  "managerId": "507f1f77bcf86cd799439050"
}
```
- **Expected Success Response (200):**
```json
{
  "status": "success",
  "message": "Distributor assigned to warehouse successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439200",
    "code": "WH-CAI-01",
    "name": "Cairo Main Distribution Center",
    "manager": {
      "_id": "507f1f77bcf86cd799439050",
      "firstName": "Ahmed",
      "lastName": "Hassan",
      "email": "ahmed.hassan@distributor.com"
    },
    "updatedAt": "2026-04-25T12:00:00.000Z"
  }
}
```
- **Expected Error Responses:**
  - `400` – User is not a distributor
  - `400` – User already manages another warehouse
  - `401` – Authentication required
  - `403` – Permission denied
  - `404` – Warehouse not found
  - `404` – User not found

### Adjust Inventory
- **Method:** POST
- **URL:** `http://localhost:5000/api/inventory/adjust`
- **Headers:**
  - Content-Type: application/json
  - Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
- **Body (JSON):**
```json
{
  "productId": "507f1f77bcf86cd799439100",
  "warehouseId": "507f1f77bcf86cd799439200",
  "quantity": 150,
  "reason": "Initial stock setup",
  "type": "in"
}
```
- **Expected Success Response (200):**
```json
{
  "status": "success",
  "message": "Inventory adjusted successfully",
  "data": {
    "inventory": {
      "_id": "507f1f77bcf86cd799439300",
      "product": "507f1f77bcf86cd799439100",
      "warehouse": "507f1f77bcf86cd799439200",
      "quantity": 150,
      "reservedQuantity": 0,
      "availableQuantity": 150,
      "lastMovement": "2026-04-25T12:30:00.000Z"
    },
    "movement": {
      "_id": "507f1f77bcf86cd799439400",
      "type": "in",
      "quantity": 150,
      "reason": "Initial stock setup",
      "previousQuantity": 0,
      "newQuantity": 150,
      "performedBy": "507f1f77bcf86cd799439011"
    }
  }
}
```
- **Expected Error Responses:**
  - `400` – Invalid quantity
  - `400` – Product not found
  - `400` – Warehouse not found
  - `401` – Authentication required
  - `403` – Permission denied

### Get Low Stock Alerts
- **Method:** GET
- **URL:** `http://localhost:5000/api/inventory/low-stock`
- **Headers:**
  - Content-Type: application/json
  - Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
- **Query Parameters:**
  - `warehouseId` (optional): Filter by specific warehouse
- **Expected Success Response (200):**
```json
{
  "status": "success",
  "data": [
    {
      "product": {
        "_id": "507f1f77bcf86cd799439100",
        "sku": "LAPTOP-DEL-001",
        "name": "Dell Latitude 5420 Laptop",
        "minStockLevel": 5,
        "reorderPoint": 20
      },
      "warehouse": {
        "_id": "507f1f77bcf86cd799439200",
        "code": "WH-CAI-01",
        "name": "Cairo Main Distribution Center"
      },
      "quantity": 3,
      "availableQuantity": 3,
      "belowLevel": "minStockLevel"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 1,
    "last_page": 1
  }
}
```
- **Expected Error Responses:**
  - `401` – Authentication required
  - `403` – Permission denied

---

## 🌱 Seeders

### Product Seeder
- **File:** `seeders/product.seeder.js`
- **Run command:** `node seeders/product.seeder.js`
- **Seeds:** 50 sample products across 5 categories

**Example seeded products:**
```javascript
const products = [
  {
    sku: "LAPTOP-DEL-001",
    name: "Dell Latitude 5420 Laptop",
    category: "Electronics",
    price: 899.99,
    costPrice: 650.00
  },
  {
    sku: "PHONE-IPH-001",
    name: "iPhone 15 Pro",
    category: "Electronics",
    price: 1099.99,
    costPrice: 850.00
  },
  {
    sku: "CHAIR-ERG-001",
    name: "Ergonomic Office Chair",
    category: "Furniture",
    price: 299.99,
    costPrice: 180.00
  },
  {
    sku: "PAPER-A4-001",
    name: "A4 Copy Paper (500 sheets)",
    category: "Office Supplies",
    price: 4.99,
    costPrice: 2.50
  }
];
```

### Warehouse Seeder
- **File:** `seeders/warehouse.seeder.js`
- **Run command:** `node seeders/warehouse.seeder.js`
- **Seeds:** 5 warehouses across major cities

**Example seeded warehouses:**
```javascript
const warehouses = [
  {
    code: "WH-CAI-01",
    name: "Cairo Main Distribution Center",
    location: {
      city: "Cairo",
      country: "Egypt"
    }
  },
  {
    code: "WH-ALX-01",
    name: "Alexandria Warehouse",
    location: {
      city: "Alexandria",
      country: "Egypt"
    }
  }
];
```

### Inventory Seeder
- **File:** `seeders/inventory.seeder.js`
- **Run command:** `node seeders/inventory.seeder.js`
- **Seeds:** Initial stock levels for all products in all warehouses

---

## 📦 Phase Summary

The Products & Warehouses phase has been completed, establishing a comprehensive inventory management system with full CRUD capabilities and stock tracking.

### Schemas Created

1. **Product Schema** – Complete product catalog with pricing, dimensions, and metadata
2. **Warehouse Schema** – Multi-location warehouse management with distributor assignments
3. **Inventory Schema** – Real-time stock tracking with reserved quantity calculations
4. **StockMovement Schema** – Complete audit trail of all inventory changes

### Endpoints Built

**Product Management:**
- `POST /products` – Create products with full validation
- `GET /products` – Paginated listing with filters (category, price range, status)
- `GET /products/:id` – Detailed product retrieval
- `PUT /products/:id` – Product updates
- `DELETE /products/:id` – Soft delete deactivation
- `GET /products/search` – Full-text search by name/SKU
- `GET /products/:id/inventory` – Cross-warehouse inventory view

**Warehouse Management:**
- `POST /warehouses` – Create distribution centers
- `GET /warehouses` – Paginated warehouse listing
- `GET /warehouses/:id` – Warehouse details
- `PUT /warehouses/:id` – Warehouse updates
- `DELETE /warehouses/:id` – Warehouse removal
- `PUT /warehouses/:id/assign` – Distributor assignment with validation
- `GET /warehouses/:id/inventory` – Warehouse stock view

**Inventory Operations:**
- `POST /inventory/adjust` – Stock adjustments with movement logging
- `GET /inventory/low-stock` – Automated alerts below thresholds
- `POST /inventory/transfer` – Inter-warehouse transfers

### Security Implementation

- All endpoints protected with `authenticate` middleware
- Permission-based access control (product:create, warehouse:update, etc.)
- Validation prevents duplicate SKUs and warehouse codes
- Distributor assignment validates user role

### Business Logic

**Inventory Calculations:**
```javascript
availableQuantity = quantity - reservedQuantity
```

**Low Stock Detection:**
```javascript
isLowStock = quantity <= minStockLevel || quantity <= reorderPoint
```

**Stock Movement Logging:**
- Every quantity change creates a StockMovement record
- Tracks previous/new quantities, reason, and performer
- Enables complete audit trail

### Testable via Postman

- [x] Create products with full specifications
- [x] List products with filters and pagination
- [x] Update product pricing and stock levels
- [x] Create warehouses with location data
- [x] Assign distributors to warehouses (validates role)
- [x] Adjust inventory with movement logging
- [x] View low stock alerts
- [x] Transfer stock between warehouses
- [x] Search products by name or SKU

### Important Architectural Decisions

- **Compound Unique Index:** `{ product, warehouse }` prevents duplicate inventory records
- **Reserved Quantity Pattern:** Separates physical stock from order-committed stock
- **Stock Movement Audit:** Every change logged for accountability
- **Soft Deletes:** Products and warehouses deactivated rather than deleted (preserve history)
- **Cost Price Storage:** Enables profit margin calculations in reporting
- **Reorder Point Logic:** Separate from min stock for proactive purchasing

---

## ✔️ Phase Done When:

- [x] All endpoints return correct responses
- [x] Postman tests pass for all scenarios
- [x] Products can be created with all fields
- [x] SKU uniqueness enforced at database level
- [x] Warehouses can be created and assigned to distributors
- [x] Only users with "distributor" role can be assigned as warehouse managers
- [x] Inventory tracks quantity, reservedQuantity, and availableQuantity
- [x] Stock movements are logged with user reference
- [x] Low stock alerts return products below thresholds
- [x] All list endpoints support pagination
- [x] Product search works by name and SKU
- [x] Inter-warehouse transfers update both locations
