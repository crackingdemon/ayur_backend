import { Request, Response } from 'express';
import { patientService } from '../services/patient.service';

export class PatientController {
  async getAll(req: Request, res: Response) {
    try {
      const patients = await patientService.getAllPatients();
      res.json(patients);
    } catch (error) {
      console.error('Error fetching patients:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  async getById(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      const patient = await patientService.getPatientById(id);
      
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
      const patient = await patientService.createPatient(req.body);
      // Automatically create an initial visit for the new patient
      await patientService.getOrCreateLatestVisit(patient.id);
      res.status(201).json(patient);
    } catch (error) {
      console.error('Error creating patient:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  async updateModernEMR(req: Request, res: Response) {
    try {
      const patientId = req.params.id as string;
      const visit = await patientService.getOrCreateLatestVisit(patientId);
      const emr = await patientService.updateModernEMR(visit.id, req.body);
      res.json(emr);
    } catch (error) {
      console.error('Error updating Modern EMR:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  async updateAyurvedicEMR(req: Request, res: Response) {
    try {
      const patientId = req.params.id as string;
      const visit = await patientService.getOrCreateLatestVisit(patientId);
      const emr = await patientService.updateAyurvedicEMR(visit.id, req.body);
      res.json(emr);
    } catch (error) {
      console.error('Error updating Ayurvedic EMR:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  async updateDiagnosis(req: Request, res: Response) {
    try {
      const patientId = req.params.id as string;
      const visit = await patientService.getOrCreateLatestVisit(patientId);
      const diagnosis = await patientService.updateDiagnosis(visit.id, req.body);
      res.json(diagnosis);
    } catch (error) {
      console.error('Error updating Diagnosis:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }
}

export const patientController = new PatientController();
