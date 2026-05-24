"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.patientController = exports.PatientController = void 0;
const patient_service_1 = require("../services/patient.service");
class PatientController {
    async getAll(req, res) {
        try {
            const orgId = req.user.organizationId;
            const search = req.query.search;
            const patients = await patient_service_1.patientService.getAllPatients(orgId, search);
            res.json(patients);
        }
        catch (error) {
            console.error('Error fetching patients:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }
    async getById(req, res) {
        try {
            const orgId = req.user.organizationId;
            const id = req.params.id;
            const patient = await patient_service_1.patientService.getPatientById(orgId, id);
            if (!patient) {
                return res.status(404).json({ error: 'Patient not found' });
            }
            res.json(patient);
        }
        catch (error) {
            console.error('Error fetching patient:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }
    async create(req, res) {
        try {
            const orgId = req.user.organizationId;
            const patient = await patient_service_1.patientService.createPatient(orgId, req.body);
            // Automatically create an initial visit for the new patient
            await patient_service_1.patientService.getOrCreateLatestVisit(orgId, patient.id);
            res.status(201).json(patient);
        }
        catch (error) {
            console.error('Error creating patient:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }
    async updatePatient(req, res) {
        try {
            const orgId = req.user.organizationId;
            const id = req.params.id;
            const patient = await patient_service_1.patientService.updatePatient(orgId, id, req.body);
            res.json(patient);
        }
        catch (error) {
            console.error('Error updating patient:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }
    async updateModernEMR(req, res) {
        try {
            const visitId = req.params.visitId;
            const emr = await patient_service_1.patientService.updateModernEMR(visitId, req.body);
            res.json(emr);
        }
        catch (error) {
            console.error('Error updating Modern EMR:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }
    async updateAyurvedicEMR(req, res) {
        try {
            const visitId = req.params.visitId;
            const emr = await patient_service_1.patientService.updateAyurvedicEMR(visitId, req.body);
            res.json(emr);
        }
        catch (error) {
            console.error('Error updating Ayurvedic EMR:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }
    async updateDiagnosis(req, res) {
        try {
            const visitId = req.params.visitId;
            const diagnosis = await patient_service_1.patientService.updateDiagnosis(visitId, req.body);
            res.status(200).json(diagnosis);
        }
        catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }
    async getHistory(req, res) {
        try {
            const orgId = req.user.organizationId;
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 5;
            const result = await patient_service_1.patientService.getPatientHistoryPaginated(orgId, req.params.id, page, limit);
            res.json(result);
        }
        catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }
}
exports.PatientController = PatientController;
exports.patientController = new PatientController();
