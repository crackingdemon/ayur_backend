import { prisma } from '../lib/prisma';
import { z } from 'zod';

export const createTreatmentSchema = z.object({
  patientId: z.string(),
  visitId: z.string().optional(),
  facilityId: z.string().optional(),
  name: z.string().min(1, "Name is required"),
  startDate: z.string().optional(),
  totalDays: z.number().int().min(1).max(90),
  days: z.array(z.object({
    dayNumber: z.number().int(),
    notes: z.string().optional()
  })).optional()
});

export const updateDaySchema = z.object({
  status: z.enum(["Pending", "Completed", "Missed"]),
  notes: z.string().optional()
});

export const panchakarmaService = {
  async getTreatments(organizationId: string, filters?: { status?: string, patientId?: string, facilityId?: string }) {
    return prisma.panchakarmaTreatment.findMany({
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

  async getTreatmentById(id: string, organizationId: string) {
    return prisma.panchakarmaTreatment.findFirst({
      where: { id, organizationId },
      include: {
        patient: { select: { name: true, phone: true } },
        days: {
          orderBy: { dayNumber: 'asc' }
        }
      }
    });
  },

  async createTreatment(organizationId: string, data: z.infer<typeof createTreatmentSchema>) {
    // Generate default days if not provided
    const daysData = data.days && data.days.length > 0 
      ? data.days.map(d => ({ dayNumber: d.dayNumber, notes: d.notes || "" }))
      : Array.from({ length: data.totalDays }).map((_, i) => ({
          dayNumber: i + 1,
          notes: ""
        }));

    return prisma.panchakarmaTreatment.create({
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

  async updateDay(treatmentId: string, dayId: string, organizationId: string, data: z.infer<typeof updateDaySchema>) {
    // Verify ownership
    const treatment = await prisma.panchakarmaTreatment.findFirst({
      where: { id: treatmentId, organizationId }
    });

    if (!treatment) {
      throw new Error("Treatment not found");
    }

    return prisma.panchakarmaDay.update({
      where: { id: dayId },
      data: {
        status: data.status,
        ...(data.notes !== undefined ? { notes: data.notes } : {})
      }
    });
  },

  async completeTreatment(id: string, organizationId: string) {
    return prisma.panchakarmaTreatment.updateMany({
      where: { id, organizationId },
      data: { status: 'Completed' }
    });
  }
};
