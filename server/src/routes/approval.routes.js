import { Router } from 'express';
import * as approvalController from '../controllers/approval.controller.js';
import { authenticate } from '../middlewares/authenticate.js';

const router = Router();

router.use(authenticate);

router.get('/pending', approvalController.listPending);
router.post('/:id/approve', approvalController.approve);
router.post('/:id/reject', approvalController.reject);

export default router;
