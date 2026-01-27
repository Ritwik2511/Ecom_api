const axios = require('axios');

async function testCartAdd() {
    try {
        const response = await axios.post('http://localhost:3000/api/cart/add', {
            productId: 'cmkwj6mso000010z792tsrjrl',
            quantity: 1
        }, {
            headers: {
                'accept': '*/*',
                'Content-Type': 'application/json',
                'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJjbWt3aXVkZWgwMDAwYThmejN5cTh4eHNlIiwicm9sZSI6IkJVWUVSIiwiaWF0IjoxNzY5NTEzODI0LCJleHAiOjE3NzAxMTg2MjR9.SzabxHDgdbfYlRN1ENWtejHjBKqUCQl-hYFcBxI3mJM'
            }
        });

        console.log('Success!');
        console.log('Status:', response.status);
        console.log('Data:', JSON.stringify(response.data, null, 2));
    } catch (error) {
        console.log('Error occurred:');
        console.log('Status:', error.response?.status);
        console.log('Error data:', JSON.stringify(error.response?.data, null, 2));
    }
}

testCartAdd();
