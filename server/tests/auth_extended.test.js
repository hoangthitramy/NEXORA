import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';

describe('Auth Extended Flows: Register, Forgot Password, Reset Password & User Management', () => {
  let adminToken = '';
  let resetToken = '';
  const testEmail = `newuser_${Date.now()}@exitcontrol.vn`;
  const adminCreatedEmail = `adminuser_${Date.now()}@exitcontrol.vn`;

  it('GET /api/v1/auth/departments - should return list of departments', async () => {
    const res = await request(app).get('/api/v1/auth/departments');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThanOrEqual(1);
  });

  it('POST /api/v1/auth/register - should register a new employee user', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({
        fullName: 'Nguyễn Văn Test',
        email: testEmail,
        password: 'Password123!',
        phone: '0912345678',
        jobTitle: 'Junior QA Engineer',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.email).toBe(testEmail);
    expect(res.body.data.employeeCode).toBeDefined();
  });

  it('POST /api/v1/auth/register - should fail when email already exists', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({
        fullName: 'Nguyễn Văn Trùng',
        email: testEmail,
        password: 'Password123!',
      });

    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
  });

  it('POST /api/v1/auth/forgot-password - should generate reset token for existing user', async () => {
    const res = await request(app)
      .post('/api/v1/auth/forgot-password')
      .send({ email: testEmail });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.resetToken).toBeDefined();
    resetToken = res.body.data.resetToken;
  });

  it('POST /api/v1/auth/reset-password - should reset password with valid token', async () => {
    const res = await request(app)
      .post('/api/v1/auth/reset-password')
      .send({
        resetToken,
        newPassword: 'NewPassword456!',
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('POST /api/v1/auth/login - should login with the newly reset password', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: testEmail,
        password: 'NewPassword456!',
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.accessToken).toBeDefined();
  });

  describe('Admin User Management', () => {
    it('Should login as Admin and create a new user with custom role', async () => {
      // 1. Login Admin
      const loginRes = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: 'admin@exitcontrol.vn', password: 'Password123!' });

      adminToken = loginRes.body.data.accessToken;
      expect(adminToken).toBeDefined();

      // 2. Admin creates user
      const createRes = await request(app)
        .post('/api/v1/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          fullName: 'Trần Thị AdminCreated',
          email: adminCreatedEmail,
          password: 'Password123!',
          roleName: 'IT',
          jobTitle: 'Network Security Officer',
          phone: '0988776655',
        });

      expect(createRes.status).toBe(201);
      expect(createRes.body.success).toBe(true);
      expect(createRes.body.data.email).toBe(adminCreatedEmail);
    });

    it('GET /api/v1/users - should list all users for Admin', async () => {
      const res = await request(app)
        .get('/api/v1/users')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      const found = res.body.data.find((u) => u.email === adminCreatedEmail);
      expect(found).toBeDefined();
    });
  });
});
