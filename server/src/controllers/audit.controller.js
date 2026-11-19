import * as auditService from '../services/audit.service.js';

export const getAuditLogs = async (req, res, next) => {
  try {
    const data = await auditService.getAuditLogs(req.query);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};
