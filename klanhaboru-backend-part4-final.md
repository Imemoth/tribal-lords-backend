# BACKEND PROJEKT - PART 4: ROUTES, SERVICES, MIDDLEWARE

---

## 📦 src/routes/auth.routes.js

```javascript
import express from 'express';
import { register, login, getMe } from '../controllers/auth.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

const router = express.Router();

/**
 * AUTH ROUTES
 */

// POST /api/auth/register - Regisztráció
router.post('/register', register);

// POST /api/auth/login - Bejelentkezés
router.post('/login', login);

// GET /api/auth/me - Aktuális user (védett route)
router.get('/me', authMiddleware, getMe);

export default router;
```

---

## 📦 src/routes/village.routes.js

```javascript
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
 * Minden route védett (auth middleware)
 */

// Middleware alkalmazása minden route-ra
router.use(authMiddleware);

// GET /api/villages - User összes faluja
router.get('/', getVillages);

// GET /api/villages/:id - Konkrét falu
router.get('/:id', getVillageById);

// PATCH /api/villages/:id - Falu átnevezése
router.patch('/:id', updateVillageName);

export default router;
```

---

## 📦 src/routes/building.routes.js

```javascript
import express from 'express';
import { 
  getBuildings, 
  upgradeBuilding 
} from '../controllers/building.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

const router = express.Router();

/**
 * BUILDING ROUTES
 * Minden route védett (auth middleware)
 */

// Middleware alkalmazása minden route-ra
router.use(authMiddleware);

// GET /api/buildings?villageId=xxx - Falu épületei
router.get('/', getBuildings);

// POST /api/buildings/upgrade - Épület fejlesztése
router.post('/upgrade', upgradeBuilding);

export default router;
```

---

## 📦 src/middleware/auth.middleware.js

```javascript
import jwt from 'jsonwebtoken';
import { HTTP_STATUS, ERRORS } from '../config/constants.js';

/**
 * AUTH MIDDLEWARE
 * JWT token ellenőrzése
 */

export const authMiddleware = (req, res, next) => {
  try {
    // Token lekérése a header-ből
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        error: ERRORS.UNAUTHORIZED,
        message: 'Token hiányzik vagy hibás formátum'
      });
    }
    
    // Token kinyerése ("Bearer TOKEN" → "TOKEN")
    const token = authHeader.substring(7);
    
    // Token verifikálása
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // User ID hozzáadása a request objektumhoz
    req.userId = decoded.id;
    
    // Folytatás a következő middleware/controller-hez
    next();
    
  } catch (error) {
    console.error('[Auth Middleware] Error:', error.message);
    
    // JWT specific errors
    if (error.name === 'JsonWebTokenError') {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        error: 'Érvénytelen token'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        error: 'Token lejárt, kérlek jelentkezz be újra'
      });
    }
    
    res.status(HTTP_STATUS.UNAUTHORIZED).json({
      success: false,
      error: ERRORS.UNAUTHORIZED
    });
  }
};

export default authMiddleware;
```

---

## 📦 src/services/resource.service.js

```javascript
import Village from '../models/Village.js';
import { io } from '../server.js';

/**
 * RESOURCE SERVICE
 * Nyersanyag termelés számítások
 */

/**
 * Nyersanyag frissítés számítása
 */
export const calculateResourceUpdate = (village) => {
  const now = new Date();
  const lastUpdate = new Date(village.lastResourceUpdate);
  
  // Eltelt idő órában
  const hoursElapsed = (now - lastUpdate) / (1000 * 60 * 60);
  
  // Nyersanyag növekmény
  const woodGained = village.production.wood * hoursElapsed;
  const clayGained = village.production.clay * hoursElapsed;
  const ironGained = village.production.iron * hoursElapsed;
  
  // Új nyersanyag mennyiségek (storage limittel)
  const newResources = {
    wood: Math.min(
      village.resources.wood + woodGained,
      village.storage.wood
    ),
    clay: Math.min(
      village.resources.clay + clayGained,
      village.storage.clay
    ),
    iron: Math.min(
      village.resources.iron + ironGained,
      village.storage.iron
    )
  };
  
  return {
    resources: newResources,
    lastUpdate: now
  };
};

/**
 * Valós idejű resource updater
 * Minden falut frissít 5 másodpercenként
 */
export const startResourceUpdater = (socketIo) => {
  console.log('[Resource Service] Starting real-time updater...');
  
  setInterval(() => {
    const allVillages = Village.findAll();
    
    allVillages.forEach(village => {
      // Nyersanyag frissítés
      const updated = calculateResourceUpdate(village);
      Village.updateResources(village.id, updated.resources);
      
      // WebSocket broadcast a village room-ba
      socketIo.to(`village:${village.id}`).emit('resources:update', {
        villageId: village.id,
        resources: updated.resources,
        production: village.production,
        timestamp: new Date()
      });
    });
    
  }, 5000); // 5 másodpercenként
};

export default {
  calculateResourceUpdate,
  startResourceUpdater
};
```

---

## 📦 src/services/building.service.js

```javascript
import { BUILDINGS, BUILDING_FORMULAS } from '../config/constants.js';
import Building from '../models/Building.js';

/**
 * BUILDING SERVICE
 * Épület számítások
 */

/**
 * Fejlesztési költség számítása
 */
export const calculateUpgradeCost = (buildingType, currentLevel) => {
  const building = BUILDINGS[buildingType];
  
  if (!building) {
    throw new Error('Érvénytelen épület típus');
  }
  
  const multiplier = Math.pow(BUILDING_FORMULAS.costMultiplier, currentLevel);
  
  return {
    wood: Math.floor(building.baseCost.wood * multiplier),
    clay: Math.floor(building.baseCost.clay * multiplier),
    iron: Math.floor(building.baseCost.iron * multiplier)
  };
};

/**
 * Építési idő számítása (másodpercben)
 */
export const calculateBuildTime = (buildingType, level) => {
  const building = BUILDINGS[buildingType];
  
  if (!building) {
    throw new Error('Érvénytelen épület típus');
  }
  
  const timeMultiplier = Math.pow(BUILDING_FORMULAS.timeMultiplier, level);
  const buildTime = BUILDING_FORMULAS.baseTime * 
                    building.buildTimeMultiplier * 
                    timeMultiplier;
  
  return Math.floor(buildTime);
};

/**
 * Termelés számítása (óránként)
 */
export const calculateProduction = (buildingType, level) => {
  const building = BUILDINGS[buildingType];
  
  if (!building || !building.baseProduction) {
    return 0;
  }
  
  return Math.floor(
    building.baseProduction * 
    Math.pow(BUILDING_FORMULAS.productionMultiplier, level - 1)
  );
};

/**
 * Falu pontszám újraszámítása
 */
export const calculateVillagePoints = (villageId) => {
  const buildings = Building.findByVillageId(villageId);
  
  let totalPoints = 0;
  
  buildings.forEach(building => {
    // Minden szint költségének összege
    for (let i = 0; i < building.level; i++) {
      const cost = calculateUpgradeCost(building.buildingType, i);
      totalPoints += (cost.wood + cost.clay + cost.iron) / 10;
    }
  });
  
  return Math.floor(totalPoints);
};

export default {
  calculateUpgradeCost,
  calculateBuildTime,
  calculateProduction,
  calculateVillagePoints
};
```

---

## 📦 src/utils/helpers.js

```javascript
/**
 * HELPER FUNCTIONS
 * Általános segédfüggvények
 */

/**
 * Véletlenszerű koordináta generálás
 */
export const generateRandomCoordinates = (min = 0, max = 99) => {
  return {
    x: Math.floor(Math.random() * (max - min + 1)) + min,
    y: Math.floor(Math.random() * (max - min + 1)) + min
  };
};

/**
 * Távolság számítás két koordináta között
 */
export const calculateDistance = (x1, y1, x2, y2) => {
  return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
};

/**
 * Idő formázás (másodperc → óra:perc:másodperc)
 */
export const formatTime = (seconds) => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

/**
 * Számok formázása (1000 → 1,000)
 */
export const formatNumber = (num) => {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

/**
 * Dátum formázás magyar formátumban
 */
export const formatDate = (date) => {
  const d = new Date(date);
  return d.toLocaleString('hu-HU', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
};

/**
 * Véletlenszerű ID generálás
 */
export const generateId = (length = 8) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

export default {
  generateRandomCoordinates,
  calculateDistance,
  formatTime,
  formatNumber,
  formatDate,
  generateId
};
```

---

## 📦 README.md

```markdown
# 🏰 KLÁNHÁBORÚ BACKEND - EGYSZERŰ VERZIÓ

Böngészőalapú középkori stratégiai játék backend API - In-memory adattárolással

## 📋 Főbb Funkciók

- ✅ User regisztráció és bejelentkezés (JWT)
- ✅ Falu menedzsment
- ✅ Épület fejlesztés
- ✅ Valós idejű nyersanyag termelés
- ✅ WebSocket támogatás
- ✅ In-memory adattárolás (később PostgreSQL)

## 🚀 GYORS INDÍTÁS (Windows)

### 1. Node.js telepítése

Ha még nincs Node.js-ed:
1. Menj ide: https://nodejs.org/
2. Töltsd le az LTS verziót
3. Telepítsd (next, next, finish)
4. Ellenőrzés: nyiss egy CMD-t és írd be:
   ```bash
   node --version
   npm --version
   ```

### 2. Projekt letöltése

```bash
# Ha git-ed van:
git clone <repo_url>
cd klanhaboru-backend

# Vagy egyszerűen csak csomagold ki a ZIP-et
```

### 3. Dependencies telepítése

```bash
npm install
```

Ez kb. 1-2 percet vesz igénybe.

### 4. .env fájl létrehozása

```bash
# Windows CMD-ben:
copy .env.example .env

# Vagy PowerShell-ben:
cp .env.example .env

# Vagy egyszerűen másold át VS Code-ban
```

Szerkeszd a `.env` fájlt:
```env
PORT=3000
NODE_ENV=development
JWT_SECRET=valami-random-szoveg-ide-123456
JWT_EXPIRES_IN=7d
FRONTEND_URL=http://localhost:5173
```

### 5. Szerver indítása

```bash
# Normál mód:
npm start

# VAGY fejlesztői mód (auto-restart):
npm run dev
```

Ha minden jól ment, ezt látod:
```
═══════════════════════════════════════════════════════════
🏰 KLÁNHÁBORÚ BACKEND - EGYSZERŰ VERZIÓ
═══════════════════════════════════════════════════════════
🚀 Server running on port 3000
📡 API: http://localhost:3000/api
🏥 Health: http://localhost:3000/api/health
🔌 WebSocket: ws://localhost:3000
🌍 Environment: development
💾 Storage: IN-MEMORY (session-based)
═══════════════════════════════════════════════════════════
```

### 6. Teszt Postman-nel

Nyisd meg Postman-t és teszteld:

**Health Check:**
```
GET http://localhost:3000/api/health
```

Válasz:
```json
{
  "status": "ok",
  "message": "Klánháború Backend is running",
  "timestamp": "2025-02-16T...",
  "uptime": 5.123
}
```

## 📡 API ENDPOINTS

### Authentication
- `POST /api/auth/register` - Regisztráció
- `POST /api/auth/login` - Bejelentkezés
- `GET /api/auth/me` - Aktuális user (auth required)

### Villages
- `GET /api/villages` - User falvai (auth required)
- `GET /api/villages/:id` - Falu részletei (auth required)
- `PATCH /api/villages/:id` - Falu átnevezése (auth required)

### Buildings
- `GET /api/buildings?villageId=xxx` - Falu épületei (auth required)
- `POST /api/buildings/upgrade` - Épület fejlesztése (auth required)

## 🧪 POSTMAN TESZTELÉS

### 1. Regisztráció
```
POST http://localhost:3000/api/auth/register

Body:
{
  "username": "teszt_peter",
  "email": "peter@example.com",
  "password": "teszt123"
}
```

### 2. Bejelentkezés
```
POST http://localhost:3000/api/auth/login

Body:
{
  "username": "teszt_peter",
  "password": "teszt123"
}

→ Mentsd el a "token"-t a válaszból!
```

### 3. Falu lekérése
```
GET http://localhost:3000/api/villages

Headers:
  Authorization: Bearer <token_ide>
```

### 4. Épület fejlesztés
```
POST http://localhost:3000/api/buildings/upgrade

Headers:
  Authorization: Bearer <token_ide>

Body:
{
  "villageId": "<village_id>",
  "buildingType": "lumber"
}
```

## ⚠️ FONTOS TUDNIVALÓK

### In-Memory Storage
- Minden adat a memóriában tárolódik
- Szerver újraindítás = minden adat elvész
- Ezt később PostgreSQL-re cseréljük

### Token Lejárat
- JWT token élettartama: 7 nap
- Lejárat után újra be kell jelentkezni

## 🐛 HIBAELHÁRÍTÁS

### "Cannot find module..."
```bash
npm install
```

### "Port 3000 is already in use"
Változtasd meg a `.env`-ben:
```
PORT=3001
```

### "JWT_SECRET is not defined"
Ellenőrizd, hogy a `.env` fájl létezik és tartalmazza a `JWT_SECRET`-et.

## 📚 KÖVETKEZŐ LÉPÉSEK

1. ✅ Backend működik
2. → PostgreSQL hozzáadása
3. → Frontend összekötése
4. → WebSocket real-time funkciók
5. → Deployment

## 📞 SUPPORT

Ha bármi nem működik, nézd meg a console log-okat vagy kérdezz!
```

---

## ✅ TELJES PROJEKT KÉSZ!

**Minden fájl elkészült!** 

Most már csak:
1. Összerakni a projektet
2. Telepíteni a package-eket
3. Elindítani
4. Tesztelni Postman-nel

**Elkészítsem a Windows setup útmutatót is?** 🚀