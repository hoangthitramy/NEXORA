import express from 'express';
import * as resignationController from '../controllers/resignation.controller.js';
import { authenticate } from '../middlewares/authenticate.js';
import { authorize } from '../middlewares/authorize.js';

const router = express.Router();

router.use(authenticate);

router.get('/', resignationController.getResignationRequests);
router.get('/:id', resignationController.getResignationRequestById);
router.post('/', resignationController.createResignationRequest);

// HR and Managers can review (approve/reject)
router.post(
  '/:id/review',
  authorize(['Admin', 'ADMIN', 'HR', 'Manager', 'MANAGER']),
  resignationController.reviewResignationRequest
);

export default router;
