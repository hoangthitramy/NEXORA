import prisma from '../config/database.js';

export const getOverviewStats = async () => {
  const [totalRequests, inProgressRequests, pendingApprovalRequests, completedRequests, overdueTasks] = await Promise.all([
    prisma.offboardingRequest.count(),
    prisma.offboardingRequest.count({ where: { status: 'IN_PROGRESS' } }),
    prisma.offboardingRequest.count({ where: { status: 'PENDING_APPROVAL' } }),
    prisma.offboardingRequest.count({ where: { status: 'COMPLETED' } }),
    prisma.offboardingTask.count({
      where: {
        status: { notIn: ['COMPLETED', 'CANCELLED'] },
        dueDate: { lt: new Date() },
      },
    }),
  ]);

  const recentActivities = await prisma.auditLog.findMany({
    take: 10,
    orderBy: { createdAt: 'desc' },
    include: {
      user: { select: { fullName: true, email: true } },
      request: { select: { requestCode: true } },
    },
  });

  const highRiskCount = await prisma.offboardingRequest.count({
    where: { riskLevel: 'HIGH' },
  });

  return {
    totalRequests,
    inProgressRequests,
    pendingApprovalRequests,
    completedRequests,
    overdueTasks,
    highRiskCount,
    recentActivities,
  };
};
