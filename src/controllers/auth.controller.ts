import { Request, Response } from 'express';
import { authService } from '../services/auth.service';

export class AuthController {
  async signup(req: Request, res: Response) {
    try {
      const data = await authService.signup(req.body);
      res.status(201).json(data);
    } catch (error: any) {
      console.error('Signup error:', error);
      res.status(400).json({ error: error.message || 'Signup failed' });
    }
  }

  async login(req: Request, res: Response) {
    try {
      const data = await authService.login(req.body);
      res.json(data);
    } catch (error: any) {
      console.error('Login error:', error);
      res.status(401).json({ error: error.message || 'Login failed' });
    }
  }
}

export const authController = new AuthController();
