# Phase 04 – Distributor Operations

## 🎯 Goals

Implement the complete distributor workflow for order fulfillment. This phase enables distributors to manage incoming orders, reserve stock, prepare shipments, and confirm deliveries.

**Key Outcomes:**
- Distributors can view and manage assigned orders
- Accept/reject order functionality with stock reservation
- Stock locking mechanism during order preparation
- Automatic stock deduction upon preparation confirmation
- Complete order fulfillment workflow

---

## ✅ Backend Tasks

- [x] Create distributor order listing endpoint
- [x] Implement accept order API with stock reservation
- [x] Implement reject order API with reason logging
- [x] Build stock locking mechanism on accept
- [x] Create prepare order API (decreases actual stock)
- [x] Implement confirm delivery API
- [x] Add order status transitions validation
- [x] Create distributor dashboard stats endpoint
- [x] Add order filtering by status for distributors
- [x] Implement batch operations (accept multiple orders)

---

## 🗂️ Database Schemas

### Order Schema (Updates)

| Field | Type | Required | Default | Notes |
|-------|------|----------|---------|-------|
| preparedBy | ObjectId | No | null | User who prepared the order |
| deliveredBy | ObjectId | No | null | Driver/delivery person |
| trackingNumber | String | No | null | Shipping tracking number |
| deliveryNotes | String | No | "" | Delivery completion notes |

### OrderStatusHistory Schema

| Field | Type | Required | Default | Notes |
|-------|------|----------|---------|-------|
| _id | ObjectId | Auto | - | MongoDB document ID |
| order | ObjectId | Yes | - | Reference to Order |
| status | String | Yes | - | New status value |
| previousStatus | String | No | null | Previous status |
| changedBy | ObjectId | Yes | - | User who made change |
| reason | String | No | "" | Reason for change |
| notes | String | No | "" | Additional notes |
| createdAt | Date | Auto | Date.now | When change occurred |

### DistributorStats (Virtual/Calculated)

| Field | Type | Notes |
|-------|------|-------|
| pendingOrders | Number | Count of pending orders |
| acceptedOrders | Number | Count of accepted orders |
| readyOrders | Number | Count ready for pickup |
| completedToday | Number | Orders delivered today |
| totalRevenue | Number | Revenue from completed orders |
| lowStockItems | Number | Products below threshold |

---

## 🔌 API Endpoints

| Method | Endpoint | Description | Permission Required |
|--------|----------|-------------|-------------------|
| GET | `/distributor/orders` | List orders for distributor | order:list |
| GET | `/distributor/orders/:id` | Get order details | order:read |
| PUT | `/distributor/orders/:id/accept` | Accept pending order | order:accept |
| PUT | `/distributor/orders/:id/reject` | Reject pending order | order:reject |
| PUT | `/distributor/orders/:id/prepare` | Mark order as prepared | order:update |
| PUT | `/distributor/orders/:id/ready` | Mark order ready for pickup | order:update |
| PUT | `/distributor/orders/:id/ship` | Mark order in transit | order:update |
| PUT | `/distributor/orders/:id/deliver` | Confirm delivery | order:update |
| PUT | `/distributor/orders/:id/deliver` | Confirm delivery | order:update |
| GET | `/distributor/dashboard` | Get distributor stats | user:read |
| POST | `/distributor/orders/batch-accept` | Accept multiple orders | order:accept |

---

## 🧪 Postman Testing Guide

### List Distributor Orders
- **Method:** GET
- **URL:** `http://localhost:5000/api/distributor/orders?page=1&limit=10&status=pending`
- **Headers:**
  - Content-Type: application/json
  - Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... (distributor token)
- **Query Parameters:**
  - `page` (optional): Page number
  - `limit` (optional): Items per page
  - `status` (optional): Filter by status
  - `dateFrom` (optional): Start date filter
  - `dateTo` (optional): End date filter
- **Expected Success Response (200):**
```json
{
  "status": "success",
  "data": [
    {
      "_id": "507f1f77bcf86cd799439600",
      "orderNumber": "ORD-2026-0001",
      "status": "pending",
      "customer": {
        "firstName": "Mohamed",
        "lastName": "Ali",
        "phone": "+20 100 123 4567"
      },
      "totalAmount": 2899.97,
      "finalAmount": 3189.96,
      "itemCount": 2,
      "shippingAddress": {
        "city": "Cairo",
        "street": "25 Tahrir Street"
      },
      "createdAt": "2026-04-25T11:30:00.000Z",
      "notes": "Please deliver after 2 PM"
    },
    {
      "_id": "507f1f77bcf86cd799439601",
      "orderNumber": "ORD-2026-0003",
      "status": "accepted",
      "customer": {
        "firstName": "Sarah",
        "lastName": "Khaled"
      },
      "totalAmount": 1599.98,
      "acceptedAt": "2026-04-25T09:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 8,
    "last_page": 1
  }
}
```
- **Expected Error Responses:**
  - `401` – Authentication required
  - `403` – Only distributors can access

### Accept Order
- **Method:** PUT
- **URL:** `http://localhost:5000/api/distributor/orders/507f1f77bcf86cd799439600/accept`
- **Headers:**
  - Content-Type: application/json
  - Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
- **Body:** None (or optional notes)
```json
{
  "notes": "Order accepted, preparing for shipment"
}
```
- **Expected Success Response (200):**
```json
{
  "status": "success",
  "message": "Order accepted successfully",
  "data": {
    "order": {
      "_id": "507f1f77bcf86cd799439600",
      "orderNumber": "ORD-2026-0001",
      "status": "accepted",
      "acceptedAt": "2026-04-25T14:00:00.000Z",
      "items": [
        {
          "product": "507f1f77bcf86cd799439100",
          "productName": "Dell Latitude 5420 Laptop",
          "quantity": 2,
          "status": "reserved"
        }
      ]
    },
    "stockReservations": [
      {
        "productId": "507f1f77bcf86cd799439100",
        "warehouseId": "507f1f77bcf86cd799439200",
        "reservedQuantity": 2,
        "availableAfter": 148
      }
    ]
  }
}
```
- **Side Effects:**
  - Order status changes to "accepted"
  - Inventory.reservedQuantity increased
  - Inventory.availableQuantity decreased
  - Order item status changes to "reserved"
  - OrderStatusHistory record created
- **Expected Error Responses:**
  - `400` – Order is not in pending status
  - `400` – Insufficient stock to fulfill
  - `401` – Authentication required
  - `403` – Not assigned to this order's warehouse
  - `404` – Order not found

### Reject Order
- **Method:** PUT
- **URL:** `http://localhost:5000/api/distributor/orders/507f1f77bcf86cd799439600/reject`
- **Headers:**
  - Content-Type: application/json
  - Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
- **Body (JSON):**
```json
{
  "reason": "Out of stock for requested items",
  "notes": "Will be back in stock next week"
}
```
- **Expected Success Response (200):**
```json
{
  "status": "success",
  "message": "Order rejected successfully",
  "data": {
    "order": {
      "_id": "507f1f77bcf86cd799439600",
      "orderNumber": "ORD-2026-0001",
      "status": "rejected",
      "rejectionReason": "Out of stock for requested items",
      "rejectedAt": "2026-04-25T14:30:00.000Z",
      "rejectedBy": "507f1f77bcf86cd799439050",
      "statusHistory": [
        {
          "status": "pending",
          "timestamp": "2026-04-25T11:30:00.000Z"
        },
        {
          "status": "rejected",
          "timestamp": "2026-04-25T14:30:00.000Z",
          "reason": "Out of stock for requested items"
        }
      ]
    }
  }
}
```
- **Expected Error Responses:**
  - `400` – Rejection reason is required
  - `400` – Order is not in pending status
  - `401` – Authentication required
  - `403` – Not authorized to reject this order
  - `404` – Order not found

### Prepare Order
- **Method:** PUT
- **URL:** `http://localhost:5000/api/distributor/orders/507f1f77bcf86cd799439600/prepare`
- **Headers:**
  - Content-Type: application/json
  - Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
- **Body (JSON):**
```json
{
  "preparedBy": "507f1f77bcf86cd799439050",
  "notes": "All items verified and packed"
}
```
- **Expected Success Response (200):**
```json
{
  "status": "success",
  "message": "Order prepared successfully",
  "data": {
    "order": {
      "_id": "507f1f77bcf86cd799439600",
      "orderNumber": "ORD-2026-0001",
      "status": "preparing",
      "preparedBy": {
        "_id": "507f1f77bcf86cd799439050",
        "firstName": "Ahmed",
        "lastName": "Hassan"
      },
      "preparedAt": "2026-04-25T15:00:00.000Z"
    },
    "stockMovements": [
      {
        "productId": "507f1f77bcf86cd799439100",
        "warehouseId": "507f1f77bcf86cd799439200",
        "quantity": -2,
        "type": "out",
        "reason": "Order preparation - ORD-2026-0001",
        "previousQuantity": 150,
        "newQuantity": 148
      }
    ]
  }
}
```
- **Side Effects:**
  - Order status changes to "preparing"
  - Actual stock deducted (Inventory.quantity decreased)
  - Reserved stock released (Inventory.reservedQuantity decreased)
  - StockMovement records created for audit
- **Expected Error Responses:**
  - `400` – Order is not in accepted status
  - `401` – Authentication required
  - `403` – Permission denied
  - `404` – Order not found

### Mark Order Ready for Pickup
- **Method:** PUT
- **URL:** `http://localhost:5000/api/distributor/orders/507f1f77bcf86cd799439600/ready`
- **Headers:**
  - Content-Type: application/json
  - Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
- **Body:** None or optional
```json
{
  "notes": "Order packed and ready for driver pickup"
}
```
- **Expected Success Response (200):**
```json
{
  "status": "success",
  "message": "Order marked as ready",
  "data": {
    "order": {
      "_id": "507f1f77bcf86cd799439600",
      "orderNumber": "ORD-2026-0001",
      "status": "ready",
      "readyAt": "2026-04-25T16:00:00.000Z"
    }
  }
}
```
- **Expected Error Responses:**
  - `400` – Order must be in preparing status
  - `401` – Authentication required

### Ship Order
- **Method:** PUT
- **URL:** `http://localhost:5000/api/distributor/orders/507f1f77bcf86cd799439600/ship`
- **Headers:**
  - Content-Type: application/json
  - Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
- **Body (JSON):**
```json
{
  "trackingNumber": "TRK-EGY-789456123",
  "deliveredBy": "507f1f77bcf86cd799439051",
  "notes": "Handed to delivery driver"
}
```
- **Expected Success Response (200):**
```json
{
  "status": "success",
  "message": "Order marked as in transit",
  "data": {
    "order": {
      "_id": "507f1f77bcf86cd799439600",
      "orderNumber": "ORD-2026-0001",
      "status": "in_transit",
      "trackingNumber": "TRK-EGY-789456123",
      "deliveredBy": {
        "_id": "507f1f77bcf86cd799439051",
        "firstName": "Omar",
        "lastName": "Ibrahim"
      },
      "shippedAt": "2026-04-26T08:00:00.000Z"
    }
  }
}
```
- **Expected Error Responses:**
  - `400` – Order must be in ready status
  - `401` – Authentication required

### Confirm Delivery
- **Method:** PUT
- **URL:** `http://localhost:5000/api/distributor/orders/507f1f77bcf86cd799439600/deliver`
- **Headers:**
  - Content-Type: application/json
  - Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
- **Body (JSON):**
```json
{
  "deliveryNotes": "Delivered to customer at 3 PM. Customer signed receipt.",
  "recipientName": "Mohamed Ali"
}
```
- **Expected Success Response (200):**
```json
{
  "status": "success",
  "message": "Order delivery confirmed",
  "data": {
    "order": {
      "_id": "507f1f77bcf86cd799439600",
      "orderNumber": "ORD-2026-0001",
      "status": "delivered",
      "deliveredAt": "2026-04-26T15:00:00.000Z",
      "deliveryNotes": "Delivered to customer at 3 PM. Customer signed receipt.",
      "statusHistory": [
        {
          "status": "pending",
          "timestamp": "2026-04-25T11:30:00.000Z"
        },
        {
          "status": "accepted",
          "timestamp": "2026-04-25T14:00:00.000Z"
        },
        {
          "status": "preparing",
          "timestamp": "2026-04-25T15:00:00.000Z"
        },
        {
          "status": "ready",
          "timestamp": "2026-04-25T16:00:00.000Z"
        },
        {
          "status": "in_transit",
          "timestamp": "2026-04-26T08:00:00.000Z"
        },
        {
          "status": "delivered",
          "timestamp": "2026-04-26T15:00:00.000Z"
        }
      ]
    }
  }
}
```
- **Expected Error Responses:**
  - `400` – Order must be in in_transit status
  - `401` – Authentication required
  - `403` – Permission denied

### Get Distributor Dashboard Stats
- **Method:** GET
- **URL:** `http://localhost:5000/api/distributor/dashboard`
- **Headers:**
  - Content-Type: application/json
  - Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
- **Body:** None
- **Expected Success Response (200):**
```json
{
  "status": "success",
  "data": {
    "orders": {
      "pending": 5,
      "accepted": 3,
      "preparing": 2,
      "ready": 1,
      "in_transit": 4,
      "deliveredToday": 8,
      "totalActive": 15
    },
    "revenue": {
      "today": 15499.50,
      "thisWeek": 87650.25,
      "thisMonth": 342180.00
    },
    "inventory": {
      "totalProducts": 156,
      "lowStockItems": 12,
      "outOfStock": 3
    },
    "recentOrders": [
      {
        "_id": "507f1f77bcf86cd799439600",
        "orderNumber": "ORD-2026-0001",
        "status": "pending",
        "customerName": "Mohamed Ali",
        "totalAmount": 2899.97,
        "createdAt": "2026-04-25T11:30:00.000Z"
      }
    ]
  }
}
```
- **Expected Error Responses:**
  - `401` – Authentication required
  - `403` – Only distributors can access

### Batch Accept Orders
- **Method:** POST
- **URL:** `http://localhost:5000/api/distributor/orders/batch-accept`
- **Headers:**
  - Content-Type: application/json
  - Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
- **Body (JSON):**
```json
{
  "orderIds": [
    "507f1f77bcf86cd799439600",
    "507f1f77bcf86cd799439602",
    "507f1f77bcf86cd799439603"
  ],
  "notes": "Bulk acceptance"
}
```
- **Expected Success Response (200):**
```json
{
  "status": "success",
  "message": "Batch operation completed",
  "data": {
    "success": [
      {
        "orderId": "507f1f77bcf86cd799439600",
        "orderNumber": "ORD-2026-0001",
        "newStatus": "accepted"
      },
      {
        "orderId": "507f1f77bcf86cd799439602",
        "orderNumber": "ORD-2026-0004",
        "newStatus": "accepted"
      }
    ],
    "failed": [
      {
        "orderId": "507f1f77bcf86cd799439603",
        "orderNumber": "ORD-2026-0005",
        "reason": "Insufficient stock"
      }
    ],
    "summary": {
      "total": 3,
      "accepted": 2,
      "failed": 1
    }
  }
}
```
- **Expected Error Responses:**
  - `400` – Invalid order IDs provided
  - `401` – Authentication required
  - `403` – Permission denied

---

## 🌱 Seeders

### OrderStatusHistory Seeder
- **File:** `seeders/orderStatusHistory.seeder.js`
- **Run command:** `node seeders/orderStatusHistory.seeder.js`
- **Seeds:** Status history records for test orders

**Example:**
```javascript
const statusHistories = [
  {
    order: "507f1f77bcf86cd799439600",
    status: "pending",
    previousStatus: null,
    changedBy: "507f1f77bcf86cd799439060",
    reason: "Order created"
  },
  {
    order: "507f1f77bcf86cd799439600",
    status: "accepted",
    previousStatus: "pending",
    changedBy: "507f1f77bcf86cd799439050",
    reason: "Stock available"
  }
];
```

---

## 📦 Phase Summary

The Distributor Operations phase has been completed, providing a comprehensive workflow for order fulfillment from acceptance through delivery.

### Schemas Created/Updated

1. **Order Schema (Extended)** – Added tracking, delivery, and preparation fields
2. **OrderStatusHistory Schema** – Complete audit trail of all status changes
3. **DistributorStats (Virtual)** – Calculated metrics for dashboard

### Endpoints Built

**Order Management:**
- `GET /distributor/orders` – List assigned orders with status filtering
- `GET /distributor/orders/:id` – Detailed order view for fulfillment
- `PUT /distributor/orders/:id/accept` – Accept with stock reservation
- `PUT /distributor/orders/:id/reject` – Reject with reason
- `PUT /distributor/orders/:id/prepare` – Decrease stock, release reservation
- `PUT /distributor/orders/:id/ready` – Mark packed and ready
- `PUT /distributor/orders/:id/ship` – Assign tracking, mark in-transit
- `PUT /distributor/orders/:id/deliver` – Confirm delivery completion

**Batch Operations:**
- `POST /distributor/orders/batch-accept` – Accept multiple orders at once

**Dashboard:**
- `GET /distributor/dashboard` – Real-time stats and metrics

### Business Logic

**Status Transition Rules:**
```javascript
const validTransitions = {
  pending: ['accepted', 'rejected', 'cancelled'],
  accepted: ['preparing', 'cancelled'],
  preparing: ['ready', 'cancelled'],
  ready: ['in_transit'],
  in_transit: ['delivered'],
  delivered: [], // Terminal state
  rejected: [], // Terminal state
  cancelled: [] // Terminal state
};
```

**Stock Flow:**
1. **Order Created:** No stock change (just reservation check)
2. **Order Accepted:** Reserve stock (reserved↑, available↓)
3. **Order Prepared:** Deduct stock (quantity↓, reserved↓)
4. **Order Cancelled (before prepare):** Release reservation (reserved↓, available↑)
5. **Order Rejected:** Release reservation

**Revenue Calculations:**
```javascript
todayRevenue = sum(orders.deliveredAt === today).finalAmount
weeklyRevenue = sum(orders.deliveredAt within this week).finalAmount
monthlyRevenue = sum(orders.deliveredAt within this month).finalAmount
```

### Security Implementation

- Distributors can only access orders assigned to their warehouse
- Status transitions validated server-side
- Stock operations use atomic database transactions
- Batch operations return detailed success/failure lists

### Testable via Postman

- [x] View list of assigned orders with filtering
- [x] Accept order with stock reservation
- [x] Reject order with required reason
- [x] Attempt invalid status transitions (blocked)
- [x] Prepare order (actual stock deduction)
- [x] Mark order ready, ship, and deliver
- [x] View dashboard with stats
- [x] Batch accept multiple orders
- [x] Verify stock quantities update correctly through workflow
- [x] View order status history

### Important Architectural Decisions

- **Stock Reservation Pattern:** Stock reserved on accept, deducted on prepare
- **Status History Tracking:** Every change logged with who, when, and why
- **Terminal States:** delivered, rejected, cancelled are final (no transitions out)
- **Atomic Stock Operations:** Uses MongoDB transactions for consistency
- **Validation at Each Step:** Status transitions strictly enforced
- **Cascading Permissions:** Distributor inherits permissions from their role + warehouse assignment
- **Batch Operations:** Partial success allowed (some orders may fail in batch)

---

## ✔️ Phase Done When:

- [x] All endpoints return correct responses
- [x] Postman tests pass for all scenarios
- [x] Distributors can view orders assigned to their warehouse
- [x] Accept order reserves stock (increases reservedQuantity)
- [x] Reject order requires a reason
- [x] Prepare order decreases actual stock quantity
- [x] Status transitions are validated (can't skip steps)
- [x] Order status history is tracked
- [x] Dashboard shows real-time stats
- [x] Batch accept works with partial success handling
- [x] Stock movements are logged for audit
