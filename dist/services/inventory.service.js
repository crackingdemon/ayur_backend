"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.inventoryService = exports.InventoryService = void 0;
const prisma_1 = require("../lib/prisma");
class InventoryService {
    async searchInventory(organizationId, query) {
        if (!query)
            return [];
        return await prisma_1.prisma.inventory.findMany({
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
    async getAll(organizationId, page = 1, limit = 20, search = "", filterStatus = "") {
        const skip = (page - 1) * limit;
        const where = { organizationId };
        if (search) {
            where.name = { contains: search, mode: 'insensitive' };
        }
        if (filterStatus === 'low_stock') {
            where.stockCount = { lt: 20 };
        }
        const [data, total] = await Promise.all([
            prisma_1.prisma.inventory.findMany({
                where,
                skip,
                take: limit,
                orderBy: { name: 'asc' },
            }),
            prisma_1.prisma.inventory.count({ where })
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
    async create(organizationId, data) {
        return await prisma_1.prisma.inventory.create({
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
    async updateStock(organizationId, id, amount) {
        return await prisma_1.prisma.inventory.updateMany({
            where: { id, organizationId },
            data: {
                stockCount: {
                    increment: amount
                }
            }
        });
    }
}
exports.InventoryService = InventoryService;
exports.inventoryService = new InventoryService();
