"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.financeController = exports.FinanceController = void 0;
const finance_service_1 = require("../services/finance.service");
const zod_1 = require("zod");
const createTransactionSchema = zod_1.z.object({
    type: zod_1.z.enum(["INCOME", "EXPENSE"]),
    amount: zod_1.z.number().positive(),
    category: zod_1.z.string().min(1),
    description: zod_1.z.string().optional(),
});
class FinanceController {
    async create(req, res) {
        try {
            const orgId = req.user.organizationId;
            const validatedData = createTransactionSchema.parse(req.body);
            const transaction = await finance_service_1.financeService.addTransaction(orgId, validatedData);
            res.status(201).json(transaction);
        }
        catch (error) {
            if (error instanceof zod_1.z.ZodError) {
                return res.status(400).json({ error: error.issues[0].message });
            }
            console.error('Error creating transaction:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }
    async getAll(req, res) {
        try {
            const orgId = req.user.organizationId;
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 20;
            const result = await finance_service_1.financeService.getAllTransactions(orgId, page, limit);
            res.json(result);
        }
        catch (error) {
            console.error('Error getting transactions:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }
}
exports.FinanceController = FinanceController;
exports.financeController = new FinanceController();
