import prisma from '../config/database.js';

export const getAssets = async (filters = {}) => {
  const { status, category, search } = filters;
  const where = {};
  if (status) where.status = status;
  if (category) where.category = category;
  if (search) {
    where.OR = [
      { name: { contains: search } },
      { assetCode: { contains: search } },
      { serialNumber: { contains: search } },
    ];
  }

  return await prisma.asset.findMany({
    where,
    include: {
      assignments: {
        where: { returnedAt: null },
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

export const getAssetAssignments = async (employeeId) => {
  const where = {};
  if (employeeId) where.employeeId = employeeId;
  return await prisma.assetAssignment.findMany({
    where,
    include: {
      asset: true,
      employee: {
        include: { department: true },
      },
    },
    orderBy: { assignedAt: 'desc' },
  });
};

export const returnAsset = async (assignmentId, condition, note, userId) => {
  const assignment = await prisma.assetAssignment.findUnique({
    where: { id: assignmentId },
    include: { asset: true, employee: true },
  });

  if (!assignment) {
    const error = new Error('Không tìm thấy thông tin cấp phát tài sản');
    error.statusCode = 404;
    throw error;
  }

  const updatedAssignment = await prisma.assetAssignment.update({
    where: { id: assignmentId },
    data: {
      returnedAt: new Date(),
      condition: condition || assignment.condition,
      note: note || assignment.note,
    },
  });

  await prisma.asset.update({
    where: { id: assignment.assetId },
    data: { status: 'AVAILABLE' },
  });

  // Audit Log
  await prisma.auditLog.create({
    data: {
      userId,
      action: 'RETURN_ASSET',
      entity: 'AssetAssignment',
      entityId: assignmentId,
      newValue: {
        assetCode: assignment.asset.assetCode,
        employee: assignment.employee.fullName,
        condition,
      },
    },
  });

  return updatedAssignment;
};
