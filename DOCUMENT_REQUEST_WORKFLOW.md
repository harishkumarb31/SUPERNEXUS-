# SuperNexus AI — Employee Missing Document Request Workflow

## 1. Executive Summary

When an employee, subject-matter evaluator, or junior trainee receives an assigned application scrutiny task, they must inspect the required evidence files. If a required document is absent from the application vault, the **Employee Document Request System** provides a structured mechanism to request the file, notify supervisory authorities, track progress, and securely deliver the verified document.

---

## 2. End-to-End Request Lifecycle

```
[ Step 1: Task Assignment ]
  Employee / Evaluator opens assigned scrutiny task in Tasks Workspace.
        │
[ Step 2: Document Search ]
  Employee queries the Document Repository for required records.
        │
        ├──> [ Document Found ] ──> Proceed with Scrutiny Verification
        │
        └──> [ Document Missing ]
                    │
[ Step 3: Issue Request ]
  Employee clicks "Request Missing Document".
  Fills: Document Name, Category, Priority (URGENT/HIGH/NORMAL/LOW), Required-By Date, Operational Justification.
        │
[ Step 4: Multi-Recipient Notification Engine ]
  Dispatches real-time alerts with request metadata to:
  1. Super Administrator (System-wide governance)
  2. Administrator (Bureau Chief / Regional HQ)
  3. Assigned HR / Department Officer (Local scrutiny supervisor)
  4. Confirmation receipt to Requesting Employee with tracking link
        │
[ Step 5: Queue & Assignment ]
  Request appears in HR & Admin "Pending Requests" queue.
  HR / Admin assigns request to a designated officer or claims it.
        │
[ Step 6: Fulfillment Upload ]
  Officer clicks "Upload & Fulfill", uploading the missing document.
  Document is linked directly to the original request and the assigned task.
        │
[ Step 7: Verification Sign-Off ]
  Uploaded file undergoes integrity checks and regulatory verification.
        │
[ Step 8: Secure Delivery & Notification ]
  Upon verification, request status advances to AVAILABLE_FOR_EMPLOYEE.
  Employee receives automated delivery notification.
  Document becomes immediately accessible in employee's "My Documents" & Task workspace.
```

---

## 3. Request Statuses & State Machine

| Request Status | Description | Actionable Roles |
|---|---|---|
| `SUBMITTED` | Request created by employee; awaiting review | HR, Admin, Super Admin |
| `PENDING_ASSIGNMENT` | Request logged in central pool awaiting delegation | HR, Admin, Super Admin |
| `ASSIGNED` | Assigned to a specific HR officer or administrator | Assigned Officer |
| `IN_PROGRESS` | Officer is sourcing document from physical records or applicant | Assigned Officer |
| `DOCUMENT_UPLOADED` | File uploaded; undergoing validation & verification | Verifying Officers |
| `AVAILABLE_FOR_EMPLOYEE` | File verified and made accessible in employee workbench | Requesting Employee |
| `REJECTED` | Request declined with required justification | Requesting Employee (View) |
| `CLOSED` | Full verification and task cycle completed | System / Admin |

---

## 4. Multi-Role Notifications & Escalation Rules

- **Urgent Priority Escalation**: Requests marked `URGENT` or approaching their `requiredByDate` trigger high-priority warning badges in the notification center.
- **Deduplication**: Notifications are scoped by user identity to prevent spam.
- **Traceability**: Every assignment, status transition, and comment is logged with timestamps in `DocumentRequestAssignment` and `AuditEvent`.
