import { prisma } from '../lib/prisma';
import { Prisma } from '@prisma/client';

export class InventoryService {
  async searchInventory(organizationId: string, query: string) {
    if (!query) return [];
    
    return await prisma.inventory.findMany({
      where: {
        organizationId,
        name: {
          contains: query,
          mode: 'insensitive',
        }
      },
      take: 10,
    });
  }

  async getAll(organizationId: string, page: number = 1, limit: number = 20, search: string = "", filterStatus: string = "") {
    const skip = (page - 1) * limit;
    
    const where: Prisma.InventoryWhereInput = { organizationId };
    if (search) {
      where.name = { contains: search, mode: 'insensitive' };
    }
    if (filterStatus === 'low_stock') {
      where.stockCount = { lt: 20 };
    }

    const [data, total] = await Promise.all([
      prisma.inventory.findMany({
        where,
        skip,
        take: limit,
        orderBy: { name: 'asc' },
      }),
      prisma.inventory.count({ where })
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

  async create(organizationId: string, data: { name: string; type: string; stockCount?: number; unit?: string; price?: number }) {
    return await prisma.inventory.create({
      data: {
        organizationId,
        name: data.name,
        type: data.type,
        stockCount: data.stockCount || 0,
        unit: data.unit || 'units',
        price: data.price || 0,
      }
    });
  }

  async updateStock(organizationId: string, id: string, amount: number, userId: string, reason: string = "Manual Adjustment") {
    return await prisma.$transaction(async (tx) => {
      const updated = await tx.inventory.update({
        where: { id, organizationId },
        data: {
          stockCount: {
            increment: amount
          }
        }
      });

      await tx.inventoryTransaction.create({
        data: {
          organizationId,
          inventoryId: id,
          userId,
          type: amount > 0 ? "RESTOCK" : "ADJUSTMENT",
          quantityChange: amount,
          reason
        }
      });

      return updated;
    });
  }
}

export const inventoryService = new InventoryService();
