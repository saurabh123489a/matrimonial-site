# Security Fixes Implementation Guide

## Quick Fixes for Critical Issues

### 1. Fix OTP Service (CRITICAL)

**File**: `backend/src/services/otpService.js`

```javascript
// Replace generateOTP function:
function generateOTP() {
  // Generate random 6-digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  console.log(`Generated OTP: ${otp} (Remove this log in production)`);
  return otp;
}

// Update sendOTP to use SMS service (future):
async sendOTP(phone) {
  // ... existing code ...
  
  // TODO: Integrate SMS service
  // For now, log OTP (REMOVE IN PRODUCTION)
  if (process.env.NODE_ENV === 'development') {
    console.log(`📱 OTP for ${cleanPhone}: ${code}`);
  }
  
  // In production, send via SMS:
  // await smsService.send(cleanPhone, `Your OTP is ${code}`);
  
  return {
    success: true,
    message: 'OTP sent successfully',
    // Remove otp from response in production
    ...(process.env.NODE_ENV === 'development' && { otp: code })
  };
}
```

### 2. Add Rate Limiting

**File**: `backend/src/server.js` or create `backend/src/middleware/rateLimiter.js`

```javascript
import rateLimit from 'express-rate-limit';

// OTP Rate Limiter
export const otpRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // 5 requests per hour
  message: 'Too many OTP requests, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
});

// Login Rate Limiter
export const loginRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 login attempts
  message: 'Too many login attempts, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
});

// General API Rate Limiter
export const apiRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per 15 minutes
  message: 'Too many requests, please try again later',
});
```

**Usage**: Apply to routes in `backend/src/routes/authRoutes.js`:
```javascript
import { otpRateLimiter, loginRateLimiter } from '../middleware/rateLimiter.js';

router.post('/otp/send', otpRateLimiter, sendOTP);
router.post('/login', loginRateLimiter, login);
```

### 3. Enhance Password Validation

**File**: `backend/src/utils/validation.js`

```javascript
export const registerSchema = z.object({
  // ... existing fields ...
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
  // ... rest of schema
});
```

### 4. Add Input Sanitization

**Install**: `npm install validator xss`

**File**: Create `backend/src/middleware/sanitize.js`

```javascript
import validator from 'validator';
import xss from 'xss';

export const sanitizeInput = (req, res, next) => {
  const sanitizeObject = (obj) => {
    for (const key in obj) {
      if (typeof obj[key] === 'string') {
        obj[key] = xss(validator.escape(obj[key]));
      } else if (typeof obj[key] === 'object' && obj[key] !== null) {
        sanitizeObject(obj[key]);
      }
    }
  };
  
  if (req.body) sanitizeObject(req.body);
  if (req.query) sanitizeObject(req.query);
  if (req.params) sanitizeObject(req.params);
  
  next();
};
```

**Usage**: Add to `backend/src/server.js` before routes:
```javascript
import { sanitizeInput } from './middleware/sanitize.js';
app.use(sanitizeInput);
```

### 5. Enhance File Upload Security

**File**: `backend/src/middleware/upload.js`

```javascript
import fileType from 'file-type';
import { promises as fs } from 'fs';
import path from 'path';

// Enhanced file filter
const fileFilter = async (req, file, cb) => {
  // Check extension
  const ext = path.extname(file.originalname).toLowerCase();
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  
  if (!allowedTypes.test(ext)) {
    return cb(new Error('Only image files are allowed!'));
  }
  
  // Check MIME type
  const allowedMimes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  if (!allowedMimes.includes(file.mimetype)) {
    return cb(new Error('Invalid file type!'));
  }
  
  cb(null, true);
};

// Add file content validation after upload
export const validateFileContent = async (req, res, next) => {
  if (!req.files || req.files.length === 0) {
    return next();
  }
  
  for (const file of req.files) {
    try {
      const fileInfo = await fileType.fromFile(file.path);
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      
      if (!fileInfo || !allowedTypes.includes(fileInfo.mime)) {
        await fs.unlink(file.path);
        return res.status(400).json({
          status: false,
          message: 'File content validation failed'
        });
      }
    } catch (error) {
      await fs.unlink(file.path);
      return res.status(400).json({
        status: false,
        message: 'File validation error'
      });
    }
  }
  
  next();
};
```

**Install**: `npm install file-type`

### 6. Add CSRF Protection

**Install**: `npm install csurf cookie-parser`

**File**: `backend/src/server.js`

```javascript
import csrf from 'csurf';
import cookieParser from 'cookie-parser';

app.use(cookieParser());
const csrfProtection = csrf({ 
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict'
  }
});

// Exclude GET requests and health checks
app.use((req, res, next) => {
  if (req.method === 'GET' || req.path === '/api/health') {
    return next();
  }
  csrfProtection(req, res, next);
});

// Add CSRF token endpoint
app.get('/api/csrf-token', (req, res) => {
  res.json({ csrfToken: req.csrfToken() });
});
```

### 7. Enhance JWT Security

**File**: `backend/src/services/authService.js`

```javascript
function signToken(userId) {
  const secret = process.env.JWT_SECRET;
  
  if (!secret || secret.length < 32) {
    throw new Error('JWT_SECRET must be at least 32 characters');
  }
  
  const expiresIn = process.env.JWT_EXPIRES_IN || '24h'; // Shorter default
  return jwt.sign(
    { 
      userId,
      type: 'access',
      iat: Math.floor(Date.now() / 1000)
    },
    secret,
    { 
      subject: String(userId),
      expiresIn,
      issuer: 'ekgahoi-api',
      audience: 'ekgahoi-app'
    }
  );
}
```

### 8. Add Environment Variable Validation

**File**: Create `backend/src/config/env.js`

```javascript
import dotenv from 'dotenv';
dotenv.config();

const requiredEnvVars = [
  'JWT_SECRET',
  'MONGODB_URI',
];

const validateEnv = () => {
  const missing = [];
  
  requiredEnvVars.forEach(varName => {
    if (!process.env[varName]) {
      missing.push(varName);
    }
  });
  
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
  
  // Validate JWT_SECRET strength
  if (process.env.JWT_SECRET && process.env.JWT_SECRET.length < 32) {
    throw new Error('JWT_SECRET must be at least 32 characters');
  }
  
  console.log('✅ Environment variables validated');
};

export default validateEnv;
```

**Usage**: Call in `backend/src/server.js` before starting:
```javascript
import validateEnv from './config/env.js';
validateEnv();
```

### 9. Session Revocation on Logout

**File**: Create `backend/src/controllers/authController.js` logout function:

```javascript
export const logout = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const token = req.headers.authorization?.substring(7);
    
    // Deactivate session
    if (token) {
      await sessionRepository.deactivateSessionByToken(token);
    }
    
    // Or deactivate all user sessions
    // await sessionRepository.deactivateAllUserSessions(userId);
    
    res.json({
      status: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    next(error);
  }
};
```

### 10. Add HTTPS Enforcement

**File**: `backend/src/server.js`

```javascript
// Add before app.listen
if (process.env.NODE_ENV === 'production') {
  app.use((req, res, next) => {
    if (req.header('x-forwarded-proto') !== 'https') {
      res.redirect(`https://${req.header('host')}${req.url}`);
    } else {
      next();
    }
  });
}
```

---

## Testing Checklist

After implementing fixes:

- [ ] OTP generates random codes
- [ ] Rate limiting works on auth endpoints
- [ ] Strong passwords are enforced
- [ ] File uploads validate content
- [ ] CSRF tokens work
- [ ] Sessions revoked on logout
- [ ] HTTPS redirects in production
- [ ] Environment validation fails on missing vars
- [ ] Input sanitization prevents XSS
- [ ] JWT tokens have proper claims

---

## Production Deployment Notes

1. **Never** log OTPs in production
2. **Never** include OTP in API responses
3. **Always** use HTTPS
4. **Always** validate environment variables
5. **Always** sanitize user inputs
6. **Always** validate file contents
7. **Always** rate limit auth endpoints
8. **Always** use strong JWT secrets (32+ chars)
9. **Always** hide error details in production
10. **Always** use environment-specific configs

