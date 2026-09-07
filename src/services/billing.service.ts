import { prisma } from '../lib/prisma';
import { Prisma } from '@prisma/client';

export class BillingService {
  /**
   * Get all unpaid invoices or dispensed prescriptions that haven't been billed yet for a specific patient
   */
  async getPatientPendingBills(organizationId: string, patientId: string) {
    // Get dispensed prescriptions that have NO invoice yet
    const unbilledPrescriptions = await prisma.prescription.findMany({
      where: {
        organizationId,
        visit: { patientId },
        status: "Dispensed",
        invoice: null // No invoice created yet
      },
      include: {
        items: {
          include: { inventory: true }
        },
        visit: {
          include: { diagnosis: true }
        }
      }
    });

    // Get existing unpaid invoices
    const unpaidInvoices = await prisma.invoice.findMany({
      where: {
        organizationId,
        patientId,
        status: "Unpaid"
      },
      include: {
        items: true,
        prescription: true
      }
    });

    return {
      unbilledPrescriptions,
      unpaidInvoices
    };
  }

  /**
   * Create a new unified invoice containing custom line items
   */
  async createInvoice(organizationId: string, patientId: string, data: {
    prescriptionId?: string;
    items: Array<{
      description: string;
      quantity: number;
      unitPrice: number;
      discount: number;
      totalPrice: number;
    }>;
    subTotal: number;
    discount: number;
    totalAmount: number;
  }) {
    return await prisma.$transaction(async (tx) => {
      // Create the invoice with its items
      const invoice = await tx.invoice.create({
        data: {
          organizationId,
          patientId,
          prescriptionId: data.prescriptionId,
          subTotal: data.subTotal,
          discount: data.discount,
          totalAmount: data.totalAmount,
          status: "Unpaid", // Starts as unpaid
          items: {
            create: data.items
          }
        },
        include: {
          items: true
        }
      });

      return invoice;
    });
  }

  /**
   * Process payment for an invoice
   */
  async processPayment(organizationId: string, invoiceId: string, paymentMethod: string) {
    return await prisma.$transaction(async (tx) => {
      const invoice = await tx.invoice.findFirst({
        where: { id: invoiceId, organizationId }
      });

      if (!invoice) throw new Error("Invoice not found");
      if (invoice.status === "Paid") throw new Error("Invoice is already paid");

      // Mark invoice as Paid
      const paidInvoice = await tx.invoice.update({
        where: { id: invoice.id },
        data: { status: "Paid" }
      });

      // Create Financial Transaction for the income
      if (invoice.totalAmount > 0) {
        await tx.financialTransaction.create({
          data: {
            organizationId,
            type: "INCOME",
            amount: invoice.totalAmount,
            category: "Clinic Revenue",
            description: `Payment for Invoice ${invoice.id} via ${paymentMethod}`
          }
        });
      }

      return paidInvoice;
    });
  }
}

export const billingService = new BillingService();
