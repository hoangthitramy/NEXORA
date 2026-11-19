import { Router } from 'express';
import * as commentController from '../controllers/comment.controller.js';
import { authenticate } from '../middlewares/authenticate.js';

const router = Router();

router.use(authenticate);

router.get('/offboarding/:requestId/comments', commentController.listComments);
router.post('/offboarding/:requestId/comments', commentController.createComment);

export default router;
