import { Router } from 'express';
import * as templateController from '../controllers/template.controller.js';
import { authenticate } from '../middlewares/authenticate.js';

const router = Router();

router.use(authenticate);

router.get('/', templateController.listTemplates);
router.get('/:id', templateController.getTemplate);
router.post('/', templateController.createTemplate);

export default router;
