import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import prisma from '../config/database.js';
import { ENV } from '../config/env.js';

export const loginUser = async (email, password) => {
  const user = await prisma.user.findUnique({
    where: { email },
    include: {
      userRoles: {
        include: { role: true },
      },
      employee: {
        include: { department: true },
      },
      organization: true,
    },
  });

  if (!user || !user.isActive) {
    const error = new Error('Tài khoản hoặc mật khẩu không chính xác');
    error.statusCode = 401;
    throw error;
  }

  const isMatch = await bcrypt.compare(password, user.passwordHash);
  if (!isMatch) {
    const error = new Error('Tài khoản hoặc mật khẩu không chính xác');
    error.statusCode = 401;
    throw error;
  }

  const roles = user.userRoles.map((ur) => ur.role.name);

  const payload = {
    userId: user.id,
    email: user.email,
    roles,
  };

  const accessToken = jwt.sign(payload, ENV.JWT_ACCESS_SECRET, { expiresIn: '8h' });
  const refreshToken = jwt.sign(payload, ENV.JWT_REFRESH_SECRET, { expiresIn: '7d' });

  return {
    accessToken,
    refreshToken,
    user: {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      roles,
      organization: {
        id: user.organization.id,
        name: user.organization.name,
      },
      employee: user.employee
        ? {
            id: user.employee.id,
            employeeCode: user.employee.employeeCode,
            jobTitle: user.employee.jobTitle,
            department: user.employee.department.name,
          }
        : null,
    },
  };
};

export const registerUser = async (data) => {
  const { fullName, email, password, phone, jobTitle, departmentId } = data;

  // 1. Check existing email
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    const error = new Error('Email này đã được sử dụng trên hệ thống');
    error.statusCode = 409;
    throw error;
  }

  // 2. Get organization
  let org = await prisma.organization.findFirst();
  if (!org) {
    org = await prisma.organization.create({
      data: { name: 'Công ty EXITCONTROL', code: 'EXITCONTROL' },
    });
  }

  // 3. Resolve department
  let deptId = departmentId;
  if (!deptId) {
    const defaultDept = await prisma.department.findFirst({
      where: { organizationId: org.id },
    });
    deptId = defaultDept ? defaultDept.id : null;
  }

  // 4. Hash password
  const passwordHash = await bcrypt.hash(password, 10);

  // 5. Create user
  const user = await prisma.user.create({
    data: {
      fullName,
      email,
      passwordHash,
      organizationId: org.id,
    },
  });

  // 6. Assign default role "Employee"
  let role = await prisma.role.findUnique({ where: { name: 'Employee' } });
  if (!role) {
    role = await prisma.role.create({ data: { name: 'Employee', description: 'Nhân viên thông thường' } });
  }

  await prisma.userRole.create({
    data: {
      userId: user.id,
      roleId: role.id,
    },
  });

  // 7. Create linked employee profile
  const empCount = await prisma.employee.count();
  const employeeCode = `EMP${String(empCount + 1).padStart(3, '0')}`;

  if (deptId) {
    await prisma.employee.create({
      data: {
        employeeCode,
        fullName,
        email,
        phone: phone || null,
        jobTitle: jobTitle || 'Chuyên viên',
        organizationId: org.id,
        departmentId: deptId,
        userId: user.id,
      },
    });
  }

  // Audit Log
  await prisma.auditLog.create({
    data: {
      userId: user.id,
      action: 'USER_REGISTER',
      entity: 'User',
      entityId: user.id,
      newValue: { fullName, email, role: 'Employee', employeeCode },
    },
  });

  return {
    id: user.id,
    fullName: user.fullName,
    email: user.email,
    employeeCode,
  };
};

export const forgotPassword = async (email) => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !user.isActive) {
    // For security we can state email was processed or throw if explicit
    const error = new Error('Không tìm thấy tài khoản với email này');
    error.statusCode = 404;
    throw error;
  }

  // Generate a reset token valid for 15 minutes
  const resetToken = jwt.sign(
    { userId: user.id, email: user.email, purpose: 'password_reset' },
    ENV.JWT_ACCESS_SECRET,
    { expiresIn: '15m' }
  );

  return {
    message: 'Mã xác nhận đặt lại mật khẩu đã được tạo',
    resetToken,
    expiresIn: '15 phút',
  };
};

export const resetPassword = async (resetToken, newPassword) => {
  let decoded;
  try {
    decoded = jwt.verify(resetToken, ENV.JWT_ACCESS_SECRET);
  } catch (err) {
    const error = new Error('Mã xác nhận không hợp lệ hoặc đã hết hạn');
    error.statusCode = 400;
    throw error;
  }

  if (decoded.purpose !== 'password_reset') {
    const error = new Error('Mã xác nhận không đúng mục đích');
    error.statusCode = 400;
    throw error;
  }

  const passwordHash = await bcrypt.hash(newPassword, 10);
  await prisma.user.update({
    where: { id: decoded.userId },
    data: { passwordHash },
  });

  // Audit Log
  await prisma.auditLog.create({
    data: {
      userId: decoded.userId,
      action: 'RESET_PASSWORD',
      entity: 'User',
      entityId: decoded.userId,
      newValue: { resetBy: 'Forgot Password Flow' },
    },
  });

  return true;
};

export const getDepartmentsList = async () => {
  return await prisma.department.findMany({
    orderBy: { name: 'asc' },
    select: {
      id: true,
      name: true,
      code: true,
    },
  });
};

export const getMe = async (userId) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      userRoles: { include: { role: true } },
      employee: { include: { department: true } },
      organization: true,
    },
  });

  if (!user) {
    const error = new Error('Không tìm thấy người dùng');
    error.statusCode = 404;
    throw error;
  }

  return {
    id: user.id,
    fullName: user.fullName,
    email: user.email,
    roles: user.userRoles.map((ur) => ur.role.name),
    organization: user.organization,
    employee: user.employee,
  };
};

export const changePassword = async (userId, oldPassword, newPassword) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    const error = new Error('Người dùng không tồn tại');
    error.statusCode = 404;
    throw error;
  }

  const isMatch = await bcrypt.compare(oldPassword, user.passwordHash);
  if (!isMatch) {
    const error = new Error('Mật khẩu cũ không chính xác');
    error.statusCode = 400;
    throw error;
  }

  const passwordHash = await bcrypt.hash(newPassword, 10);
  await prisma.user.update({
    where: { id: userId },
    data: { passwordHash },
  });

  return true;
};

export const updateProfile = async (userId, data) => {
  const { fullName, phone, jobTitle } = data;
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { employee: true },
  });

  if (!user) {
    const error = new Error('Người dùng không tồn tại');
    error.statusCode = 404;
    throw error;
  }

  if (fullName) {
    await prisma.user.update({
      where: { id: userId },
      data: { fullName },
    });
  }

  if (user.employee) {
    await prisma.employee.update({
      where: { id: user.employee.id },
      data: {
        ...(fullName && { fullName }),
        ...(phone !== undefined && { phone }),
        ...(jobTitle !== undefined && { jobTitle }),
      },
    });
  }

  return await getMe(userId);
};

