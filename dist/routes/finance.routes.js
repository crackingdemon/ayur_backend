"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.financeRoutes = void 0;
const express_1 = require("express");
const finance_controller_1 = require("../controllers/finance.controller");
const router = (0, express_1.Router)();
router.get('/transactions', finance_controller_1.financeController.getAll.bind(finance_controller_1.financeController));
router.post('/transactions', finance_controller_1.financeController.create.bind(finance_controller_1.financeController));
exports.financeRoutes = router;
