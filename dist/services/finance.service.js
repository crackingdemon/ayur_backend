"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.financeService = exports.FinanceService = void 0;
const prisma_1 = require("../lib/prisma");
class FinanceService {
    async addTransaction(organizationId, data) {
        return await prisma_1.prisma.financialTransaction.create({
            data: {
                organizationId,
                type: data.type,
                amount: data.amount,
                category: data.category,
                description: data.description,
            }
        });
    }
    async getAllTransactions(organizationId, page = 1, limit = 20) {
        const skip = (page - 1) * limit;
        const [data, total] = await Promise.all([
            prisma_1.prisma.financialTransaction.findMany({
                where: { organizationId },
                skip,
                take: limit,
                orderBy: { date: 'desc' },
            }),
            prisma_1.prisma.financialTransaction.count({ where: { organizationId } })
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
exports.FinanceService = FinanceService;
exports.financeService = new FinanceService();
