#!/usr/bin/env node

/**
 * Check API Status Script
 * Tests both Vercel and Railway backend endpoints
 */

const https = require('https');
const http = require('http');

const API_ENDPOINTS = [
  {
    name: 'Vercel Frontend API Route',
    url: 'https://ekgahoi.vercel.app/api/health',
    expected: 'JSON response or 404'
  },
  {
    name: 'Local Backend',
    url: 'http://localhost:5050/api/health',
    expected: 'JSON response with status: true'
  }
];

// Common Railway backend URLs (update if you know your Railway URL)
const RAILWAY_URLS = [
  'https://matrimonial-site-production.up.railway.app',
  'https://matrimonial-site.up.railway.app',
  'https://matrimonial-backend.up.railway.app',
];

function makeRequest(url) {
  return new Promise((resolve, reject) => {
    const isHttps = url.startsWith('https');
    const client = isHttps ? https : http;
    
    const req = client.get(url, { timeout: 5000 }, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          headers: res.headers,
          data: data.substring(0, 500), // First 500 chars
          success: res.statusCode >= 200 && res.statusCode < 300
        });
      });
    });
    
    req.on('error', (err) => {
      reject(err);
    });
    
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });
  });
}

async function checkEndpoint(endpoint) {
  console.log(`\n🔍 Checking: ${endpoint.name}`);
  console.log(`   URL: ${endpoint.url}`);
  
  try {
    const result = await makeRequest(endpoint.url);
    console.log(`   ✅ Status: ${result.status}`);
    
    if (result.success) {
      try {
        const json = JSON.parse(result.data);
        console.log(`   ✅ Response:`, JSON.stringify(json, null, 2));
      } catch (e) {
        console.log(`   ⚠️  Response (not JSON): ${result.data.substring(0, 100)}...`);
      }
    } else {
      console.log(`   ❌ Failed with status ${result.status}`);
      if (result.data) {
        console.log(`   Response: ${result.data.substring(0, 200)}...`);
      }
    }
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
  }
}

async function checkRailwayBackends() {
  console.log(`\n🔍 Checking Railway Backends...`);
  
  for (const baseUrl of RAILWAY_URLS) {
    const url = `${baseUrl}/api/health`;
    console.log(`\n   Testing: ${url}`);
    
    try {
      const result = await makeRequest(url);
      if (result.success) {
        console.log(`   ✅ FOUND! Status: ${result.status}`);
        try {
          const json = JSON.parse(result.data);
          console.log(`   ✅ Response:`, JSON.stringify(json, null, 2));
          console.log(`\n   🎯 Use this URL in Vercel: ${baseUrl}/api`);
          return baseUrl;
        } catch (e) {
          console.log(`   ⚠️  Response: ${result.data.substring(0, 100)}...`);
        }
      } else {
        console.log(`   ❌ Status: ${result.status}`);
      }
    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`);
    }
  }
  
  return null;
}

async function main() {
  console.log('='.repeat(60));
  console.log('API Status Check');
  console.log('='.repeat(60));
  
  // Check known endpoints
  for (const endpoint of API_ENDPOINTS) {
    await checkEndpoint(endpoint);
  }
  
  // Check Railway backends
  const railwayUrl = await checkRailwayBackends();
  
  console.log('\n' + '='.repeat(60));
  console.log('Summary & Recommendations');
  console.log('='.repeat(60));
  
  console.log('\n📋 Next Steps:');
  console.log('1. If Railway backend is found, update Vercel environment variable:');
  if (railwayUrl) {
    console.log(`   NEXT_PUBLIC_API_URL=${railwayUrl}/api`);
  } else {
    console.log('   NEXT_PUBLIC_API_URL=https://your-railway-url.up.railway.app/api');
  }
  console.log('\n2. To find your Railway URL:');
  console.log('   - Go to Railway Dashboard');
  console.log('   - Select your backend service');
  console.log('   - Go to Settings → Networking');
  console.log('   - Copy the generated domain');
  console.log('\n3. To update Vercel:');
  console.log('   - Go to Vercel Dashboard → Your Project → Settings → Environment Variables');
  console.log('   - Add/Update NEXT_PUBLIC_API_URL');
  console.log('   - Redeploy the frontend');
}

main().catch(console.error);

