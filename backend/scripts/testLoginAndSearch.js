/**
 * Test Login and Search Functionality
 * Tests:
 * 1. Send OTP to phone 9000000250
 * 2. Verify OTP with 123456
 * 3. Search profiles with various filters
 */

import axios from 'axios';
import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

config({ path: join(__dirname, '../.env') });

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || process.env.API_URL || 'http://localhost:5050/api';
const TEST_PHONE = '9000000250';
const TEST_OTP = '123456';

console.log(`🔍 Testing API: ${API_BASE_URL}\n`);

// Create axios instance with proper headers to bypass anti-scraping
const testApi = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'application/json',
    'Referer': 'https://ekgahoi.vercel.app',
    'Origin': 'https://ekgahoi.vercel.app'
  }
});

async function testLoginAndSearch() {
  try {
    let token = null;

    // Step 1: Send OTP
    console.log('📱 Step 1: Sending OTP...');
    try {
      const sendOTPResponse = await testApi.post('/auth/send-otp', {
        phone: TEST_PHONE
      });
      
      if (sendOTPResponse.data.status) {
        console.log('✅ OTP sent successfully');
        console.log(`   OTP: ${sendOTPResponse.data.data?.otp || TEST_OTP}`);
      } else {
        console.error('❌ Failed to send OTP:', sendOTPResponse.data.message);
        return;
      }
    } catch (error) {
      console.error('❌ Error sending OTP:', error.response?.data?.message || error.message);
      if (error.code === 'ECONNREFUSED' || error.code === 'ERR_NETWORK') {
        console.error('   ⚠️  Cannot connect to backend. Is it running?');
      }
      return;
    }

    // Wait a moment
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Step 2: Verify OTP
    console.log('\n🔐 Step 2: Verifying OTP...');
    try {
      const verifyOTPResponse = await testApi.post('/auth/verify-otp', {
        phone: TEST_PHONE,
        otp: TEST_OTP
      });
      
      if (verifyOTPResponse.data.status && verifyOTPResponse.data.data?.token) {
        token = verifyOTPResponse.data.data.token;
        console.log('✅ Login successful!');
        console.log(`   Token: ${token.substring(0, 20)}...`);
        console.log(`   User: ${verifyOTPResponse.data.data.user?.name || 'N/A'}`);
        console.log(`   Gender: ${verifyOTPResponse.data.data.user?.gender || 'N/A'}`);
        console.log(`   Gahoi ID: ${verifyOTPResponse.data.data.user?.gahoiId || 'N/A'}`);
      } else {
        console.error('❌ Failed to verify OTP:', verifyOTPResponse.data.message);
        return;
      }
    } catch (error) {
      console.error('❌ Error verifying OTP:', error.response?.data?.message || error.message);
      return;
    }

    if (!token) {
      console.error('❌ No token received. Cannot proceed with search tests.');
      return;
    }

    // Step 3: Test Search Profiles (without filters)
    console.log('\n🔍 Step 3: Testing profile search (no filters)...');
    try {
      const searchResponse = await axios.get(`${API_BASE_URL}/users/search`, {
        headers: {
          'Authorization': `Bearer ${token}`
        },
        params: {
          page: 1,
          limit: 10
        }
      });
      
      if (searchResponse.data.status) {
        const profiles = searchResponse.data.data || [];
        console.log(`✅ Search successful! Found ${profiles.length} profiles`);
        if (profiles.length > 0) {
          console.log(`   First profile: ${profiles[0].name} (Gahoi ID: ${profiles[0].gahoiId})`);
        }
      } else {
        console.error('❌ Search failed:', searchResponse.data.message);
      }
    } catch (error) {
      console.error('❌ Error searching profiles:', error.response?.data?.message || error.message);
      if (error.response?.status === 401) {
        console.error('   ⚠️  Authentication failed. Token may be invalid.');
      }
    }

    // Step 4: Test Search with Gender Filter
    console.log('\n🔍 Step 4: Testing profile search with gender filter (male)...');
    try {
      const searchResponse = await axios.get(`${API_BASE_URL}/users/search`, {
        headers: {
          'Authorization': `Bearer ${token}`
        },
        params: {
          gender: 'male',
          page: 1,
          limit: 10
        }
      });
      
      if (searchResponse.data.status) {
        const profiles = searchResponse.data.data || [];
        console.log(`✅ Gender filter search successful! Found ${profiles.length} male profiles`);
        if (profiles.length > 0) {
          console.log(`   First profile: ${profiles[0].name} (Gender: ${profiles[0].gender}, Gahoi ID: ${profiles[0].gahoiId})`);
        }
      } else {
        console.error('❌ Gender filter search failed:', searchResponse.data.message);
      }
    } catch (error) {
      console.error('❌ Error with gender filter:', error.response?.data?.message || error.message);
    }

    // Step 5: Test Search with Occupation Filter
    console.log('\n🔍 Step 5: Testing profile search with occupation filter...');
    try {
      const searchResponse = await axios.get(`${API_BASE_URL}/users/search`, {
        headers: {
          'Authorization': `Bearer ${token}`
        },
        params: {
          occupation: 'Software Engineer',
          page: 1,
          limit: 10
        }
      });
      
      if (searchResponse.data.status) {
        const profiles = searchResponse.data.data || [];
        console.log(`✅ Occupation filter search successful! Found ${profiles.length} profiles`);
        if (profiles.length > 0) {
          console.log(`   First profile: ${profiles[0].name} (Occupation: ${profiles[0].occupation})`);
        } else {
          console.log('   ℹ️  No profiles found with this occupation');
        }
      } else {
        console.error('❌ Occupation filter search failed:', searchResponse.data.message);
      }
    } catch (error) {
      console.error('❌ Error with occupation filter:', error.response?.data?.message || error.message);
    }

    // Step 6: Test Search by Gahoi ID
    console.log('\n🔍 Step 6: Testing search by Gahoi ID (10001)...');
    try {
      const searchResponse = await axios.get(`${API_BASE_URL}/users/search`, {
        headers: {
          'Authorization': `Bearer ${token}`
        },
        params: {
          gahoiId: '10001',
          page: 1,
          limit: 10
        }
      });
      
      if (searchResponse.data.status) {
        const profiles = searchResponse.data.data || [];
        console.log(`✅ Gahoi ID search successful! Found ${profiles.length} profiles`);
        if (profiles.length > 0) {
          console.log(`   Profile: ${profiles[0].name} (Gahoi ID: ${profiles[0].gahoiId})`);
        }
      } else {
        console.error('❌ Gahoi ID search failed:', searchResponse.data.message);
      }
    } catch (error) {
      console.error('❌ Error with Gahoi ID search:', error.response?.data?.message || error.message);
    }

    console.log('\n✨ Testing completed!');
    
  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
    if (error.response) {
      console.error('   Response:', error.response.data);
    }
  }
}

// Run the test
testLoginAndSearch();

