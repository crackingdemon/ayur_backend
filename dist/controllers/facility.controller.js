"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.facilityController = exports.FacilityController = void 0;
const facility_service_1 = require("../services/facility.service");
const zod_1 = require("zod");
const createFacilitySchema = zod_1.z.object({
    name: zod_1.z.string().min(1),
    type: zod_1.z.string().optional(),
    address: zod_1.z.string().optional(),
    phone: zod_1.z.string().optional()
});
class FacilityController {
    async createFacility(req, res) {
        try {
            const orgId = req.user.organizationId;
            const validatedData = createFacilitySchema.parse(req.body);
            const facility = await facility_service_1.facilityService.createFacility(orgId, validatedData);
            // Auto-assign the creator to this facility as primary if it's their first
            await facility_service_1.facilityService.assignUserToFacility(req.user.userId, facility.id, true);
            res.status(201).json(facility);
        }
        catch (error) {
            if (error instanceof zod_1.z.ZodError) {
                return res.status(400).json({ error: error.issues[0].message });
            }
            console.error('Error creating facility:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }
    async getFacilities(req, res) {
        try {
            const orgId = req.user.organizationId;
            const facilities = await facility_service_1.facilityService.getFacilities(orgId);
            res.json(facilities);
        }
        catch (error) {
            console.error('Error fetching facilities:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }
    async getUserFacilities(req, res) {
        try {
            const userId = req.user.userId;
            const facilities = await facility_service_1.facilityService.getUserFacilities(userId);
            res.json(facilities);
        }
        catch (error) {
            console.error('Error fetching user facilities:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }
    async switchFacility(req, res) {
        try {
            const userId = req.user.userId;
            const { facilityId } = req.body;
            if (!facilityId)
                return res.status(400).json({ error: 'facilityId required' });
            await facility_service_1.facilityService.assignUserToFacility(userId, facilityId, true);
            res.json({ success: true });
        }
        catch (error) {
            console.error('Error switching facility:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }
}
exports.FacilityController = FacilityController;
exports.facilityController = new FacilityController();
