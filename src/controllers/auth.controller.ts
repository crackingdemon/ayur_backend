import { Request, Response } from 'express';
import { authService } from '../services/auth.service';
import { logger } from '../utils/logger';

export class AuthController {
  async signup(req: Request, res: Response) {
    try {
      const { token, ...data } = await authService.signup(req.body);
      res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
      });
      res.status(201).json(data);
    } catch (error: any) {
      logger.error('Signup error:', error);
      res.status(400).json({ error: error.message || 'Signup failed' });
    }
  }

  async login(req: Request, res: Response) {
    try {
      const { token, ...data } = await authService.login(req.body);
      res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
      });
      res.json(data);
    } catch (error: any) {
      logger.error('Login error:', error);
      res.status(401).json({ error: error.message || 'Login failed' });
    }
  }
  async logout(req: Request, res: Response) {
    res.clearCookie('token');
    res.json({ message: 'Logged out successfully' });
  }
}

export const authController = new AuthController();
