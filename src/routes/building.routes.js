import express from 'express';
import { 
  getBuildings, 
  upgradeBuilding 
} from '../controllers/building.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

const router = express.Router();

/**
 * BUILDING ROUTES
 * Minden route VÉDETT (authMiddleware)
 */

// Middleware alkalmazása MINDEN route-ra
router.use(authMiddleware);

// GET /api/buildings?villageId=xxx - Falu épületei
router.get('/', getBuildings);
//               ↑ Query string: ?villageId=village-A

// POST /api/buildings/upgrade - Épület fejlesztése
router.post('/upgrade', upgradeBuilding);

export default router;