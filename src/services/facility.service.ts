import { prisma } from '../lib/prisma';
import { Prisma } from '@prisma/client';

export class FacilityService {
  async createFacility(organizationId: string, data: { name: string; type?: string; address?: string; phone?: string }) {
    return prisma.facility.create({
      data: {
        organizationId,
        name: data.name,
        type: data.type || 'CLINIC',
        address: data.address,
        phone: data.phone
      }
    });
  }

  async getFacilities(organizationId: string) {
    return prisma.facility.findMany({
      where: { organizationId },
      orderBy: { createdAt: 'asc' }
    });
  }

  async getUserFacilities(userId: string) {
    const access = await prisma.userFacilityAccess.findMany({
      where: { userId },
      include: {
        facility: true
      }
    });
    return access.map(a => ({
      ...a.facility,
      isPrimary: a.isPrimary
    }));
  }

  async assignUserToFacility(userId: string, facilityId: string, isPrimary: boolean = false) {
    if (isPrimary) {
      // Unset primary from all others
      await prisma.userFacilityAccess.updateMany({
        where: { userId, isPrimary: true },
        data: { isPrimary: false }
      });
    }

    return prisma.userFacilityAccess.upsert({
      where: { userId_facilityId: { userId, facilityId } },
      create: { userId, facilityId, isPrimary },
      update: { isPrimary }
    });
  }
}

export const facilityService = new FacilityService();
