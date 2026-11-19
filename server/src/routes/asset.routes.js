import { Router } from 'express';
import * as assetController from '../controllers/asset.controller.js';
import { authenticate } from '../middlewares/authenticate.js';

const router = Router();

router.use(authenticate);

router.get('/', assetController.listAssets);
router.get('/assignments', assetController.listAssignments);
router.post('/assignments/:id/return', assetController.returnAsset);

export default router;
