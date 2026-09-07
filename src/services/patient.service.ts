import { prisma } from '../lib/prisma';
import { Prisma } from '@prisma/client';

export class PatientService {
  async getAllPatients(organizationId: string, search?: string) {
    const whereClause: Prisma.PatientWhereInput = { organizationId, deletedAt: null };
    if (search) {
      whereClause.OR = [
        { name: { contains: search, mode: 'insensitive' as Prisma.QueryMode } },
        { phone: { contains: search, mode: 'insensitive' as Prisma.QueryMode } },
      ];
    }

    return prisma.patient.findMany({
      where: whereClause,
      orderBy: { updatedAt: 'desc' },
      include: {
        visits: {
          take: 1,
          orderBy: { date: 'desc' }
        }
      }
    });
  }

  async getPatientById(organizationId: string, id: string) {
    return prisma.patient.findFirst({
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

  async createPatient(organizationId: string, data: any) {
    return prisma.patient.create({ data: { ...data, organizationId } });
  }

  async updatePatient(organizationId: string, id: string, data: Partial<Prisma.PatientUpdateInput>) {
    // Only update if it belongs to org
    return prisma.patient.updateMany({
      where: { id, organizationId },
      data
    }).then(() => this.getPatientById(organizationId, id));
  }

  // A method to ensure a patient has at least one visit to attach EMRs to. 
  // In a real app, visits are created when an appointment happens.
  async getOrCreateLatestVisit(organizationId: string, patientId: string) {
    const latestVisit = await prisma.visit.findFirst({
      where: { patientId, organizationId },
      orderBy: { date: 'desc' }
    });

    if (latestVisit) return latestVisit;

    // Create a default "Initial Consultation" visit if none exists
    return prisma.visit.create({
      data: {
        organizationId,
        patientId,
        doctor: 'Dr. Default',
        reason: 'Initial Consultation',
      }
    });
  }

  async updateModernEMR(organizationId: string, visitId: string, data: Omit<Prisma.ModernEMRCreateInput, 'visit'>) {
    const visit = await prisma.visit.findFirst({
      where: { id: visitId, organizationId },
    });
    
    if (!visit) {
      throw new Error("Visit not found or does not belong to this organization");
    }

    return prisma.modernEMR.upsert({
      where: { visitId },
      update: data,
      create: { ...data, visit: { connect: { id: visitId } } }
    });
  }

  async updateAyurvedicEMR(organizationId: string, visitId: string, data: Omit<Prisma.AyurvedicEMRCreateInput, 'visit'>) {
    const visit = await prisma.visit.findFirst({
      where: { id: visitId, organizationId },
    });
    
    if (!visit) {
      throw new Error("Visit not found or does not belong to this organization");
    }

    return prisma.ayurvedicEMR.upsert({
      where: { visitId },
      update: data,
      create: { ...data, visit: { connect: { id: visitId } } }
    });
  }

  async updateDiagnosis(organizationId: string, visitId: string, data: Omit<Prisma.DiagnosisCreateInput, 'visit'>) {
    const visit = await prisma.visit.findFirst({
      where: { id: visitId, organizationId },
    });
    
    if (!visit) {
      throw new Error("Visit not found or does not belong to this organization");
    }

    return prisma.diagnosis.upsert({
      where: { visitId },
      update: data,
      create: { ...data, visit: { connect: { id: visitId } } }
    });
  }
  async getPatientHistoryPaginated(organizationId: string, patientId: string, page: number = 1, limit: number = 5) {
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      prisma.visit.findMany({
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
      prisma.visit.count({ where: { patientId, organizationId } })
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

export const patientService = new PatientService();
