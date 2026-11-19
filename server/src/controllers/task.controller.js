import * as taskService from '../services/task.service.js';
import { sendSuccess } from '../utils/response.js';

export const listTasks = async (req, res, next) => {
  try {
    const { requestId, status, assigneeId } = req.query;
    const data = await taskService.getTasks({ requestId, status, assigneeId });
    return sendSuccess(res, data, 'Lấy danh sách nhiệm vụ thành công');
  } catch (error) {
    next(error);
  }
};

export const updateStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const data = await taskService.updateTaskStatus(id, status, req.user.id);
    return sendSuccess(res, data, 'Cập nhật trạng thái nhiệm vụ thành công');
  } catch (error) {
    next(error);
  }
};
