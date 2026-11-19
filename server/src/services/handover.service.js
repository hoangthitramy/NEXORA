import prisma from '../config/database.js';

export const getHandovers = async (filters = {}) => {
  const { status, requestId } = filters;
  const where = {};
  if (status) where.status = status;
  if (requestId) where.requestId = requestId;

  return await prisma.handover.findMany({
    where,
    include: {
      request: {
        include: {
          employee: { include: { department: true } },
          creator: { select: { fullName: true, email: true } },
        },
      },
      items: true,
    },
    orderBy: { createdAt: 'desc' },
  });
};

export const getHandoverById = async (id) => {
  return await prisma.handover.findUnique({
    where: { id },
    include: {
      request: {
        include: {
          employee: { include: { department: true } },
        },
      },
      items: true,
    },
  });
};

export const updateHandoverItemStatus = async (itemId, status, receiver, evidenceUrl, userId) => {
  const item = await prisma.handoverItem.update({
    where: { id: itemId },
    data: {
      status,
      receiver: receiver || undefined,
      evidenceUrl: evidenceUrl || undefined,
    },
    include: { handover: true },
  });

  // Audit Log
  await prisma.auditLog.create({
    data: {
      requestId: item.handover.requestId,
      userId,
      action: 'UPDATE_HANDOVER_ITEM',
      entity: 'HandoverItem',
      entityId: itemId,
      newValue: { title: item.title, status, receiver },
    },
  });

  return item;
};

export const confirmHandover = async (handoverId, userId) => {
  const handover = await prisma.handover.update({
    where: { id: handoverId },
    data: {
      status: 'CONFIRMED',
      confirmedAt: new Date(),
    },
  });

  await prisma.auditLog.create({
    data: {
      requestId: handover.requestId,
      userId,
      action: 'CONFIRM_HANDOVER',
      entity: 'Handover',
      entityId: handoverId,
      newValue: { status: 'CONFIRMED' },
    },
  });

  return handover;
};
