import * as offboardingService from '../services/offboarding.service.js';
import { sendSuccess, sendError } from '../utils/response.js';

export const listRequests = async (req, res, next) => {
  try {
    const { search, status, departmentId } = req.query;
    const data = await offboardingService.getOffboardingRequests({ search, status, departmentId });
    return sendSuccess(res, data, 'Lấy danh sách hồ sơ nghỉ việc thành công');
  } catch (error) {
    next(error);
  }
};

export const getRequest = async (req, res, next) => {
  try {
    const { id } = req.params;
    const data = await offboardingService.getOffboardingRequestById(id);
    if (!data) return sendError(res, 'Không tìm thấy hồ sơ', 404);
    return sendSuccess(res, data, 'Lấy chi tiết hồ sơ thành công');
  } catch (error) {
    next(error);
  }
};

export const createRequest = async (req, res, next) => {
  try {
    const data = await offboardingService.createOffboardingRequest(req.body, req.user.id);
    return sendSuccess(res, data, 'Tạo hồ sơ nghỉ việc thành công', 201);
  } catch (error) {
    next(error);
  }
};

export const getProgress = async (req, res, next) => {
  try {
    const { id } = req.params;
    const data = await offboardingService.getOffboardingProgress(id);
    if (!data) return sendError(res, 'Không tìm thấy hồ sơ', 404);
    return sendSuccess(res, data, 'Lấy tiến độ hồ sơ thành công');
  } catch (error) {
    next(error);
  }
};
