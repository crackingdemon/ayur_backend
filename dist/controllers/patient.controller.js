"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.patientController = exports.PatientController = void 0;
const patient_service_1 = require("../services/patient.service");
const zod_1 = require("zod");
const patientSchema = zod_1.z.object({
    name: zod_1.z.string().min(1, "Name is required"),
    age: zod_1.z.number().positive("Age must be a positive number"),
    gender: zod_1.z.string().min(1, "Gender is required"),
    phone: zod_1.z.string().min(1, "Phone is required"),
    bloodGroup: zod_1.z.string().optional(),
    allergies: zod_1.z.string().optional(),
    pastHistory: zod_1.z.string().optional(),
    drugHistory: zod_1.z.string().optional(),
    personalHistory: zod_1.z.string().optional(),
    familyHistory: zod_1.z.string().optional(),
});
const patientUpdateSchema = patientSchema.partial();
const modernEMRSchema = zod_1.z.object({
    chiefComplaints: zod_1.z.string().optional(),
    hpi: zod_1.z.string().optional(),
    pulse: zod_1.z.string().optional(),
    bp: zod_1.z.string().optional(),
    temp: zod_1.z.string().optional(),
    systemicExam: zod_1.z.string().optional(),
    investigations: zod_1.z.string().optional(),
});
const ayurvedicEMRSchema = zod_1.z.object({
    prakruti: zod_1.z.string().optional(),
    vikruti: zod_1.z.string().optional(),
    sara: zod_1.z.string().optional(),
    samhanana: zod_1.z.string().optional(),
    pramana: zod_1.z.string().optional(),
    satmya: zod_1.z.string().optional(),
    satva: zod_1.z.string().optional(),
    aharaShakti: zod_1.z.string().optional(),
    vyayamaShakti: zod_1.z.string().optional(),
    vaya: zod_1.z.string().optional(),
    nadi: zod_1.z.string().optional(),
    mootra: zod_1.z.string().optional(),
    mala: zod_1.z.string().optional(),
    jihva: zod_1.z.string().optional(),
    shabda: zod_1.z.string().optional(),
    sparsha: zod_1.z.string().optional(),
    drik: zod_1.z.string().optional(),
    aakruti: zod_1.z.string().optional(),
    vata: zod_1.z.number().optional(),
    pitta: zod_1.z.number().optional(),
    kapha: zod_1.z.number().optional(),
    affectedDhatu: zod_1.z.string().optional(),
    srotodushtiType: zod_1.z.string().optional(),
    agni: zod_1.z.string().optional(),
    ama: zod_1.z.string().optional(),
    kostha: zod_1.z.string().optional(),
    nidana: zod_1.z.string().optional(),
});
const diagnosisSchema = zod_1.z.object({
    provisional: zod_1.z.string().optional(),
    differential: zod_1.z.string().optional(),
    ayurvedicDiagnosis: zod_1.z.string().optional(),
    samprapti: zod_1.z.string().optional(),
    chikitsa: zod_1.z.string().optional(),
});
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
            const validatedData = patientSchema.parse(req.body);
            const patient = await patient_service_1.patientService.createPatient(orgId, validatedData);
            res.status(201).json(patient);
        }
        catch (error) {
            if (error instanceof zod_1.z.ZodError) {
                return res.status(400).json({ error: error.issues[0].message });
            }
            console.error('Error creating patient:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }
    async updatePatient(req, res) {
        try {
            const orgId = req.user.organizationId;
            const id = req.params.id;
            const validatedData = patientUpdateSchema.parse(req.body);
            const patient = await patient_service_1.patientService.updatePatient(orgId, id, validatedData);
            res.json(patient);
        }
        catch (error) {
            if (error instanceof zod_1.z.ZodError) {
                return res.status(400).json({ error: error.issues[0].message });
            }
            console.error('Error updating patient:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }
    async updateModernEMR(req, res) {
        try {
            const orgId = req.user.organizationId;
            const visitId = req.params.visitId;
            const validatedData = modernEMRSchema.parse(req.body);
            const emr = await patient_service_1.patientService.updateModernEMR(orgId, visitId, validatedData);
            res.json(emr);
        }
        catch (error) {
            if (error instanceof zod_1.z.ZodError) {
                return res.status(400).json({ error: error.issues[0].message });
            }
            console.error('Error updating Modern EMR:', error);
            res.status(error.message?.includes('not found') ? 404 : 500).json({ error: error.message || 'Internal Server Error' });
        }
    }
    async updateAyurvedicEMR(req, res) {
        try {
            const orgId = req.user.organizationId;
            const visitId = req.params.visitId;
            const validatedData = ayurvedicEMRSchema.parse(req.body);
            const emr = await patient_service_1.patientService.updateAyurvedicEMR(orgId, visitId, validatedData);
            res.json(emr);
        }
        catch (error) {
            if (error instanceof zod_1.z.ZodError) {
                return res.status(400).json({ error: error.issues[0].message });
            }
            console.error('Error updating Ayurvedic EMR:', error);
            res.status(error.message?.includes('not found') ? 404 : 500).json({ error: error.message || 'Internal Server Error' });
        }
    }
    async updateDiagnosis(req, res) {
        try {
            const orgId = req.user.organizationId;
            const visitId = req.params.visitId;
            const validatedData = diagnosisSchema.parse(req.body);
            const diagnosis = await patient_service_1.patientService.updateDiagnosis(orgId, visitId, validatedData);
            res.status(200).json(diagnosis);
        }
        catch (error) {
            if (error instanceof zod_1.z.ZodError) {
                return res.status(400).json({ error: error.issues[0].message });
            }
            console.error(error);
            res.status(error.message?.includes('not found') ? 404 : 500).json({ error: error.message || 'Internal Server Error' });
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
