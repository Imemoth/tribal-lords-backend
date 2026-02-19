import express from 'express';
import { register, login, getMe } from '../controllers/auth.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

const router = express.Router();

/**
 * AUTH ROUTES
 */

// POST /api/auth/register - Regisztráció (NYILVÁNOS)
router.post('/register', register);

// POST /api/auth/login - Bejelentkezés (NYILVÁNOS)
router.post('/login', login);

// GET /api/auth/me - Aktuális user (VÉDETT - kell token)
router.get('/me', authMiddleware, getMe);
//                ↑ authMiddleware ELŐBB fut, ellenőrzi a tokent

export default router;