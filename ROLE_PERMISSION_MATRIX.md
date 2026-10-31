# SuperNexus AI — Role-Permission Matrix

This document provides the complete, authoritative authorization matrix mapping all 24 system permissions across the supported enterprise and applicant roles.

---

## 1. Complete Role-Permission Matrix

| Permission Code | Category | Super Admin | Admin | Dept Officer | Evaluator | Fresher | Viewer | Institution User |
|:---|:---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| `APPLICATION_VIEW_ALL` | Applications | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| `APPLICATION_VIEW_ASSIGNED`| Applications | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `APPLICATION_CREATE` | Applications | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ✅ |
| `APPLICATION_EDIT` | Applications | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ✅ |
| `APPLICATION_ASSIGN` | Applications | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| `APPLICATION_TRANSITION` | Applications | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| `DOCUMENT_VIEW` | Documents & OCR | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `DOCUMENT_UPLOAD` | Documents & OCR | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ |
| `DOCUMENT_VERIFY` | Documents & OCR | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| `DOCUMENT_DELETE` | Documents & OCR | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| `COMPLIANCE_VIEW` | Compliance | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `COMPLIANCE_EVALUATE` | Compliance | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| `COMPLIANCE_RESOLVE` | Compliance | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| `FINDING_RESOLVE` | Compliance | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| `COMMITTEE_VIEW` | Committee & EVC | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ | ❌ |
| `COMMITTEE_ASSIGN` | Committee & EVC | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| `EVC_CONDUCT` | Committee & EVC | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ |
| `TASK_VIEW_OWN` | Task Management | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `TASK_VIEW_ALL` | Task Management | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| `TASK_MANAGE` | Task Management | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| `USER_MANAGE` | Administration | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| `DEPARTMENT_MANAGE` | Administration | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| `AUDIT_VIEW` | Administration | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| `SETTINGS_MANAGE` | Administration | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Total Permissions Granted** | **(out of 24)** | **24** | **20** | **14** | **9** | **4** | **4** | **7** |

---

## 2. Permission Group Details

### 2.1. System & Settings Administration
- **`SETTINGS_MANAGE`**: Solely assigned to `SUPER_ADMIN`. Governs system thresholds, security configurations, and global SLA timers.
- **`DOCUMENT_DELETE`**: Solely assigned to `SUPER_ADMIN`. Prevents accidental or unauthorized deletion of legal evidence dossiers.

### 2.2. Operations & User Management
- **`USER_MANAGE`**, **`DEPARTMENT_MANAGE`**, **`AUDIT_VIEW`**: Granted to `SUPER_ADMIN` and `ADMIN`. Allows managing users, workgroups, and inspecting tamper-evident audit trails.

### 2.3. Scrutiny & Committee Evaluation
- **`EVC_CONDUCT`**: Granted to `SUPER_ADMIN`, `ADMIN`, and `EVALUATOR`. Allows entering field inspection reports and rating verification items.
- **`DOCUMENT_VERIFY`**, **`FINDING_RESOLVE`**, **`COMPLIANCE_EVALUATE`**: Granted to `SUPER_ADMIN`, `ADMIN`, `DEPARTMENT_OFFICER`, and `EVALUATOR`. Allows evaluating compliance checklists and clearing verification findings.

### 2.4. Supervised & Read-Only Roles
- **`FRESHER`**: Restricted to `APPLICATION_VIEW_ASSIGNED`, `DOCUMENT_VIEW`, `COMPLIANCE_VIEW`, `TASK_VIEW_OWN`. Enables supervised training on dossiers without write access to live regulatory records.
- **`VIEWER`**: Restricted to `APPLICATION_VIEW_ASSIGNED`, `DOCUMENT_VIEW`, `COMPLIANCE_VIEW`, `COMMITTEE_VIEW`, `TASK_VIEW_OWN`. Purely observational access.
