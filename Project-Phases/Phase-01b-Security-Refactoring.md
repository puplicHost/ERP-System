# Phase 01b – Security Refactoring & Enhancement

## 🎯 Goals

Harden the authentication system and establish production-ready security standards. This phase transforms the basic auth system into an enterprise-grade security layer with refresh tokens, rate limiting, and permission-based authorization.

**Key Outcomes:**
- Short-lived access tokens (15 minutes) with automatic refresh
- Secure refresh token storage (HttpOnly cookies)
- Rate limiting on authentication endpoints
- Centralized error handling and response formatting
- Complete migration to permission-based authorization
- Pagination utilities for all list endpoints
- User data endpoint with populated roles and permissions

---

## ✅ Backend Tasks

### 1. Improve Authentication System (HIGH PRIORITY)
- [x] Reduce access token lifetime to 15 minutes
- [x] Implement refresh token system (7-day expiry)
- [x] Store refresh tokens in HttpOnly cookies
- [x] Create POST `/auth/refresh` endpoint
- [x] Create POST `/auth/logout` endpoint (invalidate refresh token)
- [x] Create RefreshToken schema for token management

### 2. Security Enhancements
- [x] Hash refresh tokens before database storage
- [x] Add rate limiting on login endpoint (5 attempts per 15 minutes)
- [x] Create centralized error handling middleware
- [x] Create centralized response format utility
- [x] Create permission seeder scripts
- [x] Create role seeder scripts with permission assignments

### 3. Convert Authorization to Permission-Based
- [x] Modify Role schema to include permissions array
- [x] Add permissions to JWT payload
- [x] Create `authorize(permission)` middleware
- [x] Replace all role checks with permission checks in routes

### 4. Create Roles List API (With Pagination)
- [x] GET `/roles` with pagination support
- [x] Query params: `page` (default: 1), `limit` (default: 10)
- [x] Return: `data`, `pagination: { page, limit, total, last_page }`

### 5. Apply Pagination to All List Endpoints
- [x] Add pagination to GET `/permissions`
- [x] Create reusable pagination utility function
- [x] Standardize pagination response format

### 6. Create User Data Endpoint
- [x] GET `/userdata` – Returns authenticated user's data
- [x] Extract token from Authorization header
- [x] Decode token and get user ID
- [x] Populate role with permissions
- [x] Return structured user response

### 7. Update User Model
- [x] Add `gender` field (enum: male, female)
- [x] Add `isActive` field (Boolean, default: true)
- [x] Prevent login if `isActive = false`

---

## 🗂️ Database Schemas

### RefreshToken Schema

| Field | Type | Required | Default | Notes |
|-------|------|----------|---------|-------|
| _id | ObjectId | Auto | - | MongoDB document ID |
| token | String | Yes | - | Hashed refresh token |
| user | ObjectId | Yes | - | Reference to User |
| expiresAt | Date | Yes | - | Token expiration (7 days) |
| createdAt | Date | Auto | Date.now | Token creation |
| isRevoked | Boolean | No | false | Manual revocation flag |

### Updated User Schema

| Field | Type | Required | Default | Notes |
|-------|------|----------|---------|-------|
| _id | ObjectId | Auto | - | MongoDB document ID |
| email | String | Yes | - | Unique email |
| password | String | Yes | - | Hashed password |
| firstName | String | Yes | - | First name |
| lastName | String | Yes | - | Last name |
| phone | String | No | null | Contact number |
| role | ObjectId | Yes | - | Reference to Role |
| gender | String | No | null | Enum: male, female |
| isActive | Boolean | No | true | Account status |
| lastLogin | Date | No | null | Last login timestamp |
| createdAt | Date | Auto | Date.now | Creation timestamp |
| updatedAt | Date | Auto | Date.now | Update timestamp |

### Role Schema (Updated)

| Field | Type | Required | Default | Notes |
|-------|------|----------|---------|-------|
| _id | ObjectId | Auto | - | MongoDB document ID |
| name | String | Yes | - | Display name |
| code | String | Yes | - | Unique code |
| description | String | No | "" | Role description |
| permissions | [ObjectId] | Yes | [] | Permission references |
| isDefault | Boolean | No | false | Auto-assign to new users |
| level | Number | No | 0 | Role hierarchy |

---

## 🔌 API Endpoints

| Method | Endpoint | Description | Permission Required |
|--------|----------|-------------|-------------------|
| POST | `/auth/refresh` | Get new access token using refresh token | None (requires valid refresh cookie) |
| POST | `/auth/logout` | Invalidate refresh token and logout | None (requires valid token) |
| GET | `/userdata` | Get current user's data with role & permissions | None (requires valid token) |
| GET | `/roles` | List all roles (paginated) | role:read |
| GET | `/permissions` | List all permissions (paginated) | permission:read |

---

## 🧪 Postman Testing Guide

### Refresh Token
- **Method:** POST
- **URL:** `http://localhost:5000/api/auth/refresh`
- **Headers:**
  - Content-Type: application/json
  - Cookie: refreshToken=<http_only_cookie_value>
- **Body:** None (token is in cookie)
- **Expected Success Response (200):**
```json
{
  "status": "success",
  "message": "Token refreshed successfully",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": 900
  }
}
```
- **Expected Error Responses:**
  - `401` – No refresh token provided
  - `401` – Refresh token expired
  - `401` – Refresh token revoked or invalid
  - `401` – User not found or deactivated

### Logout
- **Method:** POST
- **URL:** `http://localhost:5000/api/auth/logout`
- **Headers:**
  - Content-Type: application/json
  - Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
  - Cookie: refreshToken=<http_only_cookie_value>
- **Body:** None
- **Expected Success Response (200):**
```json
{
  "status": "success",
  "message": "Logged out successfully"
}
```
- **Cookie Response Headers:**
  - `Set-Cookie: refreshToken=; HttpOnly; Secure; SameSite=Strict; Max-Age=0`
- **Expected Error Responses:**
  - `401` – No authentication provided
  - `500` – Database error during token invalidation

### Get User Data
- **Method:** GET
- **URL:** `http://localhost:5000/api/userdata`
- **Headers:**
  - Content-Type: application/json
  - Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
- **Body:** None
- **Expected Success Response (200):**
```json
{
  "status": "success",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "email": "admin@erp-system.com",
    "firstName": "System",
    "lastName": "Administrator",
    "phone": "+20 123 456 7890",
    "gender": "male",
    "isActive": true,
    "role": {
      "_id": "507f1f77bcf86cd799439020",
      "name": "SuperAdmin",
      "code": "superadmin",
      "level": 0,
      "permissions": [
        {
          "_id": "507f1f77bcf86cd799439030",
          "name": "Create Users",
          "code": "user:create"
        },
        {
          "_id": "507f1f77bcf86cd799439031",
          "name": "Read Users",
          "code": "user:read"
        },
        {
          "_id": "507f1f77bcf86cd799439032",
          "name": "Update Users",
          "code": "user:update"
        }
      ]
    },
    "lastLogin": "2026-04-25T14:30:00.000Z",
    "createdAt": "2026-04-01T10:00:00.000Z"
  }
}
```
- **Expected Error Responses:**
  - `401` – No token provided
  - `401` – Token expired
  - `401` – Invalid token
  - `404` – User not found (deleted after token issued)

### List Roles (Paginated)
- **Method:** GET
- **URL:** `http://localhost:5000/api/roles?page=1&limit=5`
- **Headers:**
  - Content-Type: application/json
  - Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
- **Query Parameters:**
  - `page` (optional): Page number, default: 1
  - `limit` (optional): Items per page, default: 10, max: 50
- **Expected Success Response (200):**
```json
{
  "status": "success",
  "data": [
    {
      "_id": "507f1f77bcf86cd799439020",
      "name": "SuperAdmin",
      "code": "superadmin",
      "description": "Full system access",
      "level": 0
    },
    {
      "_id": "507f1f77bcf86cd799439021",
      "name": "Distributor",
      "code": "distributor",
      "description": "Warehouse and order management",
      "level": 1
    },
    {
      "_id": "507f1f77bcf86cd799439022",
      "name": "Customer",
      "code": "customer",
      "description": "Product browsing and ordering",
      "level": 2
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 5,
    "total": 3,
    "last_page": 1
  }
}
```
- **Expected Error Responses:**
  - `400` – Invalid page or limit values
  - `401` – Authentication required
  - `403` – Insufficient permissions (role:read required)

### List Permissions (Paginated)
- **Method:** GET
- **URL:** `http://localhost:5000/api/permissions?page=1&limit=10`
- **Headers:**
  - Content-Type: application/json
  - Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
- **Query Parameters:**
  - `page` (optional): Page number, default: 1
  - `limit` (optional): Items per page, default: 10, max: 50
- **Expected Success Response (200):**
```json
{
  "status": "success",
  "data": [
    {
      "_id": "507f1f77bcf86cd799439030",
      "name": "Create Users",
      "code": "user:create",
      "resource": "user",
      "action": "create"
    },
    {
      "_id": "507f1f77bcf86cd799439031",
      "name": "Read Users",
      "code": "user:read",
      "resource": "user",
      "action": "read"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 20,
    "last_page": 2
  }
}
```
- **Expected Error Responses:**
  - `400` – Invalid pagination parameters
  - `401` – Authentication required
  - `403` – Insufficient permissions (permission:read required)

### Rate Limiting Test (Login)
- **Method:** POST
- **URL:** `http://localhost:5000/api/auth/login`
- **Headers:**
  - Content-Type: application/json
- **Body (JSON):**
```json
{
  "email": "admin@erp-system.com",
  "password": "WrongPassword123"
}
```
- **Expected Error Response (429) after 5 attempts:**
```json
{
  "status": "error",
  "message": "Too many login attempts. Please try again after 15 minutes."
}
```
- **Response Headers:**
  - `Retry-After: 900` (seconds until next attempt allowed)

---

## 🌱 Seeders

### Permission Seeder (Enhanced)
- **File:** `seeders/permission.seeder.js`
- **Run command:** `node seeders/permission.seeder.js`
- **Seeds:** 25+ permissions covering all system resources

**Permission categories:**
```javascript
const permissionCategories = {
  users: ['create', 'read', 'update', 'delete', 'list'],
  roles: ['create', 'read', 'update', 'delete', 'list'],
  permissions: ['read', 'list'],
  products: ['create', 'read', 'update', 'delete', 'list'],
  warehouses: ['create', 'read', 'update', 'delete', 'list', 'assign'],
  inventory: ['read', 'update', 'transfer'],
  orders: ['create', 'read', 'update', 'delete', 'list', 'accept', 'reject'],
  invoices: ['create', 'read', 'update', 'list'],
  payments: ['create', 'read', 'update', 'list'],
  reports: ['read', 'sales', 'stock', 'profit'],
  audit: ['read']
};
```

### Role Seeder (With Permissions)
- **File:** `seeders/role.seeder.js`
- **Run command:** `node seeders/role.seeder.js`
- **Seeds:** 3 core roles with full permission mappings

**Role permission assignments:**
```javascript
const rolePermissions = {
  superadmin: ['all_permissions'], // All available permissions
  distributor: [
    'product:read', 'product:list',
    'warehouse:read', 'warehouse:list',
    'inventory:read', 'inventory:update',
    'order:read', 'order:list', 'order:update', 'order:accept', 'order:reject',
    'invoice:read', 'invoice:list',
    'payment:read', 'payment:create'
  ],
  customer: [
    'product:read', 'product:list',
    'order:create', 'order:read_own', 'order:list_own',
    'invoice:read_own', 'invoice:list_own',
    'payment:create_own'
  ]
};
```

---

## 📦 Phase Summary

The security refactoring phase has been completed successfully, transforming the basic auth system into a production-ready, enterprise-grade security layer.

### Authentication Hardening

**Token System:**
- Access tokens now expire in 15 minutes (900 seconds)
- Refresh tokens valid for 7 days with secure HttpOnly cookie storage
- Refresh tokens are SHA-256 hashed before database storage
- Automatic token rotation on every refresh
- Complete logout invalidates refresh tokens

**Rate Limiting:**
- Login endpoint limited to 5 attempts per 15 minutes per IP
- Returns `429 Too Many Requests` with `Retry-After` header
- Separate limits for authenticated vs unauthenticated endpoints

### Authorization Migration

**Permission-Based System:**
- All role checks converted to permission checks
- JWT payload now includes `permissions` array
- `authorize(permissionCode)` middleware validates access
- Middleware throws `403 Forbidden` for insufficient permissions

**Example permission check:**
```javascript
router.get('/users', authenticate, authorize('user:list'), userController.list);
```

### Pagination System

**Reusable Utility:**
```javascript
const paginate = async (model, query, page = 1, limit = 10) => {
  const skip = (page - 1) * limit;
  const [data, total] = await Promise.all([
    model.find(query).skip(skip).limit(limit),
    model.countDocuments(query)
  ]);
  return { data, pagination: { page, limit, total, last_page: Math.ceil(total / limit) } };
};
```

### Standardized Response Format

**Success Response:**
```javascript
{
  status: "success",
  message: "Operation completed",
  data: { ... },
  pagination: { page, limit, total, last_page } // Only for list endpoints
}
```

**Error Response:**
```javascript
{
  status: "error",
  message: "Human-readable error message",
  errors: [{ field: "email", message: "Invalid email format" }] // Validation errors only
}
```

### Centralized Error Handling

**Error Handler Middleware:**
- Catches all unhandled errors
- Logs stack traces in development
- Returns sanitized messages in production
- Handles Mongoose validation errors
- Handles JWT errors (expired, invalid)
- Handles MongoDB duplicate key errors

### Testable via Postman

- [x] Access token expires after 15 minutes
- [x] Refresh token endpoint returns new access token
- [x] Refresh tokens stored in HttpOnly cookies
- [x] Logout invalidates refresh token
- [x] Rate limiting blocks after 5 failed logins
- [x] All list endpoints support pagination
- [x] User data endpoint returns populated role with permissions
- [x] Permission middleware blocks unauthorized access
- [x] Response format is consistent across all endpoints
- [x] Error responses include appropriate HTTP status codes

### Important Architectural Decisions

- **HttpOnly Cookies:** Refresh tokens never exposed to JavaScript, preventing XSS theft
- **Token Hashing:** Refresh tokens hashed in DB so DB breach doesn't compromise sessions
- **Short-lived Access Tokens:** 15-minute expiry balances security and UX
- **Separate Permission/Role Seeders:** Allows independent updates to permissions vs role assignments
- **Pagination by Default:** All list endpoints require pagination parameters
- **Gender Enum:** Restricted to `male`/`female` for consistent data

---

## ✔️ Phase Done When:

- [x] All endpoints return correct responses
- [x] Postman tests pass for all scenarios
- [x] Access tokens expire in 15 minutes
- [x] Refresh tokens work and are stored in HttpOnly cookies
- [x] Logout invalidates refresh tokens
- [x] Rate limiting blocks brute force attempts (5 per 15 min)
- [x] All role checks replaced with permission checks
- [x] Pagination works on `/roles` and `/permissions`
- [x] `/userdata` returns populated role with permissions
- [x] User model includes `gender` and `isActive` fields
- [x] Login blocked for inactive users (isActive: false)
- [x] Centralized error handler catches all errors
- [x] Response format is consistent across all endpoints
