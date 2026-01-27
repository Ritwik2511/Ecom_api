// Test script for creating an order with shipping address
// Make sure you have:
// 1. A valid JWT token (from login)
// 2. Items in your cart

const BASE_URL = 'http://localhost:3000/api';

// Replace with your actual JWT token
const TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';

async function createOrderWithAddress() {
    try {
        const response = await fetch(`${BASE_URL}/orders`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${TOKEN}`
            },
            body: JSON.stringify({
                shippingName: "Ritik Kumar",
                shippingPhone: "+91 9876543210",
                shippingAddressLine1: "123 Main Street, Apartment 4B",
                shippingAddressLine2: "Near City Mall",
                shippingCity: "Mumbai",
                shippingState: "Maharashtra",
                shippingPostalCode: "400001",
                shippingCountry: "India"
            })
        });

        const data = await response.json();

        if (response.ok) {
            console.log('✅ Order created successfully!');
            console.log('Order ID:', data.id);
            console.log('Total:', data.total);
            console.log('Shipping Address:', {
                name: data.shippingName,
                phone: data.shippingPhone,
                address: `${data.shippingAddressLine1}, ${data.shippingAddressLine2 || ''}`,
                city: data.shippingCity,
                state: data.shippingState,
                postalCode: data.shippingPostalCode,
                country: data.shippingCountry
            });
            console.log('Full Order:', JSON.stringify(data, null, 2));
        } else {
            console.error('❌ Error creating order:', data);
        }
    } catch (error) {
        console.error('❌ Request failed:', error.message);
    }
}

// Example using curl (for terminal testing)
console.log('\n📋 Curl command:');
console.log(`
curl -X POST http://localhost:3000/api/orders \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \\
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
`);

// Uncomment to run the test
// createOrderWithAddress();
