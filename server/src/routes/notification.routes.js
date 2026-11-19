import { Router } from 'express';
import * as notifController from '../controllers/notification.controller.js';
import { authenticate } from '../middlewares/authenticate.js';

const router = Router();

router.use(authenticate);

router.get('/', notifController.listNotifications);
router.patch('/:id/read', notifController.markRead);

export default router;
