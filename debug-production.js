// Debug script for production deployment issues
const axios = require('axios');

// Test both local and production endpoints
const ENDPOINTS = {
  local: 'http://localhost:5001/api',
  production: 'https://assessment-ashy.vercel.app/api',
  frontend: 'https://assessment-kexs.vercel.app'
};

async function testEndpoint(baseUrl, name) {
  console.log(`\n🔍 Testing ${name} endpoint: ${baseUrl}`);
  console.log('=' .repeat(60));

  try {
    // Test health endpoint
    console.log('1. Testing health endpoint...');
    const healthResponse = await axios.get(`${baseUrl}/health`);
    console.log(`✅ Health check: ${healthResponse.status} - ${JSON.stringify(healthResponse.data)}`);

    // Test root endpoint
    console.log('\n2. Testing root endpoint...');
    const rootResponse = await axios.get(baseUrl.replace('/api', ''));
    console.log(`✅ Root endpoint: ${rootResponse.status} - ${JSON.stringify(rootResponse.data)}`);

    // Test login endpoint (with invalid credentials to check if endpoint exists)
    console.log('\n3. Testing login endpoint...');
    try {
      const loginResponse = await axios.post(`${baseUrl}/auth/login`, {
        email: 'test@example.com',
        password: 'wrongpassword'
      });
      console.log(`✅ Login endpoint accessible: ${loginResponse.status}`);
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('✅ Login endpoint accessible (401 - Invalid credentials as expected)');
      } else {
        console.log(`❌ Login endpoint error: ${error.response?.status} - ${error.response?.data?.message || error.message}`);
      }
    }

    // Test registration endpoint
    console.log('\n4. Testing registration endpoint...');
    try {
      const regResponse = await axios.post(`${baseUrl}/auth/register`, {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        role: 'student',
        phone: '+1234567890',
        studentId: 'STU001',
        department: 'Computer Science'
      });
      console.log(`✅ Registration successful: ${regResponse.status}`);
    } catch (error) {
      if (error.response?.status === 400 && error.response?.data?.message?.includes('already exists')) {
        console.log('✅ Registration endpoint accessible (400 - User already exists as expected)');
      } else {
        console.log(`❌ Registration endpoint error: ${error.response?.status} - ${error.response?.data?.message || error.message}`);
      }
    }

  } catch (error) {
    console.log(`❌ ${name} endpoint failed: ${error.message}`);
    if (error.code === 'ECONNREFUSED') {
      console.log('   → Server is not running or not accessible');
    } else if (error.code === 'ENOTFOUND') {
      console.log('   → Domain not found or DNS issue');
    } else if (error.response) {
      console.log(`   → HTTP ${error.response.status}: ${error.response.statusText}`);
    }
  }
}

async function runProductionTests() {
  console.log('🚀 Production Deployment Debug Tool');
  console.log('=' .repeat(60));
  
  // Test local endpoint
  await testEndpoint(ENDPOINTS.local, 'LOCAL');
  
  // Test production endpoint
  await testEndpoint(ENDPOINTS.production, 'PRODUCTION');
  
  console.log('\n' + '=' .repeat(60));
  console.log('📋 Debug Summary:');
  console.log('1. If LOCAL works but PRODUCTION fails → Deployment issue');
  console.log('2. If both fail → Backend server issue');
  console.log('3. If both work → Frontend configuration issue');
  console.log('4. Check browser console for CORS errors');
  console.log('5. Verify environment variables in Vercel dashboard');
}

runProductionTests();
