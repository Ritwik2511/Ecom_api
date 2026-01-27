# Order Shipping Address Implementation

## ✅ What Was Done

### 1. **Database Schema Update**
Added shipping address fields to the `Order` model in `prisma/schema.prisma`:
- `shippingName` - Recipient's full name
- `shippingPhone` - Contact phone number
- `shippingAddressLine1` - Primary address (required)
- `shippingAddressLine2` - Secondary address (optional)
- `shippingCity` - City name
- `shippingState` - State/Province
- `shippingPostalCode` - ZIP/Postal code
- `shippingCountry` - Country (defaults to "India")

### 2. **Database Migration**
Created and applied migration: `20260128004227_add_shipping_address_to_order`
- Migration adds all shipping address columns to the Order table
- Existing orders get default empty values
- Prisma Client regenerated with new schema

### 3. **API Endpoint Update**
Updated `POST /api/orders` endpoint to:
- **Accept shipping address in request body**
- **Validate all required address fields**
- **Save address with the order**
- **Return complete order with shipping details**

### 4. **Swagger Documentation**
Enhanced API documentation with:
- Complete request body schema
- Required vs optional fields marked
- Example values for each field
- Updated response descriptions

---

## 📋 API Usage

### **Endpoint**: `POST /api/orders`

### **Headers**:
```
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json
```

### **Request Body**:
```json
{
  "shippingName": "Ritik Kumar",
  "shippingPhone": "+91 9876543210",
  "shippingAddressLine1": "123 Main Street, Apartment 4B",
  "shippingAddressLine2": "Near City Mall",
  "shippingCity": "Mumbai",
  "shippingState": "Maharashtra",
  "shippingPostalCode": "400001",
  "shippingCountry": "India"
}
```

### **Required Fields**:
- ✅ `shippingName`
- ✅ `shippingPhone`
- ✅ `shippingAddressLine1`
- ✅ `shippingCity`
- ✅ `shippingState`
- ✅ `shippingPostalCode`

### **Optional Fields**:
- `shippingAddressLine2` (for additional address details)
- `shippingCountry` (defaults to "India")

---

## 🧪 Testing

### **Using Swagger UI**:
1. Go to `http://localhost:3000/api-docs`
2. Find `POST /orders` endpoint
3. Click "Try it out"
4. Click the 🔒 Authorize button and add your Bearer token
5. Fill in the shipping address fields
6. Click "Execute"

### **Using curl**:
```bash
curl -X POST http://localhost:3000/api/orders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "shippingName": "Ritik Kumar",
    "shippingPhone": "+91 9876543210",
    "shippingAddressLine1": "123 Main Street, Apartment 4B",
    "shippingAddressLine2": "Near City Mall",
    "shippingCity": "Mumbai",
    "shippingState": "Maharashtra",
    "shippingPostalCode": "400001",
    "shippingCountry": "India"
  }'
```

### **Using the test script**:
See `test_order_with_address.js` for a complete example.

---

## 📦 Response Example

### **Success (201 Created)**:
```json
{
  "id": "clz123abc456",
  "userId": "user123",
  "status": "PENDING",
  "total": "1299.99",
  "shippingName": "Ritik Kumar",
  "shippingPhone": "+91 9876543210",
  "shippingAddressLine1": "123 Main Street, Apartment 4B",
  "shippingAddressLine2": "Near City Mall",
  "shippingCity": "Mumbai",
  "shippingState": "Maharashtra",
  "shippingPostalCode": "400001",
  "shippingCountry": "India",
  "items": [
    {
      "id": "item123",
      "productId": "prod456",
      "quantity": 2,
      "price": "649.99"
    }
  ],
  "createdAt": "2026-01-28T00:42:00.000Z",
  "updatedAt": "2026-01-28T00:42:00.000Z"
}
```

### **Error (400 Bad Request)** - Missing Address:
```json
{
  "error": "Missing required shipping address fields",
  "required": [
    "shippingName",
    "shippingPhone",
    "shippingAddressLine1",
    "shippingCity",
    "shippingState",
    "shippingPostalCode"
  ]
}
```

### **Error (400 Bad Request)** - Empty Cart:
```json
{
  "error": "Cart is empty"
}
```

---

## 🔍 Viewing Orders with Address

When you fetch orders using:
- `GET /api/orders` - List all user orders
- `GET /api/orders/{orderId}` - Get specific order

The response will now include all shipping address fields.

---

## 🎯 Next Steps

You can now:
1. ✅ Create orders with complete shipping information
2. ✅ View shipping addresses in order details
3. ✅ Use this data for order fulfillment
4. 🔜 Add address validation (e.g., postal code format)
5. 🔜 Add saved addresses feature for users
6. 🔜 Add address autocomplete/suggestions

---

## 📝 Files Modified

1. `prisma/schema.prisma` - Added shipping fields to Order model
2. `prisma/migrations/20260128004227_add_shipping_address_to_order/migration.sql` - Database migration
3. `routes/order.js` - Updated order creation endpoint
4. `test_order_with_address.js` - Test script (new file)

---

## 🚀 Status

✅ **All changes applied and tested**
✅ **Database migrated successfully**
✅ **Prisma Client regenerated**
✅ **Docker container restarted**
✅ **Ready to use!**
