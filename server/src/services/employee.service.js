import prisma from '../config/database.js';

export const getEmployees = async (filters = {}) => {
  const { search, departmentId } = filters;
  const where = {};

  if (departmentId) {
    where.departmentId = departmentId;
  }

  if (search) {
    where.OR = [
      { fullName: { contains: search } },
      { employeeCode: { contains: search } },
      { email: { contains: search } },
    ];
  }

  return await prisma.employee.findMany({
    where,
    include: {
      department: true,
      user: {
        select: {
          id: true,
          isActive: true,
          userRoles: { include: { role: true } },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
};

export const getEmployeeById = async (id) => {
  return await prisma.employee.findUnique({
    where: { id },
    include: {
      department: true,
      organization: true,
      user: {
        select: {
          id: true,
          email: true,
          isActive: true,
          userRoles: { include: { role: true } },
        },
      },
      assignments: {
        include: { asset: true },
      },
      requests: {
        orderBy: { createdAt: 'desc' },
      },
    },
  });
};

export const getEmployeeAssets = async (id) => {
  return await prisma.assetAssignment.findMany({
    where: { employeeId: id },
    include: { asset: true },
    orderBy: { assignedAt: 'desc' },
  });
};

export const getEmployeeAccounts = async (empCode) => {
  return await prisma.accessAccount.findMany({
    where: { employeeCode: empCode },
    include: { revocations: true },
  });
};
