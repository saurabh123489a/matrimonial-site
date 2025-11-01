# Matrimonial Site - Complete Application

A full-stack matrimonial web application with Node.js/Express backend, Next.js frontend, and MongoDB database.

## 🚀 Quick Start

### Single Command to Run Everything

```bash
./start.sh
```

Or using npm:

```bash
npm start
```

This will automatically:
1. ✅ Start MongoDB (Docker container)
2. ✅ Start Backend Server (port 5050)
3. ✅ Start Frontend Server (port 3000)

### Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5050/api
- **MongoDB**: localhost:27017

### Stop the Application

```bash
./stop.sh
```

Or using npm:

```bash
npm stop
```

## 📁 Project Structure

```
Matrimonial Site/
├── backend/          # Node.js + Express API
├── frontend/         # Next.js Frontend
├── start.sh          # Start all services
├── stop.sh           # Stop all services
└── package.json      # Root package.json
```

## 🔧 Prerequisites

1. **Node.js** (v18 or higher)
2. **Docker** (for MongoDB)
3. **npm** or **yarn**

## 📦 Installation

If you need to install dependencies:

```bash
npm run install-all
```

This installs dependencies for both backend and frontend.

## 🎯 Features

### Authentication
- ✅ Phone + OTP login (default OTP: 123456 for development)
- ✅ JWT-based authentication

### User Features
- ✅ Profile CRUD operations
- ✅ Photo uploads (max 3, with watermark)
- ✅ Profile search and filtering
- ✅ Profile views tracking
- ✅ Interest system (send/accept/reject)
- ✅ Shortlist functionality
- ✅ Messaging between users

### Community
- ✅ Q&A forum (Quora-like)
- ✅ Questions and Answers
- ✅ Upvote/Downvote system
- ✅ Categories and tags

### Notifications
- ✅ Real-time notification system
- ✅ Profile view notifications
- ✅ Interest received/accepted notifications
- ✅ Shortlist notifications
- ✅ Message notifications
- ✅ Admin push notifications

### Location
- ✅ Country, State, City selection
- ✅ Free location API integration

## 🔑 Environment Variables

### Backend (.env)
```env
PORT=5050
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/matrimonial
JWT_SECRET=your-secret-key-change-in-production
JWT_EXPIRES_IN=7d
ALLOWED_ORIGINS=http://localhost:3000
USE_DEFAULT_OTP=true  # Set to false for random OTPs
```

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:5050/api
```

## 📝 API Documentation

See `backend/README.md` for complete API documentation.

## 🐛 Troubleshooting

### Port Already in Use
If ports 3000 or 5050 are already in use:
```bash
# Kill processes on ports
lsof -ti:3000 | xargs kill -9
lsof -ti:5050 | xargs kill -9
```

### MongoDB Not Starting
Ensure Docker is running:
```bash
docker ps
```

Start MongoDB manually:
```bash
cd backend
docker compose up -d mongo
```

### View Logs
```bash
# Backend logs
tail -f /tmp/backend.log

# Frontend logs
tail -f /tmp/frontend.log
```

## 📚 Documentation

- [Backend API Docs](backend/README.md)
- [Migrations Guide](backend/MIGRATIONS.md)
- [Frontend Docs](frontend/README.md)

## 🛠️ Development

### Run Individual Services

**Backend only:**
```bash
cd backend
npm run dev
```

**Frontend only:**
```bash
cd frontend
npm run dev
```

**MongoDB only:**
```bash
cd backend
docker compose up -d mongo
```

## 🚢 Deployment

See deployment guides in:
- `backend/README.md` - Backend deployment
- `frontend/README.md` - Frontend deployment

## 📄 License

ISC

