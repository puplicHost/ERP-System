# Phase 01 – Roles & Permissions (Foundation)

## 🎯 Goals

Establish the foundational authentication and authorization layer for the ERP system. This phase creates the role-based access control (RBAC) structure that will govern all subsequent operations.

**Key Outcomes:**
- Three core user roles established (SuperAdmin, Distributor, Customer)
- Permission system ready for granular access control
- User-Role relationships functional
- Permission middleware ready for route protection
- Seeders provide test data for development

---

## ✅ Backend Tasks

- [x] Create Role schema with name and permissions array
- [x] Create Permission schema with name, code, and description
- [x] Establish Role-Permission relationship (Role has array of Permission references)
- [x] Establish User-Role relationship (User references Role)
- [x] Create permission middleware for route protection
- [x] Create seeder for SuperAdmin, Distributor, and Customer roles
- [x] Create seeder for base permissions (user:create, user:read, etc.)
- [x] Assign appropriate permissions to each role

---

## 🗂️ Database Schemas

### Permission Schema

| Field | Type | Required | Default | Notes |
|-------|------|----------|---------|-------|
| _id | ObjectId | Auto | - | MongoDB document ID |
| name | String | Yes | - | Display name (e.g., "Create Users") |
| code | String | Yes | - | Unique code (e.g., "user:create") |
| description | String | No | "" | Explanation of permission |
| resource | String | Yes | - | Resource type (user, product, order, etc.) |
| action | String | Yes | - | Action type (create, read, update, delete) |
| createdAt | Date | Auto | Date.now | Document creation timestamp |
| updatedAt | Date | Auto | Date.now | Last update timestamp |

### Role Schema

| Field | Type | Required | Default | Notes |
|-------|------|----------|---------|-------|
| _id | ObjectId | Auto | - | MongoDB document ID |
| name | String | Yes | - | Display name (e.g., "SuperAdmin") |
| code | String | Yes | - | Unique code (e.g., "superadmin") |
| description | String | No | "" | Role explanation |
| permissions | [ObjectId] | Yes | [] | Array of Permission references |
| isDefault | Boolean | No | false | Auto-assign to new users |
| level | Number | No | 0 | Hierarchy level (0=highest) |
| createdAt | Date | Auto | Date.now | Document creation timestamp |
| updatedAt | Date | Auto | Date.now | Last update timestamp |

### User Schema

| Field | Type | Required | Default | Notes |
|-------|------|----------|---------|-------|
| _id | ObjectId | Auto | - | MongoDB document ID |
| email | String | Yes | - | Unique email address |
| password | String | Yes | - | Hashed password (bcrypt) |
| firstName | String | Yes | - | User's first name |
| lastName | String | Yes | - | User's last name |
| phone | String | No | null | Contact number |
| role | ObjectId | Yes | - | Reference to Role |
| gender | String | No | null | Enum: male, female |
| isActive | Boolean | No | true | Account status |
| lastLogin | Date | No | null | Last successful login |
| createdAt | Date | Auto | Date.now | Account creation |
| updatedAt | Date | Auto | Date.now | Last profile update |

---

## 🔌 API Endpoints

| Method | Endpoint | Description | Permission Required |
|--------|----------|-------------|-------------------|
| POST | `/auth/register` | Register new user | None (public) |
| POST | `/auth/login` | Authenticate user | None (public) |
| GET | `/roles` | List all roles | user:read |
| GET | `/roles/:id` | Get role by ID | user:read |
| GET | `/permissions` | List all permissions | permission:read |
| GET | `/permissions/:id` | Get permission by ID | permission:read |

---

## 🧪 Postman Testing Guide

### Register User
- **Method:** POST
- **URL:** `http://localhost:5000/api/auth/register`
- **Headers:**
  - Content-Type: application/json
- **Body (JSON):**
```json
{
  "email": "admin@erp-system.com",
  "password": "SecurePass123!",
  "firstName": "System",
  "lastName": "Administrator",
  "phone": "+20 123 456 7890",
  "role": "superadmin"
}
```
- **Expected Success Response (201):**
```json
{
  "status": "success",
  "message": "User registered successfully",
  "data": {
    "user": {
      "_id": "507f1f77bcf86cd799439011",
      "email": "admin@erp-system.com",
      "firstName": "System",
      "lastName": "Administrator",
      "role": {
        "_id": "507f1f77bcf86cd799439020",
        "name": "SuperAdmin",
        "code": "superadmin"
      }
    }
  }
}
```
- **Expected Error Responses:**
  - `400` – Missing required fields or invalid email format
  - `409` – Email already exists
  - `400` – Password too weak (min 8 chars, one uppercase, one number)

### Login
- **Method:** POST
- **URL:** `http://localhost:5000/api/auth/login`
- **Headers:**
  - Content-Type: application/json
- **Body (JSON):**
```json
{
  "email": "admin@erp-system.com",
  "password": "SecurePass123!"
}
```
- **Expected Success Response (200):**
```json
{
  "status": "success",
  "message": "Login successful",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "_id": "507f1f77bcf86cd799439011",
      "email": "admin@erp-system.com",
      "firstName": "System",
      "lastName": "Administrator",
      "role": {
        "_id": "507f1f77bcf86cd799439020",
        "name": "SuperAdmin",
        "code": "superadmin"
      }
    }
  }
}
```
- **Expected Error Responses:**
  - `400` – Missing email or password
  - `401` – Invalid credentials
  - `403` – Account is deactivated (isActive: false)

### List All Roles
- **Method:** GET
- **URL:** `http://localhost:5000/api/roles`
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
      "_id": "507f1f77bcf86cd799439020",
      "name": "SuperAdmin",
      "code": "superadmin",
      "description": "Full system access",
      "permissions": ["507f1f77bcf86cd799439030", "507f1f77bcf86cd799439031"],
      "level": 0
    },
    {
      "_id": "507f1f77bcf86cd799439021",
      "name": "Distributor",
      "code": "distributor",
      "description": "Warehouse and order management",
      "permissions": ["507f1f77bcf86cd799439040", "507f1f77bcf86cd799439041"],
      "level": 1
    },
    {
      "_id": "507f1f77bcf86cd799439022",
      "name": "Customer",
      "code": "customer",
      "description": "Product browsing and ordering",
      "permissions": ["507f1f77bcf86cd799439050"],
      "level": 2
    }
  ]
}
```
- **Expected Error Responses:**
  - `401` – No token provided
  - `401` – Invalid or expired token
  - `403` – Insufficient permissions

### Get Role by ID
- **Method:** GET
- **URL:** `http://localhost:5000/api/roles/507f1f77bcf86cd799439020`
- **Headers:**
  - Content-Type: application/json
  - Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
- **Body:** None
- **Expected Success Response (200):**
```json
{
  "status": "success",
  "data": {
    "_id": "507f1f77bcf86cd799439020",
    "name": "SuperAdmin",
    "code": "superadmin",
    "description": "Full system access",
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
      }
    ],
    "level": 0,
    "createdAt": "2026-04-01T10:00:00.000Z"
  }
}
```
- **Expected Error Responses:**
  - `401` – No token / invalid token
  - `403` – Permission denied
  - `404` – Role not found

### List All Permissions
- **Method:** GET
- **URL:** `http://localhost:5000/api/permissions`
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
      "_id": "507f1f77bcf86cd799439030",
      "name": "Create Users",
      "code": "user:create",
      "description": "Ability to create new users",
      "resource": "user",
      "action": "create"
    },
    {
      "_id": "507f1f77bcf86cd799439031",
      "name": "Read Users",
      "code": "user:read",
      "description": "Ability to view user information",
      "resource": "user",
      "action": "read"
    },
    {
      "_id": "507f1f77bcf86cd799439040",
      "name": "Create Products",
      "code": "product:create",
      "description": "Ability to add products to catalog",
      "resource": "product",
      "action": "create"
    }
  ]
}
```
- **Expected Error Responses:**
  - `401` – Authentication required
  - `403` – Permission denied

---

## 🌱 Seeders

### Permission Seeder
- **File:** `seeders/permission.seeder.js`
- **Run command:** `node seeders/permission.seeder.js`
- **Seeds:** 20 base permissions covering all resources

**Example seeded permissions:**
```javascript
const permissions = [
  { name: "Create Users", code: "user:create", resource: "user", action: "create" },
  { name: "Read Users", code: "user:read", resource: "user", action: "read" },
  { name: "Update Users", code: "user:update", resource: "user", action: "update" },
  { name: "Delete Users", code: "user:delete", resource: "user", action: "delete" },
  { name: "Create Products", code: "product:create", resource: "product", action: "create" },
  { name: "Read Products", code: "product:read", resource: "product", action: "read" },
  { name: "Create Orders", code: "order:create", resource: "order", action: "create" },
  { name: "Read Orders", code: "order:read", resource: "order", action: "read" },
  // ... additional permissions
];
```

### Role Seeder
- **File:** `seeders/role.seeder.js`
- **Run command:** `node seeders/role.seeder.js`
- **Seeds:** 3 core roles with assigned permissions

**Example seeded roles:**
```javascript
const roles = [
  {
    name: "SuperAdmin",
    code: "superadmin",
    description: "Full system access and control",
    level: 0,
    permissions: ["all_permission_ids_here"] // All permissions
  },
  {
    name: "Distributor",
    code: "distributor",
    description: "Warehouse and order management",
    level: 1,
    permissions: ["product:read", "order:read", "order:update", "inventory:read"]
  },
  {
    name: "Customer",
    code: "customer",
    description: "Product browsing and ordering",
    level: 2,
    isDefault: true,
    permissions: ["product:read", "order:create", "order:read_own"]
  }
];
```

---

## 📦 Phase Summary

The foundational Roles & Permissions layer has been successfully implemented and tested. The system now supports three distinct user types with appropriate access controls.

### Schemas Created

1. **Permission Schema** – Stores all granular permissions with resource/action categorization
2. **Role Schema** – Defines user roles with permission arrays and hierarchy levels
3. **User Schema** – Extended with role reference and account status fields

### Endpoints Built

- `/auth/register` – User registration with role assignment
- `/auth/login` – User authentication with token generation
- `/roles` – Role listing with permission population
- `/roles/:id` – Single role retrieval
- `/permissions` – Permission catalog
- `/permissions/:id` – Single permission retrieval

### Middleware Applied

- `authenticate()` – JWT token validation middleware
- `authorize(permissionCode)` – Permission-based route protection
- `validateRequest()` – Input validation middleware

### Security Implementation

- Passwords hashed using bcrypt (12 rounds)
- JWT tokens for stateless authentication
- Role-based middleware protecting sensitive routes
- Input validation preventing malformed requests

### Testable via Postman

- [x] Register users with different roles
- [x] Login and receive access tokens
- [x] Access protected endpoints with valid tokens
- [x] Get denied access without required permissions
- [x] List and view roles with their permissions
- [x] View all available permissions

### Architectural Decisions

- **Permission-based over Role-based:** While roles group permissions, direct permission checks allow for future granular control
- **Role hierarchy levels:** Numeric levels (0, 1, 2) enable easy hierarchy comparisons
- **Soft account deactivation:** `isActive` flag allows disabling accounts without data deletion
- **Separate permission seeder:** Allows updating permissions without touching role assignments

---

## ✔️ Phase Done When:

- [x] All endpoints return correct responses
- [x] Postman tests pass for all scenarios
- [x] Permission middleware successfully blocks unauthorized access
- [x] Role seeders create all three core roles
- [x] Permission seeders create base permissions
- [x] Users can be assigned roles during registration
- [x] Login returns appropriate user data with role information
