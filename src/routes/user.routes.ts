import { Router } from 'express';
import { userController } from '../controllers/user.controller';
import { requireAuth } from '../middlewares/auth.middleware';

const router = Router();

router.get('/', requireAuth, userController.getUsers.bind(userController));
router.post('/', requireAuth, userController.createUser.bind(userController));
router.get('/doctors', requireAuth, userController.getDoctors.bind(userController));
router.post('/:userId/facilities/:facilityId', requireAuth, userController.assignFacility.bind(userController));
router.delete('/:userId/facilities/:facilityId', requireAuth, userController.unassignFacility.bind(userController));

export const userRoutes = router;
