# OTP Response Format Documentation

## Overview
This document describes the response formats for the OTP (One-Time Password) authentication endpoints.

## Endpoints

### 1. Send OTP
**Endpoint:** `POST /api/auth/send-otp`  
**Request Body:**
```json
{
  "phone": "9876543210"
}
```

#### Success Response (200 OK)
```json
{
  "status": true,
  "message": "OTP sent successfully",
  "data": {
    "otp": "123456",  // Included only in development mode
    "message": "OTP sent to your phone number"
  }
}
```

#### Error Response - Missing Phone (400 Bad Request)
```json
{
  "status": false,
  "message": "Phone number is required"
}
```

#### Error Response - Invalid Phone (400 Bad Request)
```json
{
  "status": false,
  "message": "Invalid phone number"
}
```

---

### 2. Verify OTP
**Endpoint:** `POST /api/auth/verify-otp`  
**Request Body:**
```json
{
  "phone": "9876543210",
  "otp": "123456",
  "name": "John Doe",      // Optional - for new user registration
  "gender": "male"         // Optional - for new user registration (male/female/other)
}
```

#### Success Response (200 OK)
```json
{
  "status": true,
  "message": "OTP verified successfully",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI2NzEyMzQ1Njc4OWFiYyIsImlhdCI6MTY4NzY1NDMyMSwiZXhwIjoxNjg4MjU5MTIxfQ.xyz123...",
    "user": {
      "_id": "67123456789abc",
      "name": "John Doe",
      "phone": "9876543210",
      "email": null,
      "gender": "male",
      "age": null,
      "dateOfBirth": null,
      "city": null,
      "state": null,
      "country": null,
      "religion": null,
      "education": null,
      "occupation": null,
      "photos": [],
      "isActive": true,
      "isAdmin": false,
      "isProfileComplete": false,
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z"
    }
  }
}
```

#### Error Response - Missing Fields (400 Bad Request)
```json
{
  "status": false,
  "message": "Phone number and OTP code are required"
}
```

#### Error Response - Invalid OTP (401 Unauthorized)
```json
{
  "status": false,
  "message": "Invalid or expired OTP"
}
```

#### Error Response - Expired OTP (401 Unauthorized)
```json
{
  "status": false,
  "message": "Invalid or expired OTP"
}
```

---

## Response Fields Explanation

### Send OTP Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `status` | boolean | `true` if successful, `false` if error |
| `message` | string | Human-readable message |
| `data.otp` | string | OTP code (only in development mode, currently `"123456"`) |
| `data.message` | string | Additional message |

### Verify OTP Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `status` | boolean | `true` if successful, `false` if error |
| `message` | string | Human-readable message |
| `data.token` | string | JWT authentication token (use in `Authorization: Bearer <token>` header) |
| `data.user` | object | User object with profile information |

### User Object Fields (Partial - only key fields shown)

| Field | Type | Description |
|-------|------|-------------|
| `_id` | string | Unique user identifier |
| `name` | string | User's full name |
| `phone` | string | Phone number |
| `email` | string \| null | Email address (optional) |
| `gender` | string | Gender (male/female/other) |
| `isActive` | boolean | Account active status |
| `isAdmin` | boolean | Admin privileges |
| `isProfileComplete` | boolean | Profile completion status |
| `photos` | array | Array of photo objects |
| `createdAt` | string | Account creation timestamp (ISO 8601) |
| `updatedAt` | string | Last update timestamp (ISO 8601) |

---

## Current Implementation Details

### OTP Generation
- **Current:** Fixed OTP `"123456"` for all users (development mode)
- **Future:** Will generate random 6-digit OTP when SMS API is integrated
- **Default OTP:** `123456` (defined in `backend/src/services/otpService.js`)

### OTP Expiration
- **Duration:** 5 minutes from creation
- **Auto-cleanup:** Expired OTPs are automatically deleted from database

### OTP Validation
- **Format:** 6 digits only (`/^[0-9]{6}$/`)
- **Checks:**
  - OTP exists in database
  - OTP is not used (`isUsed: false`)
  - OTP is not expired (`expiresAt > current time`)

### User Creation
When verifying OTP for a new phone number:
- Creates new user automatically
- Requires `gender` field (defaults to `"male"` if not provided)
- `name` is optional (defaults to `"User <last4digits>"` if not provided)
- Sets `passwordHash` to empty string (OTP-only auth)
- Sets `isActive: true`
- Sets `isProfileComplete: false`

---

## Frontend Integration

### Example: Send OTP
```typescript
import { authApi } from '@/lib/api';

const response = await authApi.sendOTP('9876543210');
if (response.status) {
  console.log('OTP:', response.data?.otp); // "123456" in dev mode
  console.log('Message:', response.data?.message);
}
```

### Example: Verify OTP
```typescript
import { authApi } from '@/lib/api';
import { auth } from '@/lib/auth';

const response = await authApi.verifyOTP('9876543210', '123456', {
  name: 'John Doe',    // Optional
  gender: 'male'        // Optional
});

if (response.status) {
  // Save token
  auth.setToken(response.data.token);
  
  // Access user data
  const user = response.data.user;
  console.log('Logged in as:', user.name);
}
```

---

## Error Handling

### Common Error Scenarios

1. **Network Error**
   - Check backend server is running
   - Check CORS configuration
   - Check network connectivity

2. **400 Bad Request**
   - Missing required fields (`phone` or `otp`)
   - Invalid phone format (less than 10 digits)
   - Invalid gender value (must be `male`, `female`, or `other`)

3. **401 Unauthorized**
   - Invalid OTP code
   - Expired OTP (older than 5 minutes)
   - OTP already used

4. **500 Internal Server Error**
   - Database connection issues
   - Server-side error (check backend logs)

---

## Security Notes

1. **OTP in Response:** Currently included in development mode only. Will be removed when SMS API is integrated.

2. **Token Security:** JWT tokens should be stored securely (localStorage/sessionStorage) and sent in `Authorization` header for authenticated requests.

3. **OTP Reuse:** Once an OTP is verified, it's marked as used and cannot be reused.

4. **Rate Limiting:** Consider implementing rate limiting to prevent OTP spam/brute force attacks.

---

## Testing

### Using curl

```bash
# Send OTP
curl -X POST http://localhost:5000/api/auth/send-otp \
  -H "Content-Type: application/json" \
  -d '{"phone": "9876543210"}'

# Verify OTP
curl -X POST http://localhost:5000/api/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{"phone": "9876543210", "otp": "123456"}'

# Verify OTP with user data (new user)
curl -X POST http://localhost:5000/api/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{"phone": "9876543210", "otp": "123456", "name": "John Doe", "gender": "male"}'
```

### Using Postman/Insomnia
1. Set method to `POST`
2. Set URL to `http://localhost:5000/api/auth/send-otp` or `/verify-otp`
3. Set Headers: `Content-Type: application/json`
4. Set Body (raw JSON):
   ```json
   {
     "phone": "9876543210",
     "otp": "123456"
   }
   ```

---

## Future Enhancements

1. **SMS Integration:** Replace fixed OTP with real SMS delivery
2. **Rate Limiting:** Add rate limiting to prevent abuse
3. **OTP Resend:** Add resend OTP functionality with cooldown period
4. **Multiple OTPs:** Allow multiple valid OTPs per phone (optional)
5. **OTP History:** Track OTP send/verify history for security audit


