import * as userService from '../services/user.service.js';
import { sendSuccess } from '../utils/response.js';

export const listUsers = async (req, res, next) => {
  try {
    const data = await userService.listAllUsers();
    return sendSuccess(res, data, 'Lấy danh sách người dùng thành công');
  } catch (error) {
    next(error);
  }
};

export const createUser = async (req, res, next) => {
  try {
    const data = await userService.createUserByAdmin(req.body, req.user.id);
    return sendSuccess(res, data, 'Tạo tài khoản người dùng thành công', 201);
  } catch (error) {
    next(error);
  }
};

export const toggleStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const data = await userService.toggleUserStatus(id, req.user.id);
    return sendSuccess(
      res,
      data,
      data.isActive ? 'Đã kích hoạt tài khoản' : 'Đã vô hiệu hóa tài khoản'
    );
  } catch (error) {
    next(error);
  }
};
