import * as notifService from '../services/notification.service.js';
import { sendSuccess } from '../utils/response.js';

export const listNotifications = async (req, res, next) => {
  try {
    const data = await notifService.getUserNotifications(req.user.id);
    return sendSuccess(res, data, 'Lấy danh sách thông báo thành công');
  } catch (error) {
    next(error);
  }
};

export const markRead = async (req, res, next) => {
  try {
    const { id } = req.params;
    await notifService.markAsRead(id, req.user.id);
    return sendSuccess(res, null, 'Đã đánh dấu thông báo đã đọc');
  } catch (error) {
    next(error);
  }
};
