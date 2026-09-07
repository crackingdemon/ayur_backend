import { Request, Response } from 'express';
import { facilityService } from '../services/facility.service';
import { z } from 'zod';

const createFacilitySchema = z.object({
  name: z.string().min(1),
  type: z.string().optional(),
  address: z.string().optional(),
  phone: z.string().optional()
});

export class FacilityController {
  async createFacility(req: Request, res: Response) {
    try {
      const orgId = req.user!.organizationId;
      const validatedData = createFacilitySchema.parse(req.body);
      
      const facility = await facilityService.createFacility(orgId, validatedData);
      
      // Auto-assign the creator to this facility as primary if it's their first
      await facilityService.assignUserToFacility(req.user!.userId, facility.id, true);
      
      res.status(201).json(facility);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.issues[0].message });
      }
      console.error('Error creating facility:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  async getFacilities(req: Request, res: Response) {
    try {
      const orgId = req.user!.organizationId;
      const facilities = await facilityService.getFacilities(orgId);
      res.json(facilities);
    } catch (error) {
      console.error('Error fetching facilities:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  async getUserFacilities(req: Request, res: Response) {
    try {
      const userId = req.user!.userId;
      const facilities = await facilityService.getUserFacilities(userId);
      res.json(facilities);
    } catch (error) {
      console.error('Error fetching user facilities:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  async switchFacility(req: Request, res: Response) {
    try {
      const userId = req.user!.userId;
      const { facilityId } = req.body;
      
      if (!facilityId) return res.status(400).json({ error: 'facilityId required' });
      
      await facilityService.assignUserToFacility(userId, facilityId, true);
      res.json({ success: true });
    } catch (error) {
      console.error('Error switching facility:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }
}

export const facilityController = new FacilityController();
