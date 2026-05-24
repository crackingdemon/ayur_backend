import { Router } from 'express';
import { financeController } from '../controllers/finance.controller';

const router = Router();

router.get('/transactions', financeController.getAll.bind(financeController));
router.post('/transactions', financeController.create.bind(financeController));

export const financeRoutes = router;
