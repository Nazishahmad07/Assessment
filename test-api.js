// Simple API test script
const http = require('http');

const testEndpoint = (path, method = 'GET') => {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 5001,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          headers: res.headers,
          body: data
        });
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    req.end();
  });
};

async function runTests() {
  console.log('Testing Campus Events API...\n');

  try {
    // Test root endpoint
    console.log('1. Testing root endpoint (/)...');
    const rootTest = await testEndpoint('/');
    console.log(`Status: ${rootTest.status}`);
    console.log(`Response: ${rootTest.body}\n`);

    // Test health endpoint
    console.log('2. Testing health endpoint (/api/health)...');
    const healthTest = await testEndpoint('/api/health');
    console.log(`Status: ${healthTest.status}`);
    console.log(`Response: ${healthTest.body}\n`);

    // Test events endpoint
    console.log('3. Testing events endpoint (/api/events)...');
    const eventsTest = await testEndpoint('/api/events');
    console.log(`Status: ${eventsTest.status}`);
    console.log(`Response: ${eventsTest.body}\n`);

    // Test non-existent endpoint
    console.log('4. Testing non-existent endpoint (/api/nonexistent)...');
    const notFoundTest = await testEndpoint('/api/nonexistent');
    console.log(`Status: ${notFoundTest.status}`);
    console.log(`Response: ${notFoundTest.body}\n`);

  } catch (error) {
    console.error('Error testing API:', error.message);
    console.log('\nMake sure the server is running on port 5001');
  }
}

runTests();
