"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.patientRoutes = void 0;
const express_1 = require("express");
const patient_controller_1 = require("../controllers/patient.controller");
const router = (0, express_1.Router)();
router.get('/', patient_controller_1.patientController.getAll);
router.get('/:id', patient_controller_1.patientController.getById);
router.post('/', patient_controller_1.patientController.create);
router.put('/:id', patient_controller_1.patientController.updatePatient);
// EMR Update Routes
router.put('/:id/visits/:visitId/modern-emr', patient_controller_1.patientController.updateModernEMR);
router.put('/:id/visits/:visitId/ayurvedic-emr', patient_controller_1.patientController.updateAyurvedicEMR);
router.put('/:id/visits/:visitId/diagnosis', patient_controller_1.patientController.updateDiagnosis.bind(patient_controller_1.patientController));
router.get('/:id/history', patient_controller_1.patientController.getHistory.bind(patient_controller_1.patientController));
exports.patientRoutes = router;
