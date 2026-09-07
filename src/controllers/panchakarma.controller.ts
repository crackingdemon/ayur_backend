import { Request, Response } from 'express';
import { panchakarmaService, createTreatmentSchema, updateDaySchema } from '../services/panchakarma.service';
import { z } from 'zod';

export class PanchakarmaController {
  async getTreatments(req: Request, res: Response) {
    try {
      const organizationId = req.user?.organizationId;
      if (!organizationId) return res.status(401).json({ error: 'Unauthorized' });

      const filters = {
        status: req.query.status as string,
        patientId: req.query.patientId as string,
        facilityId: req.query.facilityId as string
      };

      const treatments = await panchakarmaService.getTreatments(organizationId, filters);
      res.json(treatments);
    } catch (error) {
      console.error('Error fetching panchakarma treatments:', error);
      res.status(500).json({ error: 'Failed to fetch treatments' });
    }
  }

  async getTreatmentById(req: Request, res: Response) {
    try {
      const organizationId = req.user?.organizationId;
      if (!organizationId) return res.status(401).json({ error: 'Unauthorized' });

      const id = req.params.id as string;
      const treatment = await panchakarmaService.getTreatmentById(id, organizationId);
      
      if (!treatment) {
        return res.status(404).json({ error: 'Treatment not found' });
      }

      res.json(treatment);
    } catch (error) {
      console.error('Error fetching panchakarma treatment:', error);
      res.status(500).json({ error: 'Failed to fetch treatment' });
    }
  }

  async createTreatment(req: Request, res: Response) {
    try {
      const organizationId = req.user?.organizationId;
      if (!organizationId) return res.status(401).json({ error: 'Unauthorized' });

      const validatedData = createTreatmentSchema.parse(req.body);
      const treatment = await panchakarmaService.createTreatment(organizationId, validatedData);
      
      res.status(201).json(treatment);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.issues[0].message });
      }
      console.error('Error creating panchakarma treatment:', error);
      res.status(500).json({ error: 'Failed to create treatment' });
    }
  }

  async updateDay(req: Request, res: Response) {
    try {
      const organizationId = req.user?.organizationId;
      if (!organizationId) return res.status(401).json({ error: 'Unauthorized' });

      const id = req.params.id as string;
      const dayId = req.params.dayId as string;
      const validatedData = updateDaySchema.parse(req.body);

      const day = await panchakarmaService.updateDay(id, dayId, organizationId, validatedData);
      res.json(day);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.issues[0].message });
      }
      console.error('Error updating panchakarma day:', error);
      res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to update day' });
    }
  }

  async completeTreatment(req: Request, res: Response) {
    try {
      const organizationId = req.user?.organizationId;
      if (!organizationId) return res.status(401).json({ error: 'Unauthorized' });

      const id = req.params.id as string;
      await panchakarmaService.completeTreatment(id, organizationId);
      
      res.json({ success: true });
    } catch (error) {
      console.error('Error completing panchakarma treatment:', error);
      res.status(500).json({ error: 'Failed to complete treatment' });
    }
  }
}
