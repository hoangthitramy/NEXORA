import * as resignationService from '../services/resignation.service.js';

export const getResignationRequests = async (req, res, next) => {
  try {
    const data = await resignationService.getResignationRequests(req.user, req.query);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const getResignationRequestById = async (req, res, next) => {
  try {
    const data = await resignationService.getResignationRequestById(req.params.id);
    if (!data) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy đơn xin nghỉ việc' });
    }
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const createResignationRequest = async (req, res, next) => {
  try {
    const data = await resignationService.createResignationRequest(req.user, req.body);
    res.status(201).json({
      success: true,
      message: 'Gửi đơn xin nghỉ việc thành công',
      data,
    });
  } catch (error) {
    next(error);
  }
};

export const reviewResignationRequest = async (req, res, next) => {
  try {
    const data = await resignationService.reviewResignationRequest(
      req.params.id,
      req.user.id,
      req.body
    );
    res.json({
      success: true,
      message: req.body.action === 'APPROVE' ? 'Đã phê duyệt đơn xin nghỉ việc' : 'Đã từ chối đơn xin nghỉ việc',
      data,
    });
  } catch (error) {
    next(error);
  }
};
