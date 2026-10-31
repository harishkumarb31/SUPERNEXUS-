# SuperNexus AI — Document Verification Workflow Specification

## 1. Overview

The SuperNexus AI document verification pipeline guarantees that all evidence documents submitted for statutory institution approval, Extension of Approval (EoA), or compliance audits are systematically authenticated, examined for discrepancies, and approved only by certified regulatory officers.

---

## 2. Document Verification States

```
                 ┌────────────────────────────────┐
                 │       1. UPLOADED              │
                 │   (Integrity & SHA256 Check)   │
                 └───────────────┬────────────────┘
                                 │
                 ┌───────────────▼────────────────┐
                 │    2. PENDING_VERIFICATION     │
                 │   (OCR Text Stream Extracted)  │
                 └───────────────┬────────────────┘
                                 │
                 ┌───────────────▼────────────────┐
                 │       3. UNDER_REVIEW          │
                 │  (Officer Scrutiny & Findings) │
                 └───────┬───────────────┬────────┘
                         │               │
      [ Deficiencies Detected ]     [ Criteria Satisfied ]
                         │               │
     ┌───────────────────▼────────┐      │
     │ 5. REJECTED /              │      │
     │ 6. REQUIRES_RESUBMISSION   │      │
     │    (Mandatory Reason)      │      │
     └────────────────────────────┘      │
                                         ▼
                               ┌──────────────────┐
                               │  4. VERIFIED     │
                               │(Digital Sign-Off)│
                               └──────────────────┘
```

1. **`UPLOADED`**: File has been received, SHA-256 integrity hash generated, and duplicate checks confirmed.
2. **`PENDING_VERIFICATION`**: File is in the queue; asynchronous OCR extraction has parsed structured field bindings.
3. **`UNDER_REVIEW`**: Assigned scrutiny officer or evaluator has opened the dossier and is cross-checking parameters against regulatory norms.
4. **`VERIFIED`**: Document has met statutory requirements; officer digital sign-off and audit timestamp are recorded.
5. **`REJECTED`**: Document violates regulations or has expired (e.g. expired Fire Safety NOC). Requires a mandatory written justification.
6. **`REQUIRES_RESUBMISSION`**: Document is blurry, incomplete, or requires clarification before approval.

---

## 3. Human-in-the-Loop AI & OCR Scrutiny

* **Advisory Role of AI**: OCR and validation algorithms highlight parameters (e.g., land carpet area, lease expiration dates, fire NOC issue dates) and compute confidence scores.
* **Non-Delegable Human Authority**: AI never executes statutory approvals or final rejections autonomously. Only users with the `DOCUMENT_VERIFY` permission (Super Admin, Admin, Department Officer, Evaluator) can transition a document to `VERIFIED` or `REJECTED`.
* **Discrepancy Correction**: Certified officers can edit OCR-extracted fields in the Scrutiny Studio to correct typographical OCR errors, which are captured in the immutable audit log with reasons.

---

## 4. Verification History & Audit Tracking

Every decision produces an immutable record in `DocumentVerification`:
- **Verifier ID & Full Name**
- **Decision Status** (`VERIFIED`, `REJECTED`, `REQUIRES_RESUBMISSION`)
- **Timestamp**
- **Mandatory Justification / Rejection Reason**
- **Detailed Audit Trail** in `AuditEvent` with IP address and user agent.

