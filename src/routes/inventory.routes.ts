import { Router } from 'express';
import { inventoryController } from '../controllers/inventory.controller';

const router = Router();

router.get('/search', inventoryController.search.bind(inventoryController));
router.get('/', inventoryController.getAll.bind(inventoryController));
router.post('/', inventoryController.create.bind(inventoryController));

export const inventoryRoutes = router;
