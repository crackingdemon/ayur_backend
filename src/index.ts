import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { prisma } from './lib/prisma';
import { patientRoutes } from './routes/patient.routes';
import { appointmentRoutes } from './routes/appointment.routes';
import { inventoryRoutes } from './routes/inventory.routes';
import { prescriptionRoutes } from './routes/prescription.routes';
import { financeRoutes } from './routes/finance.routes';
import { dashboardRoutes } from './routes/dashboard.routes';
import { billingRoutes } from './routes/billing.routes';
import facilityRoutes from './routes/facility.routes';
import { userRoutes } from './routes/user.routes';
import { panchakarmaRoutes } from './routes/panchakarma.routes';

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

const allowedOrigins = process.env.ALLOWED_ORIGINS 
  ? process.env.ALLOWED_ORIGINS.split(',') 
  : ['http://localhost:3000']; // default for local dev

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  }
}));
app.use(express.json());

app.get('/api/health', async (req: Request, res: Response) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: 'ok', database: 'connected' });
  } catch (error) {
    console.error('Database connection error:', error);
    res.status(500).json({ status: 'error', database: 'disconnected' });
  }
});

import authRoutes from './routes/auth.routes';
import { requireAuth } from './middlewares/auth.middleware';

app.use('/api/auth', authRoutes);

app.use('/api/patients', requireAuth, patientRoutes);
app.use('/api/appointments', requireAuth, appointmentRoutes);
app.use('/api/inventory', requireAuth, inventoryRoutes);
app.use('/api/prescriptions', requireAuth, prescriptionRoutes);
app.use('/api/finance', requireAuth, financeRoutes);
app.use('/api/dashboard', requireAuth, dashboardRoutes);
app.use('/api/billing', requireAuth, billingRoutes);
app.use('/api/facilities', requireAuth, facilityRoutes);
app.use('/api/users', requireAuth, userRoutes);
app.use('/api/panchakarma', requireAuth, panchakarmaRoutes);

// Database connection check
app.get('/api/health', async (req: Request, res: Response) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: 'ok', database: 'connected' });
  } catch (error) {
    console.error('Database connection error:', error);
    res.status(500).json({ status: 'error', database: 'disconnected' });
  }
});

app.listen(port as number, '0.0.0.0', () => {
  console.log(`Server is running on port ${port}`);
});
