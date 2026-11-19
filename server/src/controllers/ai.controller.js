import * as aiService from '../services/ai.service.js';
import { sendSuccess } from '../utils/response.js';

export const analyze = async (req, res, next) => {
  try {
    const { requestId } = req.params;
    const data = await aiService.analyzeRequest(requestId);
    return sendSuccess(res, data, 'Phân tích hồ sơ thành công');
  } catch (error) {
    next(error);
  }
};

export const chat = async (req, res, next) => {
  try {
    const { message, context } = req.body;
    const data = await aiService.chatWithAI(message, context, req.user);
    return sendSuccess(res, data, 'Phản hồi từ AI');
  } catch (error) {
    next(error);
  }
};

export const getKnowledgeList = async (req, res, next) => {
  try {
    const data = await aiService.getKnowledgeBaseList();
    return sendSuccess(res, data, 'Danh sách tri thức RAG');
  } catch (error) {
    next(error);
  }
};
