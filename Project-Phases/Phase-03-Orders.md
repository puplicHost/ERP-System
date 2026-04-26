# Phase 03 – Orders (Customer Side)

## 🎯 Goals

Implement the complete customer-facing order management system. This phase enables customers to browse products, check availability, create orders, and track their order status through the fulfillment pipeline.

**Key Outcomes:**
- Order creation with automatic distributor assignment
- Stock availability validation before order acceptance
- Order status workflow (pending → processing → etc.)
- Order item management with quantity and pricing
- Automatic distributor assignment based on location/stock

---

## ✅ Backend Tasks

- [x] Create Order schema with status tracking
- [x] Create OrderItem schema for line items
- [x] Define Order status enum (pending, accepted, preparing, ready, in_transit, delivered, cancelled, rejected)
- [x] Implement Create Order API
- [x] Build stock availability checking logic
- [x] Implement automatic distributor assignment algorithm
- [x] Create customer order listing endpoint
- [x] Create order detail endpoint for customers
- [x] Implement order cancellation (customer-side, pending only)
- [x] Add order validation (items, quantities, pricing)

---

## 🗂️ Database Schemas

### Order Schema

| Field | Type | Required | Default | Notes |
|-------|------|----------|---------|-------|
| _id | ObjectId | Auto | - | MongoDB document ID |
| orderNumber | String | Yes | - | Unique order identifier (e.g., "ORD-2026-0001") |
| customer | ObjectId | Yes | - | Reference to User (customer) |
| distributor | ObjectId | No | null | Assigned distributor reference |
| warehouse | ObjectId | No | null | Source warehouse reference |
| status | String | Yes | "pending" | Enum: pending, accepted, preparing, ready, in_transit, delivered, cancelled, rejected |
| items | [OrderItem] | Yes | [] | Embedded order line items |
| totalAmount | Number | Yes | 0 | Sum of all item totals |
| discountAmount | Number | No | 0 | Applied discount |
| taxAmount | Number | No | 0 | Calculated tax |
| finalAmount | Number | Yes | 0 | Total after discount and tax |
| shippingAddress | Object | Yes | - | {street, city, state, country, zipCode, coordinates} |
| billingAddress | Object | Yes | - | {street, city, state, country, zipCode} |
| notes | String | No | "" | Customer notes |
| rejectionReason | String | No | null | Reason if rejected |
| cancelledBy | ObjectId | No | null | User who cancelled |
| cancellationReason | String | No | null | Cancellation reason |
| acceptedAt | Date | No | null | When distributor accepted |
| preparedAt | Date | No | null | When order was prepared |
| shippedAt | Date | No | null | When order was shipped |
| deliveredAt | Date | No | null | When order was delivered |
| createdAt | Date | Auto | Date.now | Order creation |
| updatedAt | Date | Auto | Date.now | Last update |

### OrderItem Schema (Embedded)

| Field | Type | Required | Default | Notes |
|-------|------|----------|---------|-------|
| _id | ObjectId | Auto | - | Line item ID |
| product | ObjectId | Yes | - | Reference to Product |
| productName | String | Yes | - | Snapshot of product name |
| productSku | String | Yes | - | Snapshot of SKU |
| quantity | Number | Yes | 1 | Ordered quantity |
| unitPrice | Number | Yes | 0 | Price at time of order |
| totalPrice | Number | Yes | 0 | quantity × unitPrice |
| discount | Number | No | 0 | Line item discount |
| warehouse | ObjectId | No | null | Source warehouse |
| status | String | No | "pending" | Enum: pending, reserved, picked, cancelled |

### Cart Schema (Temporary)

| Field | Type | Required | Default | Notes |
|-------|------|----------|---------|-------|
| _id | ObjectId | Auto | - | MongoDB document ID |
| customer | ObjectId | Yes | - | Reference to User |
| items | [CartItem] | Yes | [] | Cart line items |
| createdAt | Date | Auto | Date.now | Cart creation |
| updatedAt | Date | Auto | Date.now | Last update |

### CartItem Schema (Embedded)

| Field | Type | Required | Default | Notes |
|-------|------|----------|---------|-------|
| product | ObjectId | Yes | - | Reference to Product |
| quantity | Number | Yes | 1 | Desired quantity |
| addedAt | Date | Auto | Date.now | When item added |

---

## 🔌 API Endpoints

| Method | Endpoint | Description | Permission Required |
|--------|----------|-------------|-------------------|
| POST | `/cart/items` | Add item to cart | customer only |
| GET | `/cart` | Get current cart | customer only |
| DELETE | `/cart/items/:productId` | Remove item from cart | customer only |
| DELETE | `/cart` | Clear cart | customer only |
| POST | `/orders` | Create order from cart | order:create |
| GET | `/orders/my-orders` | List customer's orders | order:list_own |
| GET | `/orders/:id` | Get order details | order:read_own (customer's order only) |
| PUT | `/orders/:id/cancel` | Cancel pending order | order:update_own |
| GET | `/orders/:id/status` | Get order status timeline | order:read_own |
| POST | `/orders/check-availability` | Check stock before ordering | order:create |

---

## 🧪 Postman Testing Guide

### Add Item to Cart
- **Method:** POST
- **URL:** `http://localhost:5000/api/cart/items`
- **Headers:**
  - Content-Type: application/json
  - Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... (customer token)
- **Body (JSON):**
```json
{
  "productId": "507f1f77bcf86cd799439100",
  "quantity": 2
}
```
- **Expected Success Response (200):**
```json
{
  "status": "success",
  "message": "Item added to cart",
  "data": {
    "cart": {
      "_id": "507f1f77bcf86cd799439500",
      "customer": "507f1f77bcf86cd799439060",
      "items": [
        {
          "product": {
            "_id": "507f1f77bcf86cd799439100",
            "name": "Dell Latitude 5420 Laptop",
            "sku": "LAPTOP-DEL-001",
            "price": 899.99
          },
          "quantity": 2,
          "addedAt": "2026-04-25T10:00:00.000Z"
        }
      ],
      "itemCount": 1,
      "totalItems": 2
    }
  }
}
```
- **Expected Error Responses:**
  - `400` – Invalid product ID
  - `400` – Quantity must be positive
  - `400` – Product is out of stock
  - `401` – Authentication required
  - `403` – Only customers can add to cart

### Get Cart
- **Method:** GET
- **URL:** `http://localhost:5000/api/cart`
- **Headers:**
  - Content-Type: application/json
  - Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
- **Body:** None
- **Expected Success Response (200):**
```json
{
  "status": "success",
  "data": {
    "cart": {
      "_id": "507f1f77bcf86cd799439500",
      "items": [
        {
          "product": {
            "_id": "507f1f77bcf86cd799439100",
            "name": "Dell Latitude 5420 Laptop",
            "sku": "LAPTOP-DEL-001",
            "price": 899.99
          },
          "quantity": 2
        },
        {
          "product": {
            "_id": "507f1f77bcf86cd799439101",
            "name": "iPhone 15 Pro",
            "sku": "PHONE-IPH-001",
            "price": 1099.99
          },
          "quantity": 1
        }
      ],
      "itemCount": 2,
      "totalItems": 3,
      "estimatedTotal": 2899.97
    }
  }
}
```
- **Expected Error Responses:**
  - `401` – Authentication required

### Check Stock Availability
- **Method:** POST
- **URL:** `http://localhost:5000/api/orders/check-availability`
- **Headers:**
  - Content-Type: application/json
  - Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
- **Body (JSON):**
```json
{
  "items": [
    {
      "productId": "507f1f77bcf86cd799439100",
      "quantity": 2
    },
    {
      "productId": "507f1f77bcf86cd799439101",
      "quantity": 1
    }
  ],
  "deliveryCity": "Cairo"
}
```
- **Expected Success Response (200):**
```json
{
  "status": "success",
  "data": {
    "available": true,
    "warehouse": {
      "_id": "507f1f77bcf86cd799439200",
      "code": "WH-CAI-01",
      "name": "Cairo Main Distribution Center",
      "manager": {
        "_id": "507f1f77bcf86cd799439050",
        "firstName": "Ahmed",
        "lastName": "Hassan"
      }
    },
    "items": [
      {
        "productId": "507f1f77bcf86cd799439100",
        "requested": 2,
        "available": 150,
        "canFulfill": true
      },
      {
        "productId": "507f1f77bcf86cd799439101",
        "requested": 1,
        "available": 75,
        "canFulfill": true
      }
    ],
    "estimatedDelivery": "2026-04-27T14:00:00.000Z"
  }
}
```
- **Expected Error Response (200 with available: false):**
```json
{
  "status": "success",
  "data": {
    "available": false,
    "reason": "insufficient_stock",
    "items": [
      {
        "productId": "507f1f77bcf86cd799439100",
        "requested": 500,
        "available": 150,
        "canFulfill": false,
        "shortage": 350
      }
    ]
  }
}
```
- **Expected Error Responses:**
  - `400` – Invalid product IDs
  - `400` – No warehouses serve the delivery city
  - `401` – Authentication required

### Create Order
- **Method:** POST
- **URL:** `http://localhost:5000/api/orders`
- **Headers:**
  - Content-Type: application/json
  - Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... (customer token)
- **Body (JSON):**
```json
{
  "items": [
    {
      "productId": "507f1f77bcf86cd799439100",
      "quantity": 2
    },
    {
      "productId": "507f1f77bcf86cd799439101",
      "quantity": 1
    }
  ],
  "shippingAddress": {
    "street": "25 Tahrir Street, Apt 12",
    "city": "Cairo",
    "state": "Cairo Governorate",
    "country": "Egypt",
    "zipCode": "11511",
    "coordinates": {
      "lat": 30.0444,
      "lng": 31.2357
    }
  },
  "billingAddress": {
    "street": "25 Tahrir Street, Apt 12",
    "city": "Cairo",
    "state": "Cairo Governorate",
    "country": "Egypt",
    "zipCode": "11511"
  },
  "notes": "Please deliver after 2 PM. Call before arrival."
}
```
- **Expected Success Response (201):**
```json
{
  "status": "success",
  "message": "Order created successfully",
  "data": {
    "order": {
      "_id": "507f1f77bcf86cd799439600",
      "orderNumber": "ORD-2026-0001",
      "customer": {
        "_id": "507f1f77bcf86cd799439060",
        "firstName": "Mohamed",
        "lastName": "Ali",
        "email": "mohamed.ali@customer.com"
      },
      "distributor": {
        "_id": "507f1f77bcf86cd799439050",
        "firstName": "Ahmed",
        "lastName": "Hassan"
      },
      "warehouse": {
        "_id": "507f1f77bcf86cd799439200",
        "code": "WH-CAI-01",
        "name": "Cairo Main Distribution Center"
      },
      "status": "pending",
      "items": [
        {
          "product": "507f1f77bcf86cd799439100",
          "productName": "Dell Latitude 5420 Laptop",
          "productSku": "LAPTOP-DEL-001",
          "quantity": 2,
          "unitPrice": 899.99,
          "totalPrice": 1799.98,
          "status": "pending"
        },
        {
          "product": "507f1f77bcf86cd799439101",
          "productName": "iPhone 15 Pro",
          "productSku": "PHONE-IPH-001",
          "quantity": 1,
          "unitPrice": 1099.99,
          "totalPrice": 1099.99,
          "status": "pending"
        }
      ],
      "totalAmount": 2899.97,
      "discountAmount": 0,
      "taxAmount": 289.99,
      "finalAmount": 3189.96,
      "shippingAddress": {
        "street": "25 Tahrir Street, Apt 12",
        "city": "Cairo",
        "state": "Cairo Governorate",
        "country": "Egypt",
        "zipCode": "11511"
      },
      "notes": "Please deliver after 2 PM. Call before arrival.",
      "createdAt": "2026-04-25T11:30:00.000Z"
    }
  }
}
```
- **Expected Error Responses:**
  - `400` – Insufficient stock for items
  - `400` – Invalid product IDs
  - `400` – Missing shipping/billing address
  - `400` – No distributor available for location
  - `401` – Authentication required
  - `403` – Only customers can create orders

### List My Orders (Customer)
- **Method:** GET
- **URL:** `http://localhost:5000/api/orders/my-orders?page=1&limit=10&status=pending`
- **Headers:**
  - Content-Type: application/json
  - Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
- **Query Parameters:**
  - `page` (optional): Page number
  - `limit` (optional): Items per page
  - `status` (optional): Filter by status
- **Expected Success Response (200):**
```json
{
  "status": "success",
  "data": [
    {
      "_id": "507f1f77bcf86cd799439600",
      "orderNumber": "ORD-2026-0001",
      "status": "pending",
      "totalAmount": 2899.97,
      "finalAmount": 3189.96,
      "itemCount": 2,
      "distributor": {
        "firstName": "Ahmed",
        "lastName": "Hassan"
      },
      "createdAt": "2026-04-25T11:30:00.000Z"
    },
    {
      "_id": "507f1f77bcf86cd799439601",
      "orderNumber": "ORD-2026-0002",
      "status": "delivered",
      "totalAmount": 599.98,
      "finalAmount": 659.98,
      "itemCount": 1,
      "distributor": {
        "firstName": "Fatima",
        "lastName": "Omar"
      },
      "deliveredAt": "2026-04-20T16:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 5,
    "last_page": 1
  }
}
```
- **Expected Error Responses:**
  - `401` – Authentication required

### Get Order Details
- **Method:** GET
- **URL:** `http://localhost:5000/api/orders/507f1f77bcf86cd799439600`
- **Headers:**
  - Content-Type: application/json
  - Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
- **Body:** None
- **Expected Success Response (200):**
```json
{
  "status": "success",
  "data": {
    "_id": "507f1f77bcf86cd799439600",
    "orderNumber": "ORD-2026-0001",
    "customer": {
      "_id": "507f1f77bcf86cd799439060",
      "firstName": "Mohamed",
      "lastName": "Ali",
      "email": "mohamed.ali@customer.com",
      "phone": "+20 100 123 4567"
    },
    "distributor": {
      "_id": "507f1f77bcf86cd799439050",
      "firstName": "Ahmed",
      "lastName": "Hassan",
      "email": "ahmed.hassan@distributor.com"
    },
    "warehouse": {
      "_id": "507f1f77bcf86cd799439200",
      "code": "WH-CAI-01",
      "name": "Cairo Main Distribution Center"
    },
    "status": "pending",
    "items": [
      {
        "_id": "507f1f77bcf86cd799439700",
        "productName": "Dell Latitude 5420 Laptop",
        "productSku": "LAPTOP-DEL-001",
        "quantity": 2,
        "unitPrice": 899.99,
        "totalPrice": 1799.98,
        "status": "pending"
      }
    ],
    "totalAmount": 2899.97,
    "discountAmount": 0,
    "taxAmount": 289.99,
    "finalAmount": 3189.96,
    "shippingAddress": {
      "street": "25 Tahrir Street, Apt 12",
      "city": "Cairo",
      "state": "Cairo Governorate",
      "country": "Egypt",
      "zipCode": "11511"
    },
    "notes": "Please deliver after 2 PM.",
    "statusHistory": [
      {
        "status": "pending",
        "timestamp": "2026-04-25T11:30:00.000Z",
        "note": "Order created"
      }
    ],
    "createdAt": "2026-04-25T11:30:00.000Z",
    "updatedAt": "2026-04-25T11:30:00.000Z"
  }
}
```
- **Expected Error Responses:**
  - `401` – Authentication required
  - `403` – Not authorized to view this order
  - `404` – Order not found

### Cancel Order (Customer)
- **Method:** PUT
- **URL:** `http://localhost:5000/api/orders/507f1f77bcf86cd799439600/cancel`
- **Headers:**
  - Content-Type: application/json
  - Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
- **Body (JSON):**
```json
{
  "reason": "Changed my mind, found better price elsewhere"
}
```
- **Expected Success Response (200):**
```json
{
  "status": "success",
  "message": "Order cancelled successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439600",
    "orderNumber": "ORD-2026-0001",
    "status": "cancelled",
    "cancelledBy": "507f1f77bcf86cd799439060",
    "cancellationReason": "Changed my mind, found better price elsewhere",
    "cancelledAt": "2026-04-25T12:00:00.000Z",
    "updatedAt": "2026-04-25T12:00:00.000Z"
  }
}
```
- **Expected Error Responses:**
  - `400` – Order cannot be cancelled (not in pending status)
  - `400` – Cancellation reason required
  - `401` – Authentication required
  - `403` – Not authorized to cancel this order
  - `404` – Order not found

---

## 🌱 Seeders

### Order Seeder (Test Data)
- **File:** `seeders/order.seeder.js`
- **Run command:** `node seeders/order.seeder.js`
- **Seeds:** 20 test orders across different statuses

**Example seeded orders:**
```javascript
const orders = [
  {
    orderNumber: "ORD-2026-0001",
    status: "pending",
    totalAmount: 2899.97,
    finalAmount: 3189.96,
    items: [
      { product: "LAPTOP-DEL-001", quantity: 2, unitPrice: 899.99 }
    ]
  },
  {
    orderNumber: "ORD-2026-0002",
    status: "delivered",
    totalAmount: 599.98,
    deliveredAt: new Date("2026-04-20")
  }
];
```

---

## 📦 Phase Summary

The Orders phase (Customer Side) has been completed, providing a full-featured customer order creation and management system.

### Schemas Created

1. **Order Schema** – Core order entity with status tracking, pricing, and addresses
2. **OrderItem Schema (Embedded)** – Line items with product snapshots for historical accuracy
3. **Cart Schema** – Temporary shopping cart for customers
4. **CartItem Schema (Embedded)** – Cart line items

### Endpoints Built

**Cart Management:**
- `POST /cart/items` – Add products to cart with stock validation
- `GET /cart` – View current cart with totals
- `DELETE /cart/items/:productId` – Remove specific item
- `DELETE /cart` – Clear entire cart

**Order Creation:**
- `POST /orders/check-availability` – Pre-order stock and distributor availability check
- `POST /orders` – Create order from items with auto-distributor assignment

**Order Management:**
- `GET /orders/my-orders` – Customer's order history with pagination
- `GET /orders/:id` – Detailed order view with status history
- `PUT /orders/:id/cancel` – Cancel pending orders only

### Business Logic

**Automatic Distributor Assignment:**
```javascript
// Algorithm:
1. Find warehouses serving the delivery city
2. Check stock availability at each warehouse
3. Select warehouse with sufficient stock
4. Assign warehouse's distributor to order
5. If no single warehouse has all items, reject with reason
```

**Order Status Workflow:**
```
pending → accepted → preparing → ready → in_transit → delivered
   ↓         ↓
cancelled  rejected
```

**Pricing Calculation:**
```javascript
totalAmount = sum(item.quantity × item.unitPrice)
taxAmount = totalAmount × 0.10 // 10% tax
finalAmount = totalAmount - discountAmount + taxAmount
```

**Stock Validation:**
- Check availability before order creation
- Reserved quantity updated when order accepted
- Available quantity = inventory.quantity - inventory.reserved

### Security Implementation

- Customers can only view/cancel their own orders
- Order creation restricted to customers only
- Cart endpoints validate customer role
- Cancellation only allowed for pending orders

### Testable via Postman

- [x] Add items to cart with quantity validation
- [x] View cart with calculated totals
- [x] Check stock availability before ordering
- [x] Create order with automatic distributor assignment
- [x] View list of personal orders
- [x] Get detailed order information
- [x] Cancel pending orders with reason
- [x] Attempt to cancel non-pending orders (blocked)
- [x] View other customer's orders (blocked)

### Important Architectural Decisions

- **Product Snapshots:** Order items store productName, productSku, unitPrice at time of order to preserve historical accuracy even if product changes later
- **Automatic Distributor Assignment:** Removes manual assignment bottleneck, distributor determined by warehouse location
- **Reserved Stock Pattern:** Orders don't immediately deduct stock; instead, they reserve it until accepted
- **Status Enum:** Strict status values prevent invalid transitions
- **Cancellation Restrictions:** Only pending orders can be cancelled to prevent abuse after processing begins
- **Tax Calculation:** 10% flat rate applied (configurable per jurisdiction in future)

---

## ✔️ Phase Done When:

- [x] All endpoints return correct responses
- [x] Postman tests pass for all scenarios
- [x] Orders can be created with multiple items
- [x] Automatic distributor assignment works based on location/stock
- [x] Stock availability is checked before order creation
- [x] Customers can only view their own orders
- [x] Orders can be cancelled only when status is "pending"
- [x] Order items include product snapshots (name, SKU, price at time of order)
- [x] Order status enum is enforced
- [x] Cart system works as pre-order staging area
- [x] Order numbers are auto-generated (ORD-YYYY-XXXX format)
- [x] Pricing calculations include subtotal, tax, and final amount
