import * as authService from '../services/auth.service.js';
import { sendSuccess } from '../utils/response.js';

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const result = await authService.loginUser(email, password);
    return sendSuccess(res, result, 'Đăng nhập thành công');
  } catch (error) {
    next(error);
  }
};

export const register = async (req, res, next) => {
  try {
    const result = await authService.registerUser(req.body);
    return sendSuccess(res, result, 'Đăng ký tài khoản thành công', 201);
  } catch (error) {
    next(error);
  }
};

export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const result = await authService.forgotPassword(email);
    return sendSuccess(res, result, 'Đã tạo mã xác thực đặt lại mật khẩu');
  } catch (error) {
    next(error);
  }
};

export const resetPassword = async (req, res, next) => {
  try {
    const { resetToken, newPassword } = req.body;
    await authService.resetPassword(resetToken, newPassword);
    return sendSuccess(res, null, 'Đặt lại mật khẩu thành công');
  } catch (error) {
    next(error);
  }
};

export const getDepartments = async (req, res, next) => {
  try {
    const result = await authService.getDepartmentsList();
    return sendSuccess(res, result, 'Lấy danh sách phòng ban thành công');
  } catch (error) {
    next(error);
  }
};

export const me = async (req, res, next) => {
  try {
    const user = await authService.getMe(req.user.id);
    return sendSuccess(res, user, 'Lấy thông tin người dùng thành công');
  } catch (error) {
    next(error);
  }
};

export const logout = async (req, res) => {
  return sendSuccess(res, null, 'Đăng xuất thành công');
};

export const changePassword = async (req, res, next) => {
  try {
    const { oldPassword, newPassword } = req.body;
    await authService.changePassword(req.user.id, oldPassword, newPassword);
    return sendSuccess(res, null, 'Đổi mật khẩu thành công');
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (req, res, next) => {
  try {
    const result = await authService.updateProfile(req.user.id, req.body);
    return sendSuccess(res, result, 'Cập nhật thông tin hồ sơ thành công');
  } catch (error) {
    next(error);
  }
};

