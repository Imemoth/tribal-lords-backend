import jwt from 'jsonwebtoken';
import { HTTP_STATUS, ERRORS } from '../config/constants.js';

/**
 * AUTH MIDDLEWARE - JWT Token Ellenőrzés
 * 
 * MIT CSINÁL:
 * - Ellenőrzi, hogy van-e JWT token a request-ben
 * - Ellenőrzi, hogy a token érvényes-e
 * - Hozzáadja a user ID-t a request objektumhoz
 * 
 * HASZNÁLAT:
 * router.get('/protected', authMiddleware, controller);
 */

export const authMiddleware = (req, res, next) => {
  try {
    // ════════════════════════════════════════════════════════
    // 1️⃣ TOKEN LEKÉRÉSE A HEADER-BŐL
    // ════════════════════════════════════════════════════════
    
    const authHeader = req.headers.authorization;
    // PÉLDA: "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    
    // Ellenőrzés: van header és jó formátumú?
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        error: ERRORS.UNAUTHORIZED,
        message: 'Token hiányzik vagy hibás formátum. Használd: "Bearer <token>"'
      });
    }
    
    // ════════════════════════════════════════════════════════
    // 2️⃣ TOKEN KINYERÉSE
    // ════════════════════════════════════════════════════════
    
    const token = authHeader.substring(7);
    // "Bearer eyJhbGci..." → "eyJhbGci..."
    // A substring(7) levágja a "Bearer " részt (7 karakter)
    
    // ════════════════════════════════════════════════════════
    // 3️⃣ TOKEN VERIFIKÁLÁSA
    // ════════════════════════════════════════════════════════
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // MIT CSINÁL:
    // - Ellenőrzi a token aláírását (JWT_SECRET-tel)
    // - Ellenőrzi a lejárati időt
    // - Dekódolja a payload-ot
    
    // DECODED PÉLDA:
    // {
    //   id: "user-123",
    //   iat: 1708095600,  // issued at (mikor lett generálva)
    //   exp: 1708700400   // expiration (mikor jár le)
    // }
    
    // ════════════════════════════════════════════════════════
    // 4️⃣ USER ID HOZZÁADÁSA A REQUEST-HEZ
    // ════════════════════════════════════════════════════════
    
    req.userId = decoded.id;
    // Most a controller-ben elérhető: req.userId
    
    // ════════════════════════════════════════════════════════
    // 5️⃣ FOLYTATÁS
    // ════════════════════════════════════════════════════════
    
    next();
    // Minden rendben, mehet tovább a controller-hez
    
  } catch (error) {
    // ════════════════════════════════════════════════════════
    // HIBAKEZELÉS
    // ════════════════════════════════════════════════════════
    
    console.error('[Auth Middleware] Error:', error.message);
    
    // JWT specifikus hibák
    if (error.name === 'JsonWebTokenError') {
      // Token nem valid (pl. rossz aláírás, módosították)
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        error: 'Érvénytelen token. Kérlek jelentkezz be újra!'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      // Token lejárt
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        error: 'Token lejárt. Kérlek jelentkezz be újra!',
        expiredAt: error.expiredAt
      });
    }
    
    // Általános hiba
    res.status(HTTP_STATUS.UNAUTHORIZED).json({
      success: false,
      error: ERRORS.UNAUTHORIZED
    });
  }
};

export default authMiddleware;
