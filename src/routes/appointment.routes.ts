import { Router } from 'express';
import { appointmentController } from '../controllers/appointment.controller';

const router = Router();

router.get('/', appointmentController.getAllPaginated.bind(appointmentController));
router.get('/today', appointmentController.getToday.bind(appointmentController));
router.post('/', appointmentController.book.bind(appointmentController));
router.put('/:id/status', appointmentController.updateStatus.bind(appointmentController));

export const appointmentRoutes = router;
