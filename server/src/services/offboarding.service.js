import prisma from '../config/database.js';

export const getOffboardingRequests = async (filters = {}) => {
  const { search, status, departmentId } = filters;
  const where = {};

  if (status) {
    where.status = status;
  }

  if (departmentId) {
    where.employee = { departmentId };
  }

  if (search) {
    where.OR = [
      { requestCode: { contains: search } },
      { employee: { fullName: { contains: search } } },
      { employee: { employeeCode: { contains: search } } },
    ];
  }

  return await prisma.offboardingRequest.findMany({
    where,
    include: {
      employee: {
        include: { department: true },
      },
      creator: {
        select: { id: true, fullName: true, email: true },
      },
      tasks: {
        select: { id: true, status: true },
      },
      approvals: {
        select: { id: true, status: true, step: true },
      },
      analyses: {
        select: { id: true, riskLevel: true },
        take: 1,
        orderBy: { createdAt: 'desc' },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
};

export const getOffboardingRequestById = async (id) => {
  return await prisma.offboardingRequest.findUnique({
    where: { id },
    include: {
      employee: {
        include: {
          department: true,
          assignments: {
            include: { asset: true },
            where: { returnedAt: null },
          },
        },
      },
      creator: {
        select: { id: true, fullName: true, email: true },
      },
      template: {
        include: { items: true },
      },
      tasks: {
        include: {
          assignee: { select: { id: true, fullName: true, email: true } },
          templateItem: true,
        },
        orderBy: { createdAt: 'asc' },
      },
      handovers: {
        include: { items: true },
      },
      revocations: {
        include: { account: true },
      },
      documents: {
        orderBy: { createdAt: 'desc' },
      },
      approvals: {
        include: {
          approver: { select: { id: true, fullName: true, email: true } },
        },
        orderBy: { step: 'asc' },
      },
      comments: {
        include: {
          user: { select: { id: true, fullName: true, email: true } },
        },
        orderBy: { createdAt: 'asc' },
      },
      auditLogs: {
        include: {
          user: { select: { id: true, fullName: true, email: true } },
        },
        orderBy: { createdAt: 'desc' },
      },
      analyses: {
        orderBy: { createdAt: 'desc' },
      },
      financialReconciliations: {
        orderBy: { createdAt: 'desc' },
      },
      exceptions: {
        orderBy: { createdAt: 'desc' },
      },
    },
  });
};

export const createOffboardingRequest = async (data, creatorId) => {
  const { employeeId, reason, resignationDate, lastWorkingDate, templateId } = data;

  const count = await prisma.offboardingRequest.count();
  const requestCode = `OFF-${new Date().getFullYear()}-${String(count + 1).padStart(3, '0')}`;

  const request = await prisma.offboardingRequest.create({
    data: {
      requestCode,
      employeeId,
      creatorId,
      templateId,
      reason,
      resignationDate: new Date(resignationDate),
      lastWorkingDate: new Date(lastWorkingDate),
      status: 'SUBMITTED',
      riskLevel: 'LOW',
    },
  });

  // If template is chosen, generate tasks
  if (templateId) {
    const templateItems = await prisma.taskTemplateItem.findMany({
      where: { templateId },
      orderBy: { sortOrder: 'asc' },
    });

    for (const item of templateItems) {
      await prisma.offboardingTask.create({
        data: {
          requestId: request.id,
          templateItemId: item.id,
          title: item.title,
          description: item.description,
          status: 'TODO',
          dueDate: new Date(lastWorkingDate),
        },
      });
    }
  }

  // Auto-link Access Revocations
  const employee = await prisma.employee.findUnique({ where: { id: employeeId } });
  if (employee) {
    const accounts = await prisma.accessAccount.findMany({
      where: { employeeCode: employee.employeeCode },
    });
    for (const acc of accounts) {
      await prisma.accessRevocation.create({
        data: {
          requestId: request.id,
          accountId: acc.id,
          status: 'PENDING',
        },
      });
    }
  }

  // Auto-create initial Financial Reconciliation record for Accountant
  await prisma.financialReconciliation.create({
    data: {
      requestId: request.id,
      advanceAmount: 0,
      debtAmount: 0,
      unsettledExpense: 0,
      totalDeduction: 0,
      status: 'PENDING',
      note: 'Khởi tạo đối soát tài chính khi mở quy trình bàn giao nghỉ việc',
    },
  });

  // Audit Log
  await prisma.auditLog.create({
    data: {
      requestId: request.id,
      userId: creatorId,
      action: 'CREATE_OFFBOARDING_REQUEST',
      entity: 'OffboardingRequest',
      entityId: request.id,
      newValue: { requestCode, employeeId, lastWorkingDate },
    },
  });

  return request;
};

export const getOffboardingProgress = async (id) => {
  const request = await prisma.offboardingRequest.findUnique({
    where: { id },
    include: {
      tasks: true,
      approvals: true,
      revocations: true,
    },
  });

  if (!request) return null;

  const totalTasks = request.tasks.length;
  const completedTasks = request.tasks.filter((t) => t.status === 'COMPLETED').length;
  const taskProgress = totalTasks ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const totalRevocations = request.revocations.length;
  const revokedCount = request.revocations.filter((r) => r.status === 'REVOKED').length;
  const accessProgress = totalRevocations ? Math.round((revokedCount / totalRevocations) * 100) : 0;

  const totalApprovals = request.approvals.length;
  const approvedCount = request.approvals.filter((a) => a.status === 'APPROVED').length;
  const approvalProgress = totalApprovals ? Math.round((approvedCount / totalApprovals) * 100) : 0;

  const overallProgress = Math.round((taskProgress * 0.4) + (accessProgress * 0.3) + (approvalProgress * 0.3));

  return {
    overallProgress,
    taskProgress,
    completedTasks,
    totalTasks,
    accessProgress,
    revokedCount,
    totalRevocations,
    approvalProgress,
    approvedCount,
    totalApprovals,
  };
};
