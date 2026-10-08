"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authController = exports.AuthController = void 0;
const auth_service_1 = require("../services/auth.service");
const logger_1 = require("../utils/logger");
class AuthController {
    async signup(req, res) {
        try {
            const { token, ...data } = await auth_service_1.authService.signup(req.body);
            res.cookie('token', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
            });
            res.status(201).json(data);
        }
        catch (error) {
            logger_1.logger.error('Signup error:', error);
            res.status(400).json({ error: error.message || 'Signup failed' });
        }
    }
    async login(req, res) {
        try {
            const { token, ...data } = await auth_service_1.authService.login(req.body);
            res.cookie('token', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
            });
            res.json(data);
        }
        catch (error) {
            logger_1.logger.error('Login error:', error);
            res.status(401).json({ error: error.message || 'Login failed' });
        }
    }
    async logout(req, res) {
        res.clearCookie('token');
        res.json({ message: 'Logged out successfully' });
    }
}
exports.AuthController = AuthController;
exports.authController = new AuthController();
