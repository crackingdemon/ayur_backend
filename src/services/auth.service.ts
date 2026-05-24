import { prisma } from '../lib/prisma';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Prisma } from '@prisma/client';

const JWT_SECRET = process.env.JWT_SECRET as string;
if (!JWT_SECRET) {
  throw new Error("FATAL: JWT_SECRET environment variable is missing.");
}

export class AuthService {
  async signup(data: any) {
    const { orgName, address, doctorName, email, password } = data;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      throw new Error('Email already registered');
    }

    const passwordHash = await bcrypt.hash(password, 10);

    // Create Organization and User atomically
    const result = await prisma.$transaction(async (tx) => {
      const org = await tx.organization.create({
        data: {
          name: orgName,
          address: address || null,
        }
      });

      const user = await tx.user.create({
        data: {
          organizationId: org.id,
          name: doctorName,
          email,
          passwordHash,
        }
      });

      return { org, user };
    });

    // Generate JWT
    const token = jwt.sign(
      { userId: result.user.id, organizationId: result.org.id },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return { token, user: result.user, organization: result.org };
  }

  async login(data: any) {
    const { email, password } = data;

    const user = await prisma.user.findUnique({
      where: { email },
      include: { organization: true }
    });

    if (!user) {
      throw new Error('Invalid email or password');
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      throw new Error('Invalid email or password');
    }

    // Generate JWT
    const token = jwt.sign(
      { userId: user.id, organizationId: user.organizationId },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return { token, user, organization: user.organization };
  }
}

export const authService = new AuthService();
