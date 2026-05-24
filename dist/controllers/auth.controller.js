"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authController = exports.AuthController = void 0;
const auth_service_1 = require("../services/auth.service");
class AuthController {
    async signup(req, res) {
        try {
            const data = await auth_service_1.authService.signup(req.body);
            res.status(201).json(data);
        }
        catch (error) {
            console.error('Signup error:', error);
            res.status(400).json({ error: error.message || 'Signup failed' });
        }
    }
    async login(req, res) {
        try {
            const data = await auth_service_1.authService.login(req.body);
            res.json(data);
        }
        catch (error) {
            console.error('Login error:', error);
            res.status(401).json({ error: error.message || 'Login failed' });
        }
    }
}
exports.AuthController = AuthController;
exports.authController = new AuthController();
