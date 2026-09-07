"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireRole = void 0;
const requireRole = (allowedRoles) => {
    return (req, res, next) => {
        const userRole = req.user?.role;
        if (!userRole) {
            return res.status(401).json({ error: 'Unauthorized: No role assigned' });
        }
        if (userRole === 'ADMIN') {
            return next(); // Admin can access everything
        }
        if (!allowedRoles.includes(userRole)) {
            return res.status(403).json({ error: 'Forbidden: You do not have permission for this action' });
        }
        next();
    };
};
exports.requireRole = requireRole;
