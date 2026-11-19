import * as financeService from '../services/finance.service.js';

export const getFinancialReconciliations = async (req, res, next) => {
  try {
    const data = await financeService.getFinancialReconciliations(req.query);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const getFinancialReconciliationById = async (req, res, next) => {
  try {
    const data = await financeService.getFinancialReconciliationById(req.params.id);
    if (!data) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy bản ghi đối soát' });
    }
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const updateFinancialReconciliation = async (req, res, next) => {
  try {
    const data = await financeService.updateFinancialReconciliation(
      req.params.id,
      req.user,
      req.body
    );
    res.json({
      success: true,
      message: 'Cập nhật đối soát tài chính thành công',
      data,
    });
  } catch (error) {
    next(error);
  }
};
