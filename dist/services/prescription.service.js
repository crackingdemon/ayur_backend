"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.prescriptionService = exports.PrescriptionService = void 0;
const prisma_1 = require("../lib/prisma");
class PrescriptionService {
    async savePrescription(organizationId, visitId, data) {
        // Verify the visit belongs to the correct organization to prevent IDOR
        const visit = await prisma_1.prisma.visit.findFirst({
            where: { id: visitId, organizationId },
        });
        if (!visit) {
            throw new Error("Visit not found or does not belong to this organization");
        }
        // We use an upsert to either create a new prescription or update an existing one for the visit
        const prescription = await prisma_1.prisma.prescription.upsert({
            where: { visitId }, // Unique constraint handles the match
            create: {
                patientId: visit.patientId,
                organizationId,
                visitId,
                pathya: data.pathya,
                apathya: data.apathya,
                vihara: data.vihara,
                notes: data.notes,
                followUpDate: data.followUpDate ? new Date(data.followUpDate) : null,
                items: {
                    create: data.items,
                }
            },
            update: {
                pathya: data.pathya,
                apathya: data.apathya,
                vihara: data.vihara,
                notes: data.notes,
                followUpDate: data.followUpDate ? new Date(data.followUpDate) : null,
                items: {
                    deleteMany: {}, // Delete all old items
                    create: data.items, // Recreate with new list
                }
            },
            include: {
                items: true,
            }
        });
        return prescription;
    }
    async getPrescription(organizationId, visitId) {
        return await prisma_1.prisma.prescription.findFirst({
            where: { visitId, organizationId },
            include: {
                items: {
                    include: {
                        inventory: true,
                    }
                }
            }
        });
    }
    async getAllPrescriptions(organizationId, page = 1, limit = 20, search = "") {
        const skip = (page - 1) * limit;
        const whereClause = { organizationId };
        if (search) {
            whereClause.visit = {
                patient: {
                    name: {
                        contains: search,
                        mode: 'insensitive'
                    }
                }
            };
        }
        const [data, total] = await Promise.all([
            prisma_1.prisma.prescription.findMany({
                where: whereClause,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: {
                    visit: {
                        include: {
                            patient: true
                        }
                    },
                    items: {
                        include: {
                            inventory: true
                        }
                    }
                }
            }),
            prisma_1.prisma.prescription.count({ where: whereClause })
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
    async dispensePrescription(organizationId, prescriptionId, userId, dispensedItems) {
        return await prisma_1.prisma.$transaction(async (tx) => {
            // 1. Get prescription with items and current inventory stock
            const prescription = await tx.prescription.findFirst({
                where: { id: prescriptionId, organizationId },
                include: {
                    items: {
                        include: { inventory: true }
                    }
                }
            });
            if (!prescription)
                throw new Error("Prescription not found");
            if (prescription.status === "Dispensed")
                throw new Error("Prescription is already dispensed");
            // 2. Process each item for atomic stock deduction
            for (const item of prescription.items) {
                const dispensedData = dispensedItems?.[item.id];
                const quantity = dispensedData?.quantity ?? (item.quantity || 0);
                // Deduct stock if it's an inventory item
                if (item.inventoryId && item.inventory) {
                    if (quantity > 0) {
                        // Phase 4: Atomic update to prevent race conditions
                        const updatedInv = await tx.inventory.updateMany({
                            where: {
                                id: item.inventoryId,
                                stockCount: { gte: quantity } // Ensure stock is sufficient atomically
                            },
                            data: { stockCount: { decrement: quantity } }
                        });
                        if (updatedInv.count === 0) {
                            throw new Error(`Insufficient stock for ${item.inventory.name} (Requested: ${quantity})`);
                        }
                        // Phase 4: Log InventoryTransaction
                        await tx.inventoryTransaction.create({
                            data: {
                                organizationId,
                                inventoryId: item.inventoryId,
                                userId: userId,
                                type: "SALE",
                                quantityChange: -quantity,
                                reason: `Dispensed for Prescription ${prescription.id}`
                            }
                        });
                    }
                }
                // Update PrescriptionItem with actually dispensed quantity
                if (quantity !== item.quantity) {
                    await tx.prescriptionItem.update({
                        where: { id: item.id },
                        data: { quantity }
                    });
                }
            }
            // 3. Update Prescription Status
            await tx.prescription.update({
                where: { id: prescription.id },
                data: { status: "Dispensed" }
            });
            return { success: true, message: "Prescription dispensed successfully" };
        });
    }
}
exports.PrescriptionService = PrescriptionService;
exports.prescriptionService = new PrescriptionService();
