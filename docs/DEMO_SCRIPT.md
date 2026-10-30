# RegulaFlow AI — 5-Minute SIH Jury Demonstration Script
**Problem Statement ID:** SIH26262 | Smart India Hackathon 2026
**Theme:** Smart Automation | **Category:** Software
**Product:** RegulaFlow AI — Integrated AICTE Approval Workflow Automation, Compliance Monitoring and Alert Management System

---

## ⏱️ Minute 0:00 – 1:00: Problem & Mission Context
- **Speaker:** "Respected judges, every year thousands of technical institutions undergo statutory approvals under the AICTE Approval Process Handbook (APH). However, fragmented tracking, manual scrutiny of hundreds of pages, missed lease expirations, and opaque decision timelines lead to regulatory delays and compliance lapses."
- **Screen:** Open RegulaFlow AI Dashboard (`http://localhost:5173/dashboard`).
- **Speaker:** "Welcome to **RegulaFlow AI** — where *every approval is tracked, every deadline protected, and every action accountable*. Notice our command center: real-time application throughput, evidence-linked deficiency counts, upcoming compliance covenants, and regional pendency backed by live database persistence."

---

## ⏱️ Minute 1:00 – 2:00: Evidence-Linked Scrutiny & OCR Intelligence
- **Action:** Open application `AICTE/2026-27/APP-00102` (Apex Institute of Technology).
- **Speaker:** "Here is an active application for Increase in Intake. Notice the visual workflow stepper at the top showing the exact state machine progression from Draft to Final Approval."
- **Action:** Click the **Deficiencies & Flags** tab.
- **Speaker:** "Notice this critical finding: `VAL_FIRE_NOC_EXPIRED`. Rather than a vague notice, RegulaFlow AI cites the exact extracted text from page 1 of the Delhi Fire Service certificate: *'This certificate is valid from 16-09-2023 to 15-09-2026'*. Our deterministic rule engine verified this against AICTE APH Chapter 1 Clause 1.4 without relying on unpredictable AI hallucinations."
- **Action:** Click **Document Intelligence** on the sidebar. Show detected structured fields (Lessor, Lessee, Tenure, Expiry Date, Carpet Area) and raw text streams.

---

## ⏱️ Minute 2:00 – 3:00: Compliance Covenants & Deadline Escalation
- **Action:** Navigate to **Compliance Center** (`/compliance`).
- **Speaker:** "Regulatory governance does not end with approval. Technical institutes must maintain 30-year registered lease deeds, annual anti-ragging undertakings, and fire NOC renewals."
- **Action:** Click **"Run Deadline Evaluation"**.
- **Speaker:** "Watch as our background scheduler runs. It evaluates deadlines against statutory warning windows, shifts items from Active to Due Soon, and when an obligation lapses, automatically generates an escalation event to the Bureau Officer and alerts the institution."

---

## ⏱️ Minute 3:00 – 4:00: EVC Scheduling & Grounded RAG Assistant
- **Action:** Navigate to **EVC & Committees** (`/evc`).
- **Speaker:** "When desk scrutiny clears, physical inspection scheduling takes place. Our engine prevents expert scheduling conflicts, manages verification checklists (GIS geo-tagging, faculty biometric attendance, fire hydrants), and records observations."
- **Action:** Navigate to **Regulatory Assistant** (`/assistant`).
- **Speaker:** "Have a regulatory question? Let's ask: *'What is the mandatory Student-to-Faculty Ratio (SFR) for Undergraduate Engineering?'*"
- **Speaker:** "Notice our RAG response: it quotes official AICTE APH Chapter 2 Clause 2.1 (*SFR 1:20*) with exact chapter and page citations. The model assists officials but never usurps statutory authority."

---

## ⏱️ Minute 4:00 – 5:00: Audit Trail, Security & Closing
- **Action:** Navigate to **Audit Trail** (`/audit`). Open an event's **"Inspect State"** modal.
- **Speaker:** "Every single action — logins, stage transitions, document uploads, and deficiency resolutions — is recorded in an immutable audit journal capturing actor, role, IP address, and before/after JSON states."
- **Action:** Use the top bar **Role Switcher** to switch to `Institution Principal`.
- **Speaker:** "In 1 click, we demonstrate strict role-based isolation. The principal sees only Apex Institute's applications and documents, preventing any cross-institutional data leakage."
- **Speaker:** "RegulaFlow AI is built with Node.js, TypeScript, React, Tailwind, and Prisma ORM, fully tested with 100% test passing rates. Thank you, and we welcome your questions!"

