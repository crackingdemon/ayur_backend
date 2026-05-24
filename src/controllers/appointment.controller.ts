import { Request, Response } from 'express';
import { appointmentService } from '../services/appointment.service';
import { z } from 'zod';

const bookAppointmentSchema = z.object({
  isNewPatient: z.boolean(),
  patientId: z.string().optional(),
  name: z.string().min(1, "Name is required"),
  age: z.number().optional(),
  gender: z.string().optional(),
  phone: z.string().min(1, "Phone is required"),
  date: z.string(),
  time: z.string(),
  duration: z.number(),
  reason: z.string().min(1, "Reason is required"),
  source: z.string(),
});

export class AppointmentController {
  async book(req: Request, res: Response) {
    try {
      const validatedData = bookAppointmentSchema.parse(req.body);
      
      if (validatedData.isNewPatient && (!validatedData.age || !validatedData.gender)) {
         return res.status(400).json({ error: "Age and Gender are required for new patients" });
      }

      const orgId = req.user!.organizationId;
      const visit = await appointmentService.bookAppointment(orgId, validatedData as any);
      res.status(201).json(visit);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.issues[0].message });
      }
      console.error('Error booking appointment:', error);
      res.status(500).json({ error: error instanceof Error ? error.message : 'Internal Server Error' });
    }
  }

  async getToday(req: Request, res: Response) {
    try {
      const orgId = req.user!.organizationId;
      const dateString = req.query.date as string | undefined;
      const appointments = await appointmentService.getAppointmentsToday(orgId, dateString);
      res.json(appointments);
    } catch (error) {
      console.error('Error fetching today appointments:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  async getAllPaginated(req: Request, res: Response) {
    try {
      const orgId = req.user!.organizationId;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      
      const result = await appointmentService.getAppointmentsPaginated(orgId, page, limit);
      res.json(result);
    } catch (error) {
      console.error('Error fetching paginated appointments:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  async updateStatus(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      const status = req.body.status as string;
      
      const validStatuses = ['Scheduled', 'Waiting', 'In Consultation', 'Completed', 'Cancelled'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ error: "Invalid status" });
      }

      const orgId = req.user!.organizationId;
      const updated = await appointmentService.updateStatus(orgId, id, status);
      res.json(updated);
    } catch (error) {
      console.error('Error updating status:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }
}

export const appointmentController = new AppointmentController();
