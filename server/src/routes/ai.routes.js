import { Router } from 'express';
import * as aiController from '../controllers/ai.controller.js';
import { authenticate } from '../middlewares/authenticate.js';

const router = Router();

router.use(authenticate);

router.post('/analyze/:requestId', aiController.analyze);
router.post('/chat', aiController.chat);

export default router;
