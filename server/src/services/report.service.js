import prisma from '../config/database.js';

export const getComprehensiveReport = async () => {
  const [
    totalRequests,
    statusCounts,
    departments,
    requestsByDept,
    riskCounts,
    totalTasks,
    completedTasks,
    overdueTasks,
    totalAssets,
    assignedAssets,
    totalAccounts,
    revokedAccounts,
  ] = await Promise.all([
    prisma.offboardingRequest.count(),
    prisma.offboardingRequest.groupBy({
      by: ['status'],
      _count: { id: true },
    }),
    prisma.department.findMany({
      include: {
        _count: { select: { employees: true } },
      },
    }),
    prisma.offboardingRequest.findMany({
      select: {
        status: true,
        riskLevel: true,
        employee: {
          select: {
            department: { select: { id: true, name: true, code: true } },
          },
        },
      },
    }),
    prisma.offboardingRequest.groupBy({
      by: ['riskLevel'],
      _count: { id: true },
    }),
    prisma.offboardingTask.count(),
    prisma.offboardingTask.count({ where: { status: 'COMPLETED' } }),
    prisma.offboardingTask.count({
      where: {
        status: { notIn: ['COMPLETED', 'CANCELLED'] },
        dueDate: { lt: new Date() },
      },
    }),
    prisma.asset.count(),
    prisma.asset.count({ where: { status: 'ASSIGNED' } }),
    prisma.accessRevocation.count(),
    prisma.accessRevocation.count({ where: { status: 'REVOKED' } }),
  ]);

  // Aggregate by Department
  const deptStats = {};
  for (const r of requestsByDept) {
    const deptName = r.employee?.department?.name || 'Chưa phân bổ';
    if (!deptStats[deptName]) {
      deptStats[deptName] = { count: 0, completed: 0, highRisk: 0 };
    }
    deptStats[deptName].count += 1;
    if (r.status === 'COMPLETED') deptStats[deptName].completed += 1;
    if (r.riskLevel === 'HIGH') deptStats[deptName].highRisk += 1;
  }

  const deptBreakdown = Object.keys(deptStats).map((name) => ({
    department: name,
    total: deptStats[name].count,
    completed: deptStats[name].completed,
    highRisk: deptStats[name].highRisk,
  }));

  const taskCompletionRate = totalTasks ? Math.round((completedTasks / totalTasks) * 100) : 0;
  const accessRevocationRate = totalAccounts ? Math.round((revokedAccounts / totalAccounts) * 100) : 0;

  return {
    summary: {
      totalRequests,
      taskCompletionRate,
      accessRevocationRate,
      overdueTasks,
      totalAssets,
      assignedAssets,
    },
    statusCounts: statusCounts.map((s) => ({ status: s.status, count: s._count.id })),
    riskCounts: riskCounts.map((r) => ({ riskLevel: r.riskLevel || 'UNKNOWN', count: r._count.id })),
    deptBreakdown,
  };
};
