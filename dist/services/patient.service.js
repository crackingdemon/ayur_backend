"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.patientService = exports.PatientService = void 0;
const prisma_1 = require("../lib/prisma");
class PatientService {
    async getAllPatients(organizationId, search, page = 1, limit = 50) {
        const whereClause = { organizationId, deletedAt: null };
        if (search) {
            whereClause.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { phone: { contains: search, mode: 'insensitive' } },
            ];
        }
        const skip = (page - 1) * limit;
        const [data, total] = await Promise.all([
            prisma_1.prisma.patient.findMany({
                where: whereClause,
                skip,
                take: limit,
                orderBy: { updatedAt: 'desc' },
                include: {
                    visits: {
                        take: 1,
                        orderBy: { date: 'desc' }
                    }
                }
            }),
            prisma_1.prisma.patient.count({ where: whereClause })
        ]);
        return {
            data,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        };
    }
    async getPatientById(organizationId, id) {
        return prisma_1.prisma.patient.findFirst({
            where: { id, organizationId, deletedAt: null },
            include: {
                visits: {
                    orderBy: { date: 'desc' },
                    include: {
                        modernEMR: true,
                        ayurvedicEMR: true,
                        diagnosis: true,
                    }
                }
            }
        });
    }
    async createPatient(organizationId, data) {
        return prisma_1.prisma.patient.create({ data: { ...data, organizationId } });
    }
    async updatePatient(organizationId, id, data) {
        // Only update if it belongs to org
        return prisma_1.prisma.patient.updateMany({
            where: { id, organizationId },
            data
        }).then(() => this.getPatientById(organizationId, id));
    }
    // A method to ensure a patient has at least one visit to attach EMRs to. 
    // In a real app, visits are created when an appointment happens.
    async getOrCreateLatestVisit(organizationId, patientId) {
        const latestVisit = await prisma_1.prisma.visit.findFirst({
            where: { patientId, organizationId },
            orderBy: { date: 'desc' }
        });
        if (latestVisit)
            return latestVisit;
        // Create a default "Initial Consultation" visit if none exists
        return prisma_1.prisma.visit.create({
            data: {
                organizationId,
                patientId,
                doctor: 'Dr. Default',
                reason: 'Initial Consultation',
            }
        });
    }
    async updateModernEMR(organizationId, visitId, data) {
        const visit = await prisma_1.prisma.visit.findFirst({
            where: { id: visitId, organizationId },
        });
        if (!visit) {
            throw new Error("Visit not found or does not belong to this organization");
        }
        return prisma_1.prisma.modernEMR.upsert({
            where: { visitId },
            update: data,
            create: { ...data, visit: { connect: { id: visitId } } }
        });
    }
    async updateAyurvedicEMR(organizationId, visitId, data) {
        const visit = await prisma_1.prisma.visit.findFirst({
            where: { id: visitId, organizationId },
        });
        if (!visit) {
            throw new Error("Visit not found or does not belong to this organization");
        }
        return prisma_1.prisma.ayurvedicEMR.upsert({
            where: { visitId },
            update: data,
            create: { ...data, visit: { connect: { id: visitId } } }
        });
    }
    async updateDiagnosis(organizationId, visitId, data) {
        const visit = await prisma_1.prisma.visit.findFirst({
            where: { id: visitId, organizationId },
        });
        if (!visit) {
            throw new Error("Visit not found or does not belong to this organization");
        }
        return prisma_1.prisma.diagnosis.upsert({
            where: { visitId },
            update: data,
            create: { ...data, visit: { connect: { id: visitId } } }
        });
    }
    async getPatientHistoryPaginated(organizationId, patientId, page = 1, limit = 5) {
        const skip = (page - 1) * limit;
        const [data, total] = await Promise.all([
            prisma_1.prisma.visit.findMany({
                where: { patientId, organizationId },
                skip,
                take: limit,
                orderBy: { date: 'desc' },
                include: {
                    ayurvedicEMR: true,
                    diagnosis: true,
                    prescription: {
                        include: {
                            items: {
                                include: {
                                    inventory: true,
                                }
                            }
                        }
                    }
                }
            }),
            prisma_1.prisma.visit.count({ where: { patientId, organizationId } })
        ]);
        return {
            data,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        };
    }
}
exports.PatientService = PatientService;
exports.patientService = new PatientService();
