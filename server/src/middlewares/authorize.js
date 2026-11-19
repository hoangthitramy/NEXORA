import { sendError } from '../utils/response.js';

export const authorize = (allowedRoles = []) => {
  return (req, res, next) => {
    if (!req.user) {
      return sendError(res, 'Chưa được xác thực', 401);
    }

    if (allowedRoles.length === 0) {
      return next();
    }

    // Admin has superuser access
    const userRoles = (req.user.roles || []).map((r) => r.toUpperCase());
    if (userRoles.includes('ADMIN')) {
      return next();
    }

    const normalizedAllowed = allowedRoles.map((r) => r.toUpperCase());
    const hasRole = userRoles.some((role) => normalizedAllowed.includes(role));
    if (!hasRole) {
      return sendError(res, 'Bạn không có quyền thực hiện hành động này', 403);
    }

    next();
  };
};
