# 🏰 KLÁNHÁBORÚ BACKEND - STARTER PROJEKT
## Node.js + Express + PostgreSQL

---

## 📁 PROJEKT STRUKTÚRA

```
klanhaboru-backend/
├── src/
│   ├── config/
│   │   └── database.js          # Adatbázis kapcsolat beállítások
│   ├── controllers/
│   │   ├── auth.controller.js   # Login/Register logika
│   │   ├── village.controller.js # Falu műveletek
│   │   └── building.controller.js # Épület műveletek
│   ├── middleware/
│   │   └── auth.middleware.js   # JWT token ellenőrzés
│   ├── models/
│   │   ├── User.js              # User adatstruktúra
│   │   ├── Village.js           # Falu adatstruktúra
│   │   └── Building.js          # Épület adatstruktúra
│   ├── routes/
│   │   ├── auth.routes.js       # Auth endpoints
│   │   ├── village.routes.js    # Falu endpoints
│   │   └── building.routes.js   # Épület endpoints
│   ├── services/
│   │   ├── resource.service.js  # Nyersanyag számítások
│   │   └── building.service.js  # Épület fejlesztés logika
│   ├── utils/
│   │   └── constants.js         # Játék konstansok (költségek, termelés)
│   └── server.js                # Fő szerver fájl
├── database/
│   ├── migrations/
│   │   └── 001_initial_schema.sql  # Adatbázis táblák
│   └── seeds/
│       └── 001_test_data.sql       # Teszt adatok
├── .env.example                 # Környezeti változók példa
├── .gitignore                   # Git ignore fájl
├── package.json                 # NPM dependencies
└── README.md                    # Indítási útmutató
```

---

## 📄 MINDEN FÁJL TARTALMA

### 1. package.json

```json
{
  "name": "klanhaboru-backend",
  "version": "1.0.0",
  "description": "Klánháború backend API",
  "main": "src/server.js",
  "type": "module",
  "scripts": {
    "start": "node src/server.js",
    "dev": "nodemon src/server.js",
    "db:migrate": "node database/migrate.js",
    "db:seed": "node database/seed.js"
  },
  "keywords": ["game", "mmo", "strategy"],
  "author": "Te",
  "license": "MIT",
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "dotenv": "^16.3.1",
    "pg": "^8.11.3",
    "bcrypt": "^5.1.1",
    "jsonwebtoken": "^9.0.2",
    "socket.io": "^4.7.2"
  },
  "devDependencies": {
    "nodemon": "^3.0.1"
  }
}
```

**MIT JELENT EZ?**
- `dependencies`: Ezek a csomagok kellenek a futáshoz
- `express`: Web szerver keretrendszer (a backend alapja)
- `cors`: Engedélyezi, hogy a frontend (React) beszéljen a backend-del
- `pg`: PostgreSQL adatbázis driver
- `bcrypt`: Jelszavak biztonságos tárolása (hash-elés)
- `jsonwebtoken`: User authentikáció (belépés kezelése)
- `socket.io`: Real-time kommunikáció (nyersanyag frissítések)
- `nodemon`: Auto-restart fejlesztés közben

---

### 2. .env.example

```env
# Szerver beállítások
PORT=3000
NODE_ENV=development

# Adatbázis kapcsolat
DB_HOST=localhost
DB_PORT=5432
DB_NAME=klanhaboru
DB_USER=postgres
DB_PASSWORD=yourpassword

# JWT Secret (változtasd meg valami random szövegre!)
JWT_SECRET=your-super-secret-key-change-this-in-production

# Frontend URL (CORS miatt kell)
FRONTEND_URL=http://localhost:5173
```

**MIT JELENT EZ?**
- Ez a fájl tartalmazza a **konfigurációs adatokat**
- **NEM kerül be git-be** (biztonság miatt)
- Másold le `.env` néven és töltsd ki a saját adataiddal
- `JWT_SECRET`: Egy titkos kulcs a biztonságos belépéshez

---

### 3. src/server.js (FŐ SZERVER FÁJL)

```javascript
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';

// Route importok
import authRoutes from './routes/auth.routes.js';
import villageRoutes from './routes/village.routes.js';
import buildingRoutes from './routes/building.routes.js';

// Környezeti változók betöltése
dotenv.config();

// Express app létrehozása
const app = express();
const httpServer = createServer(app);

// Socket.IO setup (real-time kommunikációhoz)
const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    methods: ['GET', 'POST']
  }
});

// --- MIDDLEWARE-EK ---
// Ezek a "közvetítők" minden request előtt lefutnak

// 1. CORS - Engedi hogy a frontend beszéljen a backend-del
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));

// 2. JSON parser - Request body-t JSON-ná alakítja
app.use(express.json());

// 3. Request logger - Logol minden bejövő kérést (fejlesztéshez hasznos)
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// --- ROUTES (ÚTVONALAK) ---
// Itt mondjuk meg, hogy melyik URL mit csináljon

app.use('/api/auth', authRoutes);
app.use('/api/villages', villageRoutes);
app.use('/api/buildings', buildingRoutes);

// Health check endpoint - Ellenőrzi, hogy él-e a szerver
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// 404 handler - Ha nem létező URL-t kér valaki
app.use((req, res) => {
  res.status(404).json({ 
    error: 'Endpoint not found',
    path: req.url 
  });
});

// Error handler - Minden hibát itt fogunk el
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error'
  });
});

// --- WEBSOCKET EVENTS ---
// Real-time kommunikáció (pl. nyersanyag frissítések)

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
  
  // User csatlakozik egy "room"-ba (a saját faluja)
  socket.on('join:village', (villageId) => {
    socket.join(`village:${villageId}`);
    console.log(`User joined village room: ${villageId}`);
  });
  
  // Példa: Resource frissítés küldése
  socket.on('request:resources', (villageId) => {
    // Itt majd lekérjük az adatbázisból és visszaküldjük
    io.to(`village:${villageId}`).emit('update:resources', {
      wood: 1000,
      clay: 1000,
      iron: 800
    });
  });
  
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// --- SZERVER INDÍTÁS ---
const PORT = process.env.PORT || 3000;

httpServer.listen(PORT, () => {
  console.log('═══════════════════════════════════════');
  console.log('🏰 Klánháború Backend Server');
  console.log('═══════════════════════════════════════');
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 API: http://localhost:${PORT}/api`);
  console.log(`🔌 WebSocket: ws://localhost:${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV}`);
  console.log('═══════════════════════════════════════');
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  httpServer.close(() => {
    console.log('HTTP server closed');
  });
});

export default app;
```

**MIT CSINÁL EZ A FÁJL?**
1. **Létrehoz egy Express szervert** - Ez fogadja a kéréseket
2. **Beállítja a CORS-t** - Különben a frontend nem tudna beszélni vele
3. **Regisztrálja az útvonalakat** (routes) - Megmondja melyik URL mit csináljon
4. **WebSocket szerver** - Real-time kapcsolat
5. **Elindítja a szervert** a megadott porton

---

### 4. src/config/database.js

```javascript
import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

/**
 * PostgreSQL Connection Pool
 * 
 * MIT CSINÁL EZ?
 * - Kapcsolatot létesít a PostgreSQL adatbázissal
 * - "Pool" = Több kapcsolatot tart fenn egyszerre (gyorsabb)
 */
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'klanhaboru',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD,
  max: 20, // Maximum 20 connection egyszerre
  idleTimeoutMillis: 30000, // Connection timeout 30 másodperc után
  connectionTimeoutMillis: 2000, // Ha 2 mp-en belül nem kapcsolódik, error
});

/**
 * Query függvény - SQL lekérdezések futtatására
 * 
 * HASZNÁLAT:
 * const result = await db.query('SELECT * FROM users WHERE id = $1', [userId]);
 */
export const query = async (text, params) => {
  const start = Date.now();
  
  try {
    const result = await pool.query(text, params);
    const duration = Date.now() - start;
    
    // Log a query-t (fejlesztésben hasznos)
    console.log('Executed query:', {
      text: text.substring(0, 100), // Első 100 karakter
      duration: `${duration}ms`,
      rows: result.rowCount
    });
    
    return result;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
};

/**
 * Transaction függvény - Több query egyben
 * Ha valamelyik hibázik, mindegyik visszagördül
 */
export const transaction = async (callback) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

/**
 * Adatbázis kapcsolat tesztelése
 */
export const testConnection = async () => {
  try {
    const result = await query('SELECT NOW()');
    console.log('✅ Database connection successful');
    console.log('   Server time:', result.rows[0].now);
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    return false;
  }
};

// Default export
export default {
  query,
  transaction,
  testConnection,
  pool
};
```

**MIT JELENT EZ?**
- Ez kezeli az **adatbázis kapcsolatot**
- `pool`: Több kapcsolatot tart nyitva egyszerre (gyorsabb)
- `query()`: Ezzel futtatunk SQL parancsokat
- `transaction()`: Ha több dolgot egyben kell megcsinálni

---

### 5. src/utils/constants.js

```javascript
/**
 * JÁTÉK KONSTANSOK
 * 
 * Minden hardcoded érték itt van egy helyen
 * Könnyű módosítani és karbantartani
 */

// ÉPÜLET TÍPUSOK ÉS ADATAIK
export const BUILDINGS = {
  lumber: {
    name: 'Fatelep',
    baseProduction: 30, // óránkénti termelés 1. szinten
    baseCost: {
      wood: 50,
      clay: 60,
      iron: 40
    },
    buildTimeMultiplier: 1.0,
    maxLevel: 30
  },
  
  clay: {
    name: 'Agyagbánya',
    baseProduction: 30,
    baseCost: {
      wood: 65,
      clay: 50,
      iron: 40
    },
    buildTimeMultiplier: 1.0,
    maxLevel: 30
  },
  
  iron: {
    name: 'Vasbánya',
    baseProduction: 25,
    baseCost: {
      wood: 75,
      clay: 65,
      iron: 70
    },
    buildTimeMultiplier: 1.0,
    maxLevel: 30
  },
  
  headquarters: {
    name: 'Főépület',
    baseCost: {
      wood: 90,
      clay: 80,
      iron: 70
    },
    buildTimeMultiplier: 1.0,
    maxLevel: 30,
    // Főépület szintje gyorsítja az építéseket
    speedBonus: 0.05 // 5% per szint
  },
  
  barracks: {
    name: 'Kaszárnya',
    baseCost: {
      wood: 200,
      clay: 170,
      iron: 90
    },
    buildTimeMultiplier: 1.2,
    maxLevel: 25
  },
  
  wall: {
    name: 'Palánk',
    baseCost: {
      wood: 50,
      clay: 100,
      iron: 20
    },
    buildTimeMultiplier: 1.0,
    maxLevel: 20,
    // Palánk szintje növeli a védelmet
    defenseBonus: 0.04 // 4% per szint
  },
  
  storage: {
    name: 'Raktár',
    baseStorage: 1000,
    baseCost: {
      wood: 60,
      clay: 50,
      iron: 40
    },
    buildTimeMultiplier: 0.8,
    maxLevel: 30
  },
  
  farm: {
    name: 'Farm',
    basePopulation: 240,
    baseCost: {
      wood: 45,
      clay: 40,
      iron: 30
    },
    buildTimeMultiplier: 0.9,
    maxLevel: 30
  }
};

// ÉPÜLET KÖLTSÉG ÉS IDŐ SZÁMÍTÁS
export const BUILDING_FORMULAS = {
  // Költség növekedés
  costMultiplier: 1.26,
  
  // Építési idő (másodpercben)
  // baseTime * (1.18 ^ level) / (1 + HQ_BONUS)
  timeMultiplier: 1.18,
  baseTime: 180, // 3 perc alapértelmezetten
  
  // Termelés növekedés
  productionMultiplier: 1.2
};

// KEZDŐ FALU ALAPÉRTÉKEK
export const STARTING_VILLAGE = {
  resources: {
    wood: 500,
    clay: 500,
    iron: 400
  },
  
  buildings: {
    lumber: 1,
    clay: 1,
    iron: 1,
    headquarters: 1,
    barracks: 0,
    wall: 0,
    storage: 1,
    farm: 1
  },
  
  points: 20
};

// TÉRKÉP BEÁLLÍTÁSOK
export const MAP_SETTINGS = {
  worldSize: 100, // 100x100 grid (10000 falu max)
  minX: 0,
  maxX: 99,
  minY: 0,
  maxY: 99,
  
  // Barbár falvak (NPC)
  barbarianVillagePercent: 0.30 // 30% barbár falu
};

// HADSEREG EGYSÉGEK
export const TROOPS = {
  spear: {
    name: 'Lándzsás',
    cost: { wood: 50, clay: 30, iron: 10 },
    population: 1,
    attack: 10,
    defense: 15,
    defenseCavalry: 45,
    speed: 18, // percben 1 mező
    carryCapacity: 25
  },
  
  sword: {
    name: 'Kardforgató',
    cost: { wood: 30, clay: 30, iron: 70 },
    population: 1,
    attack: 25,
    defense: 50,
    defenseCavalry: 15,
    speed: 22,
    carryCapacity: 15
  },
  
  axe: {
    name: 'Rohamozó',
    cost: { wood: 60, clay: 30, iron: 40 },
    population: 1,
    attack: 40,
    defense: 10,
    defenseCavalry: 5,
    speed: 18,
    carryCapacity: 10
  },
  
  light_cavalry: {
    name: 'Könnyűlovas',
    cost: { wood: 125, clay: 100, iron: 250 },
    population: 4,
    attack: 130,
    defense: 30,
    defenseCavalry: 40,
    speed: 10,
    carryCapacity: 80
  },
  
  heavy_cavalry: {
    name: 'Nehézlovas',
    cost: { wood: 250, clay: 100, iron: 150 },
    population: 6,
    attack: 150,
    defense: 200,
    defenseCavalry: 80,
    speed: 11,
    carryCapacity: 50
  },
  
  ram: {
    name: 'Faltörő kos',
    cost: { wood: 300, clay: 200, iron: 200 },
    population: 5,
    attack: 2,
    defense: 20,
    defenseCavalry: 50,
    speed: 30,
    carryCapacity: 0,
    wallDamage: 1 // falszint csökkentés
  }
};

// JÁTÉK SZABÁLYOK
export const GAME_RULES = {
  maxVillagesPerPlayer: 100,
  maxTribeMembers: 60,
  
  // Kezdő védelem (új játékosok védettek)
  beginnerProtectionDays: 3,
  
  // Távolság limitek
  maxAttackDistance: 100, // mezők
  
  // Morale (morál) - erősebb játékos vs gyengébb büntetés
  moraleEnabled: true,
  moraleMinPoints: 100,
  
  // Éjszakai bónusz
  nightBonusEnabled: true,
  nightBonusStart: 23, // 23:00
  nightBonusEnd: 6     // 06:00
};

// HTTP STATUS CODES (segédlet)
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_ERROR: 500
};

// ERROR ÜZENETEK
export const ERRORS = {
  // Auth
  INVALID_CREDENTIALS: 'Hibás felhasználónév vagy jelszó',
  USER_EXISTS: 'Ez a felhasználónév már foglalt',
  EMAIL_EXISTS: 'Ez az email cím már használatban van',
  UNAUTHORIZED: 'Nincs jogosultságod ehhez a művelethez',
  
  // Resources
  INSUFFICIENT_RESOURCES: 'Nincs elég nyersanyag',
  
  // Buildings
  BUILDING_UPGRADING: 'Ez az épület már fejlesztés alatt áll',
  BUILDING_MAX_LEVEL: 'Az épület elérte a maximum szintet',
  INVALID_BUILDING_TYPE: 'Érvénytelen épület típus',
  
  // Village
  VILLAGE_NOT_FOUND: 'A falu nem található',
  NOT_YOUR_VILLAGE: 'Ez nem a te falvad',
  
  // General
  INTERNAL_ERROR: 'Szerverhiba történt'
};

export default {
  BUILDINGS,
  BUILDING_FORMULAS,
  STARTING_VILLAGE,
  MAP_SETTINGS,
  TROOPS,
  GAME_RULES,
  HTTP_STATUS,
  ERRORS
};
```

**MIT TARTALMAZ EZ?**
- Minden **játék adat** egy helyen
- Épület költségek, termelés, formulák
- Hadsereg egységek statisztikái
- Hibaüzenetek
- Könnyen módosítható, nem kell a kódban keresni

---

Folytatom a többi fájllal? (Controllers, Models, Routes)
Vagy inkább előbb **elmagyarázom alapból**, hogy mi az az API, Controller, Route, stb.?

**Melyik lenne hasznosabb most?** 🤔