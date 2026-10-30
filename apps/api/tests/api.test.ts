import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '../src/server';

describe('RegulaFlow AI Core Engine API Tests', () => {
  let institutionToken = '';
  let regionalOfficerToken = '';

  it('GET /api/health should return 200 and online status', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ONLINE');
    expect(res.body.sihProblemStatement).toBe('SIH26262');
  });

  describe('Authentication Module', () => {
    it('POST /api/v1/auth/login should authenticate institution user', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'institution@regulaflow.aicte.gov.in',
          password: 'Password@123',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.token).toBeDefined();
      expect(res.body.data.user.role).toBe('INSTITUTION_USER');
      institutionToken = res.body.data.token;
    });

    it('POST /api/v1/auth/login should reject invalid credentials', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'institution@regulaflow.aicte.gov.in',
          password: 'WrongPassword999',
        });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('POST /api/v1/auth/demo-login should authenticate regional officer', async () => {
      const res = await request(app)
        .post('/api/v1/auth/demo-login')
        .send({ role: 'REGIONAL_OFFICER' });

      expect(res.status).toBe(200);
      expect(res.body.data.user.role).toBe('REGIONAL_OFFICER');
      regionalOfficerToken = res.body.data.token;
    });
  });

  describe('Application Lifecycle & Access Control', () => {
    it('GET /api/v1/applications should list applications for authenticated user', async () => {
      const res = await request(app)
        .get('/api/v1/applications')
        .set('Authorization', `Bearer ${regionalOfficerToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data.applications)).toBe(true);
      expect(res.body.data.applications.length).toBeGreaterThan(0);
    });

    it('GET /api/v1/applications without token should return 401 Unauthorized', async () => {
      const res = await request(app).get('/api/v1/applications');
      expect(res.status).toBe(401);
    });
  });

  describe('Compliance & Deadline Monitoring', () => {
    it('GET /api/v1/compliance should return obligations and summary metrics', async () => {
      const res = await request(app)
        .get('/api/v1/compliance')
        .set('Authorization', `Bearer ${regionalOfficerToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.metrics).toBeDefined();
      expect(res.body.data.metrics.total).toBeGreaterThan(0);
    });

    it('POST /api/v1/compliance/check should execute scheduler job', async () => {
      const res = await request(app)
        .post('/api/v1/compliance/check')
        .set('Authorization', `Bearer ${regionalOfficerToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.obligationsChecked).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Regulatory Knowledge & Grounded RAG Assistant', () => {
    it('POST /api/v1/assistant/query should return grounded citations from APH Handbook', async () => {
      const res = await request(app)
        .post('/api/v1/assistant/query')
        .set('Authorization', `Bearer ${institutionToken}`)
        .send({ question: 'What are the minimum land norms required for technical institutions in urban areas?' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.answer).toBeDefined();
      expect(res.body.data.citations.length).toBeGreaterThan(0);
      expect(res.body.data.grounded).toBe(true);
    });
  });
});

