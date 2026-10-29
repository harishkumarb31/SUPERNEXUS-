# RegulaFlow AI — Role-Based User Manual
**Problem Statement ID:** SIH26262 | Smart India Hackathon 2026
**Theme:** Smart Automation | **Category:** Software

---

## 1. Overview & Demo Accounts

For local demonstration and SIH jury evaluation, five pre-configured role accounts are available with password `Password@123`:

| Role | Demo Account Email | Description |
|---|---|---|
| **Institution User** | `institution@regulaflow.aicte.gov.in` | Principal, Apex Institute of Technology |
| **Regional Officer** | `officer.north@regulaflow.aicte.gov.in` | Northern Regional Directorate Scrutiny Officer |
| **Bureau Officer** | `bureau.chief@regulaflow.aicte.gov.in` | Bureau Chief (Approvals & Oversight), AICTE HQ |
| **Committee Member** | `committee.expert@regulaflow.aicte.gov.in` | EVC Committee Chairman (Senior Professor) |
| **System Administrator** | `admin@regulaflow.aicte.gov.in` | AICTE IT Directorate Administrator |

> **Pro-Tip for Evaluators:** You can also switch between any of these roles in 1 click using the **"Role: [Current Role]"** dropdown in the top navigation bar!

---

## 2. User Journey Guides

### Journey A — Institution User: Submitting an Application
1. Sign in as `institution@regulaflow.aicte.gov.in`.
2. Navigate to **Applications** and click **"+ Create Application"**.
3. Choose category (e.g. `EXTENSION_OF_APPROVAL` or `INCREASE_IN_INTAKE`) and priority.
4. Open the created draft application.
5. In the **Documents & OCR** tab, click **"Upload Proof Document"**.
6. Select the file (e.g., Lease deed, Fire NOC, or Affidavit) and click upload.
7. Click **"Submit for Scrutiny"** at the top right.
8. The application moves to `SUBMITTED` stage, and the regional scrutiny queue is notified.

### Journey B — Regional Officer: Scrutiny & Deficiency Flagging
1. Sign in as `officer.north@regulaflow.aicte.gov.in`.
2. On the **Dashboard**, review applications under **"Under Desk Scrutiny"**.
3. Open application `AICTE/2026-27/APP-00102`.
4. Navigate to the **Deficiencies & Flags** tab. Notice the automated finding: `VAL_FIRE_NOC_EXPIRED`.
5. Review the source evidence excerpt: `"This certificate is valid for a period of three years from 16-09-2023 to 15-09-2026"`.
6. Click **"Transition Stage"** and select **"Deficiency Raised"** or **"Returned for Correction"**.
7. The institution is automatically notified to upload a valid renewal certificate.

### Journey C — Regional Officer & Committee: EVC Scheduling
1. Navigate to **EVC & Committees**.
2. Click **"+ Schedule EVC Inspection"**.
3. Select an application (e.g., `AICTE/2026-27/APP-00103`), assign the Chairman, inspection date, and verification mode.
4. Notice conflict detection: assigning an expert already scheduled on that date will trigger a conflict warning.
5. Once scheduled, the committee member can open the activity, conduct verification, and click **"Submit Inspection Report"** with observations and recommendation.

### Journey D — All Roles: Compliance Monitoring & Deadlines
1. Open the **Compliance Center**.
2. Inspect active covenants, upcoming renewals (&le;30 days), and overdue escalations.
3. Click **"Run Deadline Evaluation"** to trigger the background scheduler. Notice live status updates and escalation generation.
4. To fulfill an obligation, click **"Resolve Covenant"**, enter verification notes, and submit.

### Journey E — Regulatory AI Assistant (RAG)
1. Open the **Regulatory Assistant** tab.
2. Select any suggested inquiry or type a question (e.g. *"What are the minimum land norms in urban areas?"* or *"What is the mandatory SFR for B.Tech?"*).
3. The engine returns a synthesized answer grounded in the AICTE Approval Process Handbook (APH) with exact chapter, section, and page citations.

### Journey F — Audit Trail & Forensics
1. Open the **Audit Trail** tab.
2. Filter by action (e.g., `STAGE_TRANSITION` or `DEFICIENCY_FLAGGED`).
3. Click **"Inspect State"** to examine the before-and-after JSON mutation diffs.
