import prisma from '../config/database.js';

export const getExceptions = async (filters = {}) => {
  const { status, priority, type, requestId, search } = filters;
  const where = {};

  if (status) {
    where.status = status;
  }

  if (priority) {
    where.priority = priority;
  }

  if (type) {
    where.type = type;
  }

  if (requestId) {
    where.requestId = requestId;
  }

  if (search) {
    where.OR = [
      { title: { contains: search } },
      { description: { contains: search } },
      { request: { requestCode: { contains: search } } },
      { request: { employee: { fullName: { contains: search } } } },
    ];
  }

  return await prisma.processException.findMany({
    where,
    include: {
      request: {
        include: {
          employee: {
            include: { department: true },
          },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
};

export const getExceptionById = async (id) => {
  return await prisma.processException.findUnique({
    where: { id },
    include: {
      request: {
        include: {
          employee: {
            include: { department: true },
          },
        },
      },
    },
  });
};

export const createException = async (currentUser, data) => {
  const { requestId, title, description, type, priority, assignedTo } = data;

  if (!requestId || !title) {
    throw new Error('Mã hồ sơ và tiêu đề ngoại lệ là bắt buộc');
  }

  const exception = await prisma.processException.create({
    data: {
      requestId,
      title,
      description: description || null,
      type: type || 'OTHER',
      priority: priority || 'MEDIUM',
      status: 'OPEN',
      assignedTo: assignedTo || null,
    },
    include: {
      request: {
        include: { employee: true },
      },
    },
  });

  await prisma.auditLog.create({
    data: {
      requestId,
      userId: currentUser.id,
      action: 'CREATE_PROCESS_EXCEPTION',
      entity: 'ProcessException',
      entityId: exception.id,
      newValue: { title, type, priority },
    },
  });

  return exception;
};

export const resolveException = async (id, currentUser, resolveData) => {
  const { status, resolutionNote } = resolveData;

  const current = await prisma.processException.findUnique({
    where: { id },
    include: { request: true },
  });

  if (!current) {
    throw new Error('Không tìm thấy sự cố ngoại lệ');
  }

  const updated = await prisma.processException.update({
    where: { id },
    data: {
      status: status || 'RESOLVED',
      resolutionNote: resolutionNote || null,
      resolvedBy: currentUser.fullName,
      resolvedAt: new Date(),
    },
    include: {
      request: {
        include: {
          employee: {
            include: { department: true },
          },
        },
      },
    },
  });

  await prisma.auditLog.create({
    data: {
      requestId: current.requestId,
      userId: currentUser.id,
      action: 'RESOLVE_PROCESS_EXCEPTION',
      entity: 'ProcessException',
      entityId: id,
      oldValue: { status: current.status },
      newValue: { status: updated.status, resolutionNote },
    },
  });

  return updated;
};
