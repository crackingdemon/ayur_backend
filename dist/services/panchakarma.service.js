"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.panchakarmaService = exports.updateDaySchema = exports.createTreatmentSchema = void 0;
const prisma_1 = require("../lib/prisma");
const zod_1 = require("zod");
exports.createTreatmentSchema = zod_1.z.object({
    patientId: zod_1.z.string(),
    visitId: zod_1.z.string().optional(),
    facilityId: zod_1.z.string().optional(),
    name: zod_1.z.string().min(1, "Name is required"),
    startDate: zod_1.z.string().optional(),
    totalDays: zod_1.z.number().int().min(1).max(90),
    days: zod_1.z.array(zod_1.z.object({
        dayNumber: zod_1.z.number().int(),
        notes: zod_1.z.string().optional()
    })).optional()
});
exports.updateDaySchema = zod_1.z.object({
    status: zod_1.z.enum(["Pending", "Completed", "Missed"]),
    notes: zod_1.z.string().optional()
});
exports.panchakarmaService = {
    async getTreatments(organizationId, filters) {
        return prisma_1.prisma.panchakarmaTreatment.findMany({
            where: {
                organizationId,
                ...(filters?.status ? { status: filters.status } : {}),
                ...(filters?.patientId ? { patientId: filters.patientId } : {}),
                ...(filters?.facilityId ? { facilityId: filters.facilityId } : {})
            },
            include: {
                patient: { select: { name: true, phone: true } },
                facility: { select: { name: true } },
                days: {
                    orderBy: { dayNumber: 'asc' }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
    },
    async getTreatmentById(id, organizationId) {
        return prisma_1.prisma.panchakarmaTreatment.findFirst({
            where: { id, organizationId },
            include: {
                patient: { select: { name: true, phone: true } },
                days: {
                    orderBy: { dayNumber: 'asc' }
                }
            }
        });
    },
    async createTreatment(organizationId, data) {
        // Generate default days if not provided
        const daysData = data.days && data.days.length > 0
            ? data.days.map(d => ({ dayNumber: d.dayNumber, notes: d.notes || "" }))
            : Array.from({ length: data.totalDays }).map((_, i) => ({
                dayNumber: i + 1,
                notes: ""
            }));
        return prisma_1.prisma.panchakarmaTreatment.create({
            data: {
                organizationId,
                patientId: data.patientId,
                visitId: data.visitId,
                facilityId: data.facilityId,
                name: data.name,
                startDate: data.startDate ? new Date(data.startDate) : undefined,
                totalDays: data.totalDays,
                days: {
                    create: daysData
                }
            },
            include: { days: true }
        });
    },
    async updateDay(treatmentId, dayId, organizationId, data) {
        // Verify ownership
        const treatment = await prisma_1.prisma.panchakarmaTreatment.findFirst({
            where: { id: treatmentId, organizationId }
        });
        if (!treatment) {
            throw new Error("Treatment not found");
        }
        return prisma_1.prisma.panchakarmaDay.update({
            where: { id: dayId },
            data: {
                status: data.status,
                ...(data.notes !== undefined ? { notes: data.notes } : {})
            }
        });
    },
    async completeTreatment(id, organizationId) {
        return prisma_1.prisma.panchakarmaTreatment.updateMany({
            where: { id, organizationId },
            data: { status: 'Completed' }
        });
    }
};
