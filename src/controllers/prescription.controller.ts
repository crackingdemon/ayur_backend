import { Request, Response } from 'express';
import { prescriptionService } from '../services/prescription.service';
import { z } from 'zod';

const prescriptionItemSchema = z.object({
  inventoryId: z.string().optional(),
  customMedicineName: z.string().optional(),
  dosage: z.string().min(1),
  frequency: z.string().optional(),
  kala: z.string().optional(),
  anupana: z.string().optional(),
  duration: z.string().min(1),
  instructions: z.string().optional(),
});

const savePrescriptionSchema = z.object({
  pathya: z.string().optional(),
  apathya: z.string().optional(),
  vihara: z.string().optional(),
  notes: z.string().optional(),
  followUpDate: z.string().optional(),
  items: z.array(prescriptionItemSchema),
});

export class PrescriptionController {
  async save(req: Request, res: Response) {
    try {
      const orgId = req.user!.organizationId;
      const visitId = req.params.visitId as string;
      const validatedData = savePrescriptionSchema.parse(req.body);
      
      const prescription = await prescriptionService.savePrescription(orgId, visitId, validatedData);
      res.status(200).json(prescription);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.issues[0].message });
      }
      console.error('Error saving prescription:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  async get(req: Request, res: Response) {
    try {
      const orgId = req.user!.organizationId;
      const visitId = req.params.visitId as string;
      const prescription = await prescriptionService.getPrescription(orgId, visitId);
      
      if (!prescription) {
        return res.status(404).json({ error: 'Prescription not found' });
      }
      
      res.json(prescription);
    } catch (error) {
      console.error('Error fetching prescription:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  async getAll(req: Request, res: Response) {
    try {
      const orgId = req.user!.organizationId;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const search = (req.query.search as string) || "";
      
      const result = await prescriptionService.getAllPrescriptions(orgId, page, limit, search);
      res.json(result);
    } catch (error) {
      console.error('Error fetching all prescriptions:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  async dispense(req: Request, res: Response) {
    try {
      const orgId = req.user!.organizationId;
      const userId = req.user!.userId; // extracted from auth token
      const { id } = req.params;
      const { dispensedItems } = req.body;
      
      const result = await prescriptionService.dispensePrescription(orgId, id as string, userId, dispensedItems);
      res.json(result);
    } catch (error: any) {
      console.error('Error dispensing prescription:', error);
      res.status(400).json({ error: error.message || 'Error dispensing prescription' });
    }
  }
}

export const prescriptionController = new PrescriptionController();
