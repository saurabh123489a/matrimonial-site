# Railway Backend Deployment Guide

## 🚀 Quick Setup Steps

### 1. Login to Railway
- Go to https://railway.app
- Click "Sign in" and login with GitHub
- Authorize Railway to access your GitHub repositories

### 2. Create New Project
- Click "New Project"
- Select "Deploy from GitHub Repo"
- Select your repository: `saurabh123489a/matrimonial-site`

### 3. Configure Service
Once the repository is imported:

**Root Directory:** `backend`

**Build Settings:**
- Build Command: (leave empty, Railway auto-detects Node.js)
- Start Command: `npm start`

### 4. Environment Variables
Add these environment variables in Railway dashboard (Settings → Variables):

```env
PORT=5050
NODE_ENV=production
MONGODB_URI=your-mongodb-atlas-connection-string
JWT_SECRET=your-secret-key-min-32-characters
JWT_EXPIRES_IN=7d
ALLOWED_ORIGINS=https://ekgahoi.vercel.app,https://matrimonial-site-*.vercel.app
```

**Important:**
- Replace `MONGODB_URI` with your MongoDB Atlas connection string
- Generate a strong `JWT_SECRET` (at least 32 characters)
- Update `ALLOWED_ORIGINS` with your Vercel frontend URL

### 5. Database Setup
You have three options:

**Option A: Use Local Docker MongoDB (via Tunnel) - CURRENT SETUP**
Since your MongoDB is running locally in Docker, you need to expose it to the internet.

**Using ngrok (Free):**
1. Install ngrok: https://ngrok.com/download
2. Expose your local MongoDB:
   ```bash
   ngrok tcp 27017
   ```
3. Copy the forwarding URL (e.g., `tcp://0.tcp.ngrok.io:12345`)
4. Convert to MongoDB URI format:
   ```
   mongodb://0.tcp.ngrok.io:12345/matrimonial
   ```
5. Add this to Railway's `MONGODB_URI` environment variable

**Using cloudflared (Free, no signup needed):**
1. Install cloudflared: `brew install cloudflared` (or download)
2. Expose MongoDB:
   ```bash
   cloudflared tunnel --url tcp://localhost:27017
   ```
3. Use the provided URL in `MONGODB_URI`

**⚠️ Important:** 
- Keep the tunnel running while Railway backend is active
- Your MongoDB will be publicly accessible (ensure Docker MongoDB has authentication enabled)
- For production, consider Option B or C

**Option B: MongoDB Atlas (Recommended for Production)**
1. Go to https://www.mongodb.com/cloud/atlas
2. Create a free cluster
3. Get your connection string
4. Add it to `MONGODB_URI` environment variable

**Option C: Railway MongoDB**
1. In Railway project, click "New"
2. Select "MongoDB" template
3. Railway will auto-create a MongoDB instance
4. Use the `MONGO_URL` variable (Railway auto-provides this)

### 6. Deploy
- Railway will automatically detect changes and redeploy
- Check the "Deployments" tab for build logs
- Your backend will be live at: `https://your-service-name.up.railway.app`

### 7. Update Frontend API URL
After deployment, update your Vercel environment variable:

1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Update `NEXT_PUBLIC_API_URL` to:
   ```
   https://your-service-name.up.railway.app/api
   ```
3. Redeploy the frontend

## 📋 Required Environment Variables Summary

| Variable | Description | Example |
|----------|-------------|---------|
| `PORT` | Server port | `5050` |
| `NODE_ENV` | Environment | `production` |
| `MONGODB_URI` | MongoDB connection | `mongodb+srv://user:pass@cluster.mongodb.net/matrimonial` |
| `JWT_SECRET` | JWT signing key | `your-super-secret-key-min-32-chars` |
| `JWT_EXPIRES_IN` | Token expiration | `7d` |
| `ALLOWED_ORIGINS` | CORS allowed origins | `https://ekgahoi.vercel.app,https://matrimonial-site-*.vercel.app` |

## 🔍 Troubleshooting

### Build Fails
- Check Railway build logs
- Ensure `package.json` has correct `start` script
- Verify all dependencies are listed in `package.json`

### Database Connection Issues
- Verify `MONGODB_URI` is correct
- Check MongoDB Atlas IP whitelist (allow all IPs: 0.0.0.0/0)
- Ensure database credentials are correct

### CORS Errors
- Verify `ALLOWED_ORIGINS` includes your frontend URL
- Check frontend `NEXT_PUBLIC_API_URL` matches backend URL

### Service Not Starting
- Check Railway logs
- Verify `PORT` environment variable
- Ensure `src/server.js` is the correct entry point

## 🎯 Next Steps After Deployment

1. ✅ Test API endpoint: `https://your-backend.up.railway.app/api/health`
2. ✅ Update frontend environment variable
3. ✅ Test authentication flow
4. ✅ Test file uploads (may need additional storage setup)
5. ✅ Monitor Railway dashboard for usage

## 💰 Railway Pricing

- **Free Tier:** $5 credit/month
- **Usage-based:** Pay for what you use
- Backend API typically costs $0-10/month for small apps

## 📚 Additional Resources

- Railway Docs: https://docs.railway.app
- MongoDB Atlas: https://www.mongodb.com/cloud/atlas
- Railway Discord: https://discord.gg/railway

---

**Status:** Ready for deployment! Follow steps 1-7 above to deploy your backend.

