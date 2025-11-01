# 🔧 Final Deployment Fix - All Issues

## Current Status
- ✅ MongoDB Docker: Running
- ✅ Cloudflared Tunnel: Running (but need public URL)
- ❌ Railway Backend: CRASHING - Missing 5/6 environment variables
- ❌ Service: Unexposed (not publicly accessible)
- ❌ Frontend: Cannot connect (NEXT_PUBLIC_API_URL not set)

## 🔴 CRITICAL FIXES NEEDED

### Step 1: Get Cloudflared Tunnel URL

The tunnel is running but we need its public URL. Run this command to restart and capture the URL:

```bash
# Kill existing tunnel
pkill cloudflared

# Start new tunnel and capture URL
cloudflared tunnel --url tcp://localhost:27017 2>&1 | tee tunnel-output.txt
```

Look for a line like:
```
tcp://random-word-1234.trycloudflare.com:54321
```

Convert to MongoDB URI:
```
mongodb://random-word-1234.trycloudflare.com:54321/matrimonial
```

### Step 2: Add ALL Environment Variables to Railway

Go to: https://railway.com/project/372faae2-7198-4d68-ae0d-4477ea089be7/service/a0788881-31a2-4d7d-96f7-70b334466840/variables

Click "New Variable" for each:

1. **NODE_ENV** = `production`
2. **JWT_SECRET** = `ba666562a115c1bf60e4ee484dcc3afbb5e9dfff6bd27487ab41e32134b69689`
3. **JWT_EXPIRES_IN** = `7d`
4. **ALLOWED_ORIGINS** = `https://ekgahoi.vercel.app,https://matrimonial-site-*.vercel.app`
5. **MONGODB_URI** = `mongodb://<TUNNEL_HOST>:<TUNNEL_PORT>/matrimonial` (from Step 1)

### Step 3: Expose Railway Service

1. Go to: https://railway.com/project/372faae2-7198-4d68-ae0d-4477ea089be7/service/a0788881-31a2-4d7d-96f7-70b334466840/settings
2. Click "Networking" tab
3. Click "Generate Domain"
4. Copy the generated URL (e.g., `https://matrimonial-site-production-xxxx.up.railway.app`)

### Step 4: Update Vercel Environment Variable

1. Go to: https://vercel.com/dashboard
2. Select `ekgahoi` project
3. Go to Settings → Environment Variables
4. Add/Update `NEXT_PUBLIC_API_URL` = `https://<railway-url-from-step-3>/api`
5. Redeploy frontend

### Step 5: Test

1. Check Railway logs: Should show "MongoDB connected"
2. Test backend: `https://<railway-url>/api/health`
3. Test frontend: `https://ekgahoi.vercel.app/login`
4. Try sending OTP: Should connect successfully

---

## Quick Values Reference

**JWT_SECRET:** `ba666562a115c1bf60e4ee484dcc3afbb5e9dfff6bd27487ab41e32134b69689`

**ALLOWED_ORIGINS:** `https://ekgahoi.vercel.app,https://matrimonial-site-*.vercel.app`

**MONGODB_URI:** (Get from tunnel output - format: `mongodb://<host>:<port>/matrimonial`)

