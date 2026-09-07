"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.billingController = exports.BillingController = void 0;
const billing_service_1 = require("../services/billing.service");
const zod_1 = require("zod");
const invoiceItemSchema = zod_1.z.object({
    description: zod_1.z.string().min(1),
    quantity: zod_1.z.number().min(1),
    unitPrice: zod_1.z.number().min(0),
    discount: zod_1.z.number().min(0),
    totalPrice: zod_1.z.number().min(0),
});
const createInvoiceSchema = zod_1.z.object({
    prescriptionId: zod_1.z.string().optional(),
    items: zod_1.z.array(invoiceItemSchema).min(1),
    subTotal: zod_1.z.number().min(0),
    discount: zod_1.z.number().min(0),
    totalAmount: zod_1.z.number().min(0),
});
class BillingController {
    async getPendingBills(req, res) {
        try {
            const orgId = req.user.organizationId;
            const patientId = req.params.patientId;
            const bills = await billing_service_1.billingService.getPatientPendingBills(orgId, patientId);
            res.json(bills);
        }
        catch (error) {
            console.error('Error fetching pending bills:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }
    async createInvoice(req, res) {
        try {
            const orgId = req.user.organizationId;
            const patientId = req.params.patientId;
            const validatedData = createInvoiceSchema.parse(req.body);
            const invoice = await billing_service_1.billingService.createInvoice(orgId, patientId, validatedData);
            res.status(201).json(invoice);
        }
        catch (error) {
            if (error instanceof zod_1.z.ZodError) {
                return res.status(400).json({ error: error.issues[0].message });
            }
            console.error('Error creating invoice:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }
    async processPayment(req, res) {
        try {
            const orgId = req.user.organizationId;
            const invoiceId = req.params.invoiceId;
            const { paymentMethod } = req.body;
            if (!paymentMethod) {
                return res.status(400).json({ error: 'Payment method is required' });
            }
            const invoice = await billing_service_1.billingService.processPayment(orgId, invoiceId, paymentMethod);
            res.json(invoice);
        }
        catch (error) {
            console.error('Error processing payment:', error);
            res.status(400).json({ error: error.message || 'Error processing payment' });
        }
    }
}
exports.BillingController = BillingController;
exports.billingController = new BillingController();
