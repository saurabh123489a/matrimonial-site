# API Usage Examples

Complete examples for testing the User Profile CRUD APIs.

## Test with cURL

### 1. Create User Profile

```bash
curl -X POST http://localhost:5000/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Priya Sharma",
    "email": "priya@example.com",
    "phone": "9876543210",
    "password": "password123",
    "gender": "female",
    "age": 26,
    "city": "Mumbai",
    "state": "Maharashtra",
    "religion": "Hindu",
    "education": "B.Tech",
    "occupation": "Software Engineer"
  }'
```

**Response:**
```json
{
  "status": true,
  "message": "User profile created successfully",
  "data": {
    "_id": "65a1b2c3d4e5f6g7h8i9j0k1",
    "name": "Priya Sharma",
    "email": "priya@example.com",
    "age": 26,
    "city": "Mumbai",
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
}
```

### 2. Get User Profile by ID

```bash
curl -X GET http://localhost:5000/api/users/65a1b2c3d4e5f6g7h8i9j0k1
```

### 3. Get All Users with Filters

```bash
curl -X GET "http://localhost:5000/api/users?gender=female&minAge=25&maxAge=30&city=Mumbai&page=1&limit=10"
```

### 4. Update User Profile

First, get a JWT token from login (will be added in auth module), then:

```bash
curl -X PUT http://localhost:5000/api/users/me \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "bio": "Looking for a life partner who shares similar values",
    "photos": [
      {
        "url": "https://example.com/photos/priya1.jpg",
        "isPrimary": true,
        "order": 0
      }
    ],
    "preferences": {
      "minAge": 28,
      "maxAge": 35,
      "gender": "male",
      "religion": "Hindu",
      "education": "Graduate"
    }
  }'
```

### 5. Delete User Profile

```bash
curl -X DELETE http://localhost:5000/api/users/me \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Test with Postman

1. Import the following collection:

```json
{
  "info": {
    "name": "Matrimonial API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Create User",
      "request": {
        "method": "POST",
        "header": [
          {
            "key": "Content-Type",
            "value": "application/json"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"name\": \"Test User\",\n  \"email\": \"test@example.com\",\n  \"password\": \"test123\",\n  \"gender\": \"male\",\n  \"age\": 30\n}"
        },
        "url": {
          "raw": "{{base_url}}/api/users",
          "host": ["{{base_url}}"],
          "path": ["api", "users"]
        }
      }
    }
  ]
}
```

## Response Format

All APIs return responses in this format:

**Success Response:**
```json
{
  "status": true,
  "message": "Success message",
  "data": { ... }
}
```

**Error Response:**
```json
{
  "status": false,
  "message": "Error message"
}
```

**Validation Error:**
```json
{
  "status": false,
  "message": "Validation error",
  "errors": [
    {
      "path": ["email"],
      "message": "Invalid email"
    }
  ]
}
```

