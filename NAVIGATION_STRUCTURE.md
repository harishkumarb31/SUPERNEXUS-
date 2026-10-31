# SuperNexus AI — Enterprise Dynamic Navigation Structure

This document details the navigation hierarchy, route paths, icons, permission dependencies, and visibility matrices across all SuperNexus AI roles.

---

## 1. Global Navigation Layout & Experience

The navigation sidebar incorporates:
- **Branding Header**: SuperNexus AI logo, platform version tag, and sidebar collapse/expand toggle.
- **Active Role Indicator**: Visual pill badge showing the active role with distinct color accents (Indigo for Super Admin, Blue for Admin, Cyan for Dept Officer, Amber for Evaluator, Green for Fresher, Slate for Viewer, Emerald for Institution User).
- **Collapsible Mode**: Toggles between 260px expanded menu and 72px compact icon-only bar with hover tooltips.
- **Accordion Submenus**: Nested groups with chevron indicators and route highlighting.
- **Top Bar**: Search bar, role switcher quick launcher, unread notifications indicator with counter, and user profile drawer.

---

## 2. Dynamic Navigation Structures by Role

### 2.1. Super Administrator (`SUPER_ADMIN` / `SYSTEM_ADMIN`)
* **Overview** (`/`)
* **Organization & Governance** (Submenu)
  - Departments (`/admin?tab=departments`)
  - User Directory (`/admin?tab=users`)
  - Institutions (`/admin?tab=institutions`)
  - Roles & Permissions Matrix (`/admin?tab=roles`)
* **Applications & Scrutiny** (Submenu)
  - All Applications (`/applications`)
  - New Application Dossier (`/applications/new`)
* **Task & Workflows** (`/tasks`)
* **Approval & Verification** (Submenu)
  - Scrutiny Validation (`/validation`)
  - EVC Inspection Panels (`/evc`)
* **Regulatory Compliance** (`/compliance`)
* **AI Intelligence & Copilot** (Submenu)
  - Regulatory Assistant (`/assistant`)
  - OCR Document Scrutiny (`/documents`)
* **Security & Audit Logs** (`/admin?tab=security`)
* **System Settings** (`/admin?tab=health`)

---

### 2.2. Administrator (`ADMIN` / `BUREAU_OFFICER`)
* **Overview** (`/`)
* **Operations Management** (Submenu)
  - Institutions (`/admin?tab=institutions`)
  - Evaluators & Users (`/admin?tab=users`)
  - Department Workgroups (`/admin?tab=departments`)
* **Applications Oversight** (Submenu)
  - All Applications (`/applications`)
  - New Application Dossier (`/applications/new`)
* **Task Allocation & Queue** (`/tasks`)
* **Verification & Inspections** (Submenu)
  - Scrutiny Validation Queue (`/validation`)
  - EVC Inspection Committees (`/evc`)
* **Compliance Oversight** (`/compliance`)
* **AI Scrutiny Tools** (Submenu)
  - Regulatory Assistant (`/assistant`)
  - Document OCR (`/documents`)
* **Activity & Audit Stream** (`/admin?tab=security`)

---

### 2.3. HR / Department Officer (`DEPARTMENT_OFFICER` / `REGIONAL_OFFICER`)
* **Department Hub** (`/`)
* **Assigned Applications** (`/applications`)
* **Department Tasks & Scrutiny** (`/tasks`)
* **Document Verification Queue** (`/documents`)
* **Compliance Checklist** (`/compliance`)
* **Committee Coordination** (`/evc`)
* **AI Regulatory Copilot** (`/assistant`)
* **Department Reports** (`/compliance`)

---

### 2.4. Employee / Evaluator (`EVALUATOR` / `COMMITTEE_MEMBER`)
* **Evaluator Workbench** (`/`)
* **Assigned Applications** (`/applications`)
* **My Tasks Queue** (`/tasks`)
* **Scrutiny Verification** (`/validation`)
* **Document Inspection (OCR)** (`/documents`)
* **Norms & Compliance Check** (`/compliance`)
* **EVC Evaluation Panel** (`/evc`)
* **AI Regulatory Assistant** (`/assistant`)

---

### 2.5. Fresher / Junior Evaluator (`FRESHER`)
* **Fresher Workspace** (`/`)
* **Learning & Training Modules** (`/learning`)
* **Assigned Scrutiny Tasks** (`/tasks`)
* **Permitted Applications** (`/applications`)
* **Document Reading Room** (`/documents`)
* **Regulatory Norms Library** (`/compliance`)
* **AI Study Assistant** (`/assistant`)

---

### 2.6. Viewer (`VIEWER`)
* **Analytics Observatory** (`/`)
* **Authorized Applications** (`/applications`)
* **Compliance Reports** (`/compliance`)
* **AI Regulatory Assistant** (`/assistant`)
* **Inspection Summaries** (`/evc`)

---

### 2.7. Institution User (`INSTITUTION_USER`)
* **Applicant Portal** (`/`)
* **My Applications** (`/applications`)
* **Submit New Application** (`/applications/new`)
* **Document Vault** (`/documents`)
* **Deficiency Rectification** (`/compliance`)
* **AI Helpdesk Copilot** (`/assistant`)

---

## 3. Route Access Authorization Mapping

| Route Path | Allowed Roles | Enforced Guard / Condition |
|---|---|---|
| `/` | All Roles | Dynamic role dashboard rendering |
| `/applications` | All Roles | Role-based record scoping (Super/Admin sees all; Evaluator/Fresher sees assigned) |
| `/applications/new` | Super Admin, Admin, Institution User | Protected action button & form |
| `/tasks` | All Roles | Super Admin/Admin/Officer manage & create; Evaluator/Fresher update assigned |
| `/learning` | Super Admin, Fresher, Evaluator | Specialized onboarding workspace |
| `/validation` | Super Admin, Admin, Officer, Evaluator | Scrutiny review & defect clearing |
| `/documents` | All Roles | View permissions for all; upload/verify restricted |
| `/compliance` | All Roles | View permissions for all; resolution restricted |
| `/evc` | Super Admin, Admin, Officer, Evaluator, Viewer | Read-only for Viewer; Conduct for Evaluator |
| `/assistant` | All Roles | Universal AI query copilot |
| `/admin` | Super Admin, Admin | 403 Forbidden for Evaluator, Fresher, Viewer, Applicant |
| `/profile` | All Roles | Individual profile and RBAC credential inspector |
| `/notifications` | All Roles | User-scoped notification center |
