import { Request, Response } from 'express';
import { patientService } from '../services/patient.service';
import { z } from 'zod';

const patientSchema = z.object({
  name: z.string().min(1, "Name is required"),
  age: z.number().positive("Age must be a positive number"),
  gender: z.string().min(1, "Gender is required"),
  phone: z.string().min(1, "Phone is required"),
  bloodGroup: z.string().optional(),
  allergies: z.string().optional(),
  pastHistory: z.string().optional(),
  drugHistory: z.string().optional(),
  personalHistory: z.string().optional(),
  familyHistory: z.string().optional(),
});

const patientUpdateSchema = patientSchema.partial();

const modernEMRSchema = z.object({
  chiefComplaints: z.string().optional(),
  hpi: z.string().optional(),
  pulse: z.string().optional(),
  bp: z.string().optional(),
  temp: z.string().optional(),
  systemicExam: z.string().optional(),
  investigations: z.string().optional(),
});

const ayurvedicEMRSchema = z.object({
  prakruti: z.string().optional(),
  vikruti: z.string().optional(),
  sara: z.string().optional(),
  samhanana: z.string().optional(),
  pramana: z.string().optional(),
  satmya: z.string().optional(),
  satva: z.string().optional(),
  aharaShakti: z.string().optional(),
  vyayamaShakti: z.string().optional(),
  vaya: z.string().optional(),
  nadi: z.string().optional(),
  mootra: z.string().optional(),
  mala: z.string().optional(),
  jihva: z.string().optional(),
  shabda: z.string().optional(),
  sparsha: z.string().optional(),
  drik: z.string().optional(),
  aakruti: z.string().optional(),
  vata: z.number().optional(),
  pitta: z.number().optional(),
  kapha: z.number().optional(),
  affectedDhatu: z.string().optional(),
  srotodushtiType: z.string().optional(),
  agni: z.string().optional(),
  ama: z.string().optional(),
  kostha: z.string().optional(),
  nidana: z.string().optional(),
});

const diagnosisSchema = z.object({
  provisional: z.string().optional(),
  differential: z.string().optional(),
  ayurvedicDiagnosis: z.string().optional(),
  samprapti: z.string().optional(),
  chikitsa: z.string().optional(),
});

export class PatientController {
  async getAll(req: Request, res: Response) {
    try {
      const orgId = req.user!.organizationId;
      const search = req.query.search as string;
      const patients = await patientService.getAllPatients(orgId, search);
      res.json(patients);
    } catch (error) {
      console.error('Error fetching patients:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  async getById(req: Request, res: Response) {
    try {
      const orgId = req.user!.organizationId;
      const id = req.params.id as string;
      const patient = await patientService.getPatientById(orgId, id);
      
      if (!patient) {
        return res.status(404).json({ error: 'Patient not found' });
      }
      
      res.json(patient);
    } catch (error) {
      console.error('Error fetching patient:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  async create(req: Request, res: Response) {
    try {
      const orgId = req.user!.organizationId;
      const validatedData = patientSchema.parse(req.body);
      const patient = await patientService.createPatient(orgId, validatedData);
      res.status(201).json(patient);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.issues[0].message });
      }
      console.error('Error creating patient:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  async updatePatient(req: Request, res: Response) {
    try {
      const orgId = req.user!.organizationId;
      const id = req.params.id as string;
      const validatedData = patientUpdateSchema.parse(req.body);
      const patient = await patientService.updatePatient(orgId, id, validatedData);
      res.json(patient);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.issues[0].message });
      }
      console.error('Error updating patient:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  async updateModernEMR(req: Request, res: Response) {
    try {
      const orgId = req.user!.organizationId;
      const visitId = req.params.visitId as string;
      const validatedData = modernEMRSchema.parse(req.body);
      const emr = await patientService.updateModernEMR(orgId, visitId, validatedData);
      res.json(emr);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.issues[0].message });
      }
      console.error('Error updating Modern EMR:', error);
      res.status(error.message?.includes('not found') ? 404 : 500).json({ error: error.message || 'Internal Server Error' });
    }
  }

  async updateAyurvedicEMR(req: Request, res: Response) {
    try {
      const orgId = req.user!.organizationId;
      const visitId = req.params.visitId as string;
      const validatedData = ayurvedicEMRSchema.parse(req.body);
      const emr = await patientService.updateAyurvedicEMR(orgId, visitId, validatedData);
      res.json(emr);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.issues[0].message });
      }
      console.error('Error updating Ayurvedic EMR:', error);
      res.status(error.message?.includes('not found') ? 404 : 500).json({ error: error.message || 'Internal Server Error' });
    }
  }

  async updateDiagnosis(req: Request, res: Response) {
    try {
      const orgId = req.user!.organizationId;
      const visitId = req.params.visitId as string;
      const validatedData = diagnosisSchema.parse(req.body);
      const diagnosis = await patientService.updateDiagnosis(orgId, visitId, validatedData);
      res.status(200).json(diagnosis);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.issues[0].message });
      }
      console.error(error);
      res.status(error.message?.includes('not found') ? 404 : 500).json({ error: error.message || 'Internal Server Error' });
    }
  }

  async getHistory(req: Request, res: Response) {
    try {
      const orgId = req.user!.organizationId;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 5;
      
      const result = await patientService.getPatientHistoryPaginated(orgId, req.params.id as string, page, limit);
      res.json(result);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }
}

export const patientController = new PatientController();
