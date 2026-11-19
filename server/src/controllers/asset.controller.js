import * as assetService from '../services/asset.service.js';
import { sendSuccess } from '../utils/response.js';

export const listAssets = async (req, res, next) => {
  try {
    const { status, category, search } = req.query;
    const data = await assetService.getAssets({ status, category, search });
    return sendSuccess(res, data, 'Lấy danh sách tài sản thành công');
  } catch (error) {
    next(error);
  }
};

export const listAssignments = async (req, res, next) => {
  try {
    const { employeeId } = req.query;
    const data = await assetService.getAssetAssignments(employeeId);
    return sendSuccess(res, data, 'Lấy lịch sử cấp phát tài sản thành công');
  } catch (error) {
    next(error);
  }
};

export const returnAsset = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { condition, note } = req.body;
    const data = await assetService.returnAsset(id, condition, note, req.user.id);
    return sendSuccess(res, data, 'Xác nhận thu hồi tài sản thành công');
  } catch (error) {
    next(error);
  }
};
