import { prisma } from '../lib/prisma';
import { Prisma } from '@prisma/client';

export class PrescriptionService {
  async savePrescription(organizationId: string, visitId: string, data: {
    pathya?: string;
    apathya?: string;
    vihara?: string;
    notes?: string;
    followUpDate?: string;
    items: Array<{
      inventoryId?: string;
      customMedicineName?: string;
      dosage: string;
      frequency?: string;
      kala?: string;
      anupana?: string;
      duration: string;
      quantity?: number;
      instructions?: string;
    }>
  }) {
    // We use an upsert to either create a new prescription or update an existing one for the visit
    const prescription = await prisma.prescription.upsert({
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

  async getPrescription(organizationId: string, visitId: string) {
    return await prisma.prescription.findFirst({
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

  async getAllPrescriptions(organizationId: string, page: number = 1, limit: number = 20, search: string = "") {
    const skip = (page - 1) * limit;

    const whereClause: Prisma.PrescriptionWhereInput = { organizationId };
    
    if (search) {
      whereClause.visit = {
        patient: {
          name: {
            contains: search,
            mode: 'insensitive' as Prisma.QueryMode
          }
        }
      };
    }

    const [data, total] = await Promise.all([
      prisma.prescription.findMany({
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
      prisma.prescription.count({ where: whereClause })
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

  async dispenseAndBill(organizationId: string, prescriptionId: string, itemsBilling?: Record<string, { unitPrice: number, discount: number, quantity: number, total: number }>) {
    return await prisma.$transaction(async (tx) => {
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

      if (!prescription) throw new Error("Prescription not found");
      if (prescription.status === "Dispensed") throw new Error("Prescription is already dispensed");

      let subTotal = 0;
      let totalDiscount = 0;
      let grandTotal = 0;

      // 2. Process each item for stock deduction and price calculation
      for (const item of prescription.items) {
        const billingData = itemsBilling?.[item.id];
        if (!billingData) continue; // Skip if no billing data provided for this item

        const { unitPrice, discount, quantity, total } = billingData;

        // Deduct stock if it's an inventory item
        if (item.inventoryId && item.inventory) {
          if (quantity > 0) {
            await tx.inventory.update({
              where: { id: item.inventoryId },
              data: { stockCount: { decrement: quantity } }
            });
          }
        }

        // Update PrescriptionItem with pricing data and potentially new quantity
        await tx.prescriptionItem.update({
          where: { id: item.id },
          data: {
            quantity: quantity,
            unitPrice: unitPrice,
            discount: discount,
            totalPrice: total
          }
        });

        // Add to invoice totals
        subTotal += (unitPrice * quantity);
        totalDiscount += discount;
        grandTotal += total;
      }

      // 3. Create Invoice
      const invoice = await tx.invoice.create({
        data: {
          organizationId,
          patientId: prescription.visit.patientId,
          prescriptionId: prescription.id,
          subTotal,
          discount: totalDiscount,
          totalAmount: grandTotal,
          status: "Paid" // Auto-paid as requested by user
        }
      });

      // 4. Create Financial Transaction
      if (grandTotal > 0) {
        await tx.financialTransaction.create({
          data: {
            organizationId,
            type: "INCOME",
            amount: grandTotal,
            category: "Pharmacy Sales",
            description: `Dispensed Prescription ${prescription.id}`
          }
        });
      }

      // 5. Update Prescription Status
      await tx.prescription.updateMany({
        where: { id: prescription.id, organizationId },
        data: { status: "Dispensed" }
      });

      return invoice;
    });
  }
}

export const prescriptionService = new PrescriptionService();
