# 🚀 SaaS Application Deployment Guide

Complete step-by-step guide for deploying a full-stack Log Management SaaS application to production.

## 📋 Table of Contents

- [Tech Stack](#tech-stack)
- [Architecture Overview](#architecture-overview)
- [Prerequisites](#prerequisites)
- [Database Setup (Neon PostgreSQL)](#database-setup-neon-postgresql)
- [Redis Setup (Redis Cloud)](#redis-setup-redis-cloud)
- [Backend Deployment (Render)](#backend-deployment-render)
- [Frontend Deployment (Vercel)](#frontend-deployment-vercel)
- [CI/CD Setup (GitHub Actions)](#cicd-setup-github-actions)
- [Testing the Deployment](#testing-the-deployment)
- [Troubleshooting](#troubleshooting)
- [Cost Breakdown](#cost-breakdown)

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS + Framer Motion
- **HTTP Client**: Axios
- **Deployment**: Vercel

### Backend
- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Language**: JavaScript (ES Modules)
- **ORM**: Prisma
- **Authentication**: JWT + HTTP-only cookies
- **Queue System**: BullMQ + Redis
- **Email Service**: Resend
- **Deployment**: Render

### Database & Infrastructure
- **Database**: PostgreSQL (Neon)
- **Cache/Queue**: Redis (Redis Cloud)
- **CI/CD**: GitHub Actions
- **Version Control**: Git + GitHub

### Additional Features
- Syslog server (UDP) - Development only
- Rate limiting
- Security headers (Helmet)
- CORS protection
- Jest testing

---

## 🏗️ Architecture Overview

```
┌─────────────────┐
│   Vercel CDN    │ ← Frontend (React + Vite)
└────────┬────────┘
         │ HTTPS
         ↓
┌─────────────────┐
│  Render (PaaS)  │ ← Backend (Express.js)
│                 │
│ ┌─────────────┐ │
│ │ HTTP Server │ │ ← Handles API requests
│ └─────────────┘ │
│ ┌─────────────┐ │
│ │ OTP Worker  │ │ ← Processes email queue
│ └─────────────┘ │
│ ┌─────────────┐ │
│ │Syslog Server│ │ ← (Development only)
│ └─────────────┘ │
└────────┬────────┘
         │
    ┌────┴────┐
    ↓         ↓
┌────────┐ ┌──────┐
│  Neon  │ │Redis │
│  (DB)  │ │Cloud │
└────────┘ └──────┘
```

---

## ✅ Prerequisites

Before starting, ensure you have:

- Node.js 18+ installed
- Git installed
- GitHub account with your repository
- Accounts created on:
  - [Neon](https://neon.tech) (Database)
  - [Redis Cloud](https://redis.com) (Cache/Queue)
  - [Render](https://render.com) (Backend hosting)
  - [Vercel](https://vercel.com) (Frontend hosting)
  - [Resend](https://resend.com) (Email service)

---

## 🗄️ Database Setup (Neon PostgreSQL)

### 1. Create Neon Account

1. Go to [neon.tech](https://neon.tech)
2. Sign up for a free account
3. Click **Create Project**

### 2. Configure Database

```
Project Name: log-management-db
Region: AWS ap-southeast-1 (Singapore) - Choose closest to your users
PostgreSQL Version: 16
```

### 3. Get Connection String

1. After project creation, click **Connection Details**
2. Copy the **Connection String**
3. Format: `postgresql://username:password@host/dbname?sslmode=require`

Example:
```
postgresql://neondb_owner:xxxx@ep-xxx.aws.neon.tech/neondb?sslmode=require
```

### 4. Test Connection (Optional)

You can test the connection using Prisma Studio later after backend deployment.

---

## 🔴 Redis Setup (Redis Cloud)

### 1. Create Redis Cloud Account

1. Go to [redis.com](https://redis.com/try-free/)
2. Sign up for a free account
3. Click **Create Database**

### 2. Configure Redis

```
Cloud Provider: AWS
Region: ap-southeast-1 (Singapore)
Type: Redis Stack (includes JSON, Search)
```

### 3. Get Connection Details

1. Click on your database
2. Copy these values:
   - **Public Endpoint**: `redis-xxxxx.redis-cloud.com:15082`
   - **Default User Password**: Click "Show" to reveal

### 4. Save Connection Information

You'll need these for backend deployment:
```
REDIS_URL=redis://default:your-password@redis-xxxxx.redis-cloud.com:15082
REDIS_HOST=redis-xxxxx.redis-cloud.com
REDIS_USERNAME=default
REDIS_PASSWORD=your-password-here
REDIS_PORT=15082
```

---

## 🌐 Backend Deployment (Render)

### 1. Prepare Backend Code

Ensure your backend code includes the following:

#### Required Files
- `server/src/start-combined.js` - Starts HTTP server and OTP worker
- `server/src/server.js` - Main HTTP server with health check endpoint
- `server/src/jobs/worker/otpWorker.js` - Email queue processor

#### Required Configuration
- Health check endpoint at `/health`
- CORS configuration for production
- Prisma generate in postinstall script

### 2. Push Code to GitHub

```bash
git add .
git commit -m "Prepare backend for production deployment"
git push origin main
```

### 3. Deploy on Render

1. Go to [render.com](https://render.com) and sign in
2. Click **New +** → **Web Service**
3. Connect your GitHub repository
4. Configure the service:

```
Name: log-management-backend
Region: Singapore (closest to your database)
Branch: main
Root Directory: server
Runtime: Node
Build Command: npm install && npx prisma generate
Start Command: npm start
Instance Type: Free (or Starter $7/month)
```

5. Click **Advanced** and add environment variables:

```
NODE_ENV=production
PORT=10000
DATABASE_URL=postgresql://neondb_owner:xxx@xxx.neon.tech/neondb?sslmode=require
JWT_SECRET=your-super-secret-jwt-key-change-this-to-something-secure
REDIS_URL=redis://default:xxx@redis-xxxxx.redis-cloud.com:15082
REDIS_HOST=redis-xxxxx.redis-cloud.com
REDIS_USERNAME=default
REDIS_PASSWORD=your-redis-password
REDIS_PORT=15082
RESEND_API_KEY=re_xxxxxxxxxx
EMAIL_FROM=onboarding@resend.dev
COOKIE_DOMAIN=.onrender.com
BCRYPT_SALT_ROUNDS=12
CLIENT_URL=https://your-frontend.vercel.app
```

**Note**: We'll update `CLIENT_URL` after deploying the frontend.

6. Click **Create Web Service**
7. Wait 5-10 minutes for deployment

### 4. Get Backend URL

After deployment completes, you'll get a URL like:
```
https://log-management-backend.onrender.com
```

### 5. Test Backend

```bash
# Health check
curl https://log-management-backend.onrender.com/health

# Should return:
# {"status":"ok","timestamp":"...","env":"production"}
```

---

## 🎨 Frontend Deployment (Vercel)

### 1. Prepare Frontend Code

#### Create `frontend/vercel.json`

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "installCommand": "npm install",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

#### Update `frontend/vite.config.ts`

```typescript
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    outDir: "dist",
    sourcemap: false,
  },
});
```

#### Update `frontend/package.json`

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  }
}
```

#### Create `frontend/.env.production`

```env
VITE_BASE_URL=https://log-management-backend.onrender.com
```

### 2. Push to GitHub

```bash
git add .
git commit -m "Prepare frontend for Vercel deployment"
git push origin main
```

### 3. Deploy Using Vercel CLI

```bash
# Install Vercel CLI
npm install -g vercel

# Navigate to frontend folder
cd frontend

# Login
vercel login

# Deploy to production
vercel --prod
```

Follow the prompts:
```
? Set up and deploy? Y
? Which scope? [Your account]
? Link to existing project? N
? Project name? log-management-frontend
? In which directory is your code located? ./
? Want to override settings? Y
? Build Command? npm run build
? Output Directory? dist
? Development Command? npm run dev
```

Add environment variable when prompted:
```
VITE_BASE_URL=https://log-management-backend.onrender.com
```

### 4. Alternative: Deploy via Vercel Dashboard

1. Go to [vercel.com](https://vercel.com)
2. Click **Add New** → **Project**
3. Import your GitHub repository
4. Configure:

```
Framework Preset: Vite
Root Directory: frontend
Build Command: npm run build
Output Directory: dist
Install Command: npm install
```

5. Add Environment Variable:
   - Name: `VITE_BASE_URL`
   - Value: `https://log-management-backend.onrender.com`

6. Click **Deploy**

### 5. Get Frontend URL

After deployment, you'll get a URL like:
```
https://log-management-steel.vercel.app
```

### 6. Update Backend with Frontend URL

1. Go to Render Dashboard
2. Click on your backend service
3. Go to **Environment** tab
4. Update `CLIENT_URL`:
   ```
   CLIENT_URL=https://log-management-steel.vercel.app
   ```
5. Click **Save Changes** (auto-redeploys)

---

## 🔄 CI/CD Setup (GitHub Actions)

### Create `.github/workflows/ci.yml`

```yaml
name: Monorepo CI/CD

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main, develop ]

concurrency:
  group: ${{ github.ref }}
  cancel-in-progress: true

jobs:
  backend-test:
    name: Backend Tests
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: server
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 18.x
          cache: "npm"
          cache-dependency-path: server/package-lock.json

      - name: Install dependencies
        run: npm ci

      - name: Generate Prisma Client
        run: npx prisma generate

      - name: Run tests
        run: NODE_OPTIONS=--experimental-vm-modules npm test -- --coverage

      - name: Upload coverage
        uses: actions/upload-artifact@v4
        with:
          name: backend-coverage
          path: server/coverage/
          retention-days: 7

  frontend-build:
    name: Frontend Build
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: frontend
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 18.x
          cache: "npm"
          cache-dependency-path: frontend/package-lock.json

      - name: Install dependencies
        run: npm ci

      - name: Build frontend
        run: npm run build
        env:
          VITE_BASE_URL: ${{ secrets.VITE_BASE_URL }}

      - name: Upload build
        uses: actions/upload-artifact@v4
        with:
          name: frontend-build
          path: frontend/dist/
          retention-days: 7

  deploy:
    name: Deploy to Production
    needs: [backend-test, frontend-build]
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main' && github.event_name == 'push'
    steps:
      - name: Trigger Render Deploy
        run: |
          if [ -n "${{ secrets.RENDER_DEPLOY_HOOK_URL }}" ]; then
            curl -X POST ${{ secrets.RENDER_DEPLOY_HOOK_URL }}
            echo "✅ Render deployment triggered"
          fi

      - name: Deploy to Vercel
        run: |
          if [ -n "${{ secrets.VERCEL_TOKEN }}" ]; then
            npx vercel --prod --token=${{ secrets.VERCEL_TOKEN }} --yes
            echo "✅ Vercel deployment triggered"
          fi
```

### Configure GitHub Secrets

1. Go to your GitHub repository
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Add these secrets:

```
RENDER_DEPLOY_HOOK_URL=https://api.render.com/deploy/srv-xxxxx?key=xxxxx
VERCEL_TOKEN=your_vercel_token
VITE_BASE_URL=https://log-management-backend.onrender.com
```

**Get Deploy Hooks:**
- **Render**: Dashboard → Your Service → Settings → Deploy Hook
- **Vercel**: Dashboard → Settings → Tokens → Create Token

---

## ✅ Testing the Deployment

### 1. Test Backend Endpoints

```bash
# Health check
curl https://log-management-backend.onrender.com/health

# Test CORS
curl -i -X OPTIONS \
  -H "Origin: https://log-management-steel.vercel.app" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type" \
  https://log-management-backend.onrender.com/api/auth/login

# Should see:
# access-control-allow-origin: https://log-management-steel.vercel.app
```

### 2. Test Frontend

1. Visit `https://log-management-steel.vercel.app`
2. Try user registration
3. Check email for OTP
4. Try login
5. Check browser DevTools for errors

### 3. Test End-to-End Flow

- [ ] User registration works
- [ ] OTP email received
- [ ] Email verification works
- [ ] Login works
- [ ] Cookies are set properly
- [ ] Protected routes work
- [ ] Admin routes accessible (if admin)
- [ ] Logout works

---

## 🐛 Troubleshooting

### Backend Issues

#### Issue: "Not Found" on /health endpoint
**Solution**: Make sure health endpoint is BEFORE the wildcard route handler.

#### Issue: Database connection fails
**Solution**: 
1. Check `DATABASE_URL` in Render environment variables
2. Verify Neon database is active
3. Run `npx prisma generate` during build

#### Issue: Redis connection fails
**Solution**:
1. Verify Redis Cloud database is active
2. Check all Redis env vars are set correctly
3. Test connection from Render logs

#### Issue: 502 Bad Gateway
**Solution**:
1. Check Render logs for errors
2. Free tier takes 50+ seconds to wake from sleep
3. Try manual redeploy

#### Issue: OTP Worker not processing emails
**Solution**:
1. Check Render logs for worker errors
2. Verify Resend API key is valid
3. Check Redis connection

### Frontend Issues

#### Issue: 404 on Vercel
**Solution**:
1. Verify `vercel.json` exists with rewrites
2. Check Output Directory is set to `dist`
3. Verify build succeeds in deployment logs

#### Issue: CORS errors
**Solution**:
1. Check `CLIENT_URL` is set correctly on Render
2. Verify backend CORS middleware includes your Vercel URL
3. Check browser DevTools Network tab for preflight requests

#### Issue: Environment variables not working
**Solution**:
1. Vercel: Environment variables must start with `VITE_`
2. Render: Click "Save Changes" after updating env vars
3. Clear build cache and redeploy

#### Issue: API calls failing
**Solution**:
1. Verify `VITE_BASE_URL` in Vercel environment variables
2. Check backend is running (visit /health endpoint)
3. Inspect Network tab in browser DevTools

### Common Mistakes

1. **Root Directory**: Always set to `frontend` or `server` in monorepo
2. **Build Command**: Must match package.json scripts
3. **Output Directory**: Must be `dist` for Vite
4. **Environment Variables**: Must be set in platform dashboards, not just .env files
5. **CORS**: Frontend URL must match exactly (no trailing slash)
6. **JWT_SECRET**: Must be the same across all environments
7. **Redis Connection**: All Redis env vars must be set correctly

---

## 💰 Cost Breakdown

### Free Tier (Development/Testing)

| Service | Free Tier | Limits |
|---------|-----------|--------|
| **Neon** | Free | 512 MB storage, 1 compute |
| **Redis Cloud** | Free | 30 MB storage, 30 connections |
| **Render** | Free | 750 hours/month, sleeps after 15 min |
| **Vercel** | Free | 100 GB bandwidth, unlimited deployments |
| **GitHub Actions** | Free | 2000 minutes/month |
| **Resend** | Free | 100 emails/day, 3000/month |

**Total: $0/month**

### Production Tier (Recommended)

| Service | Plan | Cost |
|---------|------|------|
| **Neon** | Pro | $19/month |
| **Redis Cloud** | Fixed | $10/month (1 GB) |
| **Render** | Starter | $7/month per service |
| **Vercel** | Pro | $20/month |
| **Resend** | Pro | $20/month (50k emails) |

**Total: ~$76-83/month**

---

## 📚 Additional Resources

### Documentation
- [Neon Docs](https://neon.tech/docs)
- [Redis Cloud Docs](https://redis.io/docs/)
- [Render Docs](https://render.com/docs)
- [Vercel Docs](https://vercel.com/docs)
- [Prisma Docs](https://www.prisma.io/docs)

### Monitoring & Analytics
- [Render Metrics](https://render.com/docs/metrics)
- [Vercel Analytics](https://vercel.com/docs/analytics)
- [Sentry](https://sentry.io) - Error tracking (optional)
- [LogRocket](https://logrocket.com) - Session replay (optional)

### Performance Optimization
- Enable Vercel Edge Functions for faster API responses
- Use Render's Redis add-on for lower latency
- Implement database connection pooling
- Add CDN for static assets
- Enable gzip compression

---

## 🎉 Congratulations!

You've successfully deployed a full-stack SaaS application! 

### Next Steps

1. Set up custom domain (optional)
2. Configure SSL certificates (auto-handled by Vercel/Render)
3. Set up monitoring and alerting
4. Implement database backups
5. Add error tracking (Sentry)
6. Set up uptime monitoring
7. Implement analytics
8. Add more features!

---

## 📝 Maintenance Checklist

### Daily
- [ ] Check error logs on Render
- [ ] Monitor uptime

### Weekly
- [ ] Review performance metrics
- [ ] Check database size in Neon
- [ ] Review Redis memory usage

### Monthly
- [ ] Update dependencies
- [ ] Review security alerts on GitHub
- [ ] Backup database
- [ ] Review costs

---

## 🤝 Contributing

If you improve this deployment guide, please share your changes!

## 📄 License

This guide is provided as-is for educational purposes.

---

**Last Updated**: October 2025  
**Maintainer**: Your Name  
**Repository**: https://github.com/PhyoThanHtike/LogManagement