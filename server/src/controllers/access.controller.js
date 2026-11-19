import * as accessService from '../services/access.service.js';
import { sendSuccess } from '../utils/response.js';

export const listAccounts = async (req, res, next) => {
  try {
    const { systemName, employeeCode, status } = req.query;
    const data = await accessService.getAccessAccounts({ systemName, employeeCode, status });
    return sendSuccess(res, data, 'Lấy danh sách tài khoản hệ thống thành công');
  } catch (error) {
    next(error);
  }
};

export const listRevocations = async (req, res, next) => {
  try {
    const { requestId } = req.params;
    const data = await accessService.getRevocationsByRequest(requestId);
    return sendSuccess(res, data, 'Lấy danh sách thu hồi quyền thành công');
  } catch (error) {
    next(error);
  }
};

export const updateStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, note } = req.body;
    const data = await accessService.updateRevocationStatus(
      id,
      status,
      note,
      req.user.id,
      req.user.fullName
    );
    return sendSuccess(res, data, 'Cập nhật trạng thái thu hồi tài khoản thành công');
  } catch (error) {
    next(error);
  }
};
