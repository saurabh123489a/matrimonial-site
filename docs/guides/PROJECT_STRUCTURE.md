# Project Structure

## Backend Folder Structure

```
backend/
├── src/
│   ├── config/
│   │   └── database.js           # MongoDB connection configuration
│   │
│   ├── controllers/
│   │   └── userController.js    # HTTP request handlers for user operations
│   │
│   ├── middleware/
│   │   ├── auth.js              # JWT authentication middleware
│   │   └── errorHandler.js      # Centralized error handling
│   │
│   ├── models/
│   │   └── User.js              # MongoDB User schema with all profile fields
│   │
│   ├── repositories/
│   │   └── userRepository.js    # Data access layer (Database queries)
│   │
│   ├── routes/
│   │   ├── index.js             # Main router (aggregates all routes)
│   │   └── userRoutes.js        # User profile routes
│   │
│   ├── services/
│   │   └── userService.js       # Business logic layer
│   │
│   ├── utils/
│   │   └── validation.js        # Zod validation schemas
│   │
│   └── server.js                 # Express server entry point
│
├── .env.example                  # Environment variables template
├── .gitignore
├── package.json
├── README.md                     # API documentation
└── API_EXAMPLES.md              # cURL and Postman examples
```

## Architecture Pattern: Controller → Service → Repository

### 1. **Repository Layer** (`repositories/`)
- **Purpose**: Direct database operations
- **Responsibility**: MongoDB queries, data persistence
- **Example**: `userRepository.findById()`, `userRepository.create()`

### 2. **Service Layer** (`services/`)
- **Purpose**: Business logic and validation
- **Responsibility**: Data transformation, business rules, error handling
- **Example**: Password hashing, age calculation, profile completeness check

### 3. **Controller Layer** (`controllers/`)
- **Purpose**: Handle HTTP requests/responses
- **Responsibility**: Parse request, call service, format response
- **Example**: `createUser()`, `getUserProfile()`, `updateUserProfile()`

### 4. **Routes** (`routes/`)
- **Purpose**: Define API endpoints
- **Responsibility**: Route definitions, middleware attachment
- **Example**: `POST /api/users`, `GET /api/users/:id`

## User Profile CRUD Endpoints

| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| POST | `/api/users` | No | Create new user profile |
| GET | `/api/users` | No | Get all users (with filters) |
| GET | `/api/users/me` | Yes | Get current user's profile |
| GET | `/api/users/:id` | No | Get user profile by ID |
| PUT | `/api/users/me` | Yes | Update current user's profile |
| PUT | `/api/users/:id` | Yes | Update user profile by ID |
| DELETE | `/api/users/me` | Yes | Delete current user's profile |
| DELETE | `/api/users/:id` | Yes | Delete user profile by ID |

## Key Features Implemented

✅ **User Model** with comprehensive profile fields:
- Basic info (name, email, phone, gender, age)
- Location (city, state, country, pincode)
- Physical attributes (height, weight)
- Family background (religion, caste, mother tongue)
- Education & career (education, occupation, income)
- Lifestyle (diet, smoking, drinking)
- Photos array
- Partner preferences

✅ **CRUD Operations**:
- Create user with password hashing
- Read user profiles (single and list)
- Update user profile with validation
- Soft delete (deactivate) user profile

✅ **Search & Filter**:
- Filter by gender, age range, city, state, religion, education
- Pagination support
- Case-insensitive text search

✅ **Validation**:
- Zod schema validation
- Email/phone format validation
- Duplicate email/phone check
- Age range validation (18-100)

✅ **Security**:
- Password hashing with bcrypt
- JWT authentication middleware
- Helmet security headers
- CORS configuration

✅ **Error Handling**:
- Centralized error handler
- Consistent JSON response format
- Detailed validation errors
- MongoDB error handling

## Next Steps

After user profile CRUD, you can add:
1. Authentication endpoints (login/register)
2. Interest & Shortlist module
3. Matching algorithm
4. File upload for photos
5. Search optimization with indexes

