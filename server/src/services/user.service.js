import bcrypt from 'bcrypt';
import prisma from '../config/database.js';

export const listAllUsers = async () => {
  return await prisma.user.findMany({
    include: {
      userRoles: {
        include: { role: true },
      },
      employee: {
        include: { department: true },
      },
      organization: true,
      _count: {
        select: {
          createdRequests: true,
          assignedTasks: true,
          approvals: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
};

export const createUserByAdmin = async (data, creatorId) => {
  const { fullName, email, password, roleName, departmentId, jobTitle, phone } = data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    const error = new Error('Email này đã tồn tại trong hệ thống');
    error.statusCode = 409;
    throw error;
  }

  let org = await prisma.organization.findFirst();
  if (!org) {
    org = await prisma.organization.create({
      data: { name: 'Công ty EXITCONTROL', code: 'EXITCONTROL' },
    });
  }

  const passwordHash = await bcrypt.hash(password || 'Password123!', 10);

  const user = await prisma.user.create({
    data: {
      fullName,
      email,
      passwordHash,
      organizationId: org.id,
    },
  });

  // Assign Role
  const targetRole = roleName || 'Employee';
  let role = await prisma.role.findUnique({ where: { name: targetRole } });
  if (!role) {
    role = await prisma.role.create({
      data: { name: targetRole, description: `Vai trò ${targetRole}` },
    });
  }

  await prisma.userRole.create({
    data: {
      userId: user.id,
      roleId: role.id,
    },
  });

  // Create Employee Profile
  const empCount = await prisma.employee.count();
  const employeeCode = `EMP${String(empCount + 1).padStart(3, '0')}`;

  let deptId = departmentId;
  if (!deptId) {
    const defaultDept = await prisma.department.findFirst({
      where: { organizationId: org.id },
    });
    deptId = defaultDept ? defaultDept.id : null;
  }

  if (deptId) {
    await prisma.employee.create({
      data: {
        employeeCode,
        fullName,
        email,
        phone: phone || null,
        jobTitle: jobTitle || targetRole,
        organizationId: org.id,
        departmentId: deptId,
        userId: user.id,
      },
    });
  }

  // Audit Log
  await prisma.auditLog.create({
    data: {
      userId: creatorId,
      action: 'ADMIN_CREATE_USER',
      entity: 'User',
      entityId: user.id,
      newValue: { fullName, email, role: targetRole, employeeCode },
    },
  });

  return user;
};

export const toggleUserStatus = async (userId, adminId) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    const error = new Error('Không tìm thấy người dùng');
    error.statusCode = 404;
    throw error;
  }

  const updated = await prisma.user.update({
    where: { id: userId },
    data: { isActive: !user.isActive },
  });

  await prisma.auditLog.create({
    data: {
      userId: adminId,
      action: updated.isActive ? 'ACTIVATE_USER' : 'DEACTIVATE_USER',
      entity: 'User',
      entityId: userId,
      newValue: { isActive: updated.isActive },
    },
  });

  return updated;
};
