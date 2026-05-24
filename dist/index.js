"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const prisma_1 = require("./lib/prisma");
const patient_routes_1 = require("./routes/patient.routes");
const appointment_routes_1 = require("./routes/appointment.routes");
const inventory_routes_1 = require("./routes/inventory.routes");
const prescription_routes_1 = require("./routes/prescription.routes");
const finance_routes_1 = require("./routes/finance.routes");
const dashboard_routes_1 = require("./routes/dashboard.routes");
dotenv_1.default.config();
const app = (0, express_1.default)();
const port = process.env.PORT || 5000;
const allowedOrigins = process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',')
    : ['http://localhost:3000']; // default for local dev
app.use((0, cors_1.default)({
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        }
        else {
            callback(new Error('Not allowed by CORS'));
        }
    }
}));
app.use(express_1.default.json());
app.get('/api/health', async (req, res) => {
    try {
        await prisma_1.prisma.$queryRaw `SELECT 1`;
        res.json({ status: 'ok', database: 'connected' });
    }
    catch (error) {
        console.error('Database connection error:', error);
        res.status(500).json({ status: 'error', database: 'disconnected' });
    }
});
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const auth_middleware_1 = require("./middlewares/auth.middleware");
app.use('/api/auth', auth_routes_1.default);
app.use('/api/patients', auth_middleware_1.requireAuth, patient_routes_1.patientRoutes);
app.use('/api/appointments', auth_middleware_1.requireAuth, appointment_routes_1.appointmentRoutes);
app.use('/api/inventory', auth_middleware_1.requireAuth, inventory_routes_1.inventoryRoutes);
app.use('/api/prescriptions', auth_middleware_1.requireAuth, prescription_routes_1.prescriptionRoutes);
app.use('/api/finance', auth_middleware_1.requireAuth, finance_routes_1.financeRoutes);
app.use('/api/dashboard', auth_middleware_1.requireAuth, dashboard_routes_1.dashboardRoutes);
app.listen(port, '0.0.0.0', () => {
    console.log(`Server is running on port ${port}`);
});
