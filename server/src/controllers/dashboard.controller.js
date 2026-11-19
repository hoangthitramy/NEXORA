import * as dashboardService from '../services/dashboard.service.js';
import { sendSuccess } from '../utils/response.js';

export const getOverview = async (req, res, next) => {
  try {
    const data = await dashboardService.getOverviewStats();
    return sendSuccess(res, data, 'Lấy dữ liệu tổng quan thành công');
  } catch (error) {
    next(error);
  }
};
