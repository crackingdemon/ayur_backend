import { Request, Response } from 'express';
import { inventoryService } from '../services/inventory.service';
import { z } from 'zod';

const createInventorySchema = z.object({
  name: z.string().min(1),
  type: z.string().min(1),
  stockCount: z.number().optional(),
  unit: z.string().optional(),
  price: z.number().optional(),
});

export class InventoryController {
  async search(req: Request, res: Response) {
    try {
      const orgId = req.user!.organizationId;
      const q = req.query.q as string;
      const results = await inventoryService.searchInventory(orgId, q);
      res.json(results);
    } catch (error) {
      console.error('Error searching inventory:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  async getAll(req: Request, res: Response) {
    try {
      const orgId = req.user!.organizationId;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const search = (req.query.search as string) || "";
      const status = (req.query.status as string) || "";
      
      const result = await inventoryService.getAll(orgId, page, limit, search, status);
      res.json(result);
    } catch (error) {
      console.error('Error getting inventory:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  async create(req: Request, res: Response) {
    try {
      const orgId = req.user!.organizationId;
      const validatedData = createInventorySchema.parse(req.body);
      const item = await inventoryService.create(orgId, validatedData);
      res.status(201).json(item);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.issues[0].message });
      }
      console.error('Error creating inventory item:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }
}

export const inventoryController = new InventoryController();
