# RegulaFlow AI — REST API Documentation
**Smart India Hackathon 2026** | **Problem Statement:** SIH26262
**Version:** 1.0.0 | **Base URL:** `/api/v1`

---

## 1. Authentication & Session (`/api/v1/auth`)

### `POST /auth/login`
Authenticates a user using email and password.
- **Request Body:**
  ```json
  {
    "email": "officer.north@regulaflow.aicte.gov.in",
    "password": "Password@123"
  }
  ```
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "message": "Authentication successful",
    "data": {
      "token": "eyJhbGciOiJIUzI1NiIsInR...",
      "user": {
        "id": "uuid-here",
        "email": "officer.north@regulaflow.aicte.gov.in",
        "fullName": "Shri Vikram Malhotra (Regional Officer)",
        "role": "REGIONAL_OFFICER",
        "region": "NORTHERN",
        "institutionId": null
      }
    }
  }
  ```

### `POST /auth/demo-login`
Fast 1-click role switcher for SIH hackathon evaluators.
- **Request Body:**
  ```json
  {
    "role": "REGIONAL_OFFICER"
  }
  ```
- **Accepted Roles:** `INSTITUTION_USER`, `REGIONAL_OFFICER`, `BUREAU_OFFICER`, `COMMITTEE_MEMBER`, `SYSTEM_ADMIN`

### `GET /auth/me`
Retrieves currently authenticated session identity.
- **Headers:** `Authorization: Bearer <token>`

---

## 2. Applications Lifecycle (`/api/v1/applications`)

### `POST /applications`
Creates a new draft application (Restricted to `INSTITUTION_USER`).
- **Request Body:**
  ```json
  {
    "category": "EXTENSION_OF_APPROVAL",
    "academicYear": "2026-2027",
    "priority": "NORMAL"
  }
  ```
- **Response (201 Created):**
  ```json
  {
    "success": true,
    "data": {
      "id": "app-uuid",
      "applicationNumber": "AICTE/2026-27/APP-00106",
      "currentStage": "DRAFT",
      "priority": "NORMAL"
    }
  }
  ```

### `GET /applications`
Lists applications with role-based jurisdiction scoping and query filtering.
- **Query Parameters:**
  - `stage`: Filter by stage (`DRAFT`, `SUBMITTED`, `UNDER_SCRUTINY`, `DEFICIENCY_RAISED`, `AWAITING_EVC`, `APPROVED`, etc.)
  - `category`: Filter by category
  - `region`: Filter by jurisdiction
  - `search`: Keyword search over Application ID or Institution Name
  - `page`, `limit`: Pagination controls

### `GET /applications/:id`
Returns full application aggregate including institution details, documents, OCR extractions, validation findings, compliance covenants, EVC inspection activities, and chronological audit history.

### `POST /applications/:id/submit`
Executes deterministic validation checks and transitions application from `DRAFT` to `SUBMITTED`.

### `POST /applications/:id/transition`
Transitions workflow stage with role authorization and audit logging.
- **Request Body:**
  ```json
  {
    "targetStage": "UNDER_SCRUTINY",
    "reason": "Desk scrutiny initiated by regional officer",
    "comments": "Land records and faculty lists under verification"
  }
  ```

---

## 3. Documents & OCR Pipeline (`/api/v1/documents` & `/api/v1/ocr`)

### `POST /documents/upload`
Uploads regulatory proof document (PDF, PNG, JPEG) up to 15MB.
- **Form Data:**
  - `file`: Binary file
  - `applicationId`: Target application UUID
  - `documentType`: e.g. `FIRE_SAFETY_NOC`, `LAND_TITLE_LEASE_DEED`
  - `expiryDate`: Optional validity date

### `GET /documents/:id/download`
Streams file from private storage vault with institutional ownership check.

### `POST /ocr/process`
Triggers text recognition and regex entity extraction.
- **Request Body:** `{ "documentId": "uuid" }`
- **Extracted Entities:** Lessor, Lessee, Tenure, Expiry Date, Carpet Area, Notarization seal.

---

## 4. Deterministic Validation Engine (`/api/v1/validation`)

### `POST /validation/run`
Executes validation rules (`VAL_MANDATORY_DOCS_MISSING`, `VAL_FIRE_NOC_EXPIRED`, `VAL_LEASE_EXPIRY`, `VAL_CARPET_AREA_DEFICIT`, `VAL_DUPLICATE_CHECKSUM`).

### `PUT /validation/findings/:id/resolve`
Updates deficiency state (`CONFIRMED`, `DISMISSED`, `RESOLVED`) with officer verification notes.

---

## 5. Compliance & Deadline Scheduler (`/api/v1/compliance`)

### `GET /compliance`
Lists compliance covenants and computes live aggregate metrics (Total, Active, Due Soon, Overdue, Completed).

### `POST /compliance/check`
Executes on-demand background scheduler check. Scans all active obligations, updates status based on deadline delta, creates `EscalationEvent` records for overdue items, and issues in-app alerts.

---

## 6. Regulatory Knowledge & Grounded RAG (`/api/v1/assistant`)

### `POST /assistant/query`
Queries AICTE Approval Process Handbook (APH 2024-2027) with grounded citations.
- **Request Body:**
  ```json
  {
    "question": "What is the mandatory Student-to-Faculty Ratio (SFR) for Undergraduate Engineering?"
  }
  ```
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "data": {
      "answer": "According to the AICTE Approval Process Handbook (2026-2027)...",
      "citations": [
        {
          "documentTitle": "AICTE Approval Process Handbook — Chapter 2: Cadre Ratio and Student-Faculty Ratios",
          "chapter": "Chapter 2",
          "section": "Clause 2.1 - Student Faculty Ratio (SFR)",
          "pageRef": "Page 35, Section 2.1.2",
          "excerpt": "For Undergraduate Engineering and Technology programmes, the Student-Faculty Ratio shall be 1:20."
        }
      ],
      "grounded": true,
      "confidence": 0.92
    }
  }
  ```

---

## 7. Audit Trail (`/api/v1/audit`)

### `GET /audit`
Returns chronological audit events with actor, action, entity type, reason, IP address, and before/after mutation diffs.

