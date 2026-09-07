import { Request, Response } from 'express';
import { billingService } from '../services/billing.service';
import { z } from 'zod';

const invoiceItemSchema = z.object({
  description: z.string().min(1),
  quantity: z.number().min(1),
  unitPrice: z.number().min(0),
  discount: z.number().min(0),
  totalPrice: z.number().min(0),
});

const createInvoiceSchema = z.object({
  prescriptionId: z.string().optional(),
  items: z.array(invoiceItemSchema).min(1),
  subTotal: z.number().min(0),
  discount: z.number().min(0),
  totalAmount: z.number().min(0),
});

export class BillingController {
  async getPendingBills(req: Request, res: Response) {
    try {
      const orgId = req.user!.organizationId;
      const patientId = req.params.patientId as string;
      
      const bills = await billingService.getPatientPendingBills(orgId, patientId);
      res.json(bills);
    } catch (error) {
      console.error('Error fetching pending bills:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  async createInvoice(req: Request, res: Response) {
    try {
      const orgId = req.user!.organizationId;
      const patientId = req.params.patientId as string;
      const validatedData = createInvoiceSchema.parse(req.body);
      
      const invoice = await billingService.createInvoice(orgId, patientId, validatedData);
      res.status(201).json(invoice);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.issues[0].message });
      }
      console.error('Error creating invoice:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  async processPayment(req: Request, res: Response) {
    try {
      const orgId = req.user!.organizationId;
      const invoiceId = req.params.invoiceId as string;
      const { paymentMethod } = req.body;
      
      if (!paymentMethod) {
        return res.status(400).json({ error: 'Payment method is required' });
      }

      const invoice = await billingService.processPayment(orgId, invoiceId, paymentMethod);
      res.json(invoice);
    } catch (error: any) {
      console.error('Error processing payment:', error);
      res.status(400).json({ error: error.message || 'Error processing payment' });
    }
  }
}

export const billingController = new BillingController();
