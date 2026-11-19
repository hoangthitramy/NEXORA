import prisma from '../config/database.js';

export const getFinancialReconciliations = async (filters = {}) => {
  const { status, search } = filters;
  const where = {};

  if (status) {
    where.status = status;
  }

  if (search) {
    where.OR = [
      { request: { requestCode: { contains: search } } },
      { request: { employee: { fullName: { contains: search } } } },
      { request: { employee: { employeeCode: { contains: search } } } },
      { note: { contains: search } },
    ];
  }

  return await prisma.financialReconciliation.findMany({
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

export const getFinancialReconciliationById = async (id) => {
  return await prisma.financialReconciliation.findUnique({
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

export const updateFinancialReconciliation = async (id, currentUser, data) => {
  const { advanceAmount, debtAmount, unsettledExpense, note, status } = data;

  const current = await prisma.financialReconciliation.findUnique({
    where: { id },
    include: { request: true },
  });

  if (!current) {
    throw new Error('Không tìm thấy bản ghi đối soát tài chính');
  }

  const adv = advanceAmount !== undefined ? Number(advanceAmount) : Number(current.advanceAmount);
  const debt = debtAmount !== undefined ? Number(debtAmount) : Number(current.debtAmount);
  const unsettled = unsettledExpense !== undefined ? Number(unsettledExpense) : Number(current.unsettledExpense);
  const total = adv + debt + unsettled;

  const newStatus = status || current.status;
  const isClearing = newStatus === 'CLEARED' && current.status !== 'CLEARED';

  const updated = await prisma.financialReconciliation.update({
    where: { id },
    data: {
      advanceAmount: adv,
      debtAmount: debt,
      unsettledExpense: unsettled,
      totalDeduction: total,
      status: newStatus,
      note: note !== undefined ? note : current.note,
      clearedBy: isClearing || newStatus === 'CLEARED' ? currentUser.fullName : current.clearedBy,
      clearedAt: isClearing ? new Date() : (newStatus === 'CLEARED' ? current.clearedAt || new Date() : null),
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
      action: 'UPDATE_FINANCIAL_RECONCILIATION',
      entity: 'FinancialReconciliation',
      entityId: id,
      oldValue: {
        status: current.status,
        totalDeduction: Number(current.totalDeduction),
      },
      newValue: {
        status: newStatus,
        totalDeduction: total,
        clearedBy: updated.clearedBy,
      },
    },
  });

  return updated;
};
