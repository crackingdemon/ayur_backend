import { Router } from 'express';
import { facilityController } from '../controllers/facility.controller';
import { requireAuth } from '../middlewares/auth.middleware';

const router = Router();

router.use(requireAuth);

router.post('/', facilityController.createFacility);
router.get('/', facilityController.getFacilities);
router.get('/my-access', facilityController.getUserFacilities);
router.post('/switch', facilityController.switchFacility);

export default router;
