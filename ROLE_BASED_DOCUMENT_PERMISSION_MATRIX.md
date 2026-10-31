# SuperNexus AI — Role-Based Document Permission Matrix

This document provides the authoritative mapping of document and request permissions across all SuperNexus AI roles.

---

## 1. Document Management Permissions Matrix

| Functional Capability | Super Admin | Admin | Dept Officer | Evaluator | Fresher | Viewer | Institution User |
|:---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| **View Global Repository** | ✅ | ✅ | ✅ | ❌ (Scoped) | ❌ (Scoped) | ✅ (Verified only) | ❌ (Own institution) |
| **View Assigned Documents** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Upload Documents** | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ |
| **Verify / Certify Documents** | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| **Reject Documents (with Reason)**| ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Delete Documents (Draft)** | ✅ | ✅ | ❌ | ❌ (Own draft) | ❌ | ❌ | ❌ (Own draft) |
| **Administrative Override Delete**| ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Submit Missing Doc Request** | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| **View All Document Requests** | ✅ | ✅ | ✅ | ❌ (Own only)| ❌ (Own only)| ❌ | ❌ |
| **Assign Document Requests** | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Decline / Reject Requests** | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Fulfill Request via Upload** | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Manage Document Categories** | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Download Restricted Records** | ✅ | ✅ | ❌ (Auth only)| ❌ (Auth only)| ❌ | ❌ | ❌ |
| **View Audit Trail & Access Logs**| ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |

---

## 2. Granular Enforcement Details

### 2.1. Super Admin & System Admin
- Absolute global access across all departments, institutions, and document categories.
- Exclusive privilege to execute administrative override deletions on verified records.
- Complete visibility into access logs (`DocumentAccessLog`).

### 2.2. Administrator & Bureau Officer
- Oversight of all organizational document operations and approval pipelines.
- Authority to manage requests across all departments, reassign officers, and add classification categories.

### 2.3. HR / Department Officer
- Authority to scrutinize and verify documents within their department's jurisdiction.
- Full access to the employee missing document request queue to assign or fulfill requests.

### 2.4. Employee / Evaluator
- Can upload required evaluation evidence and view assigned application dossiers.
- Authorized to verify documents when appointed to a scrutiny or committee review panel.
- Can submit missing document requests and track fulfillment status.

### 2.5. Fresher / Junior Evaluator
- Supervised trainee access. Can view permitted learning dossiers and practice tasks.
- Can submit document requests when learning materials or evidence files are missing.
- Strictly prohibited from verifying documents, approving requests, or viewing confidential records.

### 2.6. Viewer
- Strictly read-only access.
- Restricted to verified, non-confidential records and aggregate reports.
- All write, upload, request, and verify actions return **403 Forbidden**.

