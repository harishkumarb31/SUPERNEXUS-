# RegulaFlow AI — Known Limitations & Scope Boundaries
**Problem Statement ID:** SIH26262 | Smart India Hackathon 2026
**Theme:** Smart Automation | **Category:** Software

---

## 1. Prototype & Evaluation Assumptions

1. **Local Sandbox Environment**:
   - The evaluation prototype operates with a local SQLite database via Prisma ORM for zero-friction evaluation and offline jury review.
   - A production-grade schema is pre-configured in `prisma/schema.postgresql.prisma` ready for cloud Postgres deployment.

2. **OCR Engine Integration**:
   - The application incorporates `tesseract.js` and `pdf-parse` for local OCR text and metadata extraction from uploaded PDF documents.
   - For scanned physical affidavits with low optical clarity or degraded ink, cloud vision models (Google Cloud Document AI or AWS Textract) can be integrated via the modular `ocrService.ts` driver interface.

3. **Grounded RAG Regulatory Assistant**:
   - The built-in regulatory knowledge base is grounded on official AICTE Approval Process Handbook (APH) clauses, land norms, faculty-to-student ratios, building safety standards, and fee structures.
   - The default mode operates with grounded cosine semantic similarity and clause citation extraction. When a Gemini API key is configured in `.env`, the assistant transitions to hybrid LLM synthesis with grounded citations.

4. **Official AICTE Portal Integration**:
   - As mandated by SIH competition guidelines, this software prototype does not claim live API connectivity to confidential production government servers. Simulated data ingestion mimics realistic AICTE application formats, regional jurisdictions, and committee workflows.

5. **Frontend Bundle Size**:
   - The single bundled vendor chunk is currently ~790 kB minified (gzip ~219 kB) containing Tailwind CSS, Lucide icons, and Chart.js/Recharts. In an enterprise release, route-based dynamic `import()` code-splitting can divide chunks below 200 kB.
