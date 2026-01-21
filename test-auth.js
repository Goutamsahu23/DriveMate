// Test script to verify token auth flow
const testAuth = async () => {
  const baseURL = 'http://localhost:5000/api';

  try {
    // 1. Register a test user
    console.log('1. Registering test user...');
    const registerRes = await fetch(`${baseURL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        phone: '1234567890',
        role: 'rider'
      })
    });

    if (registerRes.status === 400) {
      console.log('User already exists, attempting login...');
    } else {
      const registerData = await registerRes.json();
      console.log('Register response:', registerData);
    }

    // 2. Login
    console.log('\n2. Logging in...');
    const loginRes = await fetch(`${baseURL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'password123'
      })
    });

    const loginData = await loginRes.json();
    console.log('Login response:', loginData);
    
    if (!loginData.token) {
      console.error('No token returned!');
      return;
    }

    const token = loginData.token;
    console.log('Token received:', token.substring(0, 20) + '...');

    // 3. Test /users/me endpoint
    console.log('\n3. Testing GET /users/me...');
    const meRes = await fetch(`${baseURL}/users/me`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    const meData = await meRes.json();
    console.log('Status:', meRes.status);
    console.log('Response:', meData);

    if (meRes.status === 200) {
      console.log('\n✅ SUCCESS! Token verification is working');
    } else {
      console.log('\n❌ FAILED! Token verification error');
    }

  } catch (error) {
    console.error('Test error:', error);
  }
};

testAuth();
