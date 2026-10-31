# SuperNexus AI — Enterprise Role-Based Access Control (RBAC) Documentation

## 1. Executive Summary

SuperNexus AI (formerly RegulaFlow AI, SIH26262) is an enterprise regulatory scrutiny, document intelligence, and automated compliance workflow orchestration portal. This document establishes the operational specifications, authorization boundaries, and functional access scope across all system user tiers.

The system incorporates an enterprise **Multi-Role Organization Access System** inspired by the Nexus AI Organization Portal, providing role-delineated workspaces, dynamic navigation structures, and fine-grained permissions.

---

## 2. Supported Roles & Hierarchical Architecture

```
                       ┌─────────────────────────┐
                       │   SUPER ADMINISTRATOR   │
                       │     (System Master)     │
                       └────────────┬────────────┘
                                    │
                       ┌────────────▼────────────┐
                       │      ADMINISTRATOR      │
                       │  (Operations & Scrutiny)│
                       └────────────┬────────────┘
                                    │
           ┌────────────────────────┼────────────────────────┐
           │                        │                        │
┌──────────▼──────────┐  ┌──────────▼──────────┐  ┌──────────▼──────────┐
│HR/DEPARTMENT OFFICER│  │ EMPLOYEE /EVALUATOR │  │       VIEWER        │
│(Department Scrutiny)│  │(Assessment & Reviews│  │(Read-Only Analytics)│
└─────────────────────┘  └──────────┬──────────┘  └─────────────────────┘
                                    │
                         ┌──────────▼──────────┐
                         │FRESHER / JR EVALUATOR│
                         │ (Supervised Trainee)│
                         └─────────────────────┘
```

In addition to the 6 organizational roles, the platform preserves backward compatibility with the external **Institution User (`INSTITUTION_USER`)** role for self-service portal submissions.

---

## 3. Detailed Role Profiles & Functional Entitlements

### 3.1. Super Administrator (`SUPER_ADMIN` / `SYSTEM_ADMIN`)
* **Role Summary:** Highest level of enterprise governance with absolute system, organization, security, and administrative control.
* **Workspace Dashboard:** Global Command Center displaying system-wide institution health, processing funnels, security event counters, audit stream summaries, and department allocations.
* **Functional Scope:**
  - **Organization & Department Management:** Create, configure, reorganize, and archive departments (`DEPT_SCRUTINY`, `DEPT_LEGAL`, `DEPT_EVC`, `DEPT_QUALITY`).
  - **User & Role Administration:** Provision users, assign designated roles, configure departments, and reset access tokens.
  - **System Settings & Compliance Engine:** Manage regulatory thresholds, AI scrutiny confidence triggers, and SLA parameters.
  - **Security & Audit Logs:** Inspect tamper-evident audit trails, active sessions, permission checks, and IP addresses.
  - **Full Workflow Authority:** Override bottlenecks, reassign tasks globally, and enact final regulatory decisions.

### 3.2. Administrator (`ADMIN` / `BUREAU_OFFICER`)
* **Role Summary:** Operational management oversight across all institution applications, evaluation teams, and validation queues.
* **Workspace Dashboard:** Operational Cockpit tracking pending approvals, high-priority issues, active committees, and regional throughput.
* **Functional Scope:**
  - **Application Management:** Review, filter, assign, and advance institutional applications across approval stages.
  - **Evaluator & Task Assignment:** Delegate application dossiers to specific departments, evaluators, and fresher cohorts.
  - **Committee & EVC Scheduling:** Form Expert Visit Committees, assign scrutiny panels, and monitor physical inspection reports.
  - **Compliance Monitoring:** Review deficiency reports, defect notices, and compliance rectifications.
  - **Reports & Analytics:** Generate regulatory reports, export compliance metrics, and review performance indicators.
* **Access Boundary:** Restricted from altering foundational security keys, wiping audit logs, or modifying root system parameters.

### 3.3. HR / Department Officer (`DEPARTMENT_OFFICER` / `REGIONAL_OFFICER`)
* **Role Summary:** Department-specific operational authority supervising domain-focused scrutiny (e.g. Scrutiny, Legal, Civil/Infrastructure, Quality).
* **Workspace Dashboard:** Departmental Scrutiny Hub highlighting department queues, active deadlines, pending verifications, and compliance checklists.
* **Functional Scope:**
  - **Department Application Scrutiny:** Conduct comprehensive dossier evaluations for applications routed to the department.
  - **Document Verification & Deficiency Management:** Verify submitted certificates, title deeds, building plans, and mark defects.
  - **Task Delegation:** Assign verification tasks to departmental evaluators and supervise junior reviewers.
  - **Departmental Reporting:** Analyze throughput, bottleneck trends, and turnaround time per evaluator.

### 3.4. Employee / Evaluator (`EVALUATOR` / `COMMITTEE_MEMBER`)
* **Role Summary:** Core individual reviewer executing detailed technical, academic, legal, and regulatory assessments.
* **Workspace Dashboard:** Evaluator Workbench showing assigned dossiers, pending review checklists, active tasks, and direct review shortcuts.
* **Functional Scope:**
  - **Assigned Application Reviews:** Access and review applications specifically assigned by administrators or department officers.
  - **Document Inspection & OCR Verification:** Inspect submitted PDF/image records, compare OCR extracted fields against claims, and flag anomalies.
  - **Compliance Validation:** Check items against norms, add line-item review remarks, and issue evaluation recommendations.
  - **Task Execution:** Update task statuses (`IN_PROGRESS`, `UNDER_REVIEW`, `COMPLETED`), log progress percentages, and record completion notes.
* **Access Boundary:** Restricted from accessing unassigned applications or modifying system-level settings.

### 3.5. Fresher / Junior Evaluator (`FRESHER`)
* **Role Summary:** Supervised junior assessor undergoing structured onboarding while assisting in preliminary verification checks.
* **Workspace Dashboard:** Learning & Scrutiny Workspace featuring interactive training modules, regulatory handbooks, onboarding progress indicators, and supervised task checklists.
* **Functional Scope:**
  - **Supervised Task Execution:** Complete assigned learning exercises, sample dossiers, and preliminary checklist tasks.
  - **Read-Only Application Inspection:** View permitted dossiers to verify factual details against checklists under supervisor oversight.
  - **Learning Workspace:** Access step-by-step regulatory training modules (e.g., Norms & Land Calculations, Building Safety & Occupancy, Faculty Ratios).
* **Access Boundary:** Cannot finalize approvals, resolve formal compliance deficiencies, or assign tasks to others.

### 3.6. Viewer (`VIEWER`)
* **Role Summary:** Strictly read-only observational access for stakeholders, auditors, or external regulatory observers.
* **Workspace Dashboard:** Executive Read-Only Observatory featuring high-level approval funnels, compliance trends, and institutional summaries.
* **Functional Scope:**
  - **Read-Only Records:** Inspect authorized application summaries, approval timeline statuses, and institutional profiles.
  - **Analytics & Reports:** Review permitted aggregate reports, compliance statistics, and charts.
* **Access Boundary:** Completely blocked from all write, create, update, delete, review comment, and decision operations (enforced by 403 Forbidden guards).

---

## 4. Canonical Role Equivalence & Aliasing

To support seamless transitions from older workflows while maintaining strict enterprise RBAC, the platform implements canonical aliasing:

| Enterprise Role (`UserRole`) | Canonical System Role | Description |
|---|---|---|
| `SUPER_ADMIN` | `SYSTEM_ADMIN` | Root system administrator |
| `ADMIN` | `BUREAU_OFFICER` | Operational administrator |
| `DEPARTMENT_OFFICER` | `REGIONAL_OFFICER` | Department / Regional scrutiny officer |
| `EVALUATOR` | `COMMITTEE_MEMBER` | Subject matter evaluator |
| `FRESHER` | `FRESHER` | Junior trainee evaluator |
| `VIEWER` | `VIEWER` | Read-only stakeholder |
| `INSTITUTION_USER` | `INSTITUTION_USER` | External institution applicant |

This guarantees that legacy API consumers and modern enterprise clients interact with identical security guarantees.
