import { Router } from 'express';
import * as documentController from '../controllers/document.controller.js';
import { authenticate } from '../middlewares/authenticate.js';

const router = Router();

router.use(authenticate);

router.get('/offboarding/:requestId/documents', documentController.listDocuments);
router.post(
  '/offboarding/:requestId/documents',
  documentController.upload.single('file'),
  documentController.uploadDocument
);
router.delete('/documents/:id', documentController.deleteDocument);

export default router;
