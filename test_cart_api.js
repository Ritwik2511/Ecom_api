const http = require('http');

// Configuration
const BASE_URL = 'localhost';
const PORT = 3000;
const TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJjbWt3aXVkZWgwMDAwYThmejN5cTh4eHNlIiwicm9sZSI6IkJVWUVSIiwiaWF0IjoxNzY5NTEzODI0LCJleHAiOjE3NzAxMTg2MjR9.SzabxHDgdbfYlRN1ENWtejHjBKqUCQl-hYFcBxI3mJM';
const PRODUCT_ID = 'cmkwj6mso000010z792tsrjrl';
const QUANTITY = 1;

// Test data
const cartData = JSON.stringify({
    productId: PRODUCT_ID,
    quantity: QUANTITY
});

const options = {
    hostname: BASE_URL,
    port: PORT,
    path: '/api/cart/add',
    method: 'POST',
    headers: {
        'accept': '*/*',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${TOKEN}`,
        'Content-Length': Buffer.byteLength(cartData)
    }
};

console.log('Testing Cart Add API Endpoint...');
console.log('====================================');
console.log(`URL: http://${BASE_URL}:${PORT}/api/cart/add`);
console.log(`Product ID: ${PRODUCT_ID}`);
console.log(`Quantity: ${QUANTITY}`);
console.log('');
console.log('Request:');
console.log(JSON.stringify(JSON.parse(cartData), null, 2));
console.log('');
console.log('Response:');

const req = http.request(options, (res) => {
    console.log(`Status Code: ${res.statusCode}`);
    console.log(`Status Message: ${res.statusMessage}`);
    console.log('');
    
    let responseData = '';
    
    res.on('data', (chunk) => {
        responseData += chunk;
    });
    
    res.on('end', () => {
        try {
            const parsedResponse = JSON.parse(responseData);
            console.log(JSON.stringify(parsedResponse, null, 2));
            
            // Analyze response
            console.log('');
            console.log('Analysis:');
            if (res.statusCode === 200) {
                console.log('✅ Success: Item added to cart successfully');
                if (parsedResponse.items) {
                    console.log(`📦 Cart now has ${parsedResponse.items.length} item(s)`);
                }
            } else if (res.statusCode === 400) {
                console.log('❌ Bad Request: Invalid input or insufficient stock');
                console.log(`Error: ${parsedResponse.error}`);
            } else if (res.statusCode === 404) {
                console.log('❌ Not Found: Product does not exist');
                console.log(`Error: ${parsedResponse.error}`);
            } else if (res.statusCode === 401) {
                console.log('❌ Unauthorized: Invalid or expired token');
                console.log(`Error: ${parsedResponse.error}`);
            } else if (res.statusCode === 500) {
                console.log('❌ Internal Server Error: Something went wrong on the server');
                console.log(`Error: ${parsedResponse.error}`);
            } else {
                console.log(`⚠️  Unexpected status code: ${res.statusCode}`);
            }
        } catch (error) {
            console.log('Raw response:');
            console.log(responseData);
            console.log('');
            console.log('Error parsing response:', error.message);
        }
    });
});

req.on('error', (error) => {
    console.error('❌ Request failed:', error.message);
    console.error('');
    console.error('Possible issues:');
    console.error('1. Server is not running');
    console.error('2. Wrong port or host');
    console.error('3. Network connectivity issues');
    console.error('');
    console.error('Troubleshooting:');
    console.error('- Make sure the server is running: npm start or docker-compose up');
    console.error('- Check if the port is correct: default is 3000');
    console.error('- Verify the database is connected and accessible');
});

req.write(cartData);
req.end();
