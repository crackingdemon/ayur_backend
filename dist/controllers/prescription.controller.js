"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.prescriptionController = exports.PrescriptionController = void 0;
const prescription_service_1 = require("../services/prescription.service");
const zod_1 = require("zod");
const prescriptionItemSchema = zod_1.z.object({
    inventoryId: zod_1.z.string().optional(),
    customMedicineName: zod_1.z.string().optional(),
    dosage: zod_1.z.string().min(1),
    frequency: zod_1.z.string().optional(),
    kala: zod_1.z.string().optional(),
    anupana: zod_1.z.string().optional(),
    duration: zod_1.z.string().min(1),
    instructions: zod_1.z.string().optional(),
});
const savePrescriptionSchema = zod_1.z.object({
    pathya: zod_1.z.string().optional(),
    apathya: zod_1.z.string().optional(),
    vihara: zod_1.z.string().optional(),
    notes: zod_1.z.string().optional(),
    followUpDate: zod_1.z.string().optional(),
    items: zod_1.z.array(prescriptionItemSchema),
});
class PrescriptionController {
    async save(req, res) {
        try {
            const orgId = req.user.organizationId;
            const visitId = req.params.visitId;
            const validatedData = savePrescriptionSchema.parse(req.body);
            const prescription = await prescription_service_1.prescriptionService.savePrescription(orgId, visitId, validatedData);
            res.status(200).json(prescription);
        }
        catch (error) {
            if (error instanceof zod_1.z.ZodError) {
                return res.status(400).json({ error: error.issues[0].message });
            }
            console.error('Error saving prescription:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }
    async get(req, res) {
        try {
            const orgId = req.user.organizationId;
            const visitId = req.params.visitId;
            const prescription = await prescription_service_1.prescriptionService.getPrescription(orgId, visitId);
            if (!prescription) {
                return res.status(404).json({ error: 'Prescription not found' });
            }
            res.json(prescription);
        }
        catch (error) {
            console.error('Error fetching prescription:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }
    async getAll(req, res) {
        try {
            const orgId = req.user.organizationId;
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 20;
            const search = req.query.search || "";
            const result = await prescription_service_1.prescriptionService.getAllPrescriptions(orgId, page, limit, search);
            res.json(result);
        }
        catch (error) {
            console.error('Error fetching all prescriptions:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }
    async dispense(req, res) {
        try {
            const orgId = req.user.organizationId;
            const userId = req.user.userId; // extracted from auth token
            const { id } = req.params;
            const { dispensedItems } = req.body;
            const result = await prescription_service_1.prescriptionService.dispensePrescription(orgId, id, userId, dispensedItems);
            res.json(result);
        }
        catch (error) {
            console.error('Error dispensing prescription:', error);
            res.status(400).json({ error: error.message || 'Error dispensing prescription' });
        }
    }
}
exports.PrescriptionController = PrescriptionController;
exports.prescriptionController = new PrescriptionController();
