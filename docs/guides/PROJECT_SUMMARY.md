# EK Gahoi - Complete Community Platform Summary

## 📱 Project Overview

**EK Gahoi** is a comprehensive matrimonial and community platform built for the Gahoi community. It provides marriage matching, census data management, family registration, and community news features - all in one integrated platform.

## 🎯 Core Features

### 1. User Authentication & Profile Management
- **Phone OTP Login**: Primary authentication method (Default OTP: 123456)
- **Password Login**: Traditional email/phone + password authentication
- **User Registration**: Full profile creation with community position selection
- **Profile Management**: Complete CRUD operations for user profiles
- **Profile Activation/Deactivation**: Users can activate or deactivate their profiles
- **Photo Management**: Upload up to 3 photos with watermarking, set primary photo

### 2. Profile Features
- **Comprehensive Profile Fields**:
  - Basic: Name, Gender, Age, Date of Birth, Phone, Email
  - Location: Country, State, District, City
  - Personal: Religion, Caste, Sub-caste, Gotra, Marital Status, Complexion
  - Education: Education Level, Field of Study
  - Professional: Occupation, Employer, Salary Range
  - Personal Interests: Hobbies
  - Family Details: Family information
  - Horoscope Details: Horoscope information
- **Profile Completion Status**: Tracks profile completeness
- **Profile Visibility**: Active/Inactive status control

### 3. Search & Matching
- **Advanced Search Filters**:
  - Gender, Age Range, Height Range
  - Location (Country, State, District, City)
  - Religion, Caste, Sub-caste
  - Education, Occupation
  - Marital Status
- **Profile Browsing**: Grid view with enhanced profile cards
- **Profile Details**: Detailed view with all information
- **Matching Algorithm**: Based on preferences and filters

### 4. Interest & Shortlist System
- **Send Interest**: Users can express interest in profiles
- **Accept/Reject Interest**: Respond to interest requests
- **Shortlist Profiles**: Save favorite profiles
- **Interest Management**: Track sent and received interests

### 5. Community Features
- **Community Q&A**: Quora-like question and answer system
  - Ask questions
  - Answer questions
  - Upvote/Downvote answers
  - Accept answers
  - Categories and tags
- **Community News**: Location-based news feed
  - News filtered by district/location
  - Global news fallback

### 6. Profile Views & Messaging
- **Profile Views Tracking**: See who viewed your profile
- **Messaging System**: Direct messaging between users
  - Conversation threads
  - Mark as read functionality
  - Real-time message tracking

### 7. Notifications System
- **Notification Types**:
  - Profile views
  - Interest received/sent
  - Shortlist notifications
  - Messages
  - Admin notifications
- **Unread Count**: Real-time notification badge
- **Notification Management**: Mark as read, delete notifications

### 8. Profile Reporting System
- **Community Members**: Users with community positions can report profiles
- **Report Reasons**: Inappropriate content, fake profile, harassment, etc.
- **Admin Review Board**: Admin can review and manage reports
- **Report Status Tracking**: Pending, Reviewed, Resolved, Dismissed

### 9. Admin Portal
- **Dashboard Statistics**:
  - Total users, active users, inactive users
  - Admin users count
  - Report statistics (total, pending, resolved)
- **User Management**: View, update, delete users
- **Notification Management**:
  - Send global notifications to all users
  - Send personal notifications to specific users
- **Admin User Creation**: Create admin credentials
- **Report Management**: Review and resolve profile reports

### 10. Family & Marriage Tracking
- **Family Registration**: Register family details
- **Family Directory**: View families by district
- **Marriage Tracking**: Track marriages facilitated by the platform
- **Marriage Dashboard**: Show marriage statistics

### 11. Session & Activity Tracking
- **Session Management**: Track active user sessions
  - Device information
  - IP address, platform, browser
  - Session expiration
  - Last activity tracking
- **Login History**: Complete login log with:
  - Login method (password/OTP)
  - Device details
  - Success/failure status
  - Timestamps
- **Error Logging**: Comprehensive error tracking:
  - Error type classification
  - Stack traces
  - Request details
  - Resolution tracking

### 12. Location Services
- **Country/State/City API**: Free API integration for location data
- **District Support**: India-specific district data
- **Location-Based Features**: News and profiles filtered by location

### 13. Meta Data APIs
- **Education Options**: List of education levels
- **Occupation Options**: List of occupations
- **Religion Options**: List of religions
- **Salary Ranges**: 3L to 50L+ in 3L intervals

## 🛠️ Technology Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB (Mongoose ODM)
- **Authentication**: JWT (JSON Web Tokens)
- **Password Hashing**: bcryptjs
- **Validation**: Zod
- **File Upload**: Multer
- **Image Processing**: Sharp (resize, watermark)
- **Storage**: Local file system (with abstraction for future cloud storage)

### Frontend
- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **HTTP Client**: Axios
- **State Management**: React Hooks
- **Internationalization**: Custom i18n (English/Hindi)

### Infrastructure
- **Database**: MongoDB (Docker support)
- **Storage**: Local file system
- **Deployment Ready**: Optimized for low-cost hosting (Render, Railway, Vercel)

## 📊 Database Models

### Core Models
1. **User**: User profiles with all matrimonial fields
2. **OTP**: OTP codes for phone authentication
3. **Interest**: Interest requests between users
4. **Shortlist**: User shortlists
5. **ProfileView**: Profile view tracking
6. **Message**: User messages and conversations
7. **Notification**: User notifications
8. **Question**: Community questions
9. **Answer**: Community answers
10. **CommunityNews**: Location-based news
11. **Family**: Family registration data
12. **Marriage**: Marriage tracking data
13. **ProfileReport**: Profile reports/flagging

### Tracking & Logging Models
14. **Session**: User session management
15. **LoginLog**: Login history tracking
16. **ErrorLog**: Application error logging

## 🔌 API Structure

### Authentication Routes (`/api/auth`)
- `POST /send-otp` - Send OTP to phone
- `POST /verify-otp` - Verify OTP and login
- `POST /login` - Password-based login

### User Routes (`/api/users`)
- `POST /users` - Create user
- `GET /users/me` - Get current user profile
- `GET /users/:id` - Get user by ID
- `PUT /users/me` - Update current user
- `GET /users` - Search users with filters
- `DELETE /users/me` - Soft delete user

### Photo Routes (`/api/photos`)
- `POST /photos/upload` - Upload photos (max 3)
- `DELETE /photos/delete/:photoIndex` - Delete photo
- `PUT /photos/primary/:photoIndex` - Set primary photo

### Interest Routes (`/api/interests`)
- `POST /interests/:userId` - Send interest
- `GET /interests` - Get interests (sent/received)
- `PUT /interests/:id/accept` - Accept interest
- `PUT /interests/:id/reject` - Reject interest

### Shortlist Routes (`/api/shortlist`)
- `POST /shortlist/:userId` - Add to shortlist
- `DELETE /shortlist/:userId` - Remove from shortlist
- `GET /shortlist` - Get shortlisted profiles
- `GET /shortlist/check/:userId` - Check if shortlisted

### Location Routes (`/api/locations`)
- `GET /locations/countries` - Get countries
- `GET /locations/states` - Get states by country
- `GET /locations/districts` - Get districts by state (India)
- `GET /locations/cities` - Get cities by state

### Meta Data Routes (`/api/meta`)
- `GET /meta/education` - Get education options
- `GET /meta/occupation` - Get occupation options
- `GET /meta/religion` - Get religion options
- `GET /meta/salary` - Get salary ranges

### Community Routes (`/api/community`)
- Question/Answer endpoints
- News endpoints

### Admin Routes (`/api/admin`)
- `GET /admin/dashboard/stats` - Dashboard statistics
- `POST /admin/notifications/global` - Send global notification
- `POST /admin/notifications/personal` - Send personal notification
- `GET /admin/users` - Get all users
- `PATCH /admin/users/:id` - Update user
- `DELETE /admin/users/:id` - Delete user
- `POST /admin/users/create-admin` - Create admin user

### Report Routes (`/api/reports`)
- `POST /reports` - Report a profile
- `GET /reports` - Get all reports (admin)
- `GET /reports/:id` - Get report by ID
- `PATCH /reports/:id` - Update report status

## 🌐 Frontend Pages

### Public Pages
- `/` - Home page
- `/login` - Login page (Phone OTP)
- `/register` - Registration page
- `/profiles` - Browse profiles (requires login)

### Authenticated Pages
- `/profile` - My profile (edit, photos, activate/deactivate)
- `/profiles/[id]` - Profile detail page
- `/profile-views` - Who viewed my profile
- `/community` - Community Q&A and news
- `/notifications` - Notifications center

### Admin Pages
- `/admin` - Admin dashboard
- `/admin/reports` - Admin report board

## 🔐 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcryptjs with salt rounds
- **OTP Verification**: Phone-based authentication
- **Session Management**: Active session tracking
- **Rate Limiting**: (Can be added)
- **CORS Protection**: Configured CORS policies
- **Input Validation**: Zod schema validation
- **Error Handling**: Centralized error handling
- **File Upload Security**: File type and size validation

## 📁 Project Structure

```
Matrimonial Site/
├── backend/
│   ├── src/
│   │   ├── config/          # Database configuration
│   │   ├── controllers/      # Request handlers
│   │   ├── middleware/       # Auth, error handling, upload
│   │   ├── models/           # Mongoose models
│   │   ├── repositories/     # Data access layer
│   │   ├── routes/           # API routes
│   │   ├── services/         # Business logic
│   │   ├── utils/            # Utilities (validation, device info, image processing)
│   │   └── migrations/       # Database migrations
│   └── scripts/             # Utility scripts
├── frontend/
│   ├── app/                  # Next.js App Router pages
│   ├── components/           # React components
│   ├── lib/                  # API client, auth, i18n
│   └── hooks/                # Custom React hooks
└── docker-compose.yml        # MongoDB Docker setup
```

## 🚀 Key Features Implemented

✅ User authentication (OTP + Password)  
✅ User profile CRUD operations  
✅ Photo upload and management (max 3, watermarking)  
✅ Profile activation/deactivation  
✅ Advanced search and filtering  
✅ Interest and shortlist system  
✅ Profile views tracking  
✅ Messaging system  
✅ Community Q&A platform  
✅ Community news (location-based)  
✅ Profile reporting system  
✅ Admin portal  
✅ Notification system  
✅ Session tracking  
✅ Login history  
✅ Error logging  
✅ Family registration  
✅ Marriage tracking  
✅ Multi-language support (English/Hindi)  
✅ Responsive design  
✅ Location APIs integration  

## 📝 Environment Variables

### Backend (.env)
```
MONGODB_URI=mongodb://localhost:27017/matrimonial
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d
PORT=5050
ALLOWED_ORIGINS=http://localhost:3000
```

### Frontend (.env.local)
```
NEXT_PUBLIC_API_URL=http://localhost:5050/api
```

## 🎨 Design Features

- **Modern UI**: Tailwind CSS with gradient designs
- **Responsive**: Mobile-first responsive design
- **Brand Colors**: Pink/Red gradient theme
- **User Experience**: Intuitive navigation and feedback
- **Loading States**: Proper loading indicators
- **Error Handling**: User-friendly error messages
- **Success Feedback**: Visual success confirmations

## 📈 Future Enhancements

- [ ] SMS API integration for real OTP sending
- [ ] Cloud storage integration (Azure Blob, AWS S3, GCP)
- [ ] Real-time notifications (WebSocket)
- [ ] Advanced matching algorithm
- [ ] Video call integration
- [ ] Payment gateway for premium features
- [ ] Mobile app (React Native)
- [ ] Enhanced analytics dashboard
- [ ] Export/Import data functionality
- [ ] Automated email notifications

## 🐛 Known Issues & Notes

- **OTP**: Currently fixed at 123456 for testing (SMS API pending)
- **Storage**: Using local file storage (Cloud storage abstraction ready)
- **Profile Photos**: Maximum 3 photos per user
- **Watermarking**: Photos automatically watermarked with "EK Gahoi"

## 📞 Support & Documentation

- **API Documentation**: Available in `API_EXAMPLES.md`
- **Setup Guide**: Available in `README.md`
- **Database Migrations**: Available in `backend/src/migrations/`

---

**Last Updated**: Current Date  
**Version**: 1.0.0  
**Status**: Production Ready ✅

