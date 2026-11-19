import express from 'express';
import * as auditController from '../controllers/audit.controller.js';
import { authenticate } from '../middlewares/authenticate.js';
import { authorize } from '../middlewares/authorize.js';

const router = express.Router();

router.use(authenticate);

router.get(
  '/',
  authorize(['Admin', 'ADMIN', 'HR']),
  auditController.getAuditLogs
);

export default router;
