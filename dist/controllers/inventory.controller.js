"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.inventoryController = exports.InventoryController = void 0;
const inventory_service_1 = require("../services/inventory.service");
const zod_1 = require("zod");
const createInventorySchema = zod_1.z.object({
    name: zod_1.z.string().min(1),
    type: zod_1.z.string().min(1),
    stockCount: zod_1.z.number().optional(),
    unit: zod_1.z.string().optional(),
    price: zod_1.z.number().optional(),
});
class InventoryController {
    async search(req, res) {
        try {
            const orgId = req.user.organizationId;
            const q = req.query.q;
            const results = await inventory_service_1.inventoryService.searchInventory(orgId, q);
            res.json(results);
        }
        catch (error) {
            console.error('Error searching inventory:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }
    async getAll(req, res) {
        try {
            const orgId = req.user.organizationId;
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 20;
            const search = req.query.search || "";
            const status = req.query.status || "";
            const result = await inventory_service_1.inventoryService.getAll(orgId, page, limit, search, status);
            res.json(result);
        }
        catch (error) {
            console.error('Error getting inventory:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }
    async create(req, res) {
        try {
            const orgId = req.user.organizationId;
            const validatedData = createInventorySchema.parse(req.body);
            const item = await inventory_service_1.inventoryService.create(orgId, validatedData);
            res.status(201).json(item);
        }
        catch (error) {
            if (error instanceof zod_1.z.ZodError) {
                return res.status(400).json({ error: error.issues[0].message });
            }
            console.error('Error creating inventory item:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }
}
exports.InventoryController = InventoryController;
exports.inventoryController = new InventoryController();
