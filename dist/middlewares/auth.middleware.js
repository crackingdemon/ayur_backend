"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAuth = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const JWT_SECRET = process.env.JWT_SECRET || 'super-secure-vaidyaos-secret-key-for-dev';
const requireAuth = (req, res, next) => {
    const authHeader = req.headers.authorization;
    const facilityHeader = req.headers['x-facility-id'];
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Unauthorized: No token provided' });
    }
    const token = authHeader.split(' ')[1];
    try {
        const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        req.user = {
            userId: decoded.userId,
            organizationId: decoded.organizationId,
            email: decoded.email,
            role: decoded.role || 'RECEPTIONIST',
            facilityId: facilityHeader || undefined
        };
        next();
    }
    catch (error) {
        return res.status(401).json({ error: 'Unauthorized: Invalid token' });
    }
};
exports.requireAuth = requireAuth;
