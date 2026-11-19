import * as commentService from '../services/comment.service.js';
import { sendSuccess } from '../utils/response.js';

export const listComments = async (req, res, next) => {
  try {
    const { requestId } = req.params;
    const data = await commentService.getCommentsByRequest(requestId);
    return sendSuccess(res, data, 'Lấy danh sách trao đổi thành công');
  } catch (error) {
    next(error);
  }
};

export const createComment = async (req, res, next) => {
  try {
    const { requestId } = req.params;
    const { content } = req.body;
    const data = await commentService.addComment(requestId, req.user.id, content);
    return sendSuccess(res, data, 'Gửi bình luận thành công', 201);
  } catch (error) {
    next(error);
  }
};
