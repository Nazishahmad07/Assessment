// Debug script for registration issues
const axios = require('axios');

const API_BASE_URL = 'http://localhost:5001/api';

async function testRegistration() {
  console.log('Testing registration endpoint...\n');

  const testUser = {
    name: 'Test User',
    email: 'test@example.com',
    password: 'password123',
    role: 'student',
    phone: '+1234567890',
    studentId: 'STU001',
    department: 'Computer Science'
  };

  try {
    console.log('Sending registration request...');
    console.log('Data:', JSON.stringify(testUser, null, 2));
    
    const response = await axios.post(`${API_BASE_URL}/auth/register`, testUser, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    console.log('\n✅ Registration successful!');
    console.log('Status:', response.status);
    console.log('Response:', JSON.stringify(response.data, null, 2));

  } catch (error) {
    console.log('\n❌ Registration failed!');
    console.log('Status:', error.response?.status || 'No response');
    console.log('Error:', error.response?.data || error.message);
    
    if (error.response?.data?.errors) {
      console.log('\nValidation errors:');
      error.response.data.errors.forEach((err, index) => {
        console.log(`${index + 1}. ${err.msg} (Field: ${err.param})`);
      });
    }
  }
}

async function testBackendHealth() {
  console.log('Testing backend health...\n');
  
  try {
    const response = await axios.get(`${API_BASE_URL}/health`);
    console.log('✅ Backend is healthy');
    console.log('Response:', response.data);
  } catch (error) {
    console.log('❌ Backend health check failed');
    console.log('Error:', error.message);
  }
}

async function runTests() {
  console.log('🔍 Debugging Registration Issues\n');
  console.log('=' .repeat(50));
  
  await testBackendHealth();
  console.log('\n' + '=' .repeat(50));
  await testRegistration();
}

runTests();
