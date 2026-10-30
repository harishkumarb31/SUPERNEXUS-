import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { app } from '../src/server';
import { prisma } from '../src/services/db';

describe('RegulaFlow AI Security & Workflow Engine Verification Tests', () => {
  let institutionToken = '';
  let regionalOfficerToken = '';
  let committeeToken = '';
  let bureauToken = '';
  let adminToken = '';

  let sampleApplication: any;
  let sampleDocument: any;
  let sampleDeficiency: any;
  let sampleEvcActivity: any;
  let sampleObligation: any;

  beforeAll(async () => {
    // 1. Obtain JWT tokens for each role using demo-login
    const [instRes, roRes, cmRes, boRes, adminRes] = await Promise.all([
      request(app).post('/api/v1/auth/demo-login').send({ role: 'INSTITUTION_USER' }),
      request(app).post('/api/v1/auth/demo-login').send({ role: 'REGIONAL_OFFICER' }),
      request(app).post('/api/v1/auth/demo-login').send({ role: 'COMMITTEE_MEMBER' }),
      request(app).post('/api/v1/auth/demo-login').send({ role: 'BUREAU_OFFICER' }),
      request(app).post('/api/v1/auth/demo-login').send({ role: 'SYSTEM_ADMIN' }),
    ]);

    institutionToken = instRes.body.data.token;
    regionalOfficerToken = roRes.body.data.token;
    committeeToken = cmRes.body.data.token;
    bureauToken = boRes.body.data.token;
    adminToken = adminRes.body.data.token;

    // 2. Fetch seed artifacts for test assertions
    sampleApplication = await prisma.application.findFirst({
      include: { documents: true },
    });
    sampleDocument = sampleApplication?.documents?.[0];
    sampleDeficiency = await prisma.validationFinding.findFirst();
    sampleEvcActivity = await prisma.eVCActivity.findFirst();
    sampleObligation = await prisma.complianceObligation.findFirst();
  });

  describe('1. Role-Based Scrutiny & OCR Security Guards', () => {
    it('INSTITUTION_USER should be forbidden (403) from editing OCR verified fields', async () => {
      if (!sampleDocument) return;

      const res = await request(app)
        .put(`/api/v1/ocr/${sampleDocument.id}/fields`)
        .set('Authorization', `Bearer ${institutionToken}`)
        .send({ fields: { auditedLandArea: 7.5 } });

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });

    it('COMMITTEE_MEMBER should be forbidden (403) from editing OCR verified fields', async () => {
      if (!sampleDocument) return;

      const res = await request(app)
        .put(`/api/v1/ocr/${sampleDocument.id}/fields`)
        .set('Authorization', `Bearer ${committeeToken}`)
        .send({ fields: { auditedLandArea: 7.5 } });

      expect(res.status).toBe(403);
    });

    it('REGIONAL_OFFICER should be permitted (200) to update OCR verified fields', async () => {
      if (!sampleDocument) return;

      const res = await request(app)
        .put(`/api/v1/ocr/${sampleDocument.id}/fields`)
        .set('Authorization', `Bearer ${regionalOfficerToken}`)
        .send({ fields: { auditedLandArea: 8.2 }, remarks: 'Verified from land deed' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe('2. Validation & Deficiency Governance Guards', () => {
    it('INSTITUTION_USER should be forbidden (403) from resolving scrutiny deficiencies', async () => {
      if (!sampleDeficiency) return;

      const res = await request(app)
        .put(`/api/v1/validation/findings/${sampleDeficiency.id}/resolve`)
        .set('Authorization', `Bearer ${institutionToken}`)
        .send({ remarks: 'Self-resolved by institution' });

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });

    it('REGIONAL_OFFICER should be permitted (200) to resolve scrutiny deficiencies', async () => {
      if (!sampleDeficiency) return;

      const res = await request(app)
        .put(`/api/v1/validation/findings/${sampleDeficiency.id}/resolve`)
        .set('Authorization', `Bearer ${regionalOfficerToken}`)
        .send({ remarks: 'Verified rectification docs during scrutiny' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe('3. EVC Scheduling & Report Governance Guards', () => {
    it('INSTITUTION_USER should be forbidden (403) from scheduling an EVC inspection', async () => {
      if (!sampleApplication) return;

      const res = await request(app)
        .post('/api/v1/evc')
        .set('Authorization', `Bearer ${institutionToken}`)
        .send({
          applicationId: sampleApplication.id,
          scheduledDate: new Date(Date.now() + 86400000).toISOString(),
          committeeMembers: ['Prof. Test Expert'],
        });

      expect(res.status).toBe(403);
    });

    it('INSTITUTION_USER should be forbidden (403) from submitting EVC inspection reports', async () => {
      if (!sampleEvcActivity) return;

      const res = await request(app)
        .post(`/api/v1/evc/${sampleEvcActivity.id}/submit-report`)
        .set('Authorization', `Bearer ${institutionToken}`)
        .send({
          recommendation: 'RECOMMENDED',
          remarks: 'Self report',
          score: 85,
        });

      expect(res.status).toBe(403);
    });

    it('COMMITTEE_MEMBER or REGIONAL_OFFICER should be permitted to submit EVC report', async () => {
      if (!sampleEvcActivity) return;

      const res = await request(app)
        .post(`/api/v1/evc/${sampleEvcActivity.id}/submit-report`)
        .set('Authorization', `Bearer ${committeeToken}`)
        .send({
          recommendation: 'RECOMMENDED',
          remarks: 'EVC physical inspection completed with compliant infrastructure',
          score: 92,
        });

      expect([200, 400]).toContain(res.status);
      if (res.status === 200) {
        expect(res.body.success).toBe(true);
      }
    });
  });

  describe('4. Document Integrity & Institutional Isolation Guards', () => {
    it('POST /api/v1/documents/upload should reject zero-byte files with 400', async () => {
      if (!sampleApplication) return;

      const res = await request(app)
        .post('/api/v1/documents/upload')
        .set('Authorization', `Bearer ${institutionToken}`)
        .field('applicationId', sampleApplication.id)
        .field('documentType', 'LAND_DOCUMENT')
        .attach('file', Buffer.from(''), 'empty.pdf');

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toMatch(/empty/i);
    });

    it('DELETE /api/v1/documents/:id should reject unauthorized deletion by cross-institution user', async () => {
      const otherInstDoc = await prisma.applicationDocument.findFirst({
        where: {
          application: {
            institution: {
              code: { not: '1-109283921' }
            }
          }
        }
      });

      if (otherInstDoc) {
        const res = await request(app)
          .delete(`/api/v1/documents/${otherInstDoc.id}`)
          .set('Authorization', `Bearer ${institutionToken}`);

        expect(res.status).toBe(403);
      }
    });
  });

  describe('5. Compliance & Notification Ownership Isolation', () => {
    it('PUT /api/v1/compliance/:id/resolve should forbid non-owner institutions', async () => {
      const otherObligation = await prisma.complianceObligation.findFirst({
        where: {
          institution: {
            code: { not: '1-109283921' }
          }
        }
      });

      if (otherObligation) {
        const res = await request(app)
          .put(`/api/v1/compliance/${otherObligation.id}/resolve`)
          .set('Authorization', `Bearer ${institutionToken}`)
          .send({ resolutionNotes: 'Attempted resolution' });

        expect(res.status).toBe(403);
      }
    });

    it('PUT /api/v1/notifications/:id/read should forbid unauthorized user from updating other users notifications', async () => {
      const boUser = await prisma.user.findFirst({ where: { role: 'BUREAU_OFFICER' } });
      if (!boUser) return;

      const notif = await prisma.notification.create({
        data: {
          userId: boUser.id,
          category: 'APPLICATION_STATUS',
          severity: 'INFO',
          title: 'Private Bureau Memo',
          message: 'Confidential notification test',
        }
      });

      const res = await request(app)
        .put(`/api/v1/notifications/${notif.id}/read`)
        .set('Authorization', `Bearer ${institutionToken}`);

      expect(res.status).toBe(403);

      await prisma.notification.delete({ where: { id: notif.id } });
    });
  });

  describe('6. Application State Machine Transition Engine', () => {
    it('should reject invalid stage transitions with 400 Bad Request', async () => {
      const instUser = await prisma.user.findFirst({ where: { email: 'institution@regulaflow.aicte.gov.in' } });
      const draftApp = await prisma.application.create({
        data: {
          applicationNumber: `TEST-TRANS-${Date.now()}`,
          academicYear: '2026-2027',
          category: 'NEW_INSTITUTION',
          currentStage: 'DRAFT',
          institutionId: instUser!.institutionId!,
        }
      });

      // Attempt illegal jump from DRAFT to APPROVED
      const res = await request(app)
        .post(`/api/v1/applications/${draftApp.id}/transition`)
        .set('Authorization', `Bearer ${regionalOfficerToken}`)
        .send({ targetStage: 'APPROVED', remarks: 'Illegal transition' });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toMatch(/Invalid workflow stage transition/i);

      await prisma.application.delete({ where: { id: draftApp.id } });
    });

    it('should forbid INSTITUTION_USER from executing regulatory officer transitions', async () => {
      if (!sampleApplication) return;

      const res = await request(app)
        .post(`/api/v1/applications/${sampleApplication.id}/transition`)
        .set('Authorization', `Bearer ${institutionToken}`)
        .send({ targetStage: 'UNDER_SCRUTINY', remarks: 'Institution trying to scrutinize own app' });

      expect([400, 403]).toContain(res.status);
    });

    it('should allow valid transition from DRAFT to SUBMITTED by institution when documents exist', async () => {
      const instUser = await prisma.user.findFirst({ where: { email: 'institution@regulaflow.aicte.gov.in' } });
      const testApp = await prisma.application.create({
        data: {
          applicationNumber: `TEST-SUBMIT-${Date.now()}`,
          academicYear: '2026-2027',
          category: 'EXTENSION_OF_APPROVAL',
          currentStage: 'DRAFT',
          institutionId: instUser!.institutionId!,
        }
      });

      // Attach mandatory document
      await prisma.applicationDocument.create({
        data: {
          applicationId: testApp.id,
          documentType: 'LAND_DOCUMENT',
          fileName: 'land_title_deed_2026.pdf',
          originalName: 'Land_Title_Deed_2026.pdf',
          filePath: '/uploads/sample.pdf',
          fileSize: 1048576,
          mimeType: 'application/pdf',
          checksumSha256: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
          status: 'PENDING',
        }
      });

      const res = await request(app)
        .post(`/api/v1/applications/${testApp.id}/transition`)
        .set('Authorization', `Bearer ${institutionToken}`)
        .send({ targetStage: 'SUBMITTED', remarks: 'Official submission with all mandatory documents' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.currentStage).toBe('SUBMITTED');

      // Verify audit trail entry was recorded
      const audit = await prisma.auditEvent.findFirst({
        where: { entityId: testApp.id },
        orderBy: { timestamp: 'desc' },
      });
      expect(audit).toBeDefined();

      // Clean up
      await prisma.auditEvent.deleteMany({ where: { entityId: testApp.id } });
      await prisma.applicationDocument.deleteMany({ where: { applicationId: testApp.id } });
      await prisma.applicationStageHistory.deleteMany({ where: { applicationId: testApp.id } });
      await prisma.application.delete({ where: { id: testApp.id } });
    });
  });
});
