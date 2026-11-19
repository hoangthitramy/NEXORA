import prisma from '../config/database.js';

export const getAccessAccounts = async (filters = {}) => {
  const { systemName, employeeCode, status } = filters;
  const where = {};
  if (systemName) where.systemName = systemName;
  if (employeeCode) where.employeeCode = employeeCode;
  if (status) where.status = status;

  return await prisma.accessAccount.findMany({
    where,
    include: {
      revocations: {
        include: {
          request: {
            include: { employee: true },
          },
        },
      },
    },
    orderBy: { systemName: 'asc' },
  });
};

export const getRevocationsByRequest = async (requestId) => {
  return await prisma.accessRevocation.findMany({
    where: { requestId },
    include: {
      account: true,
    },
    orderBy: { createdAt: 'asc' },
  });
};

export const updateRevocationStatus = async (revocationId, status, note, userId, userName) => {
  const revocation = await prisma.accessRevocation.findUnique({
    where: { id: revocationId },
    include: { account: true, request: true },
  });

  if (!revocation) {
    const error = new Error('Không tìm thấy yêu cầu thu hồi quyền');
    error.statusCode = 404;
    throw error;
  }

  const updated = await prisma.accessRevocation.update({
    where: { id: revocationId },
    data: {
      status,
      note: note || revocation.note,
      revokedAt: status === 'REVOKED' ? new Date() : null,
      performedBy: userName,
    },
  });

  if (status === 'REVOKED') {
    await prisma.accessAccount.update({
      where: { id: revocation.accountId },
      data: { status: 'REVOKED' },
    });
  }

  // Audit Log
  await prisma.auditLog.create({
    data: {
      requestId: revocation.requestId,
      userId,
      action: 'UPDATE_ACCESS_REVOCATION',
      entity: 'AccessRevocation',
      entityId: revocationId,
      newValue: {
        system: revocation.account.systemName,
        account: revocation.account.accountName,
        status,
        performedBy: userName,
      },
    },
  });

  return updated;
};
