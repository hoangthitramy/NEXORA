import { Router } from 'express';
import * as handoverController from '../controllers/handover.controller.js';
import { authenticate } from '../middlewares/authenticate.js';

const router = Router();

router.use(authenticate);

router.get('/', handoverController.listHandovers);
router.get('/:id', handoverController.getHandover);
router.patch('/items/:itemId', handoverController.updateItem);
router.post('/:id/confirm', handoverController.confirm);

export default router;
