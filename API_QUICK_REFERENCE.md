# E-commerce API Quick Reference

## Base URL
```
http://localhost:3000/api
```

## Swagger Documentation
```
http://localhost:3000/api-docs
```

## Authentication Endpoints

### 1. Sign Up
```http
POST /api/auth/signup
Content-Type: application/json

{
  "email": "john.doe@example.com",
  "password": "SecurePass123",
  "name": "John Doe",
  "phone": "+91 9876543210",  // optional
  "role": "BUYER"              // optional, defaults to BUYER
}
```

**Response (201):**
```json
{
  "message": "User created successfully",
  "user": {
    "id": "clx1234567890abcdef",
    "email": "john.doe@example.com",
    "name": "John Doe",
    "role": "BUYER"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### 2. Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john.doe@example.com",
  "password": "SecurePass123"
}
```

**Response (200):**
```json
{
  "message": "Login successful",
  "user": {
    "id": "clx1234567890abcdef",
    "email": "john.doe@example.com",
    "name": "John Doe",
    "role": "BUYER"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### 3. Forgot Password
```http
POST /api/auth/forgot-password
Content-Type: application/json

{
  "email": "john.doe@example.com"
}
```

**Response (200):**
```json
{
  "message": "If account exists, password reset link sent"
}
```

---

## Cart Endpoints
**Note:** All cart endpoints require authentication. Include the JWT token in the Authorization header:
```
Authorization: Bearer <your-token>
```

### 1. Get Cart
```http
GET /api/cart
Authorization: Bearer <your-token>
```

**Response (200):**
```json
{
  "id": "clx1234567890abcdef",
  "userId": "clx0987654321fedcba",
  "items": [
    {
      "id": "clx1111111111111111",
      "productId": "clx2222222222222222",
      "quantity": 2,
      "product": {
        "id": "clx2222222222222222",
        "name": "Wireless Headphones",
        "price": 2999.99,
        "stock": 50,
        "description": "High-quality wireless headphones"
      }
    }
  ]
}
```

### 2. Add to Cart
```http
POST /api/cart/add
Authorization: Bearer <your-token>
Content-Type: application/json

{
  "productId": "clx2222222222222222",
  "quantity": 2
}
```

**Response (200):**
```json
{
  "id": "clx1234567890abcdef",
  "userId": "clx0987654321fedcba",
  "items": [...]
}
```

### 3. Remove from Cart
```http
DELETE /api/cart/remove/{itemId}
Authorization: Bearer <your-token>
```

**Response (200):**
```json
{
  "id": "clx1234567890abcdef",
  "userId": "clx0987654321fedcba",
  "items": [...]
}
```

### 4. Clear Cart
```http
DELETE /api/cart/clear
Authorization: Bearer <your-token>
```

**Response (200):**
```json
{
  "message": "Cart cleared"
}
```

---

## Order Endpoints
**Note:** All order endpoints require authentication.

### 1. Get Checkout Summary
```http
GET /api/orders/checkout
Authorization: Bearer <your-token>
```

**Response (200):**
```json
{
  "items": [
    {
      "id": "clx1111111111111111",
      "productId": "clx2222222222222222",
      "quantity": 2,
      "product": {
        "name": "Wireless Headphones",
        "price": 2999.99
      },
      "itemTotal": 5999.98
    }
  ],
  "total": 5999.98
}
```

### 2. Create Order (Checkout)
```http
POST /api/orders
Authorization: Bearer <your-token>
Content-Type: application/json

{
  "shippingName": "John Doe",
  "shippingPhone": "+91 9876543210",
  "shippingAddressLine1": "123 Main Street, Apartment 4B",
  "shippingAddressLine2": "Near City Mall",  // optional
  "shippingCity": "Mumbai",
  "shippingState": "Maharashtra",
  "shippingPostalCode": "400001",
  "shippingCountry": "India"  // optional, defaults to India
}
```

**Response (201):**
```json
{
  "id": "clx3333333333333333",
  "userId": "clx0987654321fedcba",
  "total": 5999.98,
  "status": "PENDING",
  "shippingName": "John Doe",
  "shippingPhone": "+91 9876543210",
  "shippingAddressLine1": "123 Main Street, Apartment 4B",
  "shippingAddressLine2": "Near City Mall",
  "shippingCity": "Mumbai",
  "shippingState": "Maharashtra",
  "shippingPostalCode": "400001",
  "shippingCountry": "India",
  "items": [
    {
      "id": "...",
      "productId": "...",
      "quantity": 2,
      "price": 2999.99
    }
  ],
  "createdAt": "2026-01-28T00:00:00.000Z"
}
```

### 3. Get All Orders
```http
GET /api/orders?status=PENDING&limit=10&page=1
Authorization: Bearer <your-token>
```

**Query Parameters:**
- `status` (optional) - Filter by status: PENDING, PROCESSING, SHIPPED, DELIVERED, CANCELLED
- `limit` (optional) - Number of orders to return (default: 10, max: 100)
- `page` (optional) - Page number (default: 1)

**Response (200):**
```json
[
  {
    "id": "clx3333333333333333",
    "userId": "clx0987654321fedcba",
    "total": 5999.98,
    "status": "PENDING",
    "shippingName": "John Doe",
    "shippingPhone": "+91 9876543210",
    "shippingAddressLine1": "123 Main Street, Apartment 4B",
    "shippingAddressLine2": "Near City Mall",
    "shippingCity": "Mumbai",
    "shippingState": "Maharashtra",
    "shippingPostalCode": "400001",
    "shippingCountry": "India",
    "items": [...],
    "createdAt": "2026-01-28T00:00:00.000Z",
    "updatedAt": "2026-01-28T00:00:00.000Z"
  }
]
```

### 4. Get Single Order
```http
GET /api/orders/{orderId}
Authorization: Bearer <your-token>
```

**Response (200):**
```json
{
  "id": "clx3333333333333333",
  "userId": "clx0987654321fedcba",
  "total": 5999.98,
  "status": "PENDING",
  "shippingName": "John Doe",
  "shippingPhone": "+91 9876543210",
  "shippingAddressLine1": "123 Main Street, Apartment 4B",
  "shippingAddressLine2": "Near City Mall",
  "shippingCity": "Mumbai",
  "shippingState": "Maharashtra",
  "shippingPostalCode": "400001",
  "shippingCountry": "India",
  "items": [
    {
      "id": "...",
      "productId": "...",
      "quantity": 2,
      "price": 2999.99,
      "product": {
        "id": "...",
        "name": "Wireless Headphones",
        "price": 2999.99,
        "description": "High-quality wireless headphones",
        "stock": 48
      }
    }
  ],
  "createdAt": "2026-01-28T00:00:00.000Z",
  "updatedAt": "2026-01-28T00:00:00.000Z"
}
```

---

## Common Error Responses

### 400 Bad Request
```json
{
  "error": "Missing required fields"
}
```

### 401 Unauthorized
```json
{
  "error": "Unauthorized"
}
```

### 404 Not Found
```json
{
  "error": "Resource not found"
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal server error"
}
```

---

## Order Status Values
- `PENDING` - Order created, awaiting processing
- `PROCESSING` - Order is being prepared
- `SHIPPED` - Order has been shipped
- `DELIVERED` - Order has been delivered
- `CANCELLED` - Order has been cancelled

## User Roles
- `BUYER` - Regular customer (default)
- `SELLER` - Vendor/seller account
- `ADMIN` - Administrator account

---

## Testing with cURL

### Example: Complete User Flow

1. **Sign Up:**
```bash
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "name": "Test User"
  }'
```

2. **Login (save the token):**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

3. **Add to Cart:**
```bash
curl -X POST http://localhost:3000/api/cart/add \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "productId": "PRODUCT_ID_HERE",
    "quantity": 2
  }'
```

4. **Get Cart:**
```bash
curl -X GET http://localhost:3000/api/cart \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

5. **Checkout Summary:**
```bash
curl -X GET http://localhost:3000/api/orders/checkout \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

6. **Create Order:**
```bash
curl -X POST http://localhost:3000/api/orders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "shippingName": "Test User",
    "shippingPhone": "+91 9876543210",
    "shippingAddressLine1": "123 Main Street",
    "shippingCity": "Mumbai",
    "shippingState": "Maharashtra",
    "shippingPostalCode": "400001"
  }'
```

7. **Get Orders:**
```bash
curl -X GET http://localhost:3000/api/orders \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```
