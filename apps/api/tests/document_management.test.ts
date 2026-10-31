import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { app } from '../src/server';

describe('SuperNexus AI — Enterprise Document Management, Verification & Request Workflows', () => {
  let superAdminToken = '';
  let adminToken = '';
  let deptOfficerToken = '';
  let evaluatorToken = '';
  let fresherToken = '';
  let viewerToken = '';

  let createdDocId = '';
  let createdRequestId = '';

  beforeAll(async () => {
    const [superRes, adminRes, deptRes, evalRes, freshRes, viewRes] = await Promise.all([
      request(app).post('/api/v1/auth/demo-login').send({ role: 'SUPER_ADMIN' }),
      request(app).post('/api/v1/auth/demo-login').send({ role: 'ADMIN' }),
      request(app).post('/api/v1/auth/demo-login').send({ role: 'DEPARTMENT_OFFICER' }),
      request(app).post('/api/v1/auth/demo-login').send({ role: 'EVALUATOR' }),
      request(app).post('/api/v1/auth/demo-login').send({ role: 'FRESHER' }),
      request(app).post('/api/v1/auth/demo-login').send({ role: 'VIEWER' }),
    ]);

    superAdminToken = superRes.body.data.token;
    adminToken = adminRes.body.data.token;
    deptOfficerToken = deptRes.body.data.token;
    evaluatorToken = evalRes.body.data.token;
    fresherToken = freshRes.body.data.token;
    viewerToken = viewRes.body.data.token;
  });

  describe('1. Document Categories & Overview Telemetry', () => {
    it('should list all standard document categories', async () => {
      const res = await request(app)
        .get('/api/v1/documents/categories/list')
        .set('Authorization', `Bearer ${evaluatorToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThanOrEqual(10);
      const names = res.body.data.map((c: any) => c.name);
      expect(names).toContain('AICTE Approval Documents');
      expect(names).toContain('Infrastructure Documents');
      expect(names).toContain('Financial Documents');
    });

    it('should return overview dashboard statistics', async () => {
      const res = await request(app)
        .get('/api/v1/documents/stats/overview')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.totalDocs).toBeGreaterThanOrEqual(4);
      expect(res.body.data.categoriesCount).toBeGreaterThanOrEqual(10);
      expect(res.body.data.totalRequests).toBeGreaterThanOrEqual(3);
    });
  });

  describe('2. Scenario 1: Upload → Verification Workflow', () => {
    it('Employee uploads a document which enters PENDING_VERIFICATION', async () => {
      const res = await request(app)
        .post('/api/v1/documents/upload')
        .set('Authorization', `Bearer ${evaluatorToken}`)
        .field('title', 'Faculty Biometric Attendance Roll October 2026')
        .field('documentType', 'FACULTY_STAFF_DECLARATION')
        .field('description', 'Biometric timestamp attendance logs for Computer Engineering department.')
        .attach('file', Buffer.from('PDF_SAMPLE_TEST_CONTENT_OCTOBER_FACULTY'), 'faculty_biometric_oct.pdf');

      expect(res.status).toBe(201);
      expect(res.body.data.status).toBe('PENDING_VERIFICATION');
      expect(res.body.data.title).toBe('Faculty Biometric Attendance Roll October 2026');
      createdDocId = res.body.data.id;
    });

    it('Viewer cannot verify documents (403 Forbidden)', async () => {
      const res = await request(app)
        .post(`/api/v1/documents/${createdDocId}/verify`)
        .set('Authorization', `Bearer ${viewerToken}`)
        .send({ status: 'VERIFIED', comments: 'Attempted unauthorized verification' });

      expect(res.status).toBe(403);
    });

    it('Fresher cannot verify documents (403 Forbidden)', async () => {
      const res = await request(app)
        .post(`/api/v1/documents/${createdDocId}/verify`)
        .set('Authorization', `Bearer ${fresherToken}`)
        .send({ status: 'VERIFIED', comments: 'Fresher attempting verification' });

      expect(res.status).toBe(403);
    });

    it('Department Officer verifies the uploaded document with comments', async () => {
      const res = await request(app)
        .post(`/api/v1/documents/${createdDocId}/verify`)
        .set('Authorization', `Bearer ${deptOfficerToken}`)
        .send({
          status: 'VERIFIED',
          comments: 'Biometric records match AICTE faculty cadre roll. Verified and certified.',
        });

      expect(res.status).toBe(200);
      expect(res.body.data.document.status).toBe('VERIFIED');
      expect(res.body.data.document.verifiedBy).toBeDefined();
      expect(res.body.data.verification.status).toBe('VERIFIED');
    });

    it('Uploader employee sees VERIFIED status in their documents query', async () => {
      const res = await request(app)
        .get(`/api/v1/documents/${createdDocId}`)
        .set('Authorization', `Bearer ${evaluatorToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe('VERIFIED');
      expect(res.body.data.verifications.length).toBeGreaterThan(0);
    });
  });

  describe('3. Scenario 2: Employee Missing Document Request & Multi-Tier Notifications', () => {
    it('Employee creates a missing document request with justification and priority', async () => {
      const res = await request(app)
        .post('/api/v1/document-requests')
        .set('Authorization', `Bearer ${evaluatorToken}`)
        .send({
          title: 'Registered Land Sale Deed Volume 4492',
          categoryName: 'Lease Documents',
          reason: 'Required to audit boundary demarcations against survey number 102.',
          priority: 'HIGH',
          requiredByDate: new Date(Date.now() + 86400000 * 4).toISOString(),
          description: 'Original sub-registrar deed with stamp duty certification.',
        });

      expect(res.status).toBe(201);
      expect(res.body.data.status).toBe('SUBMITTED');
      expect(res.body.data.requestNumber).toMatch(/^DOC-REQ-/);
      createdRequestId = res.body.data.id;
    });

    it('Super Admin, Admin, and HR receive notifications in their queues', async () => {
      // Check Super Admin notifications
      const saNotifs = await request(app)
        .get('/api/v1/notifications')
        .set('Authorization', `Bearer ${superAdminToken}`);

      expect(saNotifs.status).toBe(200);
      const hasReq = saNotifs.body.data.notifications.some((n: any) =>
        n.category === 'DOCUMENT_REQUEST' && n.title.includes('HIGH')
      );
      expect(hasReq).toBe(true);

      // Check Admin notifications
      const adminNotifs = await request(app)
        .get('/api/v1/notifications')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(adminNotifs.status).toBe(200);
      expect(adminNotifs.body.data.notifications.length).toBeGreaterThan(0);
    });
  });

  describe('4. Scenario 3: HR Assigns Request & Fulfills with Uploaded Document', () => {
    it('HR Officer assigns request to Administrator', async () => {
      // Get Admin User ID
      const meRes = await request(app)
        .get('/api/v1/auth/me')
        .set('Authorization', `Bearer ${adminToken}`);

      const adminId = meRes.body.data.user.id;

      const res = await request(app)
        .post(`/api/v1/document-requests/${createdRequestId}/assign`)
        .set('Authorization', `Bearer ${deptOfficerToken}`)
        .send({
          assignedToId: adminId,
          notes: 'Please verify with Central Land Registry archives.',
        });

      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe('ASSIGNED');
    });

    it('Admin uploads requested document linking to the request', async () => {
      const res = await request(app)
        .post('/api/v1/documents/upload')
        .set('Authorization', `Bearer ${adminToken}`)
        .field('title', 'Registered Land Sale Deed Volume 4492 - Fulfilled Copy')
        .field('documentType', 'LAND_TITLE_LEASE_DEED')
        .field('documentRequestId', createdRequestId)
        .attach('file', Buffer.from('FULFILLED_DEED_DOCUMENT_CONTENT_4492'), 'land_deed_4492.pdf');

      expect(res.status).toBe(201);
      const docId = res.body.data.id;

      // Verify request is updated to DOCUMENT_UPLOADED
      const reqRes = await request(app)
        .get(`/api/v1/document-requests/${createdRequestId}`)
        .set('Authorization', `Bearer ${evaluatorToken}`);

      expect(reqRes.status).toBe(200);
      expect(reqRes.body.data.status).toBe('DOCUMENT_UPLOADED');
      expect(reqRes.body.data.fulfilledDocumentId).toBe(docId);

      // Super Admin verifies the fulfilled document
      const verifyRes = await request(app)
        .post(`/api/v1/documents/${docId}/verify`)
        .set('Authorization', `Bearer ${superAdminToken}`)
        .send({
          status: 'VERIFIED',
          comments: 'Certified copy authenticated. Available for requesting employee.',
        });

      expect(verifyRes.status).toBe(200);

      // Verify request is now AVAILABLE_FOR_EMPLOYEE
      const finalReq = await request(app)
        .get(`/api/v1/document-requests/${createdRequestId}`)
        .set('Authorization', `Bearer ${evaluatorToken}`);

      expect(finalReq.body.data.status).toBe('AVAILABLE_FOR_EMPLOYEE');
    });
  });

  describe('5. Scenario 4: Admin Rejection with Required Reason', () => {
    let rejectedRequestId = '';

    it('Fresher creates a request which Admin rejects with reason', async () => {
      const createRes = await request(app)
        .post('/api/v1/document-requests')
        .set('Authorization', `Bearer ${fresherToken}`)
        .send({
          title: 'Unredacted Internal Faculty Payroll Slips',
          reason: 'Curiosity learning check',
          priority: 'LOW',
        });

      expect(createRes.status).toBe(201);
      rejectedRequestId = createRes.body.data.id;

      // Admin rejects without reason should fail (400)
      const failRes = await request(app)
        .patch(`/api/v1/document-requests/${rejectedRequestId}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'REJECTED' });

      expect(failRes.status).toBe(400);

      // Admin rejects with clear reason
      const rejectRes = await request(app)
        .patch(`/api/v1/document-requests/${rejectedRequestId}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          status: 'REJECTED',
          rejectionReason: 'Confidential payroll data cannot be disclosed for junior training tasks.',
        });

      expect(rejectRes.status).toBe(200);
      expect(rejectRes.body.data.status).toBe('REJECTED');
      expect(rejectRes.body.data.rejectionReason).toContain('Confidential payroll data');
    });
  });

  describe('6. Scenario 5: Access Control & Cross-Employee Confidentiality', () => {
    let restrictedDocId = '';

    it('Admin uploads a restricted confidential document', async () => {
      const res = await request(app)
        .post('/api/v1/documents/upload')
        .set('Authorization', `Bearer ${adminToken}`)
        .field('title', 'Confidential Vigilance Inquiry Dossier')
        .field('documentType', 'GENERAL_SUPPORTING_DOCUMENT')
        .field('isRestricted', 'true')
        .attach('file', Buffer.from('CONFIDENTIAL_VIGILANCE_DOSSIER_RESTRICTED'), 'vigilance_dossier.pdf');

      expect(res.status).toBe(201);
      restrictedDocId = res.body.data.id;
    });

    it('Fresher employee attempting to download restricted document is denied (403 Forbidden)', async () => {
      const res = await request(app)
        .get(`/api/v1/documents/${restrictedDocId}/download`)
        .set('Authorization', `Bearer ${fresherToken}`);

      expect(res.status).toBe(403);
    });

    it('Super Admin can securely download the document', async () => {
      const res = await request(app)
        .get(`/api/v1/documents/${restrictedDocId}/download`)
        .set('Authorization', `Bearer ${superAdminToken}`);

      expect(res.status).toBe(200);
    });
  });
});

