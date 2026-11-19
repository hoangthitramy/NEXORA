import prisma from '../config/database.js';

export const getTasks = async (filters = {}) => {
  const { requestId, status, assigneeId } = filters;
  const where = {};
  if (requestId) where.requestId = requestId;
  if (status) where.status = status;
  if (assigneeId) where.assigneeId = assigneeId;

  return await prisma.offboardingTask.findMany({
    where,
    include: {
      assignee: { select: { id: true, fullName: true, email: true } },
      request: {
        include: { employee: true },
      },
    },
    orderBy: { dueDate: 'asc' },
  });
};

export const updateTaskStatus = async (taskId, status, userId) => {
  const task = await prisma.offboardingTask.update({
    where: { id: taskId },
    data: {
      status,
      completedAt: status === 'COMPLETED' ? new Date() : null,
    },
    include: { request: true },
  });

  // Audit Log
  await prisma.auditLog.create({
    data: {
      requestId: task.requestId,
      userId,
      action: 'UPDATE_TASK_STATUS',
      entity: 'OffboardingTask',
      entityId: taskId,
      newValue: { status },
    },
  });

  return task;
};
