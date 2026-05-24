import { Router } from 'express';
import { patientController } from '../controllers/patient.controller';

const router = Router();

router.get('/', patientController.getAll);
router.get('/:id', patientController.getById);
router.post('/', patientController.create);
router.put('/:id', patientController.updatePatient);

// EMR Update Routes
router.put('/:id/visits/:visitId/modern-emr', patientController.updateModernEMR);
router.put('/:id/visits/:visitId/ayurvedic-emr', patientController.updateAyurvedicEMR);
router.put('/:id/visits/:visitId/diagnosis', patientController.updateDiagnosis.bind(patientController));
router.get('/:id/history', patientController.getHistory.bind(patientController));

export const patientRoutes = router;
