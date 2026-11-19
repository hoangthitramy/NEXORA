import prisma from '../config/database.js';

export const getAuditLogs = async (filters = {}) => {
  const { search, action, entity, userId, page = 1, limit = 50 } = filters;
  const where = {};

  if (action) {
    where.action = action;
  }

  if (entity) {
    where.entity = entity;
  }

  if (userId) {
    where.userId = userId;
  }

  if (search) {
    where.OR = [
      { action: { contains: search } },
      { entity: { contains: search } },
      { user: { fullName: { contains: search } } },
      { user: { email: { contains: search } } },
      { request: { requestCode: { contains: search } } },
    ];
  }

  const skip = (Number(page) - 1) * Number(limit);
  const take = Number(limit);

  const [total, logs] = await Promise.all([
    prisma.auditLog.count({ where }),
    prisma.auditLog.findMany({
      where,
      include: {
        user: {
          select: { id: true, fullName: true, email: true },
        },
        request: {
          select: { id: true, requestCode: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take,
    }),
  ]);

  return {
    total,
    page: Number(page),
    limit: take,
    totalPages: Math.ceil(total / take),
    data: logs,
  };
};
