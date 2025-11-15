# Matrimonial Site API Documentation

**Base URL:** `http://localhost:5050/api` (or your production URL)  
**API Version:** 1.0.0

## Table of Contents

1. [Authentication](#authentication)
2. [Users](#users)
3. [Interests](#interests)
4. [Shortlist](#shortlist)
5. [Messages](#messages)
6. [Notifications](#notifications)
7. [Profile Views](#profile-views)
8. [Photos](#photos)
9. [Community (Questions & Answers)](#community)
10. [Reports](#reports)
11. [Horoscope](#horoscope)
12. [Metadata](#metadata)
13. [Locations](#locations)
14. [Admin](#admin)
15. [Health](#health)
16. [Events](#events)
17. [Polls](#polls)
18. [Badges](#badges)
19. [Push Notifications](#push-notifications)

---

## Authentication

### Send OTP

Send OTP to phone number for authentication.

**Endpoint:** `POST /api/auth/send-otp`

**Request Body:**
```json
{
  "phone": "9876543210"
}
```

**Response:**
```json
{
  "status": true,
  "message": "OTP sent successfully",
  "data": {
    "phone": "9876543210",
    "expiresAt": "2024-01-15T10:35:00.000Z"
  }
}
```

---

### Verify OTP

Verify OTP and get authentication token.

**Endpoint:** `POST /api/auth/verify-otp`

**Request Body:**
```json
{
  "phone": "9876543210",
  "otp": "123456"
}
```

**Response:**
```json
{
  "status": true,
  "message": "OTP verified successfully",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "_id": "65a1b2c3d4e5f6g7h8i9j0k1",
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "9876543210"
    }
  }
}
```

---

### Login (Legacy)

Password-based login (optional, for backward compatibility).

**Endpoint:** `POST /api/auth/login`

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "status": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": { ... }
  }
}
```

---

### Logout

Logout current user.

**Endpoint:** `POST /api/auth/logout`

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "status": true,
  "message": "Logged out successfully"
}
```

---

### Change Password

Change user password.

**Endpoint:** `POST /api/auth/change-password`

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "currentPassword": "oldpassword123",
  "newPassword": "newpassword123"
}
```

**Response:**
```json
{
  "status": true,
  "message": "Password changed successfully"
}
```

---

## Users

### Create User

Register a new user profile.

**Endpoint:** `POST /api/users`

**Request Body:**
```json
{
  "name": "Priya Sharma",
  "email": "priya@example.com",
  "phone": "9876543210",
  "password": "password123",
  "gender": "female",
  "age": 26,
  "dateOfBirth": "1998-05-15",
  "city": "Mumbai",
  "state": "Maharashtra",
  "country": "India",
  "education": "B.Tech",
  "occupation": "Software Engineer"
}
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
    "phone": "9876543210",
    "gender": "female",
    "age": 26,
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
}
```

---

### Get All Users

Get paginated list of users with filters.

**Endpoint:** `GET /api/users`

**Query Parameters:**
- `page` (number, default: 1) - Page number
- `limit` (number, default: 20, max: 100) - Results per page
- `gender` (string) - Filter by gender: "male", "female", "other"
- `minAge` (number) - Minimum age
- `maxAge` (number) - Maximum age
- `city` (string) - Filter by city
- `state` (string) - Filter by state
- `country` (string) - Filter by country
- `education` (string) - Filter by education
- `occupation` (string) - Filter by occupation
- `maritalStatus` (string) - Filter by marital status
- `minHeight` (number) - Minimum height in inches
- `maxHeight` (number) - Maximum height in inches
- `gahoiId` (string) - Search by Gahoi ID

**Headers (Optional):**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "status": true,
  "data": [
    {
      "_id": "65a1b2c3d4e5f6g7h8i9j0k1",
      "name": "Priya Sharma",
      "age": 26,
      "gender": "female",
      "city": "Mumbai",
      "photos": [...],
      "gahoiId": 10001
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "pages": 8
  }
}
```

---

### Get My Profile

Get authenticated user's profile.

**Endpoint:** `GET /api/users/me`

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "status": true,
  "data": {
    "_id": "65a1b2c3d4e5f6g7h8i9j0k1",
    "name": "Priya Sharma",
    "email": "priya@example.com",
    "phone": "9876543210",
    "gender": "female",
    "age": 26,
    "bio": "Software engineer passionate about technology",
    "photos": [...],
    "education": "B.Tech",
    "occupation": "Software Engineer",
    "family": {...},
    "horoscopeDetails": {...},
    "preferences": {...}
  }
}
```

---

### Get User Profile by ID

Get specific user profile by ID or Gahoi ID.

**Endpoint:** `GET /api/users/:id`

**Parameters:**
- `id` - User ID or Gahoi ID

**Response:**
```json
{
  "status": true,
  "data": {
    "_id": "65a1b2c3d4e5f6g7h8i9j0k1",
    "name": "Priya Sharma",
    "age": 26,
    "gender": "female",
    "bio": "Software engineer...",
    "photos": [...]
  }
}
```

---

### Update My Profile

Update authenticated user's profile.

**Endpoint:** `PUT /api/users/me`

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "bio": "Updated bio text",
  "height": 66,
  "weight": 55,
  "education": "M.Tech",
  "occupation": "Senior Software Engineer",
  "city": "Pune",
  "state": "Maharashtra",
  "family": {
    "fathersName": "Rajesh Sharma",
    "mothersName": "Sunita Sharma"
  },
  "horoscopeDetails": {
    "rashi": "Cancer",
    "nakshatra": "Pushya",
    "starSign": "Cancer"
  }
}
```

**Note:** `name` and `phone` fields are non-editable and will be ignored if sent.

**Response:**
```json
{
  "status": true,
  "message": "Profile updated successfully",
  "data": {
    "_id": "65a1b2c3d4e5f6g7h8i9j0k1",
    "bio": "Updated bio text",
    ...
  }
}
```

---

### Delete My Profile

Delete authenticated user's profile (soft delete).

**Endpoint:** `DELETE /api/users/me`

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "status": true,
  "message": "Profile deleted successfully"
}
```

---

## Interests

### Send Interest

Send interest to another user.

**Endpoint:** `POST /api/interests/send`

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "targetUserId": "65a1b2c3d4e5f6g7h8i9j0k2",
  "message": "Hi, I'm interested in connecting with you."
}
```

**Response:**
```json
{
  "status": true,
  "message": "Interest sent successfully",
  "data": {
    "_id": "65a1b2c3d4e5f6g7h8i9j0k3",
    "fromUserId": "65a1b2c3d4e5f6g7h8i9j0k1",
    "targetUserId": "65a1b2c3d4e5f6g7h8i9j0k2",
    "status": "pending",
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
}
```

---

### Respond to Interest

Accept or reject an interest request.

**Endpoint:** `POST /api/interests/respond`

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "interestId": "65a1b2c3d4e5f6g7h8i9j0k3",
  "response": "accepted"
}
```

**Response Values:** `"accepted"` or `"rejected"`

**Response:**
```json
{
  "status": true,
  "message": "Interest response updated",
  "data": {
    "_id": "65a1b2c3d4e5f6g7h8i9j0k3",
    "status": "accepted",
    "respondedAt": "2024-01-15T11:00:00.000Z"
  }
}
```

---

### Get Incoming Interests

Get list of interests received by authenticated user.

**Endpoint:** `GET /api/interests/incoming`

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `page` (number, default: 1)
- `limit` (number, default: 20)
- `status` (string) - Filter by status: "pending", "accepted", "rejected"

**Response:**
```json
{
  "status": true,
  "data": [
    {
      "_id": "65a1b2c3d4e5f6g7h8i9j0k3",
      "fromUser": {
        "_id": "65a1b2c3d4e5f6g7h8i9j0k1",
        "name": "John Doe",
        "photos": [...]
      },
      "status": "pending",
      "message": "Hi, I'm interested...",
      "createdAt": "2024-01-15T10:30:00.000Z"
    }
  ],
  "pagination": {...}
}
```

---

### Get Outgoing Interests

Get list of interests sent by authenticated user.

**Endpoint:** `GET /api/interests/outgoing`

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `page` (number, default: 1)
- `limit` (number, default: 20)
- `status` (string) - Filter by status

**Response:**
```json
{
  "status": true,
  "data": [
    {
      "_id": "65a1b2c3d4e5f6g7h8i9j0k3",
      "targetUser": {
        "_id": "65a1b2c3d4e5f6g7h8i9j0k2",
        "name": "Priya Sharma",
        "photos": [...]
      },
      "status": "pending",
      "message": "Hi, I'm interested...",
      "createdAt": "2024-01-15T10:30:00.000Z"
    }
  ],
  "pagination": {...}
}
```

---

## Shortlist

### Add to Shortlist

Add a user to shortlist.

**Endpoint:** `POST /api/shortlist/add`

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "shortlistedUserId": "65a1b2c3d4e5f6g7h8i9j0k2"
}
```

**Response:**
```json
{
  "status": true,
  "message": "User added to shortlist",
  "data": {
    "_id": "65a1b2c3d4e5f6g7h8i9j0k4",
    "userId": "65a1b2c3d4e5f6g7h8i9j0k1",
    "shortlistedUserId": "65a1b2c3d4e5f6g7h8i9j0k2",
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
}
```

---

### Remove from Shortlist

Remove a user from shortlist.

**Endpoint:** `DELETE /api/shortlist/remove/:shortlistedUserId`

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "status": true,
  "message": "User removed from shortlist"
}
```

---

### Get Shortlist

Get authenticated user's shortlist.

**Endpoint:** `GET /api/shortlist`

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `page` (number, default: 1)
- `limit` (number, default: 20)

**Response:**
```json
{
  "status": true,
  "data": [
    {
      "_id": "65a1b2c3d4e5f6g7h8i9j0k4",
      "shortlistedUser": {
        "_id": "65a1b2c3d4e5f6g7h8i9j0k2",
        "name": "Priya Sharma",
        "photos": [...]
      },
      "createdAt": "2024-01-15T10:30:00.000Z"
    }
  ],
  "pagination": {...}
}
```

---

### Check if Shortlisted

Check if a user is in authenticated user's shortlist.

**Endpoint:** `GET /api/shortlist/check/:shortlistedUserId`

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "status": true,
  "data": {
    "isShortlisted": true
  }
}
```

---

## Messages

### Send Message

Send a message to another user.

**Endpoint:** `POST /api/messages/send`

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "recipientId": "65a1b2c3d4e5f6g7h8i9j0k2",
  "content": "Hello, how are you?"
}
```

**Response:**
```json
{
  "status": true,
  "message": "Message sent successfully",
  "data": {
    "_id": "65a1b2c3d4e5f6g7h8i9j0k5",
    "senderId": "65a1b2c3d4e5f6g7h8i9j0k1",
    "recipientId": "65a1b2c3d4e5f6g7h8i9j0k2",
    "content": "Hello, how are you?",
    "read": false,
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
}
```

---

### Get Conversations

Get list of all conversations for authenticated user.

**Endpoint:** `GET /api/messages/conversations`

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `page` (number, default: 1)
- `limit` (number, default: 20)

**Response:**
```json
{
  "status": true,
  "data": [
    {
      "userId": "65a1b2c3d4e5f6g7h8i9j0k2",
      "user": {
        "name": "Priya Sharma",
        "photos": [...]
      },
      "lastMessage": {
        "content": "Hello, how are you?",
        "createdAt": "2024-01-15T10:30:00.000Z"
      },
      "unreadCount": 2
    }
  ],
  "pagination": {...}
}
```

---

### Get Conversation

Get messages in a conversation with a specific user.

**Endpoint:** `GET /api/messages/conversation/:userId`

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `page` (number, default: 1)
- `limit` (number, default: 50)

**Response:**
```json
{
  "status": true,
  "data": {
    "userId": "65a1b2c3d4e5f6g7h8i9j0k2",
    "user": {
      "name": "Priya Sharma",
      "photos": [...]
    },
    "messages": [
      {
        "_id": "65a1b2c3d4e5f6g7h8i9j0k5",
        "senderId": "65a1b2c3d4e5f6g7h8i9j0k1",
        "content": "Hello, how are you?",
        "read": true,
        "createdAt": "2024-01-15T10:30:00.000Z"
      }
    ],
    "pagination": {...}
  }
}
```

---

### Mark Conversation as Read

Mark all messages in a conversation as read.

**Endpoint:** `POST /api/messages/conversation/:userId/read`

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "status": true,
  "message": "Conversation marked as read"
}
```

---

## Notifications

### Get Notifications

Get notifications for authenticated user.

**Endpoint:** `GET /api/notifications`

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `page` (number, default: 1)
- `limit` (number, default: 20)
- `isRead` (boolean) - Filter by read status

**Response:**
```json
{
  "status": true,
  "data": [
    {
      "_id": "65a1b2c3d4e5f6g7h8i9j0k6",
      "type": "interest_received",
      "title": "New Interest Received",
      "message": "John Doe sent you an interest",
      "isRead": false,
      "createdAt": "2024-01-15T10:30:00.000Z"
    }
  ],
  "pagination": {...}
}
```

---

### Get Unread Count

Get count of unread notifications.

**Endpoint:** `GET /api/notifications/unread-count`

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "status": true,
  "data": {
    "count": 5
  }
}
```

---

### Mark Notification as Read

Mark a specific notification as read.

**Endpoint:** `PUT /api/notifications/:id/read`

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "status": true,
  "message": "Notification marked as read"
}
```

---

### Mark All Notifications as Read

Mark all notifications as read.

**Endpoint:** `PUT /api/notifications/read-all`

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "status": true,
  "message": "All notifications marked as read"
}
```

---

### Delete Notification

Delete a specific notification.

**Endpoint:** `DELETE /api/notifications/:id`

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "status": true,
  "message": "Notification deleted"
}
```

---

## Profile Views

### Get Profile Views

Get list of users who viewed authenticated user's profile.

**Endpoint:** `GET /api/profile-views`

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `page` (number, default: 1)
- `limit` (number, default: 20)

**Response:**
```json
{
  "status": true,
  "data": [
    {
      "_id": "65a1b2c3d4e5f6g7h8i9j0k7",
      "viewer": {
        "_id": "65a1b2c3d4e5f6g7h8i9j0k2",
        "name": "Priya Sharma",
        "photos": [...]
      },
      "viewedAt": "2024-01-15T10:30:00.000Z"
    }
  ],
  "pagination": {...}
}
```

---

## Photos

### Upload Photo

Upload a profile photo.

**Endpoint:** `POST /api/photos/upload`

**Headers:**
```
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Request Body (Form Data):**
- `photo` (file) - Image file
- `isPrimary` (boolean, optional) - Set as primary photo
- `order` (number, optional) - Display order

**Response:**
```json
{
  "status": true,
  "message": "Photo uploaded successfully",
  "data": {
    "_id": "65a1b2c3d4e5f6g7h8i9j0k8",
    "url": "/uploads/photos/photo123.jpg",
    "isPrimary": true,
    "order": 0
  }
}
```

---

### Delete Photo

Delete a photo.

**Endpoint:** `DELETE /api/photos/:photoId`

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "status": true,
  "message": "Photo deleted successfully"
}
```

---

### Set Primary Photo

Set a photo as primary.

**Endpoint:** `PUT /api/photos/:photoId/primary`

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "status": true,
  "message": "Primary photo updated"
}
```

---

## Community

### Get Questions

Get list of community questions.

**Endpoint:** `GET /api/questions`

**Query Parameters:**
- `page` (number, default: 1)
- `limit` (number, default: 20)
- `sortBy` (string) - Sort by: "createdAt", "upvotes", "answersCount", "views"
- `search` (string) - Search query

**Response:**
```json
{
  "status": true,
  "data": [
    {
      "_id": "65a1b2c3d4e5f6g7h8i9j0k9",
      "title": "How to approach parents about marriage?",
      "content": "I want to discuss marriage with my parents...",
      "author": {
        "_id": "65a1b2c3d4e5f6g7h8i9j0k1",
        "name": "John Doe"
      },
      "upvotes": 10,
      "answersCount": 5,
      "views": 100,
      "createdAt": "2024-01-15T10:30:00.000Z"
    }
  ],
  "pagination": {...}
}
```

---

### Create Question

Create a new question.

**Endpoint:** `POST /api/questions`

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "title": "How to approach parents about marriage?",
  "content": "I want to discuss marriage with my parents but don't know how to start..."
}
```

**Response:**
```json
{
  "status": true,
  "message": "Question created successfully",
  "data": {
    "_id": "65a1b2c3d4e5f6g7h8i9j0k9",
    "title": "How to approach parents about marriage?",
    "content": "...",
    "author": "65a1b2c3d4e5f6g7h8i9j0k1",
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
}
```

---

### Get Question by ID

Get a specific question with answers.

**Endpoint:** `GET /api/questions/:id`

**Response:**
```json
{
  "status": true,
  "data": {
    "_id": "65a1b2c3d4e5f6g7h8i9j0k9",
    "title": "How to approach parents about marriage?",
    "content": "...",
    "author": {...},
    "answers": [...],
    "upvotes": 10,
    "views": 100
  }
}
```

---

### Upvote Question

Upvote a question.

**Endpoint:** `POST /api/questions/:id/upvote`

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "status": true,
  "message": "Question upvoted",
  "data": {
    "upvotes": 11
  }
}
```

---

### Add Answer

Add an answer to a question.

**Endpoint:** `POST /api/answers`

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "questionId": "65a1b2c3d4e5f6g7h8i9j0k9",
  "content": "I think you should start by having an open conversation..."
}
```

**Response:**
```json
{
  "status": true,
  "message": "Answer added successfully",
  "data": {
    "_id": "65a1b2c3d4e5f6g7h8i9j0ka",
    "questionId": "65a1b2c3d4e5f6g7h8i9j0k9",
    "content": "...",
    "author": "65a1b2c3d4e5f6g7h8i9j0k1",
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
}
```

---

## Reports

### Report User

Report/flag a user profile.

**Endpoint:** `POST /api/reports`

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "reportedUserId": "65a1b2c3d4e5f6g7h8i9j0k2",
  "reason": "inappropriate_content",
  "description": "User has posted inappropriate photos"
}
```

**Response:**
```json
{
  "status": true,
  "message": "Report submitted successfully"
}
```

---

## Horoscope

### Get Horoscope Details

Get horoscope details for a user.

**Endpoint:** `GET /api/horoscope/:userId`

**Response:**
```json
{
  "status": true,
  "data": {
    "rashi": "Cancer",
    "nakshatra": "Pushya",
    "starSign": "Cancer",
    "timeOfBirth": "10:30 AM"
  }
}
```

---

### Calculate Horoscope Match

Calculate horoscope compatibility between two users.

**Endpoint:** `POST /api/horoscope/match`

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "userId1": "65a1b2c3d4e5f6g7h8i9j0k1",
  "userId2": "65a1b2c3d4e5f6g7h8i9j0k2"
}
```

**Response:**
```json
{
  "status": true,
  "data": {
    "matchScore": 85,
    "compatibility": "high",
    "details": {
      "rashiMatch": true,
      "nakshatraMatch": false,
      "starSignMatch": true
    }
  }
}
```

---

## Metadata

### Get Education Options

Get list of education options.

**Endpoint:** `GET /api/meta/education`

**Response:**
```json
{
  "status": true,
  "data": [
    { "value": "high-school", "label": "High School" },
    { "value": "bachelor", "label": "Bachelor's Degree" },
    { "value": "master", "label": "Master's Degree" }
  ]
}
```

---

### Get Occupation Options

Get list of occupation options.

**Endpoint:** `GET /api/meta/occupation`

**Query Parameters:**
- `gender` (string, optional) - Filter by gender

**Response:**
```json
{
  "status": true,
  "data": [
    { "value": "software-engineer", "label": "Software Engineer" },
    { "value": "doctor", "label": "Doctor" },
    { "value": "teacher", "label": "Teacher" }
  ]
}
```

---

### Get Profession Options

Get list of profession options.

**Endpoint:** `GET /api/meta/profession`

**Response:**
```json
{
  "status": true,
  "data": [
    { "value": "engineering", "label": "Engineering" },
    { "value": "medical", "label": "Medical" },
    { "value": "teaching", "label": "Teaching" }
  ]
}
```

---

### Get Salary Options

Get list of salary range options.

**Endpoint:** `GET /api/meta/salary`

**Response:**
```json
{
  "status": true,
  "data": [
    { "value": "0-5", "label": "0-5 Lakhs" },
    { "value": "5-10", "label": "5-10 Lakhs" },
    { "value": "10-20", "label": "10-20 Lakhs" }
  ]
}
```

---

## Locations

### Get Countries

Get list of countries.

**Endpoint:** `GET /api/locations/countries`

**Response:**
```json
{
  "status": true,
  "data": [
    { "code": "IN", "name": "India" },
    { "code": "US", "name": "United States" }
  ]
}
```

---

### Get States

Get list of states for a country.

**Endpoint:** `GET /api/locations/states`

**Query Parameters:**
- `country` (string, required) - Country code

**Response:**
```json
{
  "status": true,
  "data": [
    { "code": "MH", "name": "Maharashtra" },
    { "code": "KA", "name": "Karnataka" }
  ]
}
```

---

### Get Cities

Get list of cities for a state.

**Endpoint:** `GET /api/locations/cities`

**Query Parameters:**
- `state` (string, required) - State code
- `country` (string, required) - Country code

**Response:**
```json
{
  "status": true,
  "data": [
    { "code": "MUM", "name": "Mumbai" },
    { "code": "PUN", "name": "Pune" }
  ]
}
```

---

## Admin

All admin routes require authentication and admin privileges.

### Get Dashboard Stats

Get admin dashboard statistics.

**Endpoint:** `GET /api/admin/dashboard/stats`

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Response:**
```json
{
  "status": true,
  "data": {
    "totalUsers": 1500,
    "activeUsers": 1200,
    "totalInterests": 5000,
    "totalMessages": 10000,
    "recentRegistrations": 50
  }
}
```

---

### Send Global Notification

Send notification to all users.

**Endpoint:** `POST /api/admin/notifications/global`

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Request Body:**
```json
{
  "title": "System Maintenance",
  "message": "The site will be under maintenance on Sunday",
  "type": "admin"
}
```

**Response:**
```json
{
  "status": true,
  "message": "Global notification sent"
}
```

---

### Send Personal Notification

Send notification to a specific user.

**Endpoint:** `POST /api/admin/notifications/personal`

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Request Body:**
```json
{
  "userId": "65a1b2c3d4e5f6g7h8i9j0k1",
  "title": "Profile Verification",
  "message": "Your profile has been verified",
  "type": "admin"
}
```

**Response:**
```json
{
  "status": true,
  "message": "Personal notification sent"
}
```

---

### Get All Users (Admin)

Get all users with admin filters.

**Endpoint:** `GET /api/admin/users`

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Query Parameters:**
- `page` (number, default: 1)
- `limit` (number, default: 20)
- `isActive` (boolean) - Filter by active status
- `isAdmin` (boolean) - Filter by admin status

**Response:**
```json
{
  "status": true,
  "data": [
    {
      "_id": "65a1b2c3d4e5f6g7h8i9j0k1",
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "9876543210",
      "isActive": true,
      "isAdmin": false,
      "createdAt": "2024-01-15T10:30:00.000Z"
    }
  ],
  "pagination": {...}
}
```

---

### Update User (Admin)

Update user details (admin only).

**Endpoint:** `PATCH /api/admin/users/:id`

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Request Body:**
```json
{
  "isActive": false,
  "isAdmin": true
}
```

**Note:** `name` and `phone` fields are non-editable even for admins.

**Response:**
```json
{
  "status": true,
  "message": "User updated successfully"
}
```

---

### Delete User (Admin)

Delete a user (admin only).

**Endpoint:** `DELETE /api/admin/users/:id`

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Response:**
```json
{
  "status": true,
  "message": "User deleted successfully"
}
```

---

### Create Admin User

Create a new admin user.

**Endpoint:** `POST /api/admin/users/create-admin`

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Request Body:**
```json
{
  "name": "Admin User",
  "email": "admin@example.com",
  "phone": "9876543210",
  "password": "adminpassword123"
}
```

**Response:**
```json
{
  "status": true,
  "message": "Admin user created successfully",
  "data": {
    "_id": "65a1b2c3d4e5f6g7h8i9j0kb",
    "name": "Admin User",
    "email": "admin@example.com",
    "isAdmin": true
  }
}
```

---

### Get All Messages (Admin)

Get all messages (admin only).

**Endpoint:** `GET /api/admin/messages`

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Query Parameters:**
- `page` (number, default: 1)
- `limit` (number, default: 20)

**Response:**
```json
{
  "status": true,
  "data": [
    {
      "_id": "65a1b2c3d4e5f6g7h8i9j0k5",
      "sender": {...},
      "recipient": {...},
      "content": "Message content",
      "createdAt": "2024-01-15T10:30:00.000Z"
    }
  ],
  "pagination": {...}
}
```

---

### Get Login Logs

Get login logs (admin only).

**Endpoint:** `GET /api/admin/login-logs`

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Query Parameters:**
- `page` (number, default: 1)
- `limit` (number, default: 20)
- `userId` (string, optional) - Filter by user ID

**Response:**
```json
{
  "status": true,
  "data": [
    {
      "_id": "65a1b2c3d4e5f6g7h8i9j0kc",
      "userId": "65a1b2c3d4e5f6g7h8i9j0k1",
      "ipAddress": "192.168.1.1",
      "userAgent": "Mozilla/5.0...",
      "loginAt": "2024-01-15T10:30:00.000Z"
    }
  ],
  "pagination": {...}
}
```

---

## Health

### Health Check

Check API health status.

**Endpoint:** `GET /api/health`

**Response:**
```json
{
  "status": true,
  "message": "API is healthy",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "uptime": 3600
}
```

---

## Events

### Get Events

Get list of community events.

**Endpoint:** `GET /api/events`

**Query Parameters:**
- `page` (number, default: 1)
- `limit` (number, default: 20)

**Response:**
```json
{
  "status": true,
  "data": [
    {
      "_id": "65a1b2c3d4e5f6g7h8i9j0kd",
      "title": "Community Meetup",
      "description": "Join us for a community gathering",
      "date": "2024-02-15T18:00:00.000Z",
      "location": "Mumbai",
      "createdAt": "2024-01-15T10:30:00.000Z"
    }
  ],
  "pagination": {...}
}
```

---

## Polls

### Get Polls

Get list of polls.

**Endpoint:** `GET /api/polls`

**Query Parameters:**
- `page` (number, default: 1)
- `limit` (number, default: 20)

**Response:**
```json
{
  "status": true,
  "data": [
    {
      "_id": "65a1b2c3d4e5f6g7h8i9j0ke",
      "question": "What's your preferred wedding location?",
      "options": ["Mumbai", "Delhi", "Bangalore"],
      "createdAt": "2024-01-15T10:30:00.000Z"
    }
  ],
  "pagination": {...}
}
```

---

## Badges

### Get User Badges

Get badges earned by authenticated user.

**Endpoint:** `GET /api/badges`

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "status": true,
  "data": [
    {
      "_id": "65a1b2c3d4e5f6g7h8i9j0kf",
      "name": "Profile Complete",
      "description": "Completed your profile",
      "icon": "badge-icon.png",
      "earnedAt": "2024-01-15T10:30:00.000Z"
    }
  ]
}
```

---

## Push Notifications

### Register Push Subscription

Register device for push notifications.

**Endpoint:** `POST /api/push/subscribe`

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "endpoint": "https://fcm.googleapis.com/...",
  "keys": {
    "p256dh": "...",
    "auth": "..."
  }
}
```

**Response:**
```json
{
  "status": true,
  "message": "Push subscription registered"
}
```

---

### Unregister Push Subscription

Unregister device from push notifications.

**Endpoint:** `POST /api/push/unsubscribe`

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "endpoint": "https://fcm.googleapis.com/..."
}
```

**Response:**
```json
{
  "status": true,
  "message": "Push subscription removed"
}
```

---

## Error Responses

All endpoints may return error responses in the following format:

### Validation Error (400)
```json
{
  "status": false,
  "message": "Validation error",
  "errors": [
    {
      "path": ["email"],
      "message": "Invalid email format"
    }
  ]
}
```

### Unauthorized (401)
```json
{
  "status": false,
  "message": "Unauthorized. Please login."
}
```

### Forbidden (403)
```json
{
  "status": false,
  "message": "Access denied. Admin privileges required."
}
```

### Not Found (404)
```json
{
  "status": false,
  "message": "Resource not found"
}
```

### Server Error (500)
```json
{
  "status": false,
  "message": "Internal server error"
}
```

---

## Authentication

Most endpoints require authentication using JWT tokens. Include the token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

Tokens are obtained through:
- `/api/auth/verify-otp` - OTP verification
- `/api/auth/login` - Password login

---

## Rate Limiting

API requests are rate-limited to prevent abuse:
- Default: 100 requests per 15 minutes per IP
- Authenticated users: 200 requests per 15 minutes
- Admin users: 500 requests per 15 minutes

---

## Pagination

Endpoints that return lists support pagination:

**Query Parameters:**
- `page` (number, default: 1) - Page number (1-indexed)
- `limit` (number, default: 20, max: 100) - Items per page

**Response Format:**
```json
{
  "status": true,
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "pages": 8
  }
}
```

---

## File Uploads

For photo uploads, use `multipart/form-data` content type:

```bash
curl -X POST http://localhost:5050/api/photos/upload \
  -H "Authorization: Bearer <token>" \
  -F "photo=@/path/to/image.jpg" \
  -F "isPrimary=true"
```

---

## Notes

1. **Non-editable Fields**: `name` and `phone` fields cannot be edited through the API, even by admins.

2. **Phone Number Format**: Phone numbers should be 10 digits (Indian format).

3. **Date Formats**: All dates are in ISO 8601 format (YYYY-MM-DDTHH:mm:ss.sssZ).

4. **Image Formats**: Supported image formats: JPG, JPEG, PNG. Maximum file size: 5MB.

5. **CORS**: CORS is configured for allowed origins. Check environment variables for allowed origins.

---

## Support

For API support or issues, please contact the development team.

**Last Updated:** January 2024

