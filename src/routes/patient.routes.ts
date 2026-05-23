import { Router } from 'express';
import { patientController } from '../controllers/patient.controller';

const router = Router();

router.get('/', patientController.getAll);
router.get('/:id', patientController.getById);
router.post('/', patientController.create);

// EMR Update Routes
router.put('/:id/modern-emr', patientController.updateModernEMR);
router.put('/:id/ayurvedic-emr', patientController.updateAyurvedicEMR);
router.put('/:id/diagnosis', patientController.updateDiagnosis);

export const patientRoutes = router;
