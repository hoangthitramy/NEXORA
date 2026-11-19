import { Router } from 'express';
import * as offboardingController from '../controllers/offboarding.controller.js';
import { authenticate } from '../middlewares/authenticate.js';

const router = Router();

router.use(authenticate);

router.get('/', offboardingController.listRequests);
router.get('/:id', offboardingController.getRequest);
router.post('/', offboardingController.createRequest);
router.get('/:id/progress', offboardingController.getProgress);

export default router;
