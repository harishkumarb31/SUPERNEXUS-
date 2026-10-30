# RegulaFlow AI — Security Architecture & Governance
**Problem Statement ID:** SIH26262 | Smart India Hackathon 2026
**Theme:** Smart Automation | **Category:** Software

---

## 1. Authentication & Session Management

- **Password Hashing:** Passwords are salted and hashed using bcryptjs with 10 salt rounds.
- **Stateless JWT Tokens:** Authentication tokens are cryptographically signed using a strong secret key (`HS256`) and carry explicit expiration (`7d`).
- **Session Revocation & Role Scoping:** Every authenticated request validates user identity against the database, ensuring deactivated accounts cannot execute actions even with valid tokens.
- **Safe Development Demo Accounts:** Pre-seeded demo credentials (`Password@123`) are provided strictly for local development and SIH evaluator demonstration.

---

## 2. Multi-Tier Role & Attribute-Based Access Control (RBAC / ABAC)

RegulaFlow AI enforces both role-based access control and jurisdictional attribute boundaries on every protected endpoint:

1. **Cross-Institution Isolation:**
   - Institution users can only view, create, edit, or upload documents for their own institution (`app.institutionId === user.institutionId`).
   - Any attempt to view another institution's application by guessing or mutating an ID returns `403 Forbidden`.

2. **Regional Jurisdictional Boundary:**
   - Regional officers are restricted to cases within their assigned geographical directorate (`app.institution.region === user.region`).
   - Bureau officers and system administrators maintain central oversight across all regions.

3. **Workflow State-Machine Enforcement:**
   - Workflow stage transitions are enforced on the backend via the `WorkflowEngine` state machine.
   - Unauthorized role attempts (e.g., an Institution User attempting to mark an application as `APPROVED`) are blocked with `403 Forbidden`.

---

## 3. Secure Private Document Storage Vault

- **Storage Outside Public Root:** Uploaded documents are saved in a private storage directory (`uploads/`), inaccessible to direct web URLs.
- **Stream Authorization:** The `/api/v1/documents/:id/download` endpoint streams files only after verifying authentication and verifying that the requester is authorized to access that document.
- **MIME & Signature Validation:** Only `application/pdf`, `image/jpeg`, and `image/png` formats are allowed.
- **File Integrity & Deduplication:** SHA-256 checksums are calculated on upload to prevent duplicate submissions and guarantee tamper-evident integrity.

---

## 4. AI & RAG Regulatory Safety Boundaries

- **Separation of AI from Official Authority:** AI assistance is explicitly architected for extraction, summarization, and regulatory citation retrieval. It cannot bypass workflow rules or grant approvals.
- **Strict Data Boundary:** The Regulatory RAG assistant retrieves clauses exclusively from verified AICTE Approval Process Handbook reference documents. It is prevented from leaking private institutional records.
- **Prompt Injection Defense:** Uploaded documents and extraction text streams are treated strictly as passive data and never concatenated into ungrounded executable system prompts.
- **Offline Deterministic Fallback:** In the absence of an external LLM API key, RegulaFlow AI employs a deterministic grounded retrieval generator that extracts exact chapter and page citations without hallucination.

---

## 5. Tamper-Evident Audit Logging

- All significant mutations (Application creation, submissions, stage transitions, document uploads, OCR execution, deficiency flags, compliance completions, EVC scheduling) are automatically logged to the `AuditEvent` journal.
- Captures: Actor ID, Email, Role, Action, Entity Type, Entity ID, Before/After JSON states, Reason, IP address, and Timestamp.
- Normal application users are prevented from editing or deleting audit events.

