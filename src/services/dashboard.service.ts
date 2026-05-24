import { prisma } from '../lib/prisma';
import { startOfDay, endOfDay } from 'date-fns';

class DashboardService {
  async getDashboardStats(organizationId: string) {
    const today = new Date();
    const start = startOfDay(today);
    const end = endOfDay(today);

    // Get today's appointments count
    const appointmentsToday = await prisma.visit.count({
      where: {
        organizationId,
        date: {
          gte: start,
          lte: end,
        },
      },
    });

    // Get total patients
    const totalPatients = await prisma.patient.count({ where: { organizationId } });

    // Get total prescriptions
    const totalPrescriptions = await prisma.prescription.count({ where: { organizationId } });

    // Get total revenue
    const invoices = await prisma.invoice.findMany({
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
    const activeAppointments = await prisma.visit.findMany({
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

export const dashboardService = new DashboardService();
