# Swagger API Documentation Update Summary

## Overview
All Swagger/OpenAPI documentation has been comprehensively updated for all API endpoints across the E-commerce application. The documentation now includes detailed parameter descriptions, request/response schemas, examples, and reusable components.

## Updated Files

### 1. `swagger.js`
**Added Reusable Schema Components:**
- `User` - User account schema
- `Product` - Product details schema
- `Cart` - Shopping cart schema
- `CartItem` - Individual cart item schema
- `Order` - Order details schema
- `OrderItem` - Individual order item schema
- `Error` - Standard error response schema

These components can be referenced throughout the API documentation using `$ref` notation, ensuring consistency and reducing duplication.

### 2. `routes/auth.js` - Authentication APIs
Updated 3 endpoints with comprehensive documentation:

#### POST `/api/auth/signup`
- **Description:** Create a new user account with email, password, and name
- **Request Parameters:**
  - `email` (required) - User's email address (must be unique)
  - `password` (required) - User's password (will be hashed, min 6 chars)
  - `name` (required) - User's full name
  - `phone` (optional) - Phone number (must be unique if provided)
  - `role` (optional) - User role (BUYER/SELLER/ADMIN, defaults to BUYER)
- **Response Codes:**
  - `201` - User created successfully (returns user object and JWT token)
  - `400` - User already exists or invalid input
  - `500` - Internal server error
- **Examples:** Complete request/response examples included

#### POST `/api/auth/login`
- **Description:** Authenticate a user with email and password
- **Request Parameters:**
  - `email` (required) - User's registered email address
  - `password` (required) - User's password
- **Response Codes:**
  - `200` - Login successful (returns user object and JWT token)
  - `400` - Missing required fields
  - `401` - Invalid credentials
  - `500` - Internal server error
- **Examples:** Complete request/response examples included

#### POST `/api/auth/forgot-password`
- **Description:** Request a password reset link
- **Request Parameters:**
  - `email` (required) - Email address to send password reset link
- **Response Codes:**
  - `200` - Reset link sent if account exists
  - `400` - Email is required
  - `500` - Internal server error
- **Examples:** Complete request/response examples included

### 3. `routes/cart.js` - Shopping Cart APIs
Updated 4 endpoints with comprehensive documentation:

#### GET `/api/cart`
- **Security:** Requires Bearer token authentication
- **Description:** Retrieve the authenticated user's shopping cart with all items and product details
- **Response Codes:**
  - `200` - Cart retrieved successfully (includes cart ID, user ID, and items array with product details)
  - `401` - Unauthorized (invalid or missing token)
  - `500` - Internal server error
- **Response Schema:** Detailed cart object with nested product information

#### POST `/api/cart/add`
- **Security:** Requires Bearer token authentication
- **Description:** Add a product to cart (increments quantity if item already exists)
- **Request Parameters:**
  - `productId` (required) - ID of the product to add
  - `quantity` (required) - Quantity to add (minimum: 1)
- **Response Codes:**
  - `200` - Cart updated successfully
  - `400` - Invalid input or not enough stock
  - `401` - Unauthorized
  - `404` - Product not found
  - `500` - Internal server error
- **Examples:** Complete request/response examples included

#### DELETE `/api/cart/remove/{itemId}`
- **Security:** Requires Bearer token authentication
- **Description:** Remove a specific item from the cart
- **Path Parameters:**
  - `itemId` (required) - The ID of the cart item to remove
- **Response Codes:**
  - `200` - Cart item removed successfully
  - `401` - Unauthorized
  - `404` - Cart or item not found
  - `500` - Internal server error
- **Examples:** Complete response examples included

#### DELETE `/api/cart/clear`
- **Security:** Requires Bearer token authentication
- **Description:** Remove all items from the cart
- **Response Codes:**
  - `200` - Cart cleared successfully
  - `401` - Unauthorized
  - `404` - Cart not found
  - `500` - Internal server error
- **Examples:** Complete response examples included

### 4. `routes/order.js` - Order Management APIs
Updated 4 endpoints with comprehensive documentation:

#### GET `/api/orders/checkout`
- **Security:** Requires Bearer token authentication
- **Description:** Get a summary of cart items and total price before placing an order
- **Response Codes:**
  - `200` - Checkout summary (includes items with itemTotal and overall total)
  - `400` - Cart is empty
  - `401` - Unauthorized
  - `500` - Internal server error
- **Response Schema:** Detailed checkout summary with item totals

#### POST `/api/orders`
- **Security:** Requires Bearer token authentication
- **Description:** Create a new order from cart items with shipping address (cart is cleared after successful order creation)
- **Request Parameters (all required except shippingAddressLine2 and shippingCountry):**
  - `shippingName` - Recipient's full name
  - `shippingPhone` - Recipient's contact phone number
  - `shippingAddressLine1` - Primary address line (street, building, apartment)
  - `shippingAddressLine2` - Secondary address line (optional - landmarks, area)
  - `shippingCity` - City name
  - `shippingState` - State or province name
  - `shippingPostalCode` - Postal/ZIP code
  - `shippingCountry` - Country name (defaults to India)
- **Response Codes:**
  - `201` - Order created successfully (returns complete order with all shipping details and items)
  - `400` - Cart is empty, not enough stock, or missing address fields
  - `401` - Unauthorized
  - `500` - Internal server error
- **Response Schema:** Complete order object with shipping address and items
- **Examples:** Detailed request/response examples with all shipping fields

#### GET `/api/orders`
- **Security:** Requires Bearer token authentication
- **Description:** Retrieve all orders for the authenticated user with optional filtering and pagination
- **Query Parameters:**
  - `status` (optional) - Filter by order status (PENDING/PROCESS/SHIPPED/DELIVERED/CANCELLED)
  - `limit` (optional) - Number of orders to return (default: 10, max: 100)
  - `page` (optional) - Page number for pagination (default: 1)
- **Response Codes:**
  - `200` - List of user orders (array of order objects with full details)
  - `401` - Unauthorized
  - `500` - Internal server error
- **Response Schema:** Array of complete order objects with shipping details and items
- **Examples:** Complete response examples included

#### GET `/api/orders/{orderId}`
- **Security:** Requires Bearer token authentication
- **Description:** Retrieve detailed information about a specific order including all items and shipping details
- **Path Parameters:**
  - `orderId` (required) - The ID of the order to retrieve
- **Response Codes:**
  - `200` - Order details (complete order object with all information)
  - `401` - Unauthorized
  - `404` - Order not found
  - `500` - Internal server error
- **Response Schema:** Complete order object with shipping address, items, and product details
- **Examples:** Complete response examples included

## Key Improvements

### 1. **Comprehensive Parameter Documentation**
- All request parameters now include:
  - Type and format specifications
  - Detailed descriptions
  - Example values
  - Required/optional indicators
  - Validation constraints (min/max, enums)

### 2. **Detailed Response Schemas**
- All responses now include:
  - Complete object structures
  - Property types and examples
  - Nested object definitions
  - Array item specifications
  - Date-time formats

### 3. **Security Documentation**
- All protected endpoints now explicitly show:
  - `bearerAuth` security requirement
  - 401 Unauthorized response documentation

### 4. **Error Response Standardization**
- All endpoints now document:
  - All possible HTTP status codes
  - Error response schemas
  - Example error messages

### 5. **Reusable Components**
- Created shared schema components for:
  - Common data structures (User, Product, Cart, Order)
  - Consistent examples across all endpoints
  - Easier maintenance and updates

## How to Access Swagger Documentation

1. **Start the server:**
   ```bash
   npm start
   ```

2. **Open Swagger UI in browser:**
   ```
   http://localhost:3000/api-docs
   ```

3. **Authenticate (for protected endpoints):**
   - Click the "Authorize" button in Swagger UI
   - Enter your JWT token in the format: `Bearer <your-token>`
   - Click "Authorize" to apply

4. **Test endpoints:**
   - Expand any endpoint
   - Click "Try it out"
   - Fill in the parameters
   - Click "Execute"

## Summary Statistics

- **Total API Endpoints Documented:** 11
  - Authentication: 3 endpoints
  - Cart Management: 4 endpoints
  - Order Management: 4 endpoints
- **Reusable Schema Components:** 7
- **Total Lines of Documentation:** ~800+ lines of Swagger annotations
- **Documentation Coverage:** 100% of existing API endpoints

## Benefits

1. **Developer Experience:** Clear, comprehensive API documentation with examples
2. **Testing:** Interactive API testing directly from Swagger UI
3. **Client Integration:** Auto-generated client SDKs possible from OpenAPI spec
4. **Maintenance:** Centralized schema components reduce duplication
5. **Onboarding:** New developers can quickly understand API structure
6. **Validation:** Request/response validation against documented schemas

## Next Steps (Optional Enhancements)

1. Add API rate limiting documentation
2. Add webhook documentation (if applicable)
3. Add API versioning information
4. Create product management endpoints documentation
5. Add admin-specific endpoints documentation
6. Generate and export OpenAPI JSON/YAML spec file
7. Set up automated API testing based on Swagger specs
