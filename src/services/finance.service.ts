import { prisma } from '../lib/prisma';
import { Prisma } from '@prisma/client';

export class FinanceService {
  async addTransaction(organizationId: string, data: {
    type: string;
    amount: number;
    category: string;
    description?: string;
  }) {
    return await prisma.financialTransaction.create({
      data: {
        organizationId,
        type: data.type,
        amount: data.amount,
        category: data.category,
        description: data.description,
      }
    });
  }

  async getAllTransactions(organizationId: string, page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;
    
    const [data, total] = await Promise.all([
      prisma.financialTransaction.findMany({
        where: { organizationId },
        skip,
        take: limit,
        orderBy: { date: 'desc' },
      }),
      prisma.financialTransaction.count({ where: { organizationId } })
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

export const financeService = new FinanceService();
