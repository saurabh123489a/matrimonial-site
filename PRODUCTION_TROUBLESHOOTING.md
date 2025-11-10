# 🔧 Production Troubleshooting Guide

## Internal Server Error on Railway/Vercel

### Step 1: Check Railway Backend Logs

1. Go to Railway Dashboard: https://railway.app
2. Select your backend service
3. Click on "Deployments" tab
4. Check the latest deployment logs for errors

**Common Issues:**
- Missing environment variables
- MongoDB connection failure
- Port configuration issues

### Step 2: Verify Railway Environment Variables

Go to: Railway Dashboard → Your Service → Variables

**Required Variables:**
```env
PORT=5050
NODE_ENV=production
MONGODB_URI=mongodb://your-tunnel-host:port/matrimonial
JWT_SECRET=your-secret-key-min-32-characters
JWT_EXPIRES_IN=7d
ALLOWED_ORIGINS=https://ekgahoi.vercel.app,https://matrimonial-site-*.vercel.app
```

**Check:**
- ✅ All 6 variables are set
- ✅ `MONGODB_URI` is correct (if using tunnel, ensure tunnel is running)
- ✅ `ALLOWED_ORIGINS` includes your Vercel domain

### Step 3: Check Railway Service Status

1. Railway Dashboard → Your Service → Settings
2. Verify:
   - **Root Directory:** `backend`
   - **Start Command:** `npm start`
   - **Port:** `5050` (or Railway-assigned port)

### Step 4: Test Railway Backend Health

Get your Railway backend URL from Settings → Networking → Domain

Test the health endpoint:
```bash
curl https://your-railway-url.up.railway.app/api/health
```

**Expected Response:**
```json
{"status":true,"message":"API is running","timestamp":"..."}
```

**If it fails:**
- Check Railway logs for specific error
- Verify MongoDB connection
- Check if tunnel is running (if using local MongoDB)

### Step 5: Check Vercel Frontend Configuration

1. Go to Vercel Dashboard: https://vercel.com/dashboard
2. Select your project (`ekgahoi`)
3. Go to Settings → Environment Variables

**Required Variable:**
```env
NEXT_PUBLIC_API_URL=https://your-railway-url.up.railway.app/api
```

**Check:**
- ✅ Variable is set for Production environment
- ✅ URL matches your Railway backend URL
- ✅ Includes `/api` at the end

### Step 6: Check Vercel Deployment Logs

1. Vercel Dashboard → Your Project → Deployments
2. Click on latest deployment
3. Check build logs for errors

**Common Issues:**
- Build failures
- Missing environment variables
- API connection errors

### Step 7: Verify CORS Configuration

**On Railway:**
- `ALLOWED_ORIGINS` must include your Vercel domain
- Format: `https://ekgahoi.vercel.app,https://matrimonial-site-*.vercel.app`

**Test CORS:**
```bash
curl -H "Origin: https://ekgahoi.vercel.app" \
     -H "Access-Control-Request-Method: GET" \
     -X OPTIONS \
     https://your-railway-url.up.railway.app/api/health
```

### Step 8: MongoDB Connection (If Using Tunnel)

If using local MongoDB with tunnel:

1. **Check tunnel is running:**
   ```bash
   # For cloudflared
   ps aux | grep cloudflared
   
   # For ngrok
   ps aux | grep ngrok
   ```

2. **Restart tunnel if needed:**
   ```bash
   # Kill existing
   pkill cloudflared
   
   # Start new tunnel
   cloudflared tunnel --url tcp://localhost:27017
   ```

3. **Update Railway `MONGODB_URI`** with new tunnel URL
4. **Redeploy Railway service**

### Step 9: Common Error Solutions

#### Error: "Cannot connect to MongoDB"
- Verify `MONGODB_URI` is correct
- Check tunnel is running (if using local MongoDB)
- For production, consider MongoDB Atlas

#### Error: "CORS policy blocked"
- Verify `ALLOWED_ORIGINS` includes Vercel domain
- Check frontend `NEXT_PUBLIC_API_URL` matches backend URL

#### Error: "Internal Server Error" on Frontend
- Check Vercel build logs
- Verify `NEXT_PUBLIC_API_URL` is set correctly
- Test backend health endpoint directly

#### Error: "Port already in use" on Railway
- Railway auto-assigns ports, don't hardcode PORT
- Use `process.env.PORT` in code (already done)

### Step 10: Quick Fix Checklist

- [ ] Railway backend is deployed and running
- [ ] All 6 environment variables are set on Railway
- [ ] Railway service has a public domain
- [ ] `NEXT_PUBLIC_API_URL` is set on Vercel
- [ ] Vercel frontend is redeployed after env var changes
- [ ] MongoDB tunnel is running (if using local MongoDB)
- [ ] CORS allows Vercel domain
- [ ] Backend health endpoint returns success

### Step 11: Test End-to-End

1. Visit: https://ekgahoi.vercel.app
2. Open browser DevTools → Network tab
3. Check API requests:
   - Should go to Railway backend URL
   - Should not return 500 errors
   - Should have proper CORS headers

### Step 12: Get Detailed Error Logs

**Railway:**
```bash
# View logs in Railway Dashboard → Deployments → Latest → Logs
```

**Vercel:**
```bash
# View logs in Vercel Dashboard → Deployments → Latest → Logs
```

**Browser Console:**
- Open DevTools → Console
- Look for specific error messages
- Check Network tab for failed requests

## Still Having Issues?

1. Check Railway logs for specific error message
2. Check Vercel build logs
3. Verify all environment variables are set correctly
4. Test backend health endpoint directly
5. Check browser console for specific error messages

