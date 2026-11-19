import * as templateService from '../services/template.service.js';
import { sendSuccess, sendError } from '../utils/response.js';

export const listTemplates = async (req, res, next) => {
  try {
    const data = await templateService.getTemplates();
    return sendSuccess(res, data, 'Lấy danh sách mẫu quy trình bàn giao thành công');
  } catch (error) {
    next(error);
  }
};

export const getTemplate = async (req, res, next) => {
  try {
    const { id } = req.params;
    const data = await templateService.getTemplateById(id);
    if (!data) return sendError(res, 'Không tìm thấy mẫu quy trình', 404);
    return sendSuccess(res, data, 'Lấy chi tiết mẫu quy trình thành công');
  } catch (error) {
    next(error);
  }
};

export const createTemplate = async (req, res, next) => {
  try {
    const data = await templateService.createTemplate(req.body);
    return sendSuccess(res, data, 'Tạo mẫu quy trình thành công', 201);
  } catch (error) {
    next(error);
  }
};
