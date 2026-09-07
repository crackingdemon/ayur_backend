import { Router } from 'express';
import { PanchakarmaController } from '../controllers/panchakarma.controller';
const router = Router();
const panchakarmaController = new PanchakarmaController();

router.get('/', panchakarmaController.getTreatments);
router.get('/:id', panchakarmaController.getTreatmentById);
router.post('/', panchakarmaController.createTreatment);
router.put('/:id/day/:dayId', panchakarmaController.updateDay);
router.post('/:id/complete', panchakarmaController.completeTreatment);

export const panchakarmaRoutes = router;
