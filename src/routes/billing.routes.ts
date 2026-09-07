import { Router } from 'express';
import { billingController } from '../controllers/billing.controller';
import { requireAuth } from '../middlewares/auth.middleware';

const router = Router();

router.use(requireAuth);

router.get('/patients/:patientId/pending', billingController.getPendingBills);
router.post('/patients/:patientId/invoice', billingController.createInvoice);
router.post('/invoice/:invoiceId/pay', billingController.processPayment);

export const billingRoutes = router;
