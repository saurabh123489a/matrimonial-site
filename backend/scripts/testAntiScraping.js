/**
 * Test Anti-Scraping Implementation
 * Tests bot detection, pagination limits, and request validation
 */

import axios from 'axios';

const API_BASE_URL = process.env.API_URL || 'http://localhost:5050/api';

// Test cases
const tests = {
  passed: 0,
  failed: 0,
  results: [],
};

function logTest(name, passed, message) {
  tests[passed ? 'passed' : 'failed']++;
  tests.results.push({ name, passed, message });
  console.log(`${passed ? '✅' : '❌'} ${name}: ${message}`);
}

async function testBotDetection() {
  console.log('\n🤖 Testing Bot Detection...\n');
  
  // Test 1: Bot user agent (curl)
  try {
    const response = await axios.get(`${API_BASE_URL}/users`, {
      headers: {
        'User-Agent': 'curl/7.68.0',
      },
      validateStatus: () => true, // Don't throw on any status
    });
    logTest('Bot Detection (curl)', response.status === 403, 
      `Expected 403, got ${response.status}`);
  } catch (error) {
    logTest('Bot Detection (curl)', false, `Error: ${error.message}`);
  }
  
  // Test 2: Python requests
  try {
    const response = await axios.get(`${API_BASE_URL}/users`, {
      headers: {
        'User-Agent': 'python-requests/2.28.1',
      },
      validateStatus: () => true,
    });
    logTest('Bot Detection (python-requests)', response.status === 403,
      `Expected 403, got ${response.status}`);
  } catch (error) {
    logTest('Bot Detection (python-requests)', false, `Error: ${error.message}`);
  }
  
  // Test 3: Missing user agent
  try {
    const response = await axios.get(`${API_BASE_URL}/users`, {
      headers: {},
      validateStatus: () => true,
    });
    logTest('Bot Detection (missing UA)', response.status === 403,
      `Expected 403, got ${response.status}`);
  } catch (error) {
    logTest('Bot Detection (missing UA)', false, `Error: ${error.message}`);
  }
  
  // Test 4: Valid browser user agent
  try {
    const response = await axios.get(`${API_BASE_URL}/users`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'application/json',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
      },
      validateStatus: () => true,
    });
    // Should not be blocked (might be 401 if auth required, but not 403)
    logTest('Valid Browser UA', response.status !== 403,
      `Should not be blocked (got ${response.status})`);
  } catch (error) {
    logTest('Valid Browser UA', false, `Error: ${error.message}`);
  }
}

async function testPaginationLimits() {
  console.log('\n📄 Testing Pagination Limits...\n');
  
  // Test 1: Excessive limit
  try {
    const response = await axios.get(`${API_BASE_URL}/users?limit=200`, {
      headers: {
        'User-Agent': 'Mozilla/5.0',
        'Accept': 'application/json',
      },
      validateStatus: () => true,
    });
    // Should be limited to 50 or return error
    logTest('Pagination Limit (200)', response.status === 400 || (response.data?.data?.length <= 50),
      `Limit should be capped at 50 (got ${response.data?.data?.length || 'error'})`);
  } catch (error) {
    logTest('Pagination Limit (200)', false, `Error: ${error.message}`);
  }
  
  // Test 2: Excessive page number
  try {
    const response = await axios.get(`${API_BASE_URL}/users?page=500`, {
      headers: {
        'User-Agent': 'Mozilla/5.0',
        'Accept': 'application/json',
      },
      validateStatus: () => true,
    });
    logTest('Pagination Page (500)', response.status === 400,
      `Should reject page > 100 (got ${response.status})`);
  } catch (error) {
    logTest('Pagination Page (500)', false, `Error: ${error.message}`);
  }
  
  // Test 3: Valid pagination
  try {
    const response = await axios.get(`${API_BASE_URL}/users?limit=20&page=1`, {
      headers: {
        'User-Agent': 'Mozilla/5.0',
        'Accept': 'application/json',
      },
      validateStatus: () => true,
    });
    logTest('Valid Pagination', response.status !== 400,
      `Should accept valid pagination (got ${response.status})`);
  } catch (error) {
    logTest('Valid Pagination', false, `Error: ${error.message}`);
  }
}

async function testMissingHeaders() {
  console.log('\n🔒 Testing Missing Headers...\n');
  
  // Test: Missing browser headers
  try {
    const response = await axios.get(`${API_BASE_URL}/users`, {
      headers: {
        'User-Agent': 'Mozilla/5.0',
        // Missing Accept, Accept-Language, Accept-Encoding
      },
      validateStatus: () => true,
    });
    logTest('Missing Headers', response.status === 403,
      `Should block missing headers (got ${response.status})`);
  } catch (error) {
    logTest('Missing Headers', false, `Error: ${error.message}`);
  }
}

async function testRapidRequests() {
  console.log('\n⚡ Testing Rapid Request Detection...\n');
  
  // Test: Send 15 rapid requests
  try {
    const requests = Array(15).fill(null).map(() =>
      axios.get(`${API_BASE_URL}/users`, {
        headers: {
          'User-Agent': 'Mozilla/5.0',
          'Accept': 'application/json',
        },
        validateStatus: () => true,
      })
    );
    
    const responses = await Promise.all(requests);
    const blockedCount = responses.filter(r => r.status === 429).length;
    
    logTest('Rapid Requests', blockedCount > 0,
      `${blockedCount} out of 15 requests were blocked`);
  } catch (error) {
    logTest('Rapid Requests', false, `Error: ${error.message}`);
  }
}

async function runTests() {
  console.log('🧪 Starting Anti-Scraping Tests\n');
  console.log('='.repeat(50));
  
  await testBotDetection();
  await testPaginationLimits();
  await testMissingHeaders();
  await testRapidRequests();
  
  console.log('\n' + '='.repeat(50));
  console.log('\n📊 Test Results:');
  console.log(`✅ Passed: ${tests.passed}`);
  console.log(`❌ Failed: ${tests.failed}`);
  console.log(`📈 Success Rate: ${((tests.passed / (tests.passed + tests.failed)) * 100).toFixed(1)}%`);
  
  if (tests.failed > 0) {
    console.log('\n❌ Failed Tests:');
    tests.results
      .filter(r => !r.passed)
      .forEach(r => console.log(`   - ${r.name}: ${r.message}`));
  }
  
  process.exit(tests.failed > 0 ? 1 : 0);
}

// Run tests
runTests().catch(error => {
  console.error('Test execution error:', error);
  process.exit(1);
});

