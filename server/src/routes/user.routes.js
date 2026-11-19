import { Router } from 'express';
import * as userController from '../controllers/user.controller.js';
import { authenticate } from '../middlewares/authenticate.js';
import { authorize } from '../middlewares/authorize.js';

const router = Router();

router.use(authenticate);
// Admin and HR can manage users
router.use(authorize(['Admin', 'HR']));

router.get('/', userController.listUsers);
router.post('/', userController.createUser);
router.patch('/:id/toggle-status', userController.toggleStatus);

export default router;
