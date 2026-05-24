"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dashboardController = exports.DashboardController = void 0;
const dashboard_service_1 = require("../services/dashboard.service");
class DashboardController {
    async getStats(req, res) {
        try {
            const orgId = req.user.organizationId;
            const stats = await dashboard_service_1.dashboardService.getDashboardStats(orgId);
            res.json(stats);
        }
        catch (error) {
            console.error('Error fetching dashboard stats:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }
}
exports.DashboardController = DashboardController;
exports.dashboardController = new DashboardController();
