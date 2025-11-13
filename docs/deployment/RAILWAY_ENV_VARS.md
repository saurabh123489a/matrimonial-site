# Railway Environment Variables Configuration

**Generated:** $(date)

## Required Environment Variables

Copy these values to Railway Dashboard → Service → Variables:

```env
PORT=5050
NODE_ENV=production
MONGODB_URI=<SETUP_TUNNEL_FIRST>
JWT_SECRET=ba666562a115c1bf60e4ee484dcc3afbb5e9dfff6bd27487ab41e32134b69689
JWT_EXPIRES_IN=7d
ALLOWED_ORIGINS=https://ekgahoi.vercel.app,https://matrimonial-site-*.vercel.app
```

## Step-by-Step Configuration

### Step 1: Set Up MongoDB Tunnel

Run in a separate terminal (keep it running):
```bash
cloudflared tunnel --url tcp://localhost:27017
```

Or if using ngrok:
```bash
ngrok tcp 27017
```

After tunnel starts, you'll get a URL like:
- cloudflared: `tcp://<host>:<port>`
- ngrok: `tcp://0.tcp.ngrok.io:12345`

Convert to MongoDB URI:
```
mongodb://<host>:<port>/matrimonial
```

### Step 2: Add Variables to Railway

1. Go to: https://railway.com/project/372faae2-7198-4d68-ae0d-4477ea089be7/service/a0788881-31a2-4d7d-96f7-70b334466840/variables
2. Click "New Variable" for each:
   - `PORT` = `5050`
   - `NODE_ENV` = `production`
   - `MONGODB_URI` = `mongodb://<your-tunnel-host>:<port>/matrimonial`
   - `JWT_SECRET` = `ba666562a115c1bf60e4ee484dcc3afbb5e9dfff6bd27487ab41e32134b69689`
   - `JWT_EXPIRES_IN` = `7d`
   - `ALLOWED_ORIGINS` = `https://ekgahoi.vercel.app,https://matrimonial-site-*.vercel.app`

### Step 3: Expose Service

1. Go to Settings → Networking
2. Click "Generate Domain"
3. Copy the generated URL

### Step 4: Update Vercel

1. Go to Vercel Dashboard → ekgahoi → Settings → Environment Variables
2. Add/Update `NEXT_PUBLIC_API_URL` = `https://<railway-url>/api`

