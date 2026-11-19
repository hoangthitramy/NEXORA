import * as handoverService from '../services/handover.service.js';
import { sendSuccess, sendError } from '../utils/response.js';

export const listHandovers = async (req, res, next) => {
  try {
    const { status, requestId } = req.query;
    const data = await handoverService.getHandovers({ status, requestId });
    return sendSuccess(res, data, 'Lấy danh sách phiếu bàn giao thành công');
  } catch (error) {
    next(error);
  }
};

export const getHandover = async (req, res, next) => {
  try {
    const { id } = req.params;
    const data = await handoverService.getHandoverById(id);
    if (!data) return sendError(res, 'Không tìm thấy phiếu bàn giao', 404);
    return sendSuccess(res, data, 'Lấy chi tiết phiếu bàn giao thành công');
  } catch (error) {
    next(error);
  }
};

export const updateItem = async (req, res, next) => {
  try {
    const { itemId } = req.params;
    const { status, receiver, evidenceUrl } = req.body;
    const data = await handoverService.updateHandoverItemStatus(
      itemId,
      status,
      receiver,
      evidenceUrl,
      req.user.id
    );
    return sendSuccess(res, data, 'Cập nhật mục bàn giao thành công');
  } catch (error) {
    next(error);
  }
};

export const confirm = async (req, res, next) => {
  try {
    const { id } = req.params;
    const data = await handoverService.confirmHandover(id, req.user.id);
    return sendSuccess(res, data, 'Xác nhận hoàn tất phiếu bàn giao thành công');
  } catch (error) {
    next(error);
  }
};
