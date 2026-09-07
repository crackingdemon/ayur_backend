"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.facilityService = exports.FacilityService = void 0;
const prisma_1 = require("../lib/prisma");
class FacilityService {
    async createFacility(organizationId, data) {
        return prisma_1.prisma.facility.create({
            data: {
                organizationId,
                name: data.name,
                type: data.type || 'CLINIC',
                address: data.address,
                phone: data.phone
            }
        });
    }
    async getFacilities(organizationId) {
        return prisma_1.prisma.facility.findMany({
            where: { organizationId },
            orderBy: { createdAt: 'asc' }
        });
    }
    async getUserFacilities(userId) {
        const access = await prisma_1.prisma.userFacilityAccess.findMany({
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
    async assignUserToFacility(userId, facilityId, isPrimary = false) {
        if (isPrimary) {
            // Unset primary from all others
            await prisma_1.prisma.userFacilityAccess.updateMany({
                where: { userId, isPrimary: true },
                data: { isPrimary: false }
            });
        }
        return prisma_1.prisma.userFacilityAccess.upsert({
            where: { userId_facilityId: { userId, facilityId } },
            create: { userId, facilityId, isPrimary },
            update: { isPrimary }
        });
    }
}
exports.FacilityService = FacilityService;
exports.facilityService = new FacilityService();
