import { Request, Response } from 'express';
import { patientService } from '../services/patient.service';

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
      const patient = await patientService.createPatient(orgId, req.body);
      // Automatically create an initial visit for the new patient
      await patientService.getOrCreateLatestVisit(orgId, patient.id);
      res.status(201).json(patient);
    } catch (error) {
      console.error('Error creating patient:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  async updatePatient(req: Request, res: Response) {
    try {
      const orgId = req.user!.organizationId;
      const id = req.params.id as string;
      const patient = await patientService.updatePatient(orgId, id, req.body);
      res.json(patient);
    } catch (error) {
      console.error('Error updating patient:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  async updateModernEMR(req: Request, res: Response) {
    try {
      const visitId = req.params.visitId as string;
      const emr = await patientService.updateModernEMR(visitId, req.body);
      res.json(emr);
    } catch (error) {
      console.error('Error updating Modern EMR:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  async updateAyurvedicEMR(req: Request, res: Response) {
    try {
      const visitId = req.params.visitId as string;
      const emr = await patientService.updateAyurvedicEMR(visitId, req.body);
      res.json(emr);
    } catch (error) {
      console.error('Error updating Ayurvedic EMR:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  async updateDiagnosis(req: Request, res: Response) {
    try {
      const visitId = req.params.visitId as string;
      const diagnosis = await patientService.updateDiagnosis(visitId, req.body);
      res.status(200).json(diagnosis);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
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
