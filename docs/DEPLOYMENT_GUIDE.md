# SuperNexus AI — Production Deployment & Operations Guide

**System:** SuperNexus AI (RegulaFlow Engine)  
**Target Environments:** Vercel Edge Serverless & Docker Container  
**Version:** 2.0  
**Date:** October 31, 2026  

---

## 1. Deployment Topology

SuperNexus AI can be deployed either as a serverless monorepo on Vercel or as a containerized stack via Docker Compose.

```
       [ Production Edge (Vercel) ]
                  │
        ┌─────────┴─────────┐
        ▼                   ▼
 [ Vite Frontend ]    [ Serverless API ]
  - React 18 SPA       - Express Engine
  - Edge CDN           - api/index.ts
  - SPA Rewrites       - api/[...path].ts
```

---

## 2. Vercel Serverless Deployment Steps

### 2.1 Git Push Trigger
Any commit pushed to `origin/master` on `https://github.com/harishkumarb31/SUPERNEXUS-` automatically triggers a new deployment build on Vercel.

### 2.2 Vercel Project Settings
* **Framework Preset:** `Vite`
* **Root Directory:** `./` (or `apps/web`)
* **Build Command:** `npm run build`
* **Output Directory:** `apps/web/dist`
* **Install Command:** `npm install`

### 2.3 Required Environment Variables
Configure these in the Vercel Project Settings under **Environment Variables**:

| Variable Name | Required? | Recommended Value | Description |
| :--- | :---: | :--- | :--- |
| `NODE_ENV` | Optional | `production` | Enables production optimizations |
| `JWT_SECRET` | Required | `(strong-32-character-random-key)` | Cryptographic signature secret for JWT tokens |
| `DATABASE_URL` | Optional | `postgresql://user:pass@host:5432/db` | Production database connection string |
| `VITE_API_URL` | Optional | `/api/v1` (default) | Client API base path |

---

## 3. Local Development & Docker Instructions

### 3.1 Local Monorepo Startup
```bash
# 1. Install all monorepo dependencies
npm install

# 2. Setup SQLite database and seed initial accounts
npm run setup:db

# 3. Start development servers concurrently
npm run dev
```
* **Frontend:** `http://localhost:5173`
* **Backend API:** `http://localhost:5000`

### 3.2 Docker Compose Deployment
```bash
# Build and run Postgres, API, and Web containers
docker-compose up --build -d
```

---

## 4. Verification After Deployment

1. **Verify HTTP 200 on Login Page:**
   ```powershell
   (Invoke-WebRequest -Uri "https://supernexus-lovat.vercel.app/login" -UseBasicParsing).StatusCode
   ```
2. **Verify Serverless Health Check:**
   ```powershell
   (Invoke-WebRequest -Uri "https://supernexus-lovat.vercel.app/api/health" -UseBasicParsing).Content
   ```
3. **Verify API Login POST (Super Admin):**
   ```powershell
   Invoke-WebRequest -Uri "https://supernexus-lovat.vercel.app/api/v1/auth/login" -Method POST -Body '{"email":"superadmin@supernexus.ai","password":"Password@123"}' -ContentType "application/json"
   ```

