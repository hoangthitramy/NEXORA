import prisma from '../config/database.js';

export const getPendingApprovals = async (userId) => {
  return await prisma.approval.findMany({
    where: {
      approverId: userId,
      status: 'PENDING',
    },
    include: {
      request: {
        include: {
          employee: { include: { department: true } },
          tasks: true,
          revocations: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
};

export const approveStep = async (approvalId, userId, note) => {
  const approval = await prisma.approval.findUnique({
    where: { id: approvalId },
    include: { request: true },
  });

  if (!approval) {
    const error = new Error('Không tìm thấy bước phê duyệt');
    error.statusCode = 404;
    throw error;
  }

  if (approval.approverId !== userId) {
    const error = new Error('Bạn không phải là người được chỉ định phê duyệt bước này');
    error.statusCode = 403;
    throw error;
  }

  const updated = await prisma.approval.update({
    where: { id: approvalId },
    data: {
      status: 'APPROVED',
      note: note || approval.note,
      approvedAt: new Date(),
    },
  });

  // Check if all approvals are completed for the request
  const remaining = await prisma.approval.count({
    where: {
      requestId: approval.requestId,
      status: { not: 'APPROVED' },
    },
  });

  if (remaining === 0) {
    await prisma.offboardingRequest.update({
      where: { id: approval.requestId },
      data: { status: 'COMPLETED' },
    });
  }

  // Audit Log
  await prisma.auditLog.create({
    data: {
      requestId: approval.requestId,
      userId,
      action: 'APPROVE_STEP',
      entity: 'Approval',
      entityId: approvalId,
      newValue: { step: approval.step, note },
    },
  });

  return updated;
};

export const rejectStep = async (approvalId, userId, note) => {
  const approval = await prisma.approval.findUnique({
    where: { id: approvalId },
  });

  if (!approval) {
    const error = new Error('Không tìm thấy bước phê duyệt');
    error.statusCode = 404;
    throw error;
  }

  const updated = await prisma.approval.update({
    where: { id: approvalId },
    data: {
      status: 'REJECTED',
      note: note || 'Từ chối phê duyệt yêu cầu',
      approvedAt: new Date(),
    },
  });

  await prisma.offboardingRequest.update({
    where: { id: approval.requestId },
    data: { status: 'REJECTED' },
  });

  // Audit Log
  await prisma.auditLog.create({
    data: {
      requestId: approval.requestId,
      userId,
      action: 'REJECT_STEP',
      entity: 'Approval',
      entityId: approvalId,
      newValue: { step: approval.step, note },
    },
  });

  return updated;
};
