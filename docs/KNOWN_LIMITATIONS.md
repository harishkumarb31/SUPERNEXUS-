# SuperNexus AI — Known Limitations & Architectural Notes

**System:** SuperNexus AI (RegulaFlow Engine)  
**Date:** October 31, 2026  
**Version:** 2.0  

---

## 1. Known Architectural Characteristics

### 1.1 Serverless SQLite Ephemeral Storage
* **Observation:** In Vercel serverless environments, SQLite is stored in `/tmp/dev.db`. Because serverless execution containers are ephemeral and spun down after periods of inactivity, writes to the SQLite database during a specific lambda invocation will reset when new containers spin up.
* **Production Recommendation:** For persistent production data beyond demo evaluations, connect a managed PostgreSQL instance (e.g., Supabase, Neon, AWS RDS, or Railway) by specifying the `DATABASE_URL` environment variable in the Vercel dashboard.

### 1.2 OCR File Size and Serverless Timeouts
* **Observation:** Tesseract.js / PDF parsing for large document files (>15MB) may exceed the default 10-second execution timeout on free-tier Vercel serverless functions.
* **Mitigation:** The application includes a heuristic extraction fallback that parses text layers and structural regexes in milliseconds, preventing timeout errors.

### 1.3 Background Scheduler in Serverless
* **Observation:** Long-running `node-cron` schedulers (`startScheduler()`) require a persistent process. In serverless environments, cron jobs do not run continuously in memory.
* **Mitigation:** Manual compliance checks can be triggered on-demand via the "Run Compliance Scan" button on the dashboard (`POST /api/v1/compliance/check`), and Vercel Cron Jobs can be configured via `vercel.json` if automated scheduled execution is desired in production.

---

## 2. Maintenance & Support
For issues or extensions, refer to:
- Repository: `https://github.com/harishkumarb31/SUPERNEXUS-`
- Documentation: `docs/ARCHITECTURE.md`, `docs/API.md`, `docs/TEST_RESULTS.md`
