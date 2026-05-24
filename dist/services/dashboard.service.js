"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dashboardService = void 0;
const prisma_1 = require("../lib/prisma");
const date_fns_1 = require("date-fns");
class DashboardService {
    async getDashboardStats(organizationId) {
        const today = new Date();
        const start = (0, date_fns_1.startOfDay)(today);
        const end = (0, date_fns_1.endOfDay)(today);
        // Get today's appointments count
        const appointmentsToday = await prisma_1.prisma.visit.count({
            where: {
                organizationId,
                date: {
                    gte: start,
                    lte: end,
                },
            },
        });
        // Get total patients
        const totalPatients = await prisma_1.prisma.patient.count({ where: { organizationId } });
        // Get total prescriptions
        const totalPrescriptions = await prisma_1.prisma.prescription.count({ where: { organizationId } });
        // Get total revenue
        const invoices = await prisma_1.prisma.invoice.findMany({
            where: {
                organizationId,
                status: 'Paid',
                createdAt: {
                    gte: start,
                    lte: end,
                }
            },
            select: { totalAmount: true },
        });
        const revenueToday = invoices.reduce((sum, inv) => sum + inv.totalAmount, 0);
        // Get recent appointments for the waiting room (in consultation / waiting)
        const activeAppointments = await prisma_1.prisma.visit.findMany({
            where: {
                organizationId,
                date: {
                    gte: start,
                    lte: end,
                },
                status: {
                    in: ['Waiting', 'In Consultation']
                }
            },
            include: {
                patient: true
            },
            orderBy: {
                date: 'asc'
            },
            take: 10
        });
        return {
            appointmentsToday,
            totalPatients,
            totalPrescriptions,
            revenueToday,
            activeAppointments
        };
    }
}
exports.dashboardService = new DashboardService();
