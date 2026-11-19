import { Router } from 'express';
import * as taskController from '../controllers/task.controller.js';
import { authenticate } from '../middlewares/authenticate.js';

const router = Router();

router.use(authenticate);

router.get('/', taskController.listTasks);
router.patch('/:id/status', taskController.updateStatus);

export default router;
