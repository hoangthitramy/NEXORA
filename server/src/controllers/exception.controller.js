import * as exceptionService from '../services/exception.service.js';

export const getExceptions = async (req, res, next) => {
  try {
    const data = await exceptionService.getExceptions(req.query);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const getExceptionById = async (req, res, next) => {
  try {
    const data = await exceptionService.getExceptionById(req.params.id);
    if (!data) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy ngoại lệ' });
    }
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const createException = async (req, res, next) => {
  try {
    const data = await exceptionService.createException(req.user, req.body);
    res.status(201).json({
      success: true,
      message: 'Ghi nhận sự cố ngoại lệ thành công',
      data,
    });
  } catch (error) {
    next(error);
  }
};

export const resolveException = async (req, res, next) => {
  try {
    const data = await exceptionService.resolveException(req.params.id, req.user, req.body);
    res.json({
      success: true,
      message: 'Cập nhật xử lý sự cố ngoại lệ thành công',
      data,
    });
  } catch (error) {
    next(error);
  }
};
