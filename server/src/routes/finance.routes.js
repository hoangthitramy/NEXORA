import express from 'express';
import * as financeController from '../controllers/finance.controller.js';
import { authenticate } from '../middlewares/authenticate.js';
import { authorize } from '../middlewares/authorize.js';

const router = express.Router();

router.use(authenticate);

// View reconciliations
router.get(
  '/',
  authorize(['Admin', 'ADMIN', 'HR', 'Manager', 'MANAGER', 'Kế toán', 'ACCOUNTANT', 'Accountant']),
  financeController.getFinancialReconciliations
);

router.get(
  '/:id',
  authorize(['Admin', 'ADMIN', 'HR', 'Manager', 'MANAGER', 'Kế toán', 'ACCOUNTANT', 'Accountant']),
  financeController.getFinancialReconciliationById
);

// Update/clear reconciliation (Accountant, Admin)
router.patch(
  '/:id',
  authorize(['Admin', 'ADMIN', 'Kế toán', 'ACCOUNTANT', 'Accountant']),
  financeController.updateFinancialReconciliation
);

export default router;
