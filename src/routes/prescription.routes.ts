import { Router } from 'express';
import { prescriptionController } from '../controllers/prescription.controller';

const router = Router();

router.get('/', prescriptionController.getAll.bind(prescriptionController));
router.post('/:id/dispense', prescriptionController.dispense.bind(prescriptionController));
router.get('/visit/:visitId', prescriptionController.get.bind(prescriptionController));
router.post('/visit/:visitId', prescriptionController.save.bind(prescriptionController));

export const prescriptionRoutes = router;
