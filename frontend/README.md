# Matrimonial Frontend

Next.js frontend application for the Matrimonial web platform.

## 🚀 Features

- **User Registration**: Create new user accounts
- **Profile Management**: View and edit user profiles
- **Browse Profiles**: Search and filter user profiles
- **Profile Details**: View detailed profile information
- **Modern UI**: Built with Tailwind CSS for a beautiful, responsive design

## 📦 Installation

```bash
# Install dependencies
npm install

# Copy environment file
cp .env.local.example .env.local

# Edit .env.local with your backend API URL
# NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

## 🏃 Running the Application

```bash
# Development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

The application will be available at `http://localhost:3000`

## 📁 Project Structure

```
frontend/
├── app/                    # Next.js App Router pages
│   ├── (auth)/            # Authentication pages
│   │   ├── login/         # Login page
│   │   └── register/      # Registration page
│   ├── profiles/          # Browse profiles
│   │   ├── page.tsx      # Profiles listing
│   │   └── [id]/         # Profile detail page
│   ├── profile/          # My profile page
│   ├── layout.tsx        # Root layout
│   └── page.tsx         # Home page
├── components/            # React components
│   ├── Navbar.tsx        # Navigation bar
│   └── ProfileCard.tsx    # Profile card component
├── lib/                  # Utilities
│   ├── api.ts            # API client (axios)
│   └── auth.ts           # Authentication utilities
└── package.json
```

## 🔧 Configuration

### Environment Variables

Create `.env.local` file:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

## 🎨 Pages

### Home Page (`/`)
Landing page with hero section and call-to-action buttons.

### Register Page (`/register`)
User registration form with:
- Name, Email/Phone, Password
- Gender and Age selection
- Form validation

### Login Page (`/login`)
User login form (ready for authentication endpoints).

### Browse Profiles (`/profiles`)
- Search and filter profiles
- Gender, Age range, Location, Religion filters
- Pagination support
- Profile cards grid layout

### Profile Detail (`/profiles/[id]`)
Detailed view of a user profile with:
- Profile photo
- Basic information
- Education & Career
- Bio and preferences
- Action buttons (Send Interest, Shortlist)

### My Profile (`/profile`)
Authenticated user's profile page with:
- View current profile
- Edit profile information
- Profile completion status

## 🛠️ Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **HTTP Client**: Axios
- **State Management**: React Hooks

## 📡 API Integration

The frontend uses a centralized API client (`lib/api.ts`) that:
- Handles authentication tokens automatically
- Provides typed API functions
- Includes error handling and interceptors
- Supports pagination and filtering

## 🎯 Next Steps

1. **Authentication**: Implement login/logout functionality when backend auth endpoints are ready
2. **Interest & Shortlist**: Add functionality to send interest and manage shortlists
3. **Photo Upload**: Add image upload functionality
4. **Matching**: Implement matching algorithm display
5. **Notifications**: Add notification system

## 📝 Notes

- The login page currently shows a placeholder message until authentication endpoints are implemented
- Profile editing requires authentication (redirects to login if not authenticated)
- All API calls are made to the backend configured in `NEXT_PUBLIC_API_URL`
