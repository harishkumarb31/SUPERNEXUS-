# Build & Test Execution Verification Results
**Project:** RegulaFlow AI / SuperNexus AI (SIH26262)  
**Execution Timestamp:** 2026-10-30T11:30:00+05:30  

---

## 1. Build Verification (`npm run build`)

Command: `npm run build` (runs build across all workspaces in topological dependency order)

```text
> regulaflow-ai@1.0.0 build
> npm run build --workspaces --if-present

> @regulaflow/shared@1.0.0 build
> tsc

> @regulaflow/api@1.0.0 build
> tsc

> @regulaflow/web@1.0.0 build
> tsc -b && vite build

vite v5.4.21 building for production...
transforming...
✓ 2417 modules transformed.
rendering chunks...
computing gzip size...
dist/index.html                   1.11 kB │ gzip:   0.62 kB
dist/assets/index-KxmIxXBl.css   39.38 kB │ gzip:   6.86 kB
dist/assets/index-DnKYc4ni.js   790.41 kB │ gzip: 219.78 kB
✓ built in 6.61s
```
**Status: PASSED (0 errors)**

---

## 2. Test Execution Verification (`npm run test`)

Command: `npm run test` (executes Vitest test suites)

```text
> regulaflow-ai@1.0.0 test
> npm run test --workspaces --if-present

> @regulaflow/api@1.0.0 test
> vitest run

 RUN  v1.6.1 C:/SIH_NEXUS/apps/api

GET /api/health 200 5.505 ms - 125
POST /api/v1/auth/demo-login 200 54.408 ms - 640
POST /api/v1/auth/demo-login 200 69.916 ms - 593
POST /api/v1/auth/demo-login 200 122.240 ms - 708
POST /api/v1/auth/demo-login 200 109.423 ms - 639
POST /api/v1/auth/demo-login 200 121.840 ms - 631
PUT /api/v1/ocr/0f27ee07-f4e5-4366-9ed3-fa845ac43674/fields 403 5.784 ms - 163
PUT /api/v1/ocr/0f27ee07-f4e5-4366-9ed3-fa845ac43674/fields 403 3.202 ms - 163
PUT /api/v1/ocr/0f27ee07-f4e5-4366-9ed3-fa845ac43674/fields 200 12.592 ms - 623
PUT /api/v1/validation/findings/4b717ac2-8bc0-45c9-9ea4-f507b0467d3e/resolve 403 2.702 ms - 163
PUT /api/v1/validation/findings/4b717ac2-8bc0-45c9-9ea4-f507b0467d3e/resolve 200 16.040 ms - 854
POST /api/v1/auth/login 200 227.515 ms - 695
POST /api/v1/evc 403 3.260 ms - 163
POST /api/v1/evc/d6dfdf52-000f-4003-a75c-2cf8519f437b/submit-report 403 3.603 ms - 181
POST /api/v1/evc/d6dfdf52-000f-4003-a75c-2cf8519f437b/submit-report 200 23.011 ms - 1585
POST /api/v1/documents/upload 400 12.303 ms - 94
PUT /api/v1/compliance/cf299bba-c2e6-46bc-8b58-9f403b33a18e/resolve 403 4.299 ms - 95
PUT /api/v1/notifications/df18c9f7-e7dc-45b8-b03b-bfa823188b03/read 403 5.262 ms - 68
POST /api/v1/applications/692fe386-0389-4d72-9e32-49b603170309/transition 400 7.186 ms - 136
POST /api/v1/auth/login 401 118.622 ms - 53
POST /api/v1/auth/demo-login 200 10.090 ms - 639
POST /api/v1/applications/57104a92-424f-4203-a9fb-b511c467c974/transition 400 20.174 ms - 195
GET /api/v1/applications 200 37.611 ms - 7358
GET /api/v1/applications 401 0.621 ms - 67
POST /api/v1/applications/2a6fafd9-f934-4607-b004-4747d70e16a1/transition 200 22.117 ms - 1128
 ✓ tests/security_and_workflow.test.ts  (15 tests) 530ms
GET /api/v1/compliance 200 39.920 ms - 4103
POST /api/v1/compliance/check 200 5.957 ms - 194
POST /api/v1/assistant/query 200 4.781 ms - 2700
 ✓ tests/api.test.ts  (9 tests) 570ms

 Test Files  2 passed (2)
      Tests  24 passed (24)
   Duration  2.83s
```
**Status: ALL 24 TESTS PASSED (100% Pass Rate)**
