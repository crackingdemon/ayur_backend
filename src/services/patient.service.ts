import { prisma } from '../lib/prisma';
import { Prisma } from '@prisma/client';

export class PatientService {
  async getAllPatients() {
    return prisma.patient.findMany({
      orderBy: { updatedAt: 'desc' },
      include: {
        visits: {
          take: 1,
          orderBy: { date: 'desc' }
        }
      }
    });
  }

  async getPatientById(id: string) {
    return prisma.patient.findUnique({
      where: { id },
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

  async createPatient(data: Prisma.PatientCreateInput) {
    return prisma.patient.create({ data });
  }

  // A method to ensure a patient has at least one visit to attach EMRs to. 
  // In a real app, visits are created when an appointment happens.
  async getOrCreateLatestVisit(patientId: string) {
    const latestVisit = await prisma.visit.findFirst({
      where: { patientId },
      orderBy: { date: 'desc' }
    });

    if (latestVisit) return latestVisit;

    // Create a default "Initial Consultation" visit if none exists
    return prisma.visit.create({
      data: {
        patientId,
        doctor: 'Dr. Default',
        reason: 'Initial Consultation',
      }
    });
  }

  async updateModernEMR(visitId: string, data: Omit<Prisma.ModernEMRCreateInput, 'visit'>) {
    return prisma.modernEMR.upsert({
      where: { visitId },
      update: data,
      create: { ...data, visit: { connect: { id: visitId } } }
    });
  }

  async updateAyurvedicEMR(visitId: string, data: Omit<Prisma.AyurvedicEMRCreateInput, 'visit'>) {
    return prisma.ayurvedicEMR.upsert({
      where: { visitId },
      update: data,
      create: { ...data, visit: { connect: { id: visitId } } }
    });
  }

  async updateDiagnosis(visitId: string, data: Omit<Prisma.DiagnosisCreateInput, 'visit'>) {
    return prisma.diagnosis.upsert({
      where: { visitId },
      update: data,
      create: { ...data, visit: { connect: { id: visitId } } }
    });
  }
}

export const patientService = new PatientService();
