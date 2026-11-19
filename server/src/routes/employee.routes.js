import { Router } from 'express';
import * as employeeController from '../controllers/employee.controller.js';
import { authenticate } from '../middlewares/authenticate.js';

const router = Router();

router.use(authenticate);

router.get('/', employeeController.listEmployees);
router.get('/:id', employeeController.getEmployee);
router.get('/:id/assets', employeeController.getEmployeeAssets);
router.get('/:id/accounts', employeeController.getEmployeeAccounts);

export default router;
