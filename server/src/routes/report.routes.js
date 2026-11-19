import { Router } from 'express';
import * as reportController from '../controllers/report.controller.js';
import { authenticate } from '../middlewares/authenticate.js';

const router = Router();

router.use(authenticate);

router.get('/analytics', reportController.getAnalytics);

export default router;
