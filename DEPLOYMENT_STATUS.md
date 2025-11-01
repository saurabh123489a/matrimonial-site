# Deployment Status & Configuration Checklist

## ✅ Current Setup

- **Frontend**: Vercel (ekgahoi.vercel.app)
- **Backend**: Railway
- **Database**: Local Docker MongoDB (localhost:27017)

## 📋 Configuration Checklist

### 1. Local MongoDB (Docker) ✅
```bash
Status: Running
Container: matrimonial-mongo
Port: 27017
Database: matrimonial
Collections: 14 collections found
```

**To verify:**
```bash
docker ps | grep mongo
cd backend && node check-db.js
```

### 2. Backend on Railway ⚠️
**Required Configuration:**
- Root Directory: `backend`
- Start Command: `npm start`
- Port: `5050` (or Railway-assigned port)

**Environment Variables Needed:**
```env
PORT=5050
NODE_ENV=production
MONGODB_URI=mongodb://tunnel-url/matrimonial  # From tunnel
JWT_SECRET=your-secret-key-min-32-characters
JWT_EXPIRES_IN=7d
ALLOWED_ORIGINS=https://ekgahoi.vercel.app,https://matrimonial-site-*.vercel.app
```

**To verify:**
- Railway Dashboard → Your Service → Logs
- Test endpoint: `https://your-backend.up.railway.app/api/health`

### 3. Frontend on Vercel ✅
**Required Configuration:**
- Root Directory: `frontend`
- Framework: Next.js (auto-detected)

**Environment Variables Needed:**
```env
NEXT_PUBLIC_API_URL=https://your-backend.up.railway.app/api
```

**To verify:**
- Vercel Dashboard → Your Project → Settings → Environment Variables
- Visit: https://ekgahoi.vercel.app

### 4. MongoDB Tunnel ⚠️
**Required:**
Since Railway backend is in the cloud and MongoDB is local, you need a tunnel:

**Option A: ngrok**
```bash
ngrok tcp 27017
# Use output URL in MONGODB_URI
```

**Option B: cloudflared**
```bash
cloudflared tunnel --url tcp://localhost:27017
# Use output URL in MONGODB_URI
```

**⚠️ Important:**
- Tunnel must run continuously while Railway backend is active
- Tunnel URL changes when restarted (update Railway env var)
- For production, consider MongoDB Atlas instead

## 🔍 Testing Connections

### Test 1: Local Database
```bash
cd backend
node check-db.js
```

### Test 2: Backend Health
```bash
curl https://your-backend.up.railway.app/api/health
```

### Test 3: Frontend
```bash
curl https://ekgahoi.vercel.app
```

### Test 4: Full Stack
```bash
# Use the test script
./test-deployment.sh
```

## 🚨 Common Issues & Solutions

### Issue: Backend can't connect to database
**Solution:**
- Verify tunnel is running
- Check Railway MONGODB_URI environment variable
- Ensure tunnel URL is correct format: `mongodb://tunnel-host:port/matrimonial`

### Issue: Frontend can't reach backend
**Solution:**
- Verify Railway backend is deployed and running
- Check Vercel NEXT_PUBLIC_API_URL environment variable
- Check Railway ALLOWED_ORIGINS includes Vercel URL
- Verify CORS configuration in backend

### Issue: CORS errors in browser
**Solution:**
- Add Vercel URL to Railway ALLOWED_ORIGINS
- Format: `https://ekgahoi.vercel.app,https://matrimonial-site-*.vercel.app`
- Redeploy Railway backend after env var change

### Issue: Database tunnel disconnects
**Solution:**
- Keep tunnel terminal open
- Use process manager (PM2, systemd) to keep tunnel alive
- Or migrate to MongoDB Atlas for production

## 📊 Current Status

| Component | Status | URL/Connection |
|-----------|--------|----------------|
| Local MongoDB | ✅ Running | localhost:27017 |
| Railway Backend | ⚠️ Needs Setup | https://your-backend.up.railway.app |
| Vercel Frontend | ✅ Deployed | https://ekgahoi.vercel.app |
| MongoDB Tunnel | ⚠️ Needs Setup | Run: `./setup-mongodb-tunnel.sh` |

## 🎯 Next Steps

1. ✅ Deploy backend to Railway
2. ✅ Set up MongoDB tunnel
3. ✅ Configure Railway environment variables
4. ✅ Configure Vercel environment variables
5. ✅ Test full stack connectivity
6. ✅ Verify authentication flow
7. ✅ Test file uploads
8. ✅ Monitor logs and errors

## 🔗 Useful Commands

```bash
# Check MongoDB
docker ps | grep mongo
cd backend && node check-db.js

# Test backend
curl https://your-backend.up.railway.app/api/health

# Test frontend
curl https://ekgahoi.vercel.app

# Run tunnel
./setup-mongodb-tunnel.sh

# Run full test
./test-deployment.sh
```

---

**Last Updated:** $(date)
**Test Script:** `./test-deployment.sh`

