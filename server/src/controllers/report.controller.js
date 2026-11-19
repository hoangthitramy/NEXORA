import * as reportService from '../services/report.service.js';
import { sendSuccess } from '../utils/response.js';

export const getAnalytics = async (req, res, next) => {
  try {
    const data = await reportService.getComprehensiveReport();
    return sendSuccess(res, data, 'Lấy báo cáo thống kê thành công');
  } catch (error) {
    next(error);
  }
};
