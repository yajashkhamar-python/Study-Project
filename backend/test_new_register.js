require('dotenv').config();
const { setupInMemoryServer } = require('./mockServer');
const express = require('express');

async function testNewRegister() {
  const app = express();
  app.use(express.json());
  setupInMemoryServer(app);

  const server = app.listen(5006, async () => {
    console.log('Testing register on 5006...');
    try {
      const response = await fetch('http://localhost:5006/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Yajash',
          email: 'yajashkhamar@gmail.com',
          password: 'password123',
        }),
      });

      const text = await response.text();
      console.log('Status:', response.status);
      console.log('Response:', text);
    } catch (err) {
      console.error('Error:', err.message);
    } finally {
      server.close();
    }
  });
}

testNewRegister();
