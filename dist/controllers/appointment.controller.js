"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.appointmentController = exports.AppointmentController = void 0;
const appointment_service_1 = require("../services/appointment.service");
const zod_1 = require("zod");
const bookAppointmentSchema = zod_1.z.object({
    isNewPatient: zod_1.z.boolean(),
    patientId: zod_1.z.string().optional(),
    name: zod_1.z.string().min(1, "Name is required"),
    age: zod_1.z.number().optional(),
    gender: zod_1.z.string().optional(),
    phone: zod_1.z.string().min(1, "Phone is required"),
    date: zod_1.z.string(),
    time: zod_1.z.string(),
    duration: zod_1.z.number(),
    reason: zod_1.z.string().min(1, "Reason is required"),
    source: zod_1.z.string(),
});
class AppointmentController {
    async book(req, res) {
        try {
            const validatedData = bookAppointmentSchema.parse(req.body);
            if (validatedData.isNewPatient && (!validatedData.age || !validatedData.gender)) {
                return res.status(400).json({ error: "Age and Gender are required for new patients" });
            }
            const orgId = req.user.organizationId;
            const visit = await appointment_service_1.appointmentService.bookAppointment(orgId, validatedData);
            res.status(201).json(visit);
        }
        catch (error) {
            if (error instanceof zod_1.z.ZodError) {
                return res.status(400).json({ error: error.issues[0].message });
            }
            console.error('Error booking appointment:', error);
            res.status(500).json({ error: error instanceof Error ? error.message : 'Internal Server Error' });
        }
    }
    async getToday(req, res) {
        try {
            const orgId = req.user.organizationId;
            const dateString = req.query.date;
            const appointments = await appointment_service_1.appointmentService.getAppointmentsToday(orgId, dateString);
            res.json(appointments);
        }
        catch (error) {
            console.error('Error fetching today appointments:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }
    async getAllPaginated(req, res) {
        try {
            const orgId = req.user.organizationId;
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const result = await appointment_service_1.appointmentService.getAppointmentsPaginated(orgId, page, limit);
            res.json(result);
        }
        catch (error) {
            console.error('Error fetching paginated appointments:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }
    async updateStatus(req, res) {
        try {
            const id = req.params.id;
            const status = req.body.status;
            const validStatuses = ['Scheduled', 'Waiting', 'In Consultation', 'Completed', 'Cancelled'];
            if (!validStatuses.includes(status)) {
                return res.status(400).json({ error: "Invalid status" });
            }
            const orgId = req.user.organizationId;
            const updated = await appointment_service_1.appointmentService.updateStatus(orgId, id, status);
            res.json(updated);
        }
        catch (error) {
            console.error('Error updating status:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }
}
exports.AppointmentController = AppointmentController;
exports.appointmentController = new AppointmentController();
