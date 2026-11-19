import jwt from 'jsonwebtoken';
import { ENV } from '../config/env.js';
import { sendError } from '../utils/response.js';
import prisma from '../config/database.js';

export const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return sendError(res, 'Vui lòng cung cấp mã xác thực hợp lệ', 401);
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, ENV.JWT_ACCESS_SECRET);

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: {
        userRoles: {
          include: {
            role: true,
          },
        },
        employee: true,
      },
    });

    if (!user || !user.isActive) {
      return sendError(res, 'Tài khoản không tồn tại hoặc đã bị vô hiệu hóa', 401);
    }

    req.user = {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      organizationId: user.organizationId,
      employeeId: user.employee?.id || null,
      departmentId: user.employee?.departmentId || null,
      roles: user.userRoles.map((ur) => ur.role.name),
    };

    next();
  } catch (error) {
    next(error);
  }
};
