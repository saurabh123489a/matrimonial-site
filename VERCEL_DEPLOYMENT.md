# Vercel Deployment Guide

## ✅ Current Status
- GitHub repository is connected to Vercel
- Initial deployment was attempted but needs configuration adjustment

## ⚠️ Important Configuration Notes

### For Frontend Deployment (Next.js App)

1. **Root Directory**: Should be `frontend` (not `backend`)
2. **Framework Preset**: Should be `Next.js` (not Express)
3. **Build Command**: `npm run build` (auto-detected by Next.js)
4. **Output Directory**: `.next` (auto-detected by Next.js)

### For Backend Deployment (Node.js/Express API)

If you want to deploy the backend separately:
1. **Root Directory**: `backend`
2. **Framework Preset**: `Express` or `Other`
3. **Build Command**: None (or custom if needed)
4. **Output Directory**: N/A

## 🔧 How to Fix the Current Deployment

### Option 1: Update Settings in Vercel Dashboard
1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **General**
3. Update:
   - **Root Directory**: Change from `backend` to `frontend`
   - **Framework Preset**: Change to `Next.js`
4. Go to **Settings** → **Environment Variables**
5. Update `NEXT_PUBLIC_API_URL` with your backend URL:
   - If backend is deployed: `https://your-backend-url.vercel.app/api`
   - If backend is local/other: `http://localhost:5050/api` or your backend URL

### Option 2: Delete and Recreate
1. Delete the current project in Vercel
2. Create a new project
3. Select `matrimonial-site` repository
4. **IMPORTANT**: 
   - Set **Root Directory** to `frontend`
   - Set **Framework Preset** to `Next.js`
   - Add environment variable `NEXT_PUBLIC_API_URL`

## 📋 Environment Variables Needed

For the frontend:
- `NEXT_PUBLIC_API_URL`: Your backend API URL (e.g., `https://your-backend.vercel.app/api`)

## 🚀 Next Steps

1. **Fix the current deployment** using one of the options above
2. **Deploy backend separately** if needed (backend can be deployed on Railway, Render, or similar services)
3. **Update environment variables** with the correct backend URL after backend is deployed

## 📝 Notes

- Vercel is optimized for frontend applications (Next.js, React, etc.)
- For the Node.js/Express backend, consider deploying on:
  - **Railway** (easy deployment)
  - **Render** (free tier available)
  - **Heroku** (paid)
  - **AWS/GCP/Azure** (more complex)

The frontend (Next.js) is what we want on Vercel. The backend can be deployed separately on a platform better suited for Node.js APIs.

