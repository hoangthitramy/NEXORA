import { Router } from 'express';
import * as accessController from '../controllers/access.controller.js';
import { authenticate } from '../middlewares/authenticate.js';

const router = Router();

router.use(authenticate);

router.get('/accounts', accessController.listAccounts);
router.get('/revocations/:requestId', accessController.listRevocations);
router.patch('/revocations/:id/status', accessController.updateStatus);

export default router;
