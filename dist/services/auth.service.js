"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authService = exports.AuthService = void 0;
const prisma_1 = require("../lib/prisma");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
    throw new Error("FATAL: JWT_SECRET environment variable is missing.");
}
class AuthService {
    async signup(data) {
        const { orgName, address, doctorName, email, password } = data;
        // Check if user already exists
        const existingUser = await prisma_1.prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            throw new Error('Email already registered');
        }
        const passwordHash = await bcryptjs_1.default.hash(password, 10);
        // Create Organization and User atomically
        const result = await prisma_1.prisma.$transaction(async (tx) => {
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
        const token = jsonwebtoken_1.default.sign({ userId: result.user.id, organizationId: result.org.id }, JWT_SECRET, { expiresIn: '7d' });
        return { token, user: result.user, organization: result.org };
    }
    async login(data) {
        const { email, password } = data;
        const user = await prisma_1.prisma.user.findUnique({
            where: { email },
            include: { organization: true }
        });
        if (!user) {
            throw new Error('Invalid email or password');
        }
        const isValid = await bcryptjs_1.default.compare(password, user.passwordHash);
        if (!isValid) {
            throw new Error('Invalid email or password');
        }
        // Generate JWT
        const token = jsonwebtoken_1.default.sign({ userId: user.id, organizationId: user.organizationId }, JWT_SECRET, { expiresIn: '7d' });
        return { token, user, organization: user.organization };
    }
}
exports.AuthService = AuthService;
exports.authService = new AuthService();
