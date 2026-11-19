import express from 'express';
import * as exceptionController from '../controllers/exception.controller.js';
import { authenticate } from '../middlewares/authenticate.js';
import { authorize } from '../middlewares/authorize.js';

const router = express.Router();

router.use(authenticate);

router.get('/', exceptionController.getExceptions);
router.get('/:id', exceptionController.getExceptionById);
router.post('/', exceptionController.createException);
router.patch(
  '/:id/resolve',
  authorize(['Admin', 'ADMIN', 'HR', 'Manager', 'MANAGER', 'IT', 'Kế toán', 'ACCOUNTANT']),
  exceptionController.resolveException
);

export default router;
