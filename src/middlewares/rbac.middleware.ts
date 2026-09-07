import { Request, Response, NextFunction } from 'express';
import { UserRole } from '@prisma/client';

export const requireRole = (allowedRoles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const userRole = req.user?.role as UserRole;
    
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
