import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secure-vaidyaos-secret-key-for-dev';

// Extend Express Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        organizationId: string;
        email: string;
        role?: string;
        facilityId?: string;
      };
    }
  }
}

export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  const facilityHeader = req.headers['x-facility-id'] as string;
  const token = req.cookies?.token || (authHeader?.startsWith('Bearer ') ? authHeader.split(' ')[1] : null);

  if (!token) {
    return res.status(401).json({ error: 'Unauthorized: No token provided' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    req.user = {
      userId: decoded.userId,
      organizationId: decoded.organizationId,
      email: decoded.email,
      role: decoded.role || 'RECEPTIONIST',
      facilityId: facilityHeader || undefined
    };
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Unauthorized: Invalid token' });
  }
};
