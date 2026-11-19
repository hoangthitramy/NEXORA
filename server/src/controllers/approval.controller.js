import * as approvalService from '../services/approval.service.js';
import { sendSuccess } from '../utils/response.js';

export const listPending = async (req, res, next) => {
  try {
    const data = await approvalService.getPendingApprovals(req.user.id);
    return sendSuccess(res, data, 'Lấy danh sách chờ phê duyệt thành công');
  } catch (error) {
    next(error);
  }
};

export const approve = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { note } = req.body;
    const data = await approvalService.approveStep(id, req.user.id, note);
    return sendSuccess(res, data, 'Phê duyệt thành công');
  } catch (error) {
    next(error);
  }
};

export const reject = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { note } = req.body;
    const data = await approvalService.rejectStep(id, req.user.id, note);
    return sendSuccess(res, data, 'Từ chối phê duyệt thành công');
  } catch (error) {
    next(error);
  }
};
