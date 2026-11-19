import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';

describe('Enterprise Workflow: Resignation, Finance, Exceptions & Audit', () => {
  let adminToken;
  let hrToken;
  let accountantToken;
  let employeeToken;
  let resignationId;
  let offboardingRequestId;
  let financeId;
  let exceptionId;

  beforeAll(async () => {
    // 1. Login as Admin
    const adminRes = await request(app).post('/api/v1/auth/login').send({
      email: 'admin@exitcontrol.vn',
      password: 'Password123!',
    });
    expect(adminRes.status).toBe(200);
    adminToken = adminRes.body.data.accessToken;

    // 2. Login as HR
    const hrRes = await request(app).post('/api/v1/auth/login').send({
      email: 'hr@exitcontrol.vn',
      password: 'Password123!',
    });
    expect(hrRes.status).toBe(200);
    hrToken = hrRes.body.data.accessToken;

    // 3. Login as Accountant (ketoan@exitcontrol.vn)
    const accRes = await request(app).post('/api/v1/auth/login').send({
      email: 'ketoan@exitcontrol.vn',
      password: 'Password123!',
    });
    expect(accRes.status).toBe(200);
    accountantToken = accRes.body.data.accessToken;

    // 4. Login as Employee
    const empRes = await request(app).post('/api/v1/auth/login').send({
      email: 'employee@exitcontrol.vn',
      password: 'Password123!',
    });
    expect(empRes.status).toBe(200);
    employeeToken = empRes.body.data.accessToken;
  });

  it('1. Employee submits resignation request', async () => {
    const res = await request(app)
      .post('/api/v1/resignation-requests')
      .set('Authorization', `Bearer ${employeeToken}`)
      .send({
        reason: 'Chuyển định hướng sự nghiệp cá nhân và học tập chuyên sâu',
        resignationDate: new Date().toISOString(),
        lastWorkingDate: new Date(Date.now() + 30 * 86400000).toISOString(),
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.requestCode).toMatch(/^RES-/);
    expect(res.body.data.status).toBe('PENDING');
    resignationId = res.body.data.id;
  });

  it('2. HR or Manager reviews and approves resignation request', async () => {
    const res = await request(app)
      .post(`/api/v1/resignation-requests/${resignationId}/review`)
      .set('Authorization', `Bearer ${hrToken}`)
      .send({
        action: 'APPROVE',
        approverNote: 'Đồng ý duyệt đơn nghỉ việc, bắt đầu quy trình bàn giao chính thức',
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe('APPROVED');
    expect(res.body.data.offboardingRequestId).toBeDefined();
    offboardingRequestId = res.body.data.offboardingRequestId;
  });

  it('3. Accountant retrieves financial reconciliations and clears balances', async () => {
    const listRes = await request(app)
      .get('/api/v1/finance')
      .set('Authorization', `Bearer ${accountantToken}`);

    expect(listRes.status).toBe(200);
    expect(listRes.body.success).toBe(true);
    expect(Array.isArray(listRes.body.data)).toBe(true);

    const record = listRes.body.data.find((f) => f.requestId === offboardingRequestId);
    expect(record).toBeDefined();
    financeId = record.id;

    // Update reconciliation balance and clear
    const patchRes = await request(app)
      .patch(`/api/v1/finance/${financeId}`)
      .set('Authorization', `Bearer ${accountantToken}`)
      .send({
        advanceAmount: 1500000,
        debtAmount: 500000,
        unsettledExpense: 200000,
        status: 'CLEARED',
        note: 'Đã cấn trừ đầy đủ vào kỳ lương cuối cùng',
      });

    expect(patchRes.status).toBe(200);
    expect(patchRes.body.success).toBe(true);
    expect(patchRes.body.data.status).toBe('CLEARED');
    expect(Number(patchRes.body.data.totalDeduction)).toBe(2200000);
  });

  it('4. Create and resolve offboarding process exception', async () => {
    const createRes = await request(app)
      .post('/api/v1/exceptions')
      .set('Authorization', `Bearer ${hrToken}`)
      .send({
        requestId: offboardingRequestId,
        title: 'Mất thẻ từ ra vào văn phòng',
        description: 'Nhân viên báo mất thẻ ra vào tầng 12, cần lập biên bản khấu trừ',
        type: 'ASSET_LOST',
        priority: 'MEDIUM',
        assignedTo: 'Hành chính',
      });

    expect(createRes.status).toBe(201);
    expect(createRes.body.success).toBe(true);
    expect(createRes.body.data.status).toBe('OPEN');
    exceptionId = createRes.body.data.id;

    // Resolve exception
    const resolveRes = await request(app)
      .patch(`/api/v1/exceptions/${exceptionId}/resolve`)
      .set('Authorization', `Bearer ${hrToken}`)
      .send({
        status: 'RESOLVED',
        resolutionNote: 'Đã nộp phạt 100,000 VND và vô hiệu hóa thẻ trên hệ thống cửa từ',
      });

    expect(resolveRes.status).toBe(200);
    expect(resolveRes.body.success).toBe(true);
    expect(resolveRes.body.data.status).toBe('RESOLVED');
  });

  it('5. Admin views global audit log entries', async () => {
    const res = await request(app)
      .get('/api/v1/audit-logs')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.data.length).toBeGreaterThan(0);
  });

  it('6. User updates profile info', async () => {
    const res = await request(app)
      .patch('/api/v1/auth/profile')
      .set('Authorization', `Bearer ${employeeToken}`)
      .send({
        phone: '0988776655',
        jobTitle: 'Senior Fullstack Engineer',
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.employee.phone).toBe('0988776655');
  });
});
