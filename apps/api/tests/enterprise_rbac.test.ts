import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { app } from '../src/server';

describe('SuperNexus AI — Enterprise Multi-Role & RBAC Security Tests', () => {
  let superAdminToken = '';
  let adminToken = '';
  let deptOfficerToken = '';
  let evaluatorToken = '';
  let fresherToken = '';
  let viewerToken = '';

  beforeAll(async () => {
    const [superRes, adminRes, deptRes, evalRes, freshRes, viewRes] = await Promise.all([
      request(app).post('/api/v1/auth/demo-login').send({ role: 'SUPER_ADMIN' }),
      request(app).post('/api/v1/auth/demo-login').send({ role: 'ADMIN' }),
      request(app).post('/api/v1/auth/demo-login').send({ role: 'DEPARTMENT_OFFICER' }),
      request(app).post('/api/v1/auth/demo-login').send({ role: 'EVALUATOR' }),
      request(app).post('/api/v1/auth/demo-login').send({ role: 'FRESHER' }),
      request(app).post('/api/v1/auth/demo-login').send({ role: 'VIEWER' }),
    ]);

    expect(superRes.status).toBe(200);
    expect(adminRes.status).toBe(200);
    expect(deptRes.status).toBe(200);
    expect(evalRes.status).toBe(200);
    expect(freshRes.status).toBe(200);
    expect(viewRes.status).toBe(200);

    superAdminToken = superRes.body.data.token;
    adminToken = adminRes.body.data.token;
    deptOfficerToken = deptRes.body.data.token;
    evaluatorToken = evalRes.body.data.token;
    fresherToken = freshRes.body.data.token;
    viewerToken = viewRes.body.data.token;
  });

  describe('1. Identity Verification & Permission Payloads', () => {
    it('SUPER_ADMIN identity should include full permissions and designation', async () => {
      const res = await request(app)
        .get('/api/v1/auth/me')
        .set('Authorization', `Bearer ${superAdminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.user.role).toBe('SUPER_ADMIN');
      expect(res.body.data.user.designation).toBeDefined();
      expect(Array.isArray(res.body.data.user.permissions)).toBe(true);
      expect(res.body.data.user.permissions.length).toBeGreaterThan(15);
    });

    it('VIEWER identity should receive read-only permissions', async () => {
      const res = await request(app)
        .get('/api/v1/auth/me')
        .set('Authorization', `Bearer ${viewerToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.user.role).toBe('VIEWER');
      expect(res.body.data.user.permissions).toContain('application.view');
      expect(res.body.data.user.permissions).not.toContain('application.approve');
      expect(res.body.data.user.permissions).not.toContain('role.manage');
    });
  });

  describe('2. Administrative Endpoint Role Guards', () => {
    it('SUPER_ADMIN and ADMIN should access security intelligence stats', async () => {
      const res = await request(app)
        .get('/api/v1/admin/security-stats')
        .set('Authorization', `Bearer ${superAdminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.totalUsers).toBeGreaterThan(0);
    });

    it('VIEWER must be forbidden (403) from accessing security intelligence', async () => {
      const res = await request(app)
        .get('/api/v1/admin/security-stats')
        .set('Authorization', `Bearer ${viewerToken}`);

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });

    it('FRESHER must be forbidden (403) from accessing security intelligence', async () => {
      const res = await request(app)
        .get('/api/v1/admin/security-stats')
        .set('Authorization', `Bearer ${fresherToken}`);

      expect(res.status).toBe(403);
    });

    it('Should return centralized Roles & Permissions matrix', async () => {
      const res = await request(app)
        .get('/api/v1/admin/roles-permissions')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.roles.length).toBeGreaterThanOrEqual(6);
      expect(res.body.data.allPermissions.length).toBeGreaterThan(10);
    });

    it('Should list enterprise departments', async () => {
      const res = await request(app)
        .get('/api/v1/admin/departments')
        .set('Authorization', `Bearer ${deptOfficerToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThanOrEqual(4);
    });
  });

  describe('3. Task Assignment & Workflow Scoping Guards', () => {
    it('DEPARTMENT_OFFICER should be permitted to create and assign tasks', async () => {
      const meRes = await request(app)
        .get('/api/v1/auth/me')
        .set('Authorization', `Bearer ${fresherToken}`);
      const fresherId = meRes.body.data.user.id;

      const res = await request(app)
        .post('/api/v1/tasks')
        .set('Authorization', `Bearer ${deptOfficerToken}`)
        .send({
          title: 'Review Chapter 5 Land Norm Amendments',
          description: 'Compare updated 2026 acreage norms for tier-2 technical colleges.',
          type: 'LEARNING',
          priority: 'NORMAL',
          assignedToId: fresherId,
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.title).toBe('Review Chapter 5 Land Norm Amendments');
    });

    it('FRESHER must be forbidden (403) from creating/assigning tasks', async () => {
      const res = await request(app)
        .post('/api/v1/tasks')
        .set('Authorization', `Bearer ${fresherToken}`)
        .send({
          title: 'Unauthorized Task Assignment Attempt',
          assignedToId: 'some-user',
        });

      expect(res.status).toBe(403);
    });

    it('VIEWER must be forbidden (403) from creating/assigning tasks', async () => {
      const res = await request(app)
        .post('/api/v1/tasks')
        .set('Authorization', `Bearer ${viewerToken}`)
        .send({
          title: 'Unauthorized Task Assignment Attempt',
          assignedToId: 'some-user',
        });

      expect(res.status).toBe(403);
    });

    it('EVALUATOR should be able to view their assigned tasks', async () => {
      const res = await request(app)
        .get('/api/v1/tasks')
        .set('Authorization', `Bearer ${evaluatorToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('FRESHER should be able to view their learning tasks', async () => {
      const res = await request(app)
        .get('/api/v1/tasks')
        .set('Authorization', `Bearer ${fresherToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);
    });
  });
});
