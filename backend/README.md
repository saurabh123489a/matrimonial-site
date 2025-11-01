# Matrimonial Backend API

Node.js + Express backend API for Matrimonial Android App with MongoDB database.

## 📁 Project Structure

```
backend/
├── src/
│   ├── config/          # Database configuration
│   ├── controllers/     # Request handlers
│   ├── middleware/      # Auth, error handling
│   ├── models/          # MongoDB schemas
│   ├── repositories/    # Data access layer
│   ├── routes/          # API routes
│   ├── services/        # Business logic
│   ├── utils/           # Validation, helpers
│   └── server.js        # Entry point
├── .env.example
├── package.json
└── README.md
```

## 🚀 Quick Start

### Installation

```bash
# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Edit .env with your MongoDB connection string
# MONGODB_URI=mongodb://localhost:27017/matrimonial
# Or MongoDB Atlas: mongodb+srv://user:pass@cluster.mongodb.net/matrimonial

# Start development server
npm run dev

# Start production server
npm start
```

## 📡 API Endpoints

### Base URL
```
http://localhost:5000/api
```

### User Profile CRUD Operations

#### 1. Create User Profile
```http
POST /api/users
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "9876543210",
  "password": "password123",
  "gender": "male",
  "age": 28,
  "city": "Mumbai",
  "religion": "Hindu"
}
```

**Response:**
```json
{
  "status": true,
  "message": "User profile created successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "age": 28,
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

#### 2. Get My Profile (Authenticated)
```http
GET /api/users/me
Authorization: Bearer <token>
```

#### 3. Get User Profile by ID
```http
GET /api/users/:id
```

#### 4. Update User Profile
```http
PUT /api/users/me
Authorization: Bearer <token>
Content-Type: application/json

{
  "city": "Delhi",
  "state": "Delhi",
  "education": "B.Tech",
  "occupation": "Software Engineer",
  "bio": "Looking for a life partner",
  "photos": [
    {
      "url": "https://example.com/photo1.jpg",
      "isPrimary": true,
      "order": 0
    }
  ],
  "preferences": {
    "minAge": 25,
    "maxAge": 35,
    "gender": "female",
    "religion": "Hindu"
  }
}
```

#### 5. Delete User Profile (Soft Delete)
```http
DELETE /api/users/me
Authorization: Bearer <token>
```

#### 6. Get All Users (with filters)
```http
GET /api/users?gender=female&minAge=25&maxAge=35&city=Mumbai&page=1&limit=20
```

**Query Parameters:**
- `gender`: male, female, other
- `minAge`: Minimum age
- `maxAge`: Maximum age
- `city`: City name (case-insensitive)
- `state`: State name (case-insensitive)
- `religion`: Religion (case-insensitive)
- `education`: Education level (case-insensitive)
- `page`: Page number (default: 1)
- `limit`: Results per page (default: 20)

**Response:**
```json
{
  "status": true,
  "message": "Users retrieved successfully",
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "pages": 8
  }
}
```

## 🔐 Authentication

All protected routes require JWT token in Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

## 📝 Response Format

All API responses follow this format:

**Success:**
```json
{
  "status": true,
  "message": "Success message",
  "data": { ... }
}
```

**Error:**
```json
{
  "status": false,
  "message": "Error message"
}
```

## 🛠️ Tech Stack

- **Runtime**: Node.js (ES Modules)
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose
- **Validation**: Zod
- **Authentication**: JWT
- **Security**: Helmet, CORS

## 📦 Dependencies

- `express`: Web framework
- `mongoose`: MongoDB ODM
- `jsonwebtoken`: JWT authentication
- `bcryptjs`: Password hashing
- `zod`: Schema validation
- `helmet`: Security headers
- `cors`: CORS middleware
- `morgan`: HTTP request logger

## 🌐 Environment Variables

Create `.env` file:

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/matrimonial
JWT_SECRET=your-secret-key-change-in-production
JWT_EXPIRES_IN=7d
ALLOWED_ORIGINS=http://localhost:3000,*
```

## 📱 Android Integration

See `ANDROID_INTEGRATION.md` for Retrofit examples and integration guide.

## 🚀 Deployment

See `DEPLOYMENT.md` for deployment steps on Render, Railway, or Hostinger.

