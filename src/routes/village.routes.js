import express from 'express';
import { 
  getVillages, 
  getVillageById, 
  updateVillageName 
} from '../controllers/village.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

const router = express.Router();

/**
 * VILLAGE ROUTES
 * Minden route VÉDETT (authMiddleware)
 */

// Middleware alkalmazása MINDEN route-ra
router.use(authMiddleware);
// ↑ Ez azt jelenti: MINDEN village route-hoz kell token!

// GET /api/villages - User összes faluja
router.get('/', getVillages);

// GET /api/villages/:id - Konkrét falu
router.get('/:id', getVillageById);
//         ↑ :id = URL paraméter (pl. /api/villages/village-A)

// PATCH /api/villages/:id - Falu átnevezése
router.patch('/:id', updateVillageName);

export default router;