import { Request, Response } from 'express';
import { financeService } from '../services/finance.service';
import { z } from 'zod';

const createTransactionSchema = z.object({
  type: z.enum(["INCOME", "EXPENSE"]),
  amount: z.number().positive(),
  category: z.string().min(1),
  description: z.string().optional(),
});

export class FinanceController {
  async create(req: Request, res: Response) {
    try {
      const orgId = req.user!.organizationId;
      const validatedData = createTransactionSchema.parse(req.body);
      const transaction = await financeService.addTransaction(orgId, validatedData);
      res.status(201).json(transaction);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.issues[0].message });
      }
      console.error('Error creating transaction:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  async getAll(req: Request, res: Response) {
    try {
      const orgId = req.user!.organizationId;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      
      const result = await financeService.getAllTransactions(orgId, page, limit);
      res.json(result);
    } catch (error) {
      console.error('Error getting transactions:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }
}

export const financeController = new FinanceController();
