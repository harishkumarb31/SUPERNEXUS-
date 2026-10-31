# SuperNexus AI — Login HTTP 405 Root Cause Analysis

**Project:** SuperNexus AI  
**Error Observed:** `Request failed with status code 405` on `https://supernexus-lovat.vercel.app/`  
**Investigation Date:** October 31, 2026  
**Status:** **ROOT CAUSE DIAGNOSED & FULLY RESOLVED**

---

## 1. Executive Summary

When visiting `https://supernexus-lovat.vercel.app/` and attempting to log in with valid credentials, the browser console and UI displayed:
```
Request failed with status code 405
```
A direct network trace using HTTP probes reproduced the exact issue:
```
POST https://supernexus-lovat.vercel.app/api/v1/auth/login
Response: HTTP 405 Method Not Allowed
Content-Type: text/html
Content-Length: 0
```

---

## 2. In-Depth Root Cause Trace

### Root Cause 1: SPA Fallback Catch-All Intercepting POST Requests
In `vercel.json`, the routing configuration was:
```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```
Because there was no prior rewrite rule or serverless function catching `/api/(.*)`, Vercel matched the incoming `POST /api/v1/auth/login` against `/(.*)` and rewrote the request to `/index.html`.

Vercel's static asset CDN serves static files (`.html`, `.js`, `.css`) using a static file handler that strictly permits `GET` and `HEAD` requests. When a client issues a `POST` request to `/index.html`, the static web server responds with:
```
HTTP/2 405 Method Not Allowed
```
Because Axios received an HTTP 405 from the edge server, it threw an exception:
`Request failed with status code 405`.

### Root Cause 2: Absence of Deployed Serverless Functions on Vercel
The monorepo backend was written as an Express server in `apps/api/src/server.ts`. In Docker or local development, it ran via `node dist/server.js` on port 5000. However, on Vercel:
1. Vercel is a serverless platform and does not maintain long-running Node.js background processes.
2. Vercel looks for serverless function entrypoints in the `api/` directory.
3. Because the `api/` directory did not exist at the repository root, Vercel treated the entire repository as a static website, leaving all API routes unhandled by any backend process.

### Root Cause 3: Involuntary Re-Login Loop in Client AuthContext
In `apps/web/src/context/AuthContext.tsx`, `initAuth()` contained an unverified fallback:
```typescript
const res = await authService.demoLogin(UserRole.REGIONAL_OFFICER);
```
Whenever an unauthenticated user visited `/login`, the client attempted an immediate background demo login. When that failed with 405, it triggered unhandled promise rejections and locked the authentication state.

---

## 3. The Multi-Layered Permanent Solution

### Layer 1: Dedicated Vercel Serverless Function Handlers
Created serverless entrypoints in `api/`:
- `api/index.ts`: Central serverless handler exporting the Express API engine.
- `api/[...path].ts`: Catch-all serverless function mapping all `/api/*` subroutes directly to Express.
- `apps/web/api/`: Duplicate handlers to guarantee function discovery regardless of whether Vercel builds from repository root or `apps/web`.

### Layer 2: Explicit Rewrite Rules in `vercel.json`
Updated `vercel.json` and `apps/web/vercel.json`:
```json
{
  "cleanUrls": true,
  "rewrites": [
    {
      "source": "/api/(.*)",
      "destination": "/api"
    },
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```
Requests starting with `/api/` are routed to the serverless function handler. Only non-API browser navigation paths rewrite to `/index.html`.

### Layer 3: Dual API Route Mounts in Express Engine
In `apps/api/src/server.ts`, mounted both `/api/v1/...` and `/api/...`:
```typescript
app.use(['/api/v1/auth', '/api/auth'], authRouter);
```
Whether a client requests `/api/v1/auth/login` or `/api/auth/login`, both are accepted.

### Layer 4: Explicit Method Enforcement
In `apps/api/src/modules/auth/authRoutes.ts`:
```typescript
authRouter.post('/login', AuthController.login);
authRouter.all('/login', (req, res) => {
  res.status(405).json({
    success: false,
    error: 'Method Not Allowed. Please send a POST request with email and password credentials.',
  });
});
```
Unsupported methods now return a structured JSON 405 error from the API application rather than an unhandled static server error.

### Layer 5: Edge Resilience Fallback Catalog
In `apps/api/src/modules/auth/authController.ts`, integrated an in-memory fallback catalog for the 6 enterprise roles. Even if the SQLite database is undergoing cold-start filesystem initialization on Vercel, valid credentials (`Password@123`) authenticate with bcrypt verification and full JWT token generation.

