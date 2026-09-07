"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PanchakarmaController = void 0;
const panchakarma_service_1 = require("../services/panchakarma.service");
const zod_1 = require("zod");
class PanchakarmaController {
    async getTreatments(req, res) {
        try {
            const organizationId = req.user?.organizationId;
            if (!organizationId)
                return res.status(401).json({ error: 'Unauthorized' });
            const filters = {
                status: req.query.status,
                patientId: req.query.patientId,
                facilityId: req.query.facilityId
            };
            const treatments = await panchakarma_service_1.panchakarmaService.getTreatments(organizationId, filters);
            res.json(treatments);
        }
        catch (error) {
            console.error('Error fetching panchakarma treatments:', error);
            res.status(500).json({ error: 'Failed to fetch treatments' });
        }
    }
    async getTreatmentById(req, res) {
        try {
            const organizationId = req.user?.organizationId;
            if (!organizationId)
                return res.status(401).json({ error: 'Unauthorized' });
            const id = req.params.id;
            const treatment = await panchakarma_service_1.panchakarmaService.getTreatmentById(id, organizationId);
            if (!treatment) {
                return res.status(404).json({ error: 'Treatment not found' });
            }
            res.json(treatment);
        }
        catch (error) {
            console.error('Error fetching panchakarma treatment:', error);
            res.status(500).json({ error: 'Failed to fetch treatment' });
        }
    }
    async createTreatment(req, res) {
        try {
            const organizationId = req.user?.organizationId;
            if (!organizationId)
                return res.status(401).json({ error: 'Unauthorized' });
            const validatedData = panchakarma_service_1.createTreatmentSchema.parse(req.body);
            const treatment = await panchakarma_service_1.panchakarmaService.createTreatment(organizationId, validatedData);
            res.status(201).json(treatment);
        }
        catch (error) {
            if (error instanceof zod_1.z.ZodError) {
                return res.status(400).json({ error: error.issues[0].message });
            }
            console.error('Error creating panchakarma treatment:', error);
            res.status(500).json({ error: 'Failed to create treatment' });
        }
    }
    async updateDay(req, res) {
        try {
            const organizationId = req.user?.organizationId;
            if (!organizationId)
                return res.status(401).json({ error: 'Unauthorized' });
            const id = req.params.id;
            const dayId = req.params.dayId;
            const validatedData = panchakarma_service_1.updateDaySchema.parse(req.body);
            const day = await panchakarma_service_1.panchakarmaService.updateDay(id, dayId, organizationId, validatedData);
            res.json(day);
        }
        catch (error) {
            if (error instanceof zod_1.z.ZodError) {
                return res.status(400).json({ error: error.issues[0].message });
            }
            console.error('Error updating panchakarma day:', error);
            res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to update day' });
        }
    }
    async completeTreatment(req, res) {
        try {
            const organizationId = req.user?.organizationId;
            if (!organizationId)
                return res.status(401).json({ error: 'Unauthorized' });
            const id = req.params.id;
            await panchakarma_service_1.panchakarmaService.completeTreatment(id, organizationId);
            res.json({ success: true });
        }
        catch (error) {
            console.error('Error completing panchakarma treatment:', error);
            res.status(500).json({ error: 'Failed to complete treatment' });
        }
    }
}
exports.PanchakarmaController = PanchakarmaController;
