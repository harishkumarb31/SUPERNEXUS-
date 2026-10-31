# SuperNexus AI — Login Bug Fix & Authentication Stabilization Report

**Project:** SuperNexus AI (RegulaFlow Engine) — Smart India Hackathon 2026 (SIH26262)  
**Target URL:** `https://supernexus-lovat.vercel.app/login`  
**GitHub Repository:** `https://github.com/harishkumarb31/SUPERNEXUS-`  
**Audit Date:** October 31, 2026  
**Status:** **RESOLVED, VERIFIED & DEPLOYED**

---

## 1. Executive Summary

A comprehensive investigation of the authentication and deployment pipeline for SuperNexus AI revealed multiple interrelated bugs across the client-side SPA routing, frontend authentication state lifecycle, API client base URL resolution, backend payload sanitization, and Vercel hosting configuration.

All root causes were diagnosed, repaired, locally verified against a 51-test suite, built with zero TypeScript errors, committed to Git (`fix: resolve authentication bugs and stabilize SuperNexus AI`), pushed to GitHub `origin/master`, and validated live on Vercel where `/login` now returns HTTP status `200` with full single-page application routing.

---

## 2. Issues Discovered and Root Cause Analysis

### Issue 1: Vercel SPA Routing 404 on Direct Navigation & Refresh
* **Symptom:** Directly opening `https://supernexus-lovat.vercel.app/login` or reloading the browser produced an HTTP 404 error from Vercel's edge network.
* **Root Cause:** Absence of a `vercel.json` rewrite configuration. Vercel's static asset server attempted to resolve `/login` as a physical file on disk rather than rewriting non-asset paths to `/index.html` for client-side routing by `react-router-dom`.
* **Remedy:** Created root `vercel.json` and `apps/web/vercel.json` containing SPA rewrite rules:
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

### Issue 2: Automatic Re-login Loop Breaking Real Logout
* **Symptom:** Users logging out or visiting `/login` in a fresh browser session were immediately and involuntarily re-authenticated as `REGIONAL_OFFICER`.
* **Root Cause:** In [AuthContext.tsx](file:///c:/SIH_NEXUS/apps/web/src/context/AuthContext.tsx), the `initAuth()` function contained an unconditional fallback that executed `authService.demoLogin(UserRole.REGIONAL_OFFICER)` whenever `token` was missing from `localStorage`.
* **Remedy:** Removed the forced demo login fallback in `initAuth()`. When no session exists, `user` is cleanly set to `null` and `loading` completes, allowing unauthenticated users to see the login interface.

### Issue 3: Hardcoded API Base URL Preventing Environment Flexibility
* **Symptom:** In [api.ts](file:///c:/SIH_NEXUS/apps/web/src/services/api.ts), `baseURL: '/api/v1'` was hardcoded, and document preview/download URL helper functions used hardcoded relative paths.
* **Root Cause:** Lack of support for `import.meta.env.VITE_API_URL`, causing all API traffic to default to the origin host without supporting serverless or external API backends.
* **Remedy:** Configured dynamic base URL resolution with fallback:
  ```typescript
  const API_BASE_URL = ((import.meta as any).env?.VITE_API_URL as string) || '/api/v1';
  export const api = axios.create({ baseURL: API_BASE_URL, headers: { 'Content-Type': 'application/json' } });
  ```
  Updated `downloadUrl` and `previewUrl` to interpolate `API_BASE_URL`.

### Issue 4: Email Case-Sensitivity and Whitespace Failures
* **Symptom:** Users typing uppercase letters in their email address (e.g., `Admin@supernexus.ai`) or with trailing whitespace failed authentication with HTTP 401.
* **Root Cause:** In [authController.ts](file:///c:/SIH_NEXUS/apps/api/src/modules/auth/authController.ts), `loginSchema` did not normalize the email string before database lookup.
* **Remedy:** Added a Zod transformation to lowercase and trim emails:
  ```typescript
  const loginSchema = z.object({
    email: z
      .string()
      .min(1, 'Email is required')
      .email('Please enter a valid email address')
      .transform((val) => val.toLowerCase().trim()),
    password: z.string().min(1, 'Password is required'),
  });
  ```

### Issue 5: Masked Backend Validation Messages in Login UI
* **Symptom:** Login errors showed generic messages rather than actionable server feedback.
* **Root Cause:** In [LoginPage.tsx](file:///c:/SIH_NEXUS/apps/web/src/pages/LoginPage.tsx), the catch block inspected only `err.response?.data?.error`, omitting `message` and `err.message`.
* **Remedy:** Upgraded error resolution to:
  ```typescript
  const serverMessage =
    err.response?.data?.message ||
    err.response?.data?.error ||
    err.message ||
    'Authentication failed. Please verify credentials.';
  setError(serverMessage);
  ```

### Issue 6: Missing Enterprise Roles in Demo Quick-Switcher
* **Symptom:** The login page only presented 5 legacy AICTE domain roles, omitting the 6 modern enterprise roles requested by the architecture specification.
* **Root Cause:** Outdated demo role array in `LoginPage.tsx`.
* **Remedy:** Added a segmented 2-tab multi-role switcher displaying all 6 Enterprise Roles (`SUPER_ADMIN`, `ADMIN`, `DEPARTMENT_OFFICER`, `EVALUATOR`, `FRESHER`, `VIEWER`) alongside Domain Roles with both "Fill Form" and "1-Click Login" options.

### Issue 7: Port Binding Conflicts in Serverless Runtime
* **Symptom:** Potential serverless cold-start collision if Express attempts to bind a TCP port in serverless cloud environments.
* **Root Cause:** In [server.ts](file:///c:/SIH_NEXUS/apps/api/src/server.ts), `app.listen()` did not check `process.env.VERCEL`.
* **Remedy:** Guarded server listener:
  ```typescript
  if (process.env.NODE_ENV !== 'test' && !process.env.VERCEL) {
    app.listen(config.port, () => { ... });
  }
  ```

---

## 3. Files Modified & Created

| File | Status | Description |
| :--- | :--- | :--- |
| `apps/web/vercel.json` | **Created** | Client-side SPA routing rewrite rule for Vercel. |
| `vercel.json` | **Created** | Root Vercel deployment configuration. |
| `apps/web/src/vite-env.d.ts` | **Created** | TypeScript definition for Vite environment variables. |
| `apps/web/src/context/AuthContext.tsx` | **Modified** | Removed involuntary demo login; standardized logout and session clearance. |
| `apps/web/src/pages/LoginPage.tsx` | **Modified** | Added 6 enterprise roles, tab switcher, error parser, duplicate submission lock. |
| `apps/web/src/services/api.ts` | **Modified** | Dynamic `API_BASE_URL` resolution for production environments. |
| `apps/api/src/modules/auth/authController.ts` | **Modified** | Email trimming and lowercasing in Zod validation schema. |
| `apps/api/src/server.ts` | **Modified** | Added `!process.env.VERCEL` guard for serverless resilience. |
| `prisma/schema.prisma` | **Modified** | Added Linux OpenSSL binary targets for serverless deployment compatibility. |
| `apps/web/index.html` | **Modified** | Updated document title to SuperNexus AI Enterprise Platform. |

---

## 4. Verification & Live Deployment Confirmation

1. **Local Test Suite:** 51 of 51 tests passed across 4 test suites (`tests/api.test.ts`, `tests/enterprise_rbac.test.ts`, `tests/security_and_workflow.test.ts`, `tests/document_management.test.ts`).
2. **Monorepo Compilation:** Clean build of all packages (`@regulaflow/shared`, `@regulaflow/api`, `@regulaflow/web`) with 0 errors.
3. **Git Integration:** Pushed commit `558fd48` to `https://github.com/harishkumarb31/SUPERNEXUS-.git` (branch: `master`).
4. **Live URL Verification:**
   - URL: `https://supernexus-lovat.vercel.app/login`
   - Response Status: **HTTP 200 OK**
   - Page Title: **SuperNexus AI — Enterprise Multi-Role Regulatory Workflow, Document Verification & Governance Platform**
