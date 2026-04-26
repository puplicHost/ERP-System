# Phase 05 – Invoices & Payments

## 🎯 Goals

Implement the complete billing and payment system. This phase enables invoice generation from orders, payment tracking, partial payment support, and order completion workflow based on payment status.

**Key Outcomes:**
- Automatic invoice generation from delivered orders
- Payment recording and tracking
- Partial payment support
- Payment status workflow (pending → partial → paid)
- Overpayment and underpayment handling
- Order completion upon full payment

---

## ✅ Backend Tasks

- [x] Create Invoice schema with line items and totals
- [x] Create Payment schema with multiple payment methods
- [x] Implement invoice generation from order API
- [x] Create payment recording API
- [x] Implement partial payment support
- [x] Add payment status calculation
- [x] Create invoice listing endpoints (customer and admin views)
- [x] Implement payment history endpoint
- [x] Add payment method management
- [x] Create order completion trigger on full payment
- [x] Add payment reminders/overdue tracking
- [x] Implement invoice PDF generation (placeholder)

---

## 🗂️ Database Schemas

### Invoice Schema

| Field | Type | Required | Default | Notes |
|-------|------|----------|---------|-------|
| _id | ObjectId | Auto | - | MongoDB document ID |
| invoiceNumber | String | Yes | - | Unique (e.g., "INV-2026-0001") |
| order | ObjectId | Yes | - | Reference to Order |
| customer | ObjectId | Yes | - | Reference to User |
| distributor | ObjectId | Yes | - | Reference to User |
| status | String | Yes | "pending" | Enum: pending, partial, paid, overdue, cancelled, refunded |
| issueDate | Date | Yes | Date.now | Invoice creation date |
| dueDate | Date | Yes | - | Payment deadline |
| items | [InvoiceItem] | Yes | [] | Line items from order |
| subtotal | Number | Yes | 0 | Before tax/discount |
| taxAmount | Number | Yes | 0 | Calculated tax |
| discountAmount | Number | No | 0 | Applied discount |
| totalAmount | Number | Yes | 0 | Final amount due |
| paidAmount | Number | No | 0 | Total payments received |
| balanceDue | Number | No | 0 | totalAmount - paidAmount |
| payments | [ObjectId] | No | [] | References to Payment records |
| notes | String | No | "" | Terms and conditions |
| terms | String | No | "Net 30" | Payment terms |
| isOverdue | Boolean | No | false | Calculated flag |
| createdAt | Date | Auto | Date.now | Creation timestamp |
| updatedAt | Date | Auto | Date.now | Update timestamp |

### InvoiceItem Schema (Embedded)

| Field | Type | Required | Default | Notes |
|-------|------|----------|---------|-------|
| product | ObjectId | Yes | - | Reference to Product |
| productName | String | Yes | - | Snapshot of name |
| productSku | String | Yes | - | Snapshot of SKU |
| quantity | Number | Yes | 0 | Quantity |
| unitPrice | Number | Yes | 0 | Price at invoice |
| totalPrice | Number | Yes | 0 | quantity × unitPrice |

### Payment Schema

| Field | Type | Required | Default | Notes |
|-------|------|----------|---------|-------|
| _id | ObjectId | Auto | - | MongoDB document ID |
| paymentNumber | String | Yes | - | Unique (e.g., "PAY-2026-0001") |
| invoice | ObjectId | Yes | - | Reference to Invoice |
| order | ObjectId | Yes | - | Reference to Order |
| customer | ObjectId | Yes | - | Reference to User |
| amount | Number | Yes | 0 | Payment amount |
| method | String | Yes | - | Enum: cash, credit_card, bank_transfer, cheque, digital_wallet |
| status | String | Yes | "completed" | Enum: pending, completed, failed, refunded |
| reference | String | No | null | Transaction reference |
| receivedBy | ObjectId | No | null | User who recorded payment |
| processedAt | Date | No | Date.now | When payment was processed |
| notes | String | No | "" | Payment notes |
| metadata | Object | No | {} | Additional payment data |
| createdAt | Date | Auto | Date.now | Creation timestamp |

### PaymentMethod Schema (Customer Preferences)

| Field | Type | Required | Default | Notes |
|-------|------|----------|---------|-------|
| _id | ObjectId | Auto | - | MongoDB document ID |
| customer | ObjectId | Yes | - | Reference to User |
| type | String | Yes | - | Enum: credit_card, bank_account |
| isDefault | Boolean | No | false | Default payment method |
| lastFour | String | No | null | Last 4 digits (masked) |
| expiryMonth | Number | No | null | Card expiry month |
| expiryYear | Number | No | null | Card expiry year |
| bankName | String | No | null | For bank transfers |
| accountNumber | String | No | null | Masked account number |
| isActive | Boolean | No | true | Payment method status |
| createdAt | Date | Auto | Date.now | Creation timestamp |

---

## 🔌 API Endpoints

| Method | Endpoint | Description | Permission Required |
|--------|----------|-------------|-------------------|
| POST | `/invoices/generate` | Create invoice from delivered order | invoice:create |
| GET | `/invoices` | List all invoices (admin) | invoice:list |
| GET | `/invoices/my-invoices` | List customer's invoices | invoice:list_own |
| GET | `/invoices/:id` | Get invoice details | invoice:read |
| PUT | `/invoices/:id/cancel` | Cancel invoice | invoice:cancel |
| POST | `/payments` | Record payment for invoice | payment:create |
| GET | `/payments` | List all payments (admin) | payment:list |
| GET | `/payments/my-payments` | List customer's payments | payment:list_own |
| GET | `/payments/:id` | Get payment details | payment:read |
| POST | `/payments/:id/refund` | Refund a payment | payment:refund |
| GET | `/invoices/:id/payments` | Get payment history for invoice | invoice:read |
| POST | `/payment-methods` | Add payment method | payment_method:create |
| GET | `/payment-methods` | List customer's payment methods | payment_method:list |
| DELETE | `/payment-methods/:id` | Remove payment method | payment_method:delete |

---

## 🧪 Postman Testing Guide

### Generate Invoice from Order
- **Method:** POST
- **URL:** `http://localhost:5000/api/invoices/generate`
- **Headers:**
  - Content-Type: application/json
  - Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... (distributor/admin token)
- **Body (JSON):**
```json
{
  "orderId": "507f1f77bcf86cd799439600",
  "dueDate": "2026-05-26",
  "notes": "Payment due within 30 days. Late fees apply after due date.",
  "terms": "Net 30"
}
```
- **Expected Success Response (201):**
```json
{
  "status": "success",
  "message": "Invoice generated successfully",
  "data": {
    "invoice": {
      "_id": "507f1f77bcf86cd799439800",
      "invoiceNumber": "INV-2026-0001",
      "order": {
        "_id": "507f1f77bcf86cd799439600",
        "orderNumber": "ORD-2026-0001"
      },
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
      "status": "pending",
      "issueDate": "2026-04-26T10:00:00.000Z",
      "dueDate": "2026-05-26T23:59:59.000Z",
      "items": [
        {
          "product": "507f1f77bcf86cd799439100",
          "productName": "Dell Latitude 5420 Laptop",
          "productSku": "LAPTOP-DEL-001",
          "quantity": 2,
          "unitPrice": 899.99,
          "totalPrice": 1799.98
        },
        {
          "product": "507f1f77bcf86cd799439101",
          "productName": "iPhone 15 Pro",
          "productSku": "PHONE-IPH-001",
          "quantity": 1,
          "unitPrice": 1099.99,
          "totalPrice": 1099.99
        }
      ],
      "subtotal": 2899.97,
      "taxAmount": 289.99,
      "discountAmount": 0,
      "totalAmount": 3189.96,
      "paidAmount": 0,
      "balanceDue": 3189.96,
      "notes": "Payment due within 30 days. Late fees apply after due date.",
      "terms": "Net 30",
      "isOverdue": false
    }
  }
}
```
- **Expected Error Responses:**
  - `400` – Order not in delivered status
  - `400` – Invoice already exists for this order
  - `400` – Invalid due date
  - `401` – Authentication required
  - `403` – Permission denied
  - `404` – Order not found

### List Customer Invoices
- **Method:** GET
- **URL:** `http://localhost:5000/api/invoices/my-invoices?page=1&limit=10&status=pending`
- **Headers:**
  - Content-Type: application/json
  - Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... (customer token)
- **Query Parameters:**
  - `page` (optional): Page number
  - `limit` (optional): Items per page
  - `status` (optional): Filter by status
  - `isOverdue` (optional): Filter overdue invoices
- **Expected Success Response (200):**
```json
{
  "status": "success",
  "data": [
    {
      "_id": "507f1f77bcf86cd799439800",
      "invoiceNumber": "INV-2026-0001",
      "orderNumber": "ORD-2026-0001",
      "status": "partial",
      "issueDate": "2026-04-26T10:00:00.000Z",
      "dueDate": "2026-05-26T23:59:59.000Z",
      "totalAmount": 3189.96,
      "paidAmount": 1500.00,
      "balanceDue": 1689.96,
      "isOverdue": false,
      "itemCount": 2
    },
    {
      "_id": "507f1f77bcf86cd799439801",
      "invoiceNumber": "INV-2026-0002",
      "orderNumber": "ORD-2026-0002",
      "status": "pending",
      "issueDate": "2026-04-25T14:00:00.000Z",
      "dueDate": "2026-05-25T23:59:59.000Z",
      "totalAmount": 599.98,
      "paidAmount": 0,
      "balanceDue": 599.98,
      "isOverdue": true
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

### Get Invoice Details
- **Method:** GET
- **URL:** `http://localhost:5000/api/invoices/507f1f77bcf86cd799439800`
- **Headers:**
  - Content-Type: application/json
  - Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
- **Body:** None
- **Expected Success Response (200):**
```json
{
  "status": "success",
  "data": {
    "_id": "507f1f77bcf86cd799439800",
    "invoiceNumber": "INV-2026-0001",
    "order": {
      "_id": "507f1f77bcf86cd799439600",
      "orderNumber": "ORD-2026-0001",
      "deliveredAt": "2026-04-26T15:00:00.000Z"
    },
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
    "status": "partial",
    "issueDate": "2026-04-26T10:00:00.000Z",
    "dueDate": "2026-05-26T23:59:59.000Z",
    "items": [
      {
        "product": "507f1f77bcf86cd799439100",
        "productName": "Dell Latitude 5420 Laptop",
        "productSku": "LAPTOP-DEL-001",
        "quantity": 2,
        "unitPrice": 899.99,
        "totalPrice": 1799.98
      },
      {
        "product": "507f1f77bcf86cd799439101",
        "productName": "iPhone 15 Pro",
        "productSku": "PHONE-IPH-001",
        "quantity": 1,
        "unitPrice": 1099.99,
        "totalPrice": 1099.99
      }
    ],
    "subtotal": 2899.97,
    "taxAmount": 289.99,
    "discountAmount": 0,
    "totalAmount": 3189.96,
    "paidAmount": 1500.00,
    "balanceDue": 1689.96,
    "payments": [
      {
        "_id": "507f1f77bcf86cd799439900",
        "paymentNumber": "PAY-2026-0001",
        "amount": 1500.00,
        "method": "credit_card",
        "status": "completed",
        "processedAt": "2026-04-27T10:30:00.000Z"
      }
    ],
    "notes": "Payment due within 30 days. Late fees apply after due date.",
    "terms": "Net 30",
    "isOverdue": false,
    "daysUntilDue": 29
  }
}
```
- **Expected Error Responses:**
  - `401` – Authentication required
  - `403` – Not authorized to view this invoice
  - `404` – Invoice not found

### Record Payment
- **Method:** POST
- **URL:** `http://localhost:5000/api/payments`
- **Headers:**
  - Content-Type: application/json
  - Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... (distributor/admin token)
- **Body (JSON):**
```json
{
  "invoiceId": "507f1f77bcf86cd799439800",
  "amount": 1689.96,
  "method": "credit_card",
  "reference": "TXN-987654321",
  "notes": "Final payment - balance cleared"
}
```
- **Expected Success Response (201):**
```json
{
  "status": "success",
  "message": "Payment recorded successfully",
  "data": {
    "payment": {
      "_id": "507f1f77bcf86cd799439901",
      "paymentNumber": "PAY-2026-0002",
      "invoice": "507f1f77bcf86cd799439800",
      "order": "507f1f77bcf86cd799439600",
      "customer": "507f1f77bcf86cd799439060",
      "amount": 1689.96,
      "method": "credit_card",
      "status": "completed",
      "reference": "TXN-987654321",
      "receivedBy": "507f1f77bcf86cd799439050",
      "processedAt": "2026-04-28T14:00:00.000Z",
      "notes": "Final payment - balance cleared"
    },
    "invoice": {
      "_id": "507f1f77bcf86cd799439800",
      "status": "paid",
      "paidAmount": 3189.96,
      "balanceDue": 0,
      "isPaidInFull": true
    },
    "order": {
      "_id": "507f1f77bcf86cd799439600",
      "isCompleted": true,
      "completedAt": "2026-04-28T14:00:00.000Z"
    }
  }
}
```
- **Expected Error Responses:**
  - `400` – Payment amount exceeds balance due
  - `400` – Invoice is already paid or cancelled
  - `400` – Invalid payment method
  - `401` – Authentication required
  - `403` – Permission denied
  - `404` – Invoice not found

### Record Partial Payment
- **Method:** POST
- **URL:** `http://localhost:5000/api/payments`
- **Headers:**
  - Content-Type: application/json
  - Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
- **Body (JSON):**
```json
{
  "invoiceId": "507f1f77bcf86cd799439800",
  "amount": 1000.00,
  "method": "cash",
  "notes": "Partial payment - customer will pay remainder next week"
}
```
- **Expected Success Response (201):**
```json
{
  "status": "success",
  "message": "Partial payment recorded",
  "data": {
    "payment": {
      "_id": "507f1f77bcf86cd799439902",
      "paymentNumber": "PAY-2026-0003",
      "amount": 1000.00,
      "method": "cash",
      "status": "completed"
    },
    "invoice": {
      "_id": "507f1f77bcf86cd799439800",
      "status": "partial",
      "paidAmount": 1000.00,
      "balanceDue": 2189.96,
      "paymentProgress": 31.3
    }
  }
}
```
- **Expected Error Responses:**
  - `400` – Payment amount must be positive
  - `400` – Payment amount exceeds balance

### Get Payment History for Invoice
- **Method:** GET
- **URL:** `http://localhost:5000/api/invoices/507f1f77bcf86cd799439800/payments`
- **Headers:**
  - Content-Type: application/json
  - Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
- **Body:** None
- **Expected Success Response (200):**
```json
{
  "status": "success",
  "data": [
    {
      "_id": "507f1f77bcf86cd799439900",
      "paymentNumber": "PAY-2026-0001",
      "amount": 1500.00,
      "method": "credit_card",
      "status": "completed",
      "reference": "TXN-123456789",
      "receivedBy": {
        "firstName": "Ahmed",
        "lastName": "Hassan"
      },
      "processedAt": "2026-04-27T10:30:00.000Z",
      "notes": "First installment"
    },
    {
      "_id": "507f1f77bcf86cd799439901",
      "paymentNumber": "PAY-2026-0002",
      "amount": 1689.96,
      "method": "credit_card",
      "status": "completed",
      "reference": "TXN-987654321",
      "processedAt": "2026-04-28T14:00:00.000Z",
      "notes": "Final payment - balance cleared"
    }
  ],
  "summary": {
    "totalPayments": 2,
    "totalPaid": 3189.96,
    "paymentMethods": {
      "credit_card": 3189.96
    }
  }
}
```
- **Expected Error Responses:**
  - `401` – Authentication required
  - `403` – Not authorized to view these payments

### Process Refund
- **Method:** POST
- **URL:** `http://localhost:5000/api/payments/507f1f77bcf86cd799439900/refund`
- **Headers:**
  - Content-Type: application/json
  - Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... (admin token)
- **Body (JSON):**
```json
{
  "amount": 1500.00,
  "reason": "Customer returned damaged item",
  "refundMethod": "credit_card"
}
```
- **Expected Success Response (200):**
```json
{
  "status": "success",
  "message": "Refund processed successfully",
  "data": {
    "originalPayment": {
      "_id": "507f1f77bcf86cd799439900",
      "paymentNumber": "PAY-2026-0001",
      "status": "refunded",
      "refundedAmount": 1500.00,
      "refundedAt": "2026-04-29T10:00:00.000Z"
    },
    "refundPayment": {
      "_id": "507f1f77bcf86cd799439903",
      "paymentNumber": "PAY-2026-0004",
      "amount": -1500.00,
      "method": "credit_card",
      "status": "completed",
      "notes": "Refund: Customer returned damaged item"
    },
    "invoice": {
      "_id": "507f1f77bcf86cd799439800",
      "status": "partial",
      "paidAmount": 1689.96,
      "balanceDue": 1500.00
    }
  }
}
```
- **Expected Error Responses:**
  - `400` – Refund amount exceeds original payment
  - `400` – Payment is not in completed status
  - `401` – Authentication required
  - `403` – Only admins can process refunds
  - `404` – Payment not found

---

## 🌱 Seeders

### Invoice Seeder
- **File:** `seeders/invoice.seeder.js`
- **Run command:** `node seeders/invoice.seeder.js`
- **Seeds:** 15 invoices across different statuses

**Example seeded invoices:**
```javascript
const invoices = [
  {
    invoiceNumber: "INV-2026-0001",
    status: "paid",
    totalAmount: 3189.96,
    paidAmount: 3189.96,
    dueDate: new Date("2026-05-26")
  },
  {
    invoiceNumber: "INV-2026-0002",
    status: "partial",
    totalAmount: 599.98,
    paidAmount: 200.00,
    dueDate: new Date("2026-05-25")
  },
  {
    invoiceNumber: "INV-2026-0003",
    status: "overdue",
    totalAmount: 1299.99,
    paidAmount: 0,
    dueDate: new Date("2026-04-01") // Past due
  }
];
```

### Payment Seeder
- **File:** `seeders/payment.seeder.js`
- **Run command:** `node seeders/payment.seeder.js`
- **Seeds:** 25 payment records across all methods

---

## 📦 Phase Summary

The Invoices & Payments phase has been completed, establishing a comprehensive billing system with full payment tracking and partial payment support.

### Schemas Created

1. **Invoice Schema** – Complete billing document with itemization
2. **InvoiceItem Schema (Embedded)** – Line items with price snapshots
3. **Payment Schema** – Payment records with method tracking
4. **PaymentMethod Schema** – Customer payment preferences

### Endpoints Built

**Invoice Management:**
- `POST /invoices/generate` – Create invoice from delivered orders only
- `GET /invoices` – Admin view of all invoices
- `GET /invoices/my-invoices` – Customer's invoice list with status filter
- `GET /invoices/:id` – Detailed invoice with payment history
- `PUT /invoices/:id/cancel` – Cancel unpaid invoices
- `GET /invoices/:id/payments` – Payment history for invoice

**Payment Processing:**
- `POST /payments` – Record payments (full or partial)
- `GET /payments` – Admin payment listing
- `GET /payments/my-payments` – Customer's payment history
- `GET /payments/:id` – Payment details
- `POST /payments/:id/refund` – Process refunds (admin only)

**Payment Methods:**
- `POST /payment-methods` – Add customer payment method
- `GET /payment-methods` – List customer's methods
- `DELETE /payment-methods/:id` – Remove payment method

### Business Logic

**Invoice Status Calculation:**
```javascript
if (paidAmount === 0) status = "pending";
else if (paidAmount < totalAmount) status = "partial";
else if (paidAmount === totalAmount) status = "paid";
else if (paidAmount > totalAmount) status = "overpaid";

if (dueDate < now && status !== "paid") isOverdue = true;
```

**Order Completion Trigger:**
```javascript
if (invoice.status === "paid") {
  order.isCompleted = true;
  order.completedAt = new Date();
}
```

**Refund Logic:**
```javascript
// Refund payment has negative amount
refundPayment.amount = -refundAmount;
originalPayment.refundedAmount += refundAmount;
originalPayment.status = "refunded";

// Recalculate invoice
invoice.paidAmount -= refundAmount;
invoice.status = calculateStatus(invoice.paidAmount, invoice.totalAmount);
```

### Security Implementation

- Customers can only view their own invoices and payments
- Invoice generation restricted to delivered orders only
- Refunds require admin permission
- Payment recording restricted to distributor/admin roles
- Overpayment prevention validated server-side

### Testable via Postman

- [x] Generate invoice from delivered order
- [x] Attempt invoice from undelivered order (blocked)
- [x] Record full payment (marks order complete)
- [x] Record partial payment (invoice stays partial)
- [x] View invoice with payment history
- [x] List invoices with status and overdue filters
- [x] Process refund (negative payment created)
- [x] Cancel unpaid invoice
- [x] Verify overpayment is prevented
- [x] Check order completion triggered on full payment

### Important Architectural Decisions

- **Invoice from Delivered Orders Only:** Prevents billing for unfulfilled orders
- **Price Snapshots:** Invoice items store unitPrice at generation time
- **Negative Payment for Refunds:** Refunds recorded as negative amounts for clean accounting
- **Payment Status Auto-Calculation:** Invoice status derived from payment totals
- **Payment Number Sequencing:** Unique payment numbers for audit trail
- **Due Date Tracking:** Automatic overdue detection based on dueDate
- **Order Completion Link:** Order marked complete when invoice fully paid

---

## ✔️ Phase Done When:

- [x] All endpoints return correct responses
- [x] Postman tests pass for all scenarios
- [x] Invoices can be generated from delivered orders only
- [x] Invoice contains itemized line items with price snapshots
- [x] Full payment marks invoice as "paid" and order as "completed"
- [x] Partial payments update invoice status to "partial"
- [x] Payment history accessible per invoice
- [x] Refunds create negative payment records
- [x] Overdue detection works based on dueDate
- [x] Customers can only view their own invoices
- [x] Payment methods can be saved per customer
- [x] Invoice status updates automatically on payment
