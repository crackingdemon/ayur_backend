import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';

import bcrypt from 'bcryptjs';

export class UserController {
  async getDoctors(req: Request, res: Response) {
    try {
      const organizationId = req.user?.organizationId;
      if (!organizationId) return res.status(401).json({ error: 'Unauthorized' });

      const doctors = await prisma.user.findMany({
        where: { 
          memberships: {
            some: {
              organizationId,
              role: 'DOCTOR'
            }
          }
        },
        select: {
          id: true,
          name: true,
          email: true,
          facilityAccess: { select: { facilityId: true } }
        },
      });

      res.json(doctors);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch doctors' });
    }
  }

  async getUsers(req: Request, res: Response) {
    try {
      const organizationId = req.user?.organizationId;
      if (!organizationId) return res.status(401).json({ error: 'Unauthorized' });

      const users = await prisma.user.findMany({
        where: { 
          memberships: {
            some: {
              organizationId
            }
          }
        },
        select: {
          id: true,
          name: true,
          email: true,
          memberships: {
            where: { organizationId },
            select: { role: true }
          },
          facilityAccess: { select: { facilityId: true } }
        },
      });

      const mappedUsers = users.map(user => ({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.memberships[0]?.role || 'RECEPTIONIST',
        facilityAccess: user.facilityAccess
      }));

      res.json(mappedUsers);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch users' });
    }
  }

  async createUser(req: Request, res: Response) {
    try {
      const organizationId = req.user?.organizationId;
      if (!organizationId) return res.status(401).json({ error: 'Unauthorized' });

      const { name, email, password, role, facilityIds } = req.body;
      const existingUser = await prisma.user.findUnique({ where: { email } });
      if (existingUser) return res.status(400).json({ error: 'Email already exists' });

      const passwordHash = await bcrypt.hash(password, 10);

      const user = await prisma.user.create({
        data: {
          name, email, passwordHash,
          memberships: {
            create: {
              organizationId,
              role
            }
          },
          facilityAccess: facilityIds ? {
            create: facilityIds.map((id: string) => ({ facilityId: id }))
          } : undefined
        },
        include: { memberships: { where: { organizationId } } }
      });

      res.status(201).json({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.memberships[0]?.role || role
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to create user' });
    }
  }

  async assignFacility(req: Request, res: Response) {
    try {
      const organizationId = req.user?.organizationId;
      const userId = req.params.userId as string;
      const facilityId = req.params.facilityId as string;
      if (!organizationId) return res.status(401).json({ error: 'Unauthorized' });

      await prisma.userFacilityAccess.upsert({
        where: { userId_facilityId: { userId, facilityId } },
        create: { userId, facilityId },
        update: {}
      });

      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: 'Failed to assign facility' });
    }
  }

  async unassignFacility(req: Request, res: Response) {
    try {
      const organizationId = req.user?.organizationId;
      const userId = req.params.userId as string;
      const facilityId = req.params.facilityId as string;
      if (!organizationId) return res.status(401).json({ error: 'Unauthorized' });

      await prisma.userFacilityAccess.delete({
        where: { userId_facilityId: { userId, facilityId } }
      });

      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: 'Failed to unassign facility' });
    }
  }
}

export const userController = new UserController();
