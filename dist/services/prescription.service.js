"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.prescriptionService = exports.PrescriptionService = void 0;
const prisma_1 = require("../lib/prisma");
class PrescriptionService {
    async savePrescription(organizationId, visitId, data) {
        // We use an upsert to either create a new prescription or update an existing one for the visit
        const prescription = await prisma_1.prisma.prescription.upsert({
            where: { visitId }, // Assuming visitId is strictly 1-to-1 with organizationId checked prior. But better to just let Prisma do it and check ownership if needed. Since Prisma upsert requires unique constraint on visitId. We can just add organizationId to create/update.
            create: {
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
    async dispenseAndBill(organizationId, prescriptionId, customPrices) {
        return await prisma_1.prisma.$transaction(async (tx) => {
            // 1. Get prescription with items and current inventory stock
            const prescription = await tx.prescription.findFirst({
                where: { id: prescriptionId, organizationId },
                include: {
                    visit: true,
                    items: {
                        include: { inventory: true }
                    }
                }
            });
            if (!prescription)
                throw new Error("Prescription not found");
            if (prescription.status === "Dispensed")
                throw new Error("Prescription is already dispensed");
            let totalAmount = 0;
            // 2. Process each item for stock deduction and price calculation
            for (const item of prescription.items) {
                if (item.inventoryId && item.inventory) {
                    if (item.quantity) {
                        // Deduct stock
                        await tx.inventory.update({
                            where: { id: item.inventoryId },
                            data: { stockCount: { decrement: item.quantity } }
                        });
                        // Calculate price from inventory (assuming price is per unit)
                        totalAmount += (item.inventory.price * item.quantity);
                    }
                }
                else {
                    // Custom item or no inventory found
                    // Use price from customPrices payload if provided
                    if (customPrices && customPrices[item.id]) {
                        totalAmount += customPrices[item.id];
                    }
                }
            }
            // 3. Create Invoice
            const invoice = await tx.invoice.create({
                data: {
                    organizationId,
                    patientId: prescription.visit.patientId,
                    prescriptionId: prescription.id,
                    totalAmount,
                    status: "Paid" // Auto-paid as requested by user
                }
            });
            // 4. Create Financial Transaction
            await tx.financialTransaction.create({
                data: {
                    organizationId,
                    type: "INCOME",
                    amount: totalAmount,
                    category: "Pharmacy Sales",
                    description: `Dispensed Prescription ${prescription.id}`
                }
            });
            // 5. Update Prescription Status
            await tx.prescription.updateMany({
                where: { id: prescription.id, organizationId },
                data: { status: "Dispensed" }
            });
            return invoice;
        });
    }
}
exports.PrescriptionService = PrescriptionService;
exports.prescriptionService = new PrescriptionService();
