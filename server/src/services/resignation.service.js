import prisma from '../config/database.js';
import { createOffboardingRequest } from './offboarding.service.js';

export const getResignationRequests = async (currentUser, filters = {}) => {
  const { search, status, departmentId } = filters;
  const where = {};

  const userRoles = currentUser?.roles || [];
  const isPrivileged = userRoles.some((r) =>
    ['Admin', 'ADMIN', 'HR', 'Manager', 'MANAGER'].includes(r)
  );

  // If regular employee, only show their own resignation requests
  if (!isPrivileged) {
    const emp = await prisma.employee.findFirst({
      where: { userId: currentUser.id },
    });
    if (!emp) {
      return [];
    }
    where.employeeId = emp.id;
  }

  if (status) {
    where.status = status;
  }

  if (departmentId) {
    where.employee = { departmentId };
  }

  if (search) {
    where.OR = [
      { requestCode: { contains: search } },
      { reason: { contains: search } },
      { employee: { fullName: { contains: search } } },
      { employee: { employeeCode: { contains: search } } },
    ];
  }

  return await prisma.resignationRequest.findMany({
    where,
    include: {
      employee: {
        include: {
          department: true,
          user: {
            select: { id: true, fullName: true, email: true },
          },
        },
      },
      offboardingRequest: {
        select: {
          id: true,
          requestCode: true,
          status: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
};

export const getResignationRequestById = async (id) => {
  return await prisma.resignationRequest.findUnique({
    where: { id },
    include: {
      employee: {
        include: {
          department: true,
          user: {
            select: { id: true, fullName: true, email: true },
          },
        },
      },
      offboardingRequest: {
        select: {
          id: true,
          requestCode: true,
          status: true,
        },
      },
    },
  });
};

export const createResignationRequest = async (currentUser, data) => {
  const { reason, resignationDate, lastWorkingDate, attachmentUrl } = data;

  // Find or link employee record
  let employee = await prisma.employee.findFirst({
    where: { userId: currentUser.id },
  });

  if (!employee) {
    // Check if employee exists by email
    employee = await prisma.employee.findFirst({
      where: { email: currentUser.email },
    });

    if (employee) {
      await prisma.employee.update({
        where: { id: employee.id },
        data: { userId: currentUser.id },
      });
    } else {
      // Find default department
      const dept = await prisma.department.findFirst();
      const org = await prisma.organization.findFirst();
      const count = await prisma.employee.count();
      employee = await prisma.employee.create({
        data: {
          employeeCode: `EMP${String(count + 101).padStart(3, '0')}`,
          fullName: currentUser.fullName,
          email: currentUser.email,
          departmentId: dept ? dept.id : '',
          organizationId: org ? org.id : '',
          userId: currentUser.id,
        },
      });
    }
  }

  const count = await prisma.resignationRequest.count();
  const requestCode = `RES-${new Date().getFullYear()}-${String(count + 1).padStart(3, '0')}`;

  const request = await prisma.resignationRequest.create({
    data: {
      requestCode,
      employeeId: employee.id,
      reason,
      resignationDate: new Date(resignationDate || new Date()),
      lastWorkingDate: new Date(lastWorkingDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)),
      attachmentUrl: attachmentUrl || null,
      status: 'PENDING',
    },
    include: {
      employee: {
        include: { department: true },
      },
    },
  });

  // Audit log
  await prisma.auditLog.create({
    data: {
      userId: currentUser.id,
      action: 'SUBMIT_RESIGNATION_REQUEST',
      entity: 'ResignationRequest',
      entityId: request.id,
      newValue: { requestCode, employeeId: employee.id, lastWorkingDate },
    },
  });

  return request;
};

export const reviewResignationRequest = async (id, reviewerId, reviewData) => {
  const { action, approverNote, templateId } = reviewData;
  const currentReq = await prisma.resignationRequest.findUnique({
    where: { id },
    include: { employee: true },
  });

  if (!currentReq) {
    throw new Error('Không tìm thấy đơn xin nghỉ việc');
  }

  if (currentReq.status !== 'PENDING') {
    throw new Error('Đơn xin nghỉ việc này đã được xử lý trước đó');
  }

  const isApproved = action === 'APPROVE';

  if (!isApproved) {
    // REJECT
    const updated = await prisma.resignationRequest.update({
      where: { id },
      data: {
        status: 'REJECTED',
        approverId: reviewerId,
        approverNote: approverNote || 'Từ chối đơn xin nghỉ việc',
        approvedAt: new Date(),
      },
      include: {
        employee: { include: { department: true } },
      },
    });

    await prisma.auditLog.create({
      data: {
        userId: reviewerId,
        action: 'REJECT_RESIGNATION_REQUEST',
        entity: 'ResignationRequest',
        entityId: id,
        newValue: { status: 'REJECTED', approverNote },
      },
    });

    return updated;
  }

  // APPROVE -> Auto-create Offboarding Case
  let chosenTemplateId = templateId;
  if (!chosenTemplateId) {
    const defaultTemplate = await prisma.taskTemplate.findFirst({
      where: { isActive: true },
    });
    if (defaultTemplate) {
      chosenTemplateId = defaultTemplate.id;
    }
  }

  const offboardingCase = await createOffboardingRequest(
    {
      employeeId: currentReq.employeeId,
      reason: currentReq.reason,
      resignationDate: currentReq.resignationDate,
      lastWorkingDate: currentReq.lastWorkingDate,
      templateId: chosenTemplateId,
    },
    reviewerId
  );

  const updated = await prisma.resignationRequest.update({
    where: { id },
    data: {
      status: 'APPROVED',
      approverId: reviewerId,
      approverNote: approverNote || 'Chấp thuận đơn xin nghỉ việc và khởi tạo quy trình bàn giao',
      approvedAt: new Date(),
      offboardingRequestId: offboardingCase.id,
    },
    include: {
      employee: { include: { department: true } },
      offboardingRequest: true,
    },
  });

  await prisma.auditLog.create({
    data: {
      userId: reviewerId,
      action: 'APPROVE_RESIGNATION_REQUEST',
      entity: 'ResignationRequest',
      entityId: id,
      newValue: {
        status: 'APPROVED',
        offboardingRequestId: offboardingCase.id,
        offboardingRequestCode: offboardingCase.requestCode,
      },
    },
  });

  return updated;
};
