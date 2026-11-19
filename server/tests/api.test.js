import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';

describe('EXITCONTROL API Automated Test Suite (Section 13)', () => {
  let authToken = '';

  it('GET /health - should return status ok', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body.timestamp).toBeDefined();
  });

  describe('Authentication & Authorization Tests (13.1)', () => {
    it('POST /api/v1/auth/login - should fail with wrong password', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: 'hr@exitcontrol.vn', password: 'WrongPassword!' });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('POST /api/v1/auth/login - should succeed with valid credentials and return JWT', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: 'hr@exitcontrol.vn', password: 'Password123!' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.accessToken).toBeDefined();
      expect(res.body.data.user.email).toBe('hr@exitcontrol.vn');
      authToken = res.body.data.accessToken;
    });

    it('GET /api/v1/dashboard/overview - should block unauthenticated requests', async () => {
      const res = await request(app).get('/api/v1/dashboard/overview');
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });

  describe('Core Business Workflow Tests', () => {
    it('GET /api/v1/dashboard/overview - should return KPI metrics when authenticated', async () => {
      const res = await request(app)
        .get('/api/v1/dashboard/overview')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.totalRequests).toBeGreaterThanOrEqual(1);
    });

    it('GET /api/v1/offboarding - should return offboarding requests list', async () => {
      const res = await request(app)
        .get('/api/v1/offboarding')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThanOrEqual(1);
    });

    it('GET /api/v1/assets - should return inventory of physical assets', async () => {
      const res = await request(app)
        .get('/api/v1/assets')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data[0].assetCode).toBeDefined();
    });

    it('GET /api/v1/access/accounts - should return system access accounts', async () => {
      const res = await request(app)
        .get('/api/v1/access/accounts')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('GET /api/v1/handovers - should return handover documents', async () => {
      const res = await request(app)
        .get('/api/v1/handovers')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('GET /api/v1/reports/analytics - should return comprehensive analytics', async () => {
      const res = await request(app)
        .get('/api/v1/reports/analytics')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.summary).toBeDefined();
      expect(res.body.data.deptBreakdown).toBeDefined();
    });

    it('POST /api/v1/ai/chat - should reply with helpful guidance and policy disclaimer', async () => {
      const res = await request(app)
        .post('/api/v1/ai/chat')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ message: 'Quy trình bàn giao kỹ thuật gồm những bước nào?' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.reply.toLowerCase()).toContain('bàn giao');
      expect(res.body.data.disclaimer).toBeDefined();
    });
  });
});
