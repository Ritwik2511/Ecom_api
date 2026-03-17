const { Client } = require('pg');
const client = new Client({
  connectionString: "postgresql://websitedduniya:India%402026@localhost:5432/websiteduniya"
});

async function testConnection() {
  try {
    await client.connect();
    console.log('Successfully connected to the database');
    await client.end();
  } catch (err) {
    console.error('Connection error:', err.stack);
  }
}

testConnection();
