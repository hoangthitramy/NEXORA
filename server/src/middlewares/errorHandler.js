import { sendError } from '../utils/response.js';

export const errorHandler = (err, req, res, next) => {
  console.error('[Error Details]:', err);

  if (err.name === 'ZodError') {
    const formattedErrors = err.errors.map((e) => ({
      field: e.path.join('.'),
      message: e.message,
    }));
    return sendError(res, 'Dữ liệu không hợp lệ', 400, formattedErrors);
  }

  if (err.name === 'JsonWebTokenError') {
    return sendError(res, 'Mã xác thực không hợp lệ', 401);
  }

  if (err.name === 'TokenExpiredError') {
    return sendError(res, 'Phiên đăng nhập đã hết hạn', 401);
  }

  // Prisma unique constraint violation
  if (err.code === 'P2002') {
    const target = err.meta?.target ? ` (${err.meta.target})` : '';
    return sendError(res, `Dữ liệu đã tồn tại trong hệ thống${target}`, 409);
  }

  // Prisma record not found
  if (err.code === 'P2025') {
    return sendError(res, 'Không tìm thấy dữ liệu yêu cầu', 404);
  }

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Lỗi hệ thống nội bộ';

  return sendError(res, message, statusCode);
};
