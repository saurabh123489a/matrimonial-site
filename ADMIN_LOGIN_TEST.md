# Admin Login Test Guide

## Overview
Admin users can login using **email/phone + password** (not OTP). The system checks the `isAdmin` flag to grant admin access.

## Step 1: Create an Admin User

### Option A: Using the Script (Recommended)

```bash
# Navigate to project root
cd "/Users/saurabhgupta/Desktop/saurabh/Matrimonial Site"

# Run the createAdmin script
node backend/scripts/createAdmin.js "Admin User" admin@ekgahoi.com 9999999999 admin123 male
```

**Parameters:**
- Name: "Admin User"
- Email: admin@ekgahoi.com
- Phone: 9999999999
- Password: admin123
- Gender: male

### Option B: Using the Shell Script

```bash
# Make script executable (first time only)
chmod +x createAdmin.sh

# Run with defaults or custom values
./createAdmin.sh "Admin User" admin@ekgahoi.com 9999999999 admin123 male
```

### Option C: Using Admin Portal (After first admin exists)

1. Login as existing admin
2. Go to Admin Portal → Create Admin tab
3. Fill in the form and create new admin

## Step 2: Test Admin Login

### Via API (Using curl)

```bash
# Test admin login with email
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "identifier": "admin@ekgahoi.com",
    "password": "admin123"
  }'

# Test admin login with phone
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "identifier": "9999999999",
    "password": "admin123"
  }'
```

**Expected Response:**
```json
{
  "status": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "_id": "...",
      "name": "Admin User",
      "email": "admin@ekgahoi.com",
      "phone": "9999999999",
      "isAdmin": true,
      ...
    }
  }
}
```

### Via Frontend (Currently Not Available)

**Note:** The current login page (`/login`) only supports OTP login. Admin login requires email/phone + password.

**Workaround:** Use the API directly or we need to add a password login form.

## Step 3: Verify Admin Access

### Check Admin Portal Access

1. After login, navigate to: `http://localhost:3000/admin`
2. You should see the Admin Dashboard
3. Check available tabs:
   - Dashboard (stats)
   - Users Management
   - Notifications
   - Create Admin

### Check Admin Routes

```bash
# Get dashboard stats (requires admin token)
curl -X GET http://localhost:5000/api/admin/dashboard/stats \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

## Step 4: Test Admin Features

### Available Admin Features:

1. **Dashboard Stats** (`GET /api/admin/dashboard/stats`)
   - Total users
   - Active/inactive users
   - Reports stats
   - Admin users count

2. **User Management** (`GET /api/admin/users`)
   - List all users
   - Update user status
   - Delete users

3. **Reports Management** (`GET /api/admin/reports`)
   - View reported profiles
   - Resolve reports
   - Manage flagged content

4. **Notifications** (`POST /api/admin/notifications/global`)
   - Send global notifications
   - Send personal notifications

5. **Create Admin** (`POST /api/admin/users/create-admin`)
   - Create new admin users

## Test Admin Login Script

Create a test file: `test-admin-login.js`

```javascript
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

async function testAdminLogin() {
  try {
    console.log('🔐 Testing Admin Login...\n');
    
    // Test login with email
    console.log('1. Testing login with email...');
    const emailLogin = await axios.post(`${API_URL}/auth/login`, {
      identifier: 'admin@ekgahoi.com',
      password: 'admin123'
    });
    
    if (emailLogin.data.status && emailLogin.data.data.user.isAdmin) {
      console.log('✅ Email login successful!');
      console.log(`   Token: ${emailLogin.data.data.token.substring(0, 20)}...`);
      console.log(`   User: ${emailLogin.data.data.user.name}`);
      console.log(`   Admin: ${emailLogin.data.data.user.isAdmin}\n`);
      
      // Test admin endpoint
      console.log('2. Testing admin dashboard access...');
      const dashboard = await axios.get(`${API_URL}/admin/dashboard/stats`, {
        headers: {
          'Authorization': `Bearer ${emailLogin.data.data.token}`
        }
      });
      
      if (dashboard.data.status) {
        console.log('✅ Admin dashboard access successful!');
        console.log('   Stats:', dashboard.data.data);
      }
    }
    
    // Test login with phone
    console.log('\n3. Testing login with phone...');
    const phoneLogin = await axios.post(`${API_URL}/auth/login`, {
      identifier: '9999999999',
      password: 'admin123'
    });
    
    if (phoneLogin.data.status && phoneLogin.data.data.user.isAdmin) {
      console.log('✅ Phone login successful!');
      console.log(`   User: ${phoneLogin.data.data.user.name}\n`);
    }
    
    console.log('\n✅ All admin login tests passed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

testAdminLogin();
```

Run it:
```bash
node test-admin-login.js
```

## Quick Test Commands

```bash
# 1. Create admin
node backend/scripts/createAdmin.js "Test Admin" admin@test.com 8888888888 test123 male

# 2. Test login (email)
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"identifier":"admin@test.com","password":"test123"}' | jq

# 3. Get token from response and test admin endpoint
TOKEN="your_token_here"
curl -X GET http://localhost:5000/api/admin/dashboard/stats \
  -H "Authorization: Bearer $TOKEN" | jq
```

## Troubleshooting

### Issue: "Invalid credentials"
- Check if admin user exists: Query MongoDB for `isAdmin: true`
- Verify password is correct
- Ensure user has `isAdmin: true` flag

### Issue: "Access denied. Admin privileges required"
- User doesn't have `isAdmin: true` flag
- Re-create admin or update existing user:
  ```javascript
  // In MongoDB shell
  db.users.updateOne(
    { email: "admin@ekgahoi.com" },
    { $set: { isAdmin: true } }
  )
  ```

### Issue: Frontend login only shows OTP
- Admin login requires password, not OTP
- Use API directly or add password login form to frontend

## Current Login Flow

1. **Regular Users**: OTP login (phone → OTP → verify)
2. **Admin Users**: Password login (email/phone → password → verify)

**Note:** The frontend `/login` page currently only supports OTP. Admin login should use the API directly or we need to add a password login option.

