import multer from 'multer';
import path from 'path';
import * as documentService from '../services/document.service.js';
import { sendSuccess, sendError } from '../utils/response.js';

// Setup Multer Storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './uploads');
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${uniqueSuffix}${ext}`);
  },
});

export const upload = multer({
  storage,
  limits: { fileSize: 15 * 1024 * 1024 }, // 15MB
});

export const listDocuments = async (req, res, next) => {
  try {
    const { requestId } = req.params;
    const data = await documentService.getDocumentsByRequest(requestId);
    return sendSuccess(res, data, 'Lấy danh sách tài liệu thành công');
  } catch (error) {
    next(error);
  }
};

export const uploadDocument = async (req, res, next) => {
  try {
    const { requestId } = req.params;
    const { type, name } = req.body;

    const fileName = name || req.file?.originalname || 'Tài liệu bàn giao';
    const fileUrl = req.file ? `/uploads/${req.file.filename}` : req.body.fileUrl || '';

    const data = await documentService.createDocument(
      requestId,
      {
        name: fileName,
        fileUrl,
        mimeType: req.file?.mimetype || 'application/octet-stream',
        type: type || 'HANDOVER',
      },
      req.user.id,
      req.user.fullName
    );

    return sendSuccess(res, data, 'Tải lên tài liệu thành công', 201);
  } catch (error) {
    next(error);
  }
};

export const deleteDocument = async (req, res, next) => {
  try {
    const { id } = req.params;
    await documentService.deleteDocument(id, req.user.id);
    return sendSuccess(res, null, 'Xóa tài liệu thành công');
  } catch (error) {
    next(error);
  }
};
