import { Request, Response } from 'express';
import { dashboardService } from '../services/dashboard.service';

export class DashboardController {
  async getStats(req: Request, res: Response) {
    try {
      const orgId = req.user!.organizationId;
      const stats = await dashboardService.getDashboardStats(orgId);
      res.json(stats);
    } catch (error: any) {
      console.error('Error fetching dashboard stats:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }
}

export const dashboardController = new DashboardController();
