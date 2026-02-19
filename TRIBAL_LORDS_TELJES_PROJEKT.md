# 🏰 TRIBAL LORDS BACKEND - TELJES PROJEKT MINDEN FÁJLLAL
## Részletes magyarázatokkal - Értsd meg mit csinálsz!

---

## 📋 TARTALOM

```
1. Projekt Áttekintés - Mit építünk?
2. package.json - Projekt konfiguráció
3. .env.example - Környezeti változók
4. .gitignore - Git ignore fájl
5. README.md - Dokumentáció
6. src/config/constants.js - Játék konstansok
7. src/server.js - Fő szerver fájl (SZÍV!)
8. src/middleware/auth.middleware.js - Token ellenőrzés
9. src/models/User.js - User adatkezelés
10. src/models/Village.js - Falu adatkezelés
11. src/models/Building.js - Épület adatkezelés
12. src/controllers/auth.controller.js - Auth logika
13. src/controllers/village.controller.js - Falu logika
14. src/controllers/building.controller.js - Épület logika
15. src/routes/auth.routes.js - Auth útvonalak
16. src/routes/village.routes.js - Falu útvonalak
17. src/routes/building.routes.js - Épület útvonalak
18. src/services/resource.service.js - Nyersanyag számítások
19. src/services/building.service.js - Épület számítások
20. src/utils/helpers.js - Segédfüggvények
```

---

## 📖 1. PROJEKT ÁTTEKINTÉS - MIT ÉPÍTÜNK?

### Mi ez a projekt?

**Tribal Lords** = Böngészőalapú, középkori stratégiai játék backend

### Játék funkciók:
- ✅ User regisztráció és bejelentkezés (biztonságosan)
- ✅ Falu menedzsment (nyersanyagok: fa, agyag, vas)
- ✅ Épületek fejlesztése (Fatelep, Agyagbánya, stb.)
- ✅ Valós idejű nyersanyag termelés
- ✅ Pontrendszer

### Miért "egyszerű verzió"?

```
┌─────────────────────────────────────────────────────────┐
│  EGYSZERŰ (MOST)          vs      TELJES (KÉSŐBB)      │
├─────────────────────────────────────────────────────────┤
│  In-memory tárolás         |    PostgreSQL database     │
│  Gyors setup (20 perc)     |    Lassabb setup (2 óra)   │
│  Szerver restart = adat    |    Perzisztens adatok      │
│    elvész                  |                            │
│  Tökéletes tanuláshoz!     |    Production-ready        │
└─────────────────────────────────────────────────────────┘
```

**Stratégia:** Először gyorsan felépítjük, megtanuljuk, majd később átírjuk PostgreSQL-re (1 nap munka).

### Backend architektúra egyszerűen:

```
FRONTEND (React)
    ↓ HTTP Request (pl. "Fejleszd a Fatelep-et")
    ↓
ROUTES (útvonalak)
    ↓ "POST /api/buildings/upgrade"
    ↓
MIDDLEWARE (ellenőrzés)
    ↓ "Van token? Érvényes?"
    ↓
CONTROLLER (koordinátor)
    ↓ "Ellenőrizd, számold ki, válaszolj"
    ↓
SERVICE (számítások)
    ↓ "Költség: 100 fa, 80 agyag"
    ↓
MODEL (adatkezelés)
    ↓ "Mentsd az új szintet"
    ↓
IN-MEMORY STORAGE (Map objektumok)
    ↓ "Kész, elmentve!"
    ↓
RESPONSE vissza a frontend-nek
    ↓
FRONTEND frissíti a UI-t
```

---

## 📄 2. FÁJL: package.json (GYÖKÉR)

### MIT CSINÁL EZ A FÁJL?

Ez a projekt **"születési anyakönyve"**:
- Megmondja a projekt **nevét**
- Listázza a **dependencies** (csomagok, amiket telepíteni kell)
- Definiálja a **scripts** (parancsok: `npm start`, `npm run dev`)

### MIÉRT FONTOS?

Amikor írod: `npm install` → Ez a fájl alapján tölti le az összes csomagot.

### KÓD:

**Fájl: `package.json`** (gyökér mappában)

```json
{
  "name": "tribal-lords-backend",
  "version": "1.0.0",
  "description": "Tribal Lords backend - egyszerű in-memory verzió",
  "main": "src/server.js",
  "type": "module",
  "scripts": {
    "start": "node src/server.js",
    "dev": "nodemon src/server.js"
  },
  "keywords": ["game", "strategy", "mmo", "tribal", "medieval"],
  "author": "Te",
  "license": "MIT",
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "dotenv": "^16.3.1",
    "bcrypt": "^5.1.1",
    "jsonwebtoken": "^9.0.2",
    "socket.io": "^4.7.2",
    "uuid": "^9.0.1"
  },
  "devDependencies": {
    "nodemon": "^3.0.1"
  }
}
```

### MAGYARÁZAT - DEPENDENCIES:

```javascript
"express": "^4.18.2"
// MIT CSINÁL: Web szerver keretrendszer
// MIÉRT KELL: A backend alapja, fogadja a HTTP kéréseket

"cors": "^2.8.5"
// MIT CSINÁL: Cross-Origin Resource Sharing
// MIÉRT KELL: Engedi hogy a frontend (React) beszéljen a backend-del
// NÉLKÜLE: "CORS error" → frontend nem tudna API-t hívni

"dotenv": "^16.3.1"
// MIT CSINÁL: .env fájl olvasása
// MIÉRT KELL: Titkos kulcsok (JWT_SECRET) biztonságosan tárolva
// PÉLDA: process.env.JWT_SECRET

"bcrypt": "^5.1.1"
// MIT CSINÁL: Jelszavak biztonságos tárolása (hash-elés)
// MIÉRT KELL: SOHA ne tárold jelszavakat plain text-ben!
// PÉLDA: "titkos123" → "$2b$10$X7eF..."

"jsonwebtoken": "^9.0.2"
// MIT CSINÁL: JWT token generálás és ellenőrzés
// MIÉRT KELL: Bejelentkezés kezelése (session nélkül)
// PÉLDA: User bejelentkezik → kap egy tokent → minden kérésnél elküldi

"socket.io": "^4.7.2"
// MIT CSINÁL: WebSocket - valós idejű kommunikáció
// MIÉRT KELL: Nyersanyag termelés live frissítése
// PÉLDA: Backend → Frontend: "Fa: 1523" másodpercenként

"uuid": "^9.0.1"
// MIT CSINÁL: Egyedi ID generálás
// MIÉRT KELL: User ID, Village ID, stb.
// PÉLDA: "a1b2c3d4-e5f6-7890-abcd-ef1234567890"
```

### MAGYARÁZAT - DEV DEPENDENCIES:

```javascript
"nodemon": "^3.0.1"
// MIT CSINÁL: Auto-restart a szerver, ha változik a kód
// MIÉRT KELL: Fejlesztés közben nem kell mindig újraindítani
// HASZNÁLAT: npm run dev
```

### MAGYARÁZAT - SCRIPTS:

```json
"start": "node src/server.js"
// Normál indítás (production)
// Használat: npm start

"dev": "nodemon src/server.js"
// Fejlesztői mód (auto-restart)
// Használat: npm run dev
```

### MAGYARÁZAT - TYPE:

```json
"type": "module"
// Modern JavaScript syntax (import/export)
// Nélküle: require/module.exports (régi mód)
// Velük: import/export (új, szebb mód)
```

---

## 📄 3. FÁJL: .env.example (GYÖKÉR)

### MIT CSINÁL EZ A FÁJL?

Ez egy **sablon** a környezeti változókhoz. Tartalmazza a konfigurációs adatokat:
- Szerver port (3000)
- JWT secret kulcs (TITKOS!)
- Frontend URL (CORS-hoz kell)

### MIÉRT .env.example ÉS NEM .env?

```
.env.example  → Példa fájl, bekerül git-be
.env          → Valódi adatok, NEM kerül git-be (titkos!)
```

### HOGYAN HASZNÁLOD?

1. Másold át: `.env.example` → `.env`
2. Szerkeszd meg: Változtasd a `JWT_SECRET`-et valami random szövegre

### KÓD:

**Fájl: `.env.example`** (gyökér mappában)

```env
# Szerver beállítások
PORT=3000
NODE_ENV=development

# JWT Secret (FONTOS: változtasd meg random szövegre!)
# Ezt használjuk a tokenek aláírására
JWT_SECRET=tribal-lords-secret-key-CHANGE-THIS-NOW-12345678

# JWT Token élettartam (7 nap)
JWT_EXPIRES_IN=7d

# Frontend URL (CORS engedélyezéshez)
# Ha a frontend másik címen fut, itt állítsd be
FRONTEND_URL=http://localhost:5173
```

### MAGYARÁZAT:

```bash
PORT=3000
# Szerver melyik porton fusson
# localhost:3000 címen lesz elérhető

NODE_ENV=development
# Környezet típusa
# development = fejlesztés (több log, hibák részletesen)
# production = éles (kevesebb log, biztonságosabb)

JWT_SECRET=...
# NAGYON FONTOS! Ez aláírja a JWT tokeneket
# Ha valaki ismeri ezt, hamisíthat tokeneket!
# MINDIG változtasd meg random szövegre!
# Példa jó érték: "x9Kf2m$Pq8Lz#Wn4Yb7Vg"

JWT_EXPIRES_IN=7d
# Token mennyi ideig érvényes
# 7d = 7 nap
# 24h = 24 óra
# 30m = 30 perc

FRONTEND_URL=http://localhost:5173
# A frontend címe
# Vite default port: 5173
# Create React App default: 3000 (de a backend is 3000, szóval változtasd!)
```

---

## 📄 4. FÁJL: .gitignore (GYÖKÉR)

### MIT CSINÁL EZ A FÁJL?

Megmondja a **git**-nek, hogy mit **NE** version control-oljon.

### MIÉRT FONTOS?

```
node_modules/  → 200 MB, felesleges (npm install újragenerálja)
.env           → Titkos kulcsok! SOHA ne kerüljön git-be!
*.log          → Log fájlok, feleslegesek
```

### KÓD:

**Fájl: `.gitignore`** (gyökér mappában)

```
# Dependencies (node_modules nagyon nagy, felesleges)
node_modules/

# Environment változók (TITKOS adatok!)
.env

# Log fájlok
*.log
npm-debug.log*
yarn-debug.log*

# OS specifikus fájlok
.DS_Store      # macOS
Thumbs.db      # Windows

# IDE beállítások
.vscode/       # VS Code
.idea/         # IntelliJ/WebStorm
*.swp          # Vim
*.swo          # Vim

# Build output (ha lesz)
dist/
build/
```

---

## 📄 5. FÁJL: README.md (GYÖKÉR)

### MIT CSINÁL EZ A FÁJL?

Ez a projekt **"használati utasítása"**. Markdown formátumban.

### MIÉRT FONTOS?

- Újabb fejlesztő csatlakozik → elolvassa, tudja mi ez és hogyan indítsa
- Te magad 3 hónap múlva → emlékeztető

### KÓD:

**Fájl: `README.md`** (gyökér mappában)

```markdown
# 🏰 TRIBAL LORDS BACKEND

Böngészőalapú középkori stratégiai játék backend API - In-memory adattárolással

## 📋 Funkciók

- ✅ User regisztráció és bejelentkezés (JWT)
- ✅ Falu menedzsment (nyersanyagok: fa, agyag, vas)
- ✅ Épület fejlesztés rendszer
- ✅ Valós idejű nyersanyag termelés (WebSocket)
- ✅ Pontszámítás
- ✅ In-memory adattárolás (később PostgreSQL)

## 🚀 Gyors Indítás

### 1. Dependencies telepítése
```bash
npm install
```

### 2. .env fájl létrehozása
```bash
# Windows:
copy .env.example .env

# Mac/Linux:
cp .env.example .env
```

**FONTOS:** Szerkeszd meg a `.env` fájlt és változtasd meg a `JWT_SECRET` értékét!

### 3. Szerver indítása

```bash
# Fejlesztői mód (auto-restart):
npm run dev

# Normál mód:
npm start
```

Szerver fut: **http://localhost:3000**

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register` - Új user regisztrációja
- `POST /api/auth/login` - Bejelentkezés
- `GET /api/auth/me` - Aktuális user adatai (auth required)

### Villages
- `GET /api/villages` - User falvainak listája (auth required)
- `GET /api/villages/:id` - Falu részletei (auth required)
- `PATCH /api/villages/:id` - Falu átnevezése (auth required)

### Buildings
- `GET /api/buildings?villageId=xxx` - Falu épületei (auth required)
- `POST /api/buildings/upgrade` - Épület fejlesztése (auth required)

## 🧪 Tesztelés

### Postman-nel:

1. **Health Check:**
```
GET http://localhost:3000/api/health
```

2. **Regisztráció:**
```
POST http://localhost:3000/api/auth/register
Body: { "username": "teszt", "email": "teszt@email.com", "password": "teszt123" }
```

3. **Bejelentkezés:**
```
POST http://localhost:3000/api/auth/login
Body: { "username": "teszt", "password": "teszt123" }
→ Mentsd el a "token"-t!
```

4. **Falvak lekérése:**
```
GET http://localhost:3000/api/villages
Headers: Authorization: Bearer <token>
```

## ⚠️ Fontos Tudnivalók

### In-Memory Storage
- Minden adat a memóriában van (Map objektumok)
- **Szerver újraindítás = minden adat elvész!**
- Ez egy tanulási verzió, később PostgreSQL-re cseréljük

### Token
- JWT token érvényességi idő: 7 nap (változtatható .env-ben)
- Lejárat után újra be kell jelentkezni

## 🛠️ Technológiai Stack

- **Node.js** - JavaScript runtime
- **Express** - Web framework
- **Socket.IO** - Real-time kommunikáció
- **JWT** - Authentication
- **bcrypt** - Jelszó titkosítás
- **In-Memory** - Adattárolás (Map)

## 📚 Projekt Struktúra

```
tribal-lords-backend/
├── src/
│   ├── config/          # Konstansok, konfigurációk
│   ├── controllers/     # Request handling logika
│   ├── middleware/      # Auth, validáció
│   ├── models/          # Adatmodellek (User, Village, Building)
│   ├── routes/          # API útvonalak
│   ├── services/        # Üzleti logika, számítások
│   ├── utils/           # Segédfüggvények
│   └── server.js        # Fő szerver fájl
├── .env                 # Környezeti változók (git ignore!)
├── .gitignore
├── package.json
└── README.md
```

## 🔄 Következő Lépések (Fejlesztési Roadmap)

1. ✅ Alapvető backend működik (MOST)
2. → PostgreSQL adatbázis hozzáadása
3. → Frontend összekötése
4. → Hadsereg rendszer
5. → Térkép és támadások
6. → Klán rendszer
7. → Deployment (Docker + Cloud)

## 🐛 Hibaelhárítás

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
Ellenőrizd, hogy létezik-e a `.env` fájl és tartalmazza-e a `JWT_SECRET` sort.

## 📞 Support

Ha valami nem működik, ellenőrizd:
1. Node.js verzió: `node --version` (legyen >= 18.0.0)
2. Dependencies telepítve: `node_modules` mappa létezik?
3. `.env` fájl létezik és helyes?
4. Console hibák: nézd meg mit ír a terminal

## 📜 License

MIT License - Használd szabadon!
```

---

## 📄 6. FÁJL: src/config/constants.js

### MIT CSINÁL EZ A FÁJL?

Az **ÖSSZES játék konstansot** egy helyen tárolja:
- Épület költségek
- Termelési ráták
- Formulák (költség növekedés, stb.)
- Kezdő falu alapértékei
- Hibaüzenetek

### MIÉRT FONTOS?

```
❌ ROSSZ: Kódban szétszórva
function upgradeLumber() {
  cost = 50 * 1.26 * level;  // Mi ez a 50? Mi a 1.26?
}

✅ JÓ: Egy helyen
import { BUILDINGS } from './config/constants.js';
cost = BUILDINGS.lumber.baseCost * FORMULAS.costMultiplier * level;
```

**Előnyök:**
- Könnyen módosítható (egy helyen)
- Átlátható (látod mi mit jelent)
- Újrafelhasználható (több helyen is használod)

### KÓD:

**Fájl: `src/config/constants.js`**

```javascript
/**
 * TRIBAL LORDS - JÁTÉK KONSTANSOK
 * 
 * Minden hardcoded érték itt van egy helyen.
 * Ha változtatni akarsz a játékon (pl. drágább épületek),
 * csak ezt a fájlt kell szerkeszteni!
 */

// ════════════════════════════════════════════════════════════════
// ÉPÜLET TÍPUSOK ÉS TULAJDONSÁGAIK
// ════════════════════════════════════════════════════════════════

export const BUILDINGS = {
  // NYERSANYAG TERMELŐ ÉPÜLETEK
  
  lumber: {
    name: 'Fatelep',
    nameEn: 'Lumber Mill',
    baseProduction: 30,  // óránként ennyi fát termel 1. szinten
    baseCost: {          // 1. szintről 2-re fejlesztés költsége
      wood: 50,
      clay: 60,
      iron: 40
    },
    maxLevel: 30
  },
  
  clay: {
    name: 'Agyagbánya',
    nameEn: 'Clay Pit',
    baseProduction: 30,  // óránként ennyi agyagot termel
    baseCost: {
      wood: 65,
      clay: 50,
      iron: 40
    },
    maxLevel: 30
  },
  
  iron: {
    name: 'Vasbánya',
    nameEn: 'Iron Mine',
    baseProduction: 25,  // óránként ennyi vasat termel
    baseCost: {
      wood: 75,
      clay: 65,
      iron: 70
    },
    maxLevel: 30
  },
  
  // TÁMOGATÓ ÉPÜLETEK
  
  headquarters: {
    name: 'Főépület',
    nameEn: 'Headquarters',
    baseCost: {
      wood: 90,
      clay: 80,
      iron: 70
    },
    maxLevel: 30,
    speedBonus: 0.05  // minden szint 5%-kal gyorsítja az építéseket
  },
  
  // KATONAI ÉPÜLETEK
  
  barracks: {
    name: 'Kaszárnya',
    nameEn: 'Barracks',
    baseCost: {
      wood: 200,
      clay: 170,
      iron: 90
    },
    maxLevel: 25
  },
  
  // VÉDELEM
  
  wall: {
    name: 'Palánk',
    nameEn: 'Wall',
    baseCost: {
      wood: 50,
      clay: 100,
      iron: 20
    },
    maxLevel: 20,
    defenseBonus: 0.04  // minden szint 4%-kal növeli a védelmet
  }
};

// ════════════════════════════════════════════════════════════════
// ÉPÜLET FORMULÁK
// ════════════════════════════════════════════════════════════════

export const BUILDING_FORMULAS = {
  // Költség növekedés szintenként
  // Példa: 1. szint: 100, 2. szint: 126, 3. szint: 159
  costMultiplier: 1.26,
  
  // Termelés növekedés szintenként
  // Példa: 1. szint: 30/óra, 2. szint: 36/óra, 3. szint: 43/óra
  productionMultiplier: 1.2,
  
  // Építési idő formulához (később használjuk)
  timeMultiplier: 1.18,
  baseTime: 180  // másodpercben (3 perc)
};

// ════════════════════════════════════════════════════════════════
// KEZDŐ FALU ALAPÉRTÉKEI
// ════════════════════════════════════════════════════════════════

export const STARTING_VILLAGE = {
  // Kezdő nyersanyagok
  resources: {
    wood: 500,   // kezdő fa
    clay: 500,   // kezdő agyag
    iron: 400    // kezdő vas
  },
  
  // Tárolási limitek kezdéskor
  storage: {
    wood: 1000,
    clay: 1000,
    iron: 1000
  },
  
  // Kezdő épületek szintjei
  buildings: {
    lumber: 1,       // Fatelep szint 1
    clay: 1,         // Agyagbánya szint 1
    iron: 1,         // Vasbánya szint 1
    headquarters: 1, // Főépület szint 1
    barracks: 0,     // Kaszárnya nincs még
    wall: 0          // Palánk nincs még
  }
};

// ════════════════════════════════════════════════════════════════
// HTTP STATUS CODES (segédlet)
// ════════════════════════════════════════════════════════════════

export const HTTP_STATUS = {
  OK: 200,                  // Siker
  CREATED: 201,             // Létrehozva (pl. új user)
  BAD_REQUEST: 400,         // Rossz kérés (hiányzó adat)
  UNAUTHORIZED: 401,        // Nincs token / hibás token
  FORBIDDEN: 403,           // Token OK, de nincs jog (pl. más user faluja)
  NOT_FOUND: 404,           // Nem található (pl. village ID nem létezik)
  CONFLICT: 409,            // Ütközés (pl. username már létezik)
  INTERNAL_ERROR: 500       // Szerverhiba
};

// ════════════════════════════════════════════════════════════════
// HIBAÜZENETEK (magyar)
// ════════════════════════════════════════════════════════════════

export const ERRORS = {
  // Auth hibák
  INVALID_CREDENTIALS: 'Hibás felhasználónév vagy jelszó',
  USER_EXISTS: 'Ez a felhasználónév már foglalt',
  EMAIL_EXISTS: 'Ez az email cím már használatban van',
  UNAUTHORIZED: 'Nincs jogosultságod ehhez a művelethez',
  
  // Resource hibák
  INSUFFICIENT_RESOURCES: 'Nincs elég nyersanyag',
  
  // Building hibák
  BUILDING_UPGRADING: 'Ez az épület már fejlesztés alatt áll',
  BUILDING_MAX_LEVEL: 'Az épület elérte a maximum szintet',
  INVALID_BUILDING_TYPE: 'Érvénytelen épület típus',
  
  // Village hibák
  VILLAGE_NOT_FOUND: 'A falu nem található',
  NOT_YOUR_VILLAGE: 'Ez nem a te falvad',
  
  // Általános
  INTERNAL_ERROR: 'Szerverhiba történt'
};

// Default export (importáláshoz)
export default {
  BUILDINGS,
  BUILDING_FORMULAS,
  STARTING_VILLAGE,
  HTTP_STATUS,
  ERRORS
};
```

### MAGYARÁZAT - Miért ilyen struktúra?

```javascript
// 🎯 ÉPÜLET ADATOK OBJEKTUMBAN

lumber: {
  name: 'Fatelep',         // Magyar név (UI-ban megjelenítéshez)
  nameEn: 'Lumber Mill',   // Angol név (később többnyelvűség)
  baseProduction: 30,      // Termelés 1. szinten (óránként)
  baseCost: { ... },       // Költség 1-ről 2-re fejlesztésnél
  maxLevel: 30             // Maximum szint (később limitálás)
}

// MIÉRT JÓ EZ?
// 1. Könnyen bővíthető új épületekkel
// 2. Minden épület ugyanazon struktúrában
// 3. Könnyű keresni/módosítani
```

```javascript
// 🎯 FORMULÁK KONSTANSOKBAN

costMultiplier: 1.26
// Ez azt jelenti: minden szint 26%-kal drágább az előzőnél
// Példa számítás:
// Szint 1→2: 100 * 1.26^0 = 100
// Szint 2→3: 100 * 1.26^1 = 126
// Szint 3→4: 100 * 1.26^2 = 159
// ...
// Szint 10→11: 100 * 1.26^9 = 717

// MIÉRT EZ A SZÁM?
// - Exponenciális növekedés (nem lineáris!)
// - Kiegyensúlyozott játék (nem lesz túl gyors progresszió)
// - Tribal Wars eredeti értéke
```

---

---

## 📄 7. FÁJL: src/server.js ⭐ **A LEGFONTOSABB FÁJL!**

### MIT CSINÁL EZ A FÁJL?

Ez a **backend szíve**! Itt történik:
- Express szerver létrehozása
- Route-ok regisztrálása (melyik URL mit csináljon)
- Middleware-ek beállítása
- WebSocket (Socket.IO) setup
- Szerver indítása

### MIÉRT A LEGFONTOSABB?

```
server.js = Épület alapja
Routes = Szobák
Controllers = Bútorzat
Models = Pince (tárolás)
```

Ha a server.js nem fut, **SEMMI nem működik**!

### HOGYAN MŰKÖDIK?

```
1. Importok (csomagok, route-ok)
   ↓
2. Express app létrehozása
   ↓
3. Middleware-ek (CORS, JSON parser, logger)
   ↓
4. Route-ok regisztrálása (/api/auth, /api/villages, stb.)
   ↓
5. WebSocket setup
   ↓
6. Szerver indítása (PORT 3000)
```

### KÓD:

**Fájl: `src/server.js`**

```javascript
// ════════════════════════════════════════════════════════════════
// IMPORTOK
// ════════════════════════════════════════════════════════════════

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';

// Route importok (később hozzuk létre ezeket)
import authRoutes from './routes/auth.routes.js';
import villageRoutes from './routes/village.routes.js';
import buildingRoutes from './routes/building.routes.js';

// Resource service (nyersanyag frissítés)
import { startResourceUpdater } from './services/resource.service.js';

// ════════════════════════════════════════════════════════════════
// KÖRNYEZETI VÁLTOZÓK BETÖLTÉSE
// ════════════════════════════════════════════════════════════════

dotenv.config();
// Ez beolvassa a .env fájlt
// Ezután elérhető: process.env.PORT, process.env.JWT_SECRET, stb.

// ════════════════════════════════════════════════════════════════
// EXPRESS APP ÉS HTTP SZERVER LÉTREHOZÁSA
// ════════════════════════════════════════════════════════════════

const app = express();
// Ez az Express alkalmazás - kezeli a HTTP kéréseket

const httpServer = createServer(app);
// HTTP szerver (kell a Socket.IO-hoz)

// ════════════════════════════════════════════════════════════════
// SOCKET.IO SETUP (WebSocket - valós idejű kommunikáció)
// ════════════════════════════════════════════════════════════════

const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    methods: ['GET', 'POST']
  }
});

// Socket.IO példány exportálása (más fájlokban is használjuk)
export { io };

// ════════════════════════════════════════════════════════════════
// MIDDLEWARE-EK
// ════════════════════════════════════════════════════════════════
// Middleware = "közvetítő" - minden request előtt lefut

// 1️⃣ CORS - Cross-Origin Resource Sharing
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
// MIT CSINÁL: Engedi, hogy a frontend (másik domain) hívja az API-t
// NÉLKÜLE: "CORS error" hibát kapsz a frontend-en

// 2️⃣ JSON Parser
app.use(express.json());
// MIT CSINÁL: req.body JSON-ná alakítása
// PÉLDA: Request body: '{"username":"peter"}' → req.body.username = "peter"

// 3️⃣ Request Logger (fejlesztéshez hasznos)
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.url}`);
  // KIMENET: [2025-02-16T14:30:00.000Z] POST /api/auth/login
  next(); // Tovább a következő middleware-hez vagy route-hoz
});

// ════════════════════════════════════════════════════════════════
// API ROUTES (ÚTVONALAK)
// ════════════════════════════════════════════════════════════════

app.use('/api/auth', authRoutes);
// Minden /api/auth/* kérés → authRoutes-hoz
// Példa: POST /api/auth/login → authRoutes.js kezeli

app.use('/api/villages', villageRoutes);
// Minden /api/villages/* kérés → villageRoutes-hoz
// Példa: GET /api/villages/123 → villageRoutes.js kezeli

app.use('/api/buildings', buildingRoutes);
// Minden /api/buildings/* kérés → buildingRoutes-hoz
// Példa: POST /api/buildings/upgrade → buildingRoutes.js kezeli

// ════════════════════════════════════════════════════════════════
// HEALTH CHECK ENDPOINT
// ════════════════════════════════════════════════════════════════

app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok',
    message: 'Tribal Lords Backend is running',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(), // Hány másodperce fut a szerver
    environment: process.env.NODE_ENV
  });
});
// MIT CSINÁL: Ellenőrzi, hogy a szerver él-e
// HASZNÁLAT: GET http://localhost:3000/api/health
// VÁLASZ: { "status": "ok", "timestamp": "...", ... }

// ════════════════════════════════════════════════════════════════
// 404 HANDLER (nem létező endpoint)
// ════════════════════════════════════════════════════════════════

app.use((req, res) => {
  res.status(404).json({ 
    error: 'Endpoint not found',
    path: req.url,
    method: req.method,
    message: 'Az API endpoint nem létezik. Ellenőrizd az URL-t!'
  });
});
// MIT CSINÁL: Ha valaki rossz URL-t hív, ezt a választ kapja
// PÉLDA: GET /api/nemletezik → 404 error

// ════════════════════════════════════════════════════════════════
// ERROR HANDLER (minden hibát itt fogunk el)
// ════════════════════════════════════════════════════════════════

app.use((err, req, res, next) => {
  console.error('❌ Error:', err);
  
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
    // Fejlesztésben mutassuk a stack trace-t
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});
// MIT CSINÁL: Ha bármelyik route hibát dob, ide kerül
// PÉLDA: Controller-ben: throw new Error("Hiba!")
//        → Ez a handler fogja el és küldi a választ

// ════════════════════════════════════════════════════════════════
// WEBSOCKET EVENTS (valós idejű kommunikáció)
// ════════════════════════════════════════════════════════════════

io.on('connection', (socket) => {
  // Új kliens csatlakozott
  console.log(`[WebSocket] Client connected: ${socket.id}`);
  
  // 📨 EVENT: User csatlakozik egy falu "room"-hoz
  socket.on('join:village', (villageId) => {
    socket.join(`village:${villageId}`);
    console.log(`[WebSocket] Client ${socket.id} joined village:${villageId}`);
  });
  // MIT CSINÁL: Minden falu egy "room" (szoba)
  // Ha user csatlakozik → csak neki küldjük a frissítéseket
  
  // 📨 EVENT: User elhagyja a falut
  socket.on('leave:village', (villageId) => {
    socket.leave(`village:${villageId}`);
    console.log(`[WebSocket] Client ${socket.id} left village:${villageId}`);
  });
  
  // 📨 EVENT: Kliens lecsatlakozott
  socket.on('disconnect', () => {
    console.log(`[WebSocket] Client disconnected: ${socket.id}`);
  });
});

// HOGYAN MŰKÖDIK A WEBSOCKET?
// 1. Frontend: socket.emit('join:village', '123')
// 2. Backend: socket.on('join:village', ...) → csatlakozás
// 3. Backend másodpercenként: io.to('village:123').emit('resources:update', {...})
// 4. Frontend: socket.on('resources:update', ...) → UI frissítés

// ════════════════════════════════════════════════════════════════
// SZERVER INDÍTÁS
// ════════════════════════════════════════════════════════════════

const PORT = process.env.PORT || 3000;

httpServer.listen(PORT, () => {
  // Ez a blokk fut le, amikor a szerver elindul
  
  console.log('\n═══════════════════════════════════════════════════════════');
  console.log('🏰 TRIBAL LORDS BACKEND');
  console.log('═══════════════════════════════════════════════════════════');
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 API: http://localhost:${PORT}/api`);
  console.log(`🏥 Health: http://localhost:${PORT}/api/health`);
  console.log(`🔌 WebSocket: ws://localhost:${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`💾 Storage: IN-MEMORY (session-based)`);
  console.log('═══════════════════════════════════════════════════════════');
  console.log('📋 Available endpoints:');
  console.log('   POST   /api/auth/register');
  console.log('   POST   /api/auth/login');
  console.log('   GET    /api/auth/me');
  console.log('   GET    /api/villages');
  console.log('   GET    /api/villages/:id');
  console.log('   PATCH  /api/villages/:id');
  console.log('   GET    /api/buildings');
  console.log('   POST   /api/buildings/upgrade');
  console.log('═══════════════════════════════════════════════════════════\n');
  
  // 🚀 Resource updater indítása (valós idejű nyersanyag termelés)
  startResourceUpdater(io);
});

// ════════════════════════════════════════════════════════════════
// GRACEFUL SHUTDOWN (biztonságos leállítás)
// ════════════════════════════════════════════════════════════════

process.on('SIGTERM', () => {
  console.log('⚠️  SIGTERM signal received: closing HTTP server');
  httpServer.close(() => {
    console.log('✅ HTTP server closed');
  });
});
// MIT CSINÁL: Ha valaki Ctrl+C-vel leállítja a szervert,
// szépen bezárja a kapcsolatokat (nem hagyja félbe a requesteket)

// ════════════════════════════════════════════════════════════════
// EXPORT
// ════════════════════════════════════════════════════════════════

export default app;
// Exportáljuk ha tesztelni akarjuk
```

### RÉSZLETES MAGYARÁZAT - MIDDLEWARE SORREND:

```javascript
// ⚠️ A SORREND FONTOS!

app.use(cors());           // 1. CORS először
app.use(express.json());   // 2. JSON parser másodszor
app.use(logger);           // 3. Logger harmadszor

app.use('/api/auth', ...); // 4. Routes negyedszer

app.use(404handler);       // 5. 404 ötödször
app.use(errorHandler);     // 6. Error handler UTOLJÁRA

// MIÉRT?
// Ha a JSON parser UTÁN lenne a CORS → hibás sorrend
// Ha az error handler ELŐBB lenne a routes-nál → nem fogná el a route hibákat
```

### RÉSZLETES MAGYARÁZAT - WEBSOCKET ROOMS:

```javascript
// 🏠 ROOM KONCEPCIÓ

// Probléma: 1000 user, mindegyik más faluban
// Rossz megoldás: Mindenkinek küldjük az összes falu frissítését
// → Rengeteg felesleges adat!

// Jó megoldás: Minden falu egy "room" (szoba)
socket.join('village:123');
// → User csak a saját faluja frissítéseit kapja

// Broadcast csak egy room-ba:
io.to('village:123').emit('resources:update', {...});
// → Csak akik a 'village:123' room-ban vannak, kapják meg

// ELŐNY:
// - Kevesebb adat
// - Gyorsabb
// - Skálázható
```

---

## 📄 8. FÁJL: src/middleware/auth.middleware.js

### MIT CSINÁL EZ A FÁJL?

Ez egy **"kapuőr"** - minden védett route előtt ellenőrzi a JWT tokent.

### MIKOR HASZNÁLJUK?

```javascript
// VÉDETT ROUTE (kell token):
router.get('/api/villages', authMiddleware, getVillages);
                           ↑ Ez a middleware lefut ELŐBB

// NEM VÉDETT (nem kell token):
router.post('/api/auth/login', login);
                                ↑ Nincs middleware
```

### HOGYAN MŰKÖDIK?

```
1. User küld egy kérést: GET /api/villages
   Headers: Authorization: Bearer eyJhbGci...

2. authMiddleware lefut:
   - Van Authorization header?
   - Érvényes a token?
   - Token lejárt?

3. Ha OK:
   - req.userId = decoded.id (hozzáadjuk a user ID-t)
   - next() → folytatódik a controller

4. Ha HIBA:
   - 401 Unauthorized válasz
   - STOP, nem megy tovább
```

### KÓD:

**Fájl: `src/middleware/auth.middleware.js`**

```javascript
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
```

### RÉSZLETES MAGYARÁZAT - JWT Verify:

```javascript
// 🔐 HOGYAN MŰKÖDIK A jwt.verify()?

const token = "eyJhbGci...";
const decoded = jwt.verify(token, process.env.JWT_SECRET);

// 1. TOKEN STRUKTÚRA (3 rész, pont-tal elválasztva):
//    eyJhbGci... . eyJpZCI... . SflKxw...
//    ↑ Header    ↑ Payload  ↑ Signature

// 2. VERIFY LÉPÉSEI:
//    a) Dekódolja a header-t és payload-ot (base64)
//    b) Ellenőrzi az aláírást (JWT_SECRET-tel újra aláírja és összehasonlítja)
//    c) Ellenőrzi a lejárati időt (exp mező)

// 3. HA VALID:
//    → decoded = { id: "user-123", iat: ..., exp: ... }

// 4. HA INVALID:
//    → throw new JsonWebTokenError("...")
//    → throw new TokenExpiredError("...")
```

### RÉSZLETES MAGYARÁZAT - Miért nem session?

```javascript
// ❌ RÉGI MÓD: Session-based auth

app.post('/login', (req, res) => {
  // User belép
  req.session.userId = user.id;  // Szerver tárol memóriában
  res.json({ message: 'OK' });
});

app.get('/villages', (req, res) => {
  const userId = req.session.userId;  // Szerver memóriából olvassa
  // ...
});

// PROBLÉMA:
// - Szerver tárol minden session-t (sok memória!)
// - Load balancer probléma (több szerver esetén)
// - Horizontális skálázás nehéz

// ✅ ÚJ MÓD: JWT-based auth

app.post('/login', (req, res) => {
  const token = jwt.sign({ id: user.id }, JWT_SECRET);
  res.json({ token });  // Kliens tárolja!
});

app.get('/villages', authMiddleware, (req, res) => {
  const userId = req.userId;  // Middleware dekódolta a tokenből
  // ...
});

// ELŐNY:
// - Szerver NEM tárol semmit (stateless!)
// - Könnyen skálázható
// - Load balancer működik
```

---

**FOLYTATJAM A MODELS-EKKEL (User, Village, Building)?** 🚀

Ezek az adatkezelő fájlok - nagyon fontosak!

---

## 📄 9. FÁJL: src/models/User.js

### MIT CSINÁL EZ A FÁJL?

Ez a **User adatmodell** - kezeli az összes user-rel kapcsolatos adatműveletet:
- User létrehozása (create)
- User keresése (find)
- Jelszó ellenőrzése (comparePassword)
- User törlése (delete)

### IN-MEMORY STORAGE - Hogyan?

```javascript
const users = new Map();
// Map = JavaScript adatstruktúra
// Kulcs-érték párok: { "user-123": { id, username, ... } }

// PÉLDA:
users.set("user-123", { id: "user-123", username: "peter", ... });
users.get("user-123");  // → { id: "user-123", username: "peter", ... }
```

### MIÉRT CLASS?

```javascript
// ❌ Objektumokkal:
function createUser(data) { ... }
function findUser(id) { ... }
// Szétszórt függvények

// ✅ Class-al:
class User {
  static create(data) { ... }
  static findById(id) { ... }
}
// Összetartozó funkciók egy helyen
```

### KÓD:

**Fájl: `src/models/User.js`**

```javascript
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcrypt';

/**
 * USER MODEL - In-Memory
 * 
 * FIGYELEM: In-memory storage!
 * - Minden adat memóriában (Map)
 * - Szerver újraindítás → minden adat elvész!
 * - Később PostgreSQL-re cseréljük
 */

// ════════════════════════════════════════════════════════════════
// IN-MEMORY STORAGE
// ════════════════════════════════════════════════════════════════

const users = new Map();
// Map adatstruktúra: kulcs-érték párok
// Kulcs: user.id (UUID)
// Érték: User objektum

// ════════════════════════════════════════════════════════════════
// USER CLASS
// ════════════════════════════════════════════════════════════════

export class User {
  constructor(data) {
    this.id = data.id || uuidv4();  // UUID generálás ha nincs ID
    this.username = data.username;
    this.email = data.email;
    this.passwordHash = data.passwordHash;  // Hash-elt jelszó!
    this.createdAt = data.createdAt || new Date();
    this.lastLogin = data.lastLogin || null;
  }
  
  // ════════════════════════════════════════════════════════════════
  // CREATE METHODS
  // ════════════════════════════════════════════════════════════════
  
  /**
   * Új user létrehozása
   * 
   * @param {Object} userData - { username, email, password }
   * @returns {User} Létrehozott user
   */
  static async create({ username, email, password }) {
    // ──────────────────────────────────────────────────────
    // 1️⃣ ELLENŐRZÉSEK
    // ──────────────────────────────────────────────────────
    
    // Username már létezik?
    if (this.findByUsername(username)) {
      throw new Error('Ez a felhasználónév már foglalt');
    }
    
    // Email már létezik?
    if (this.findByEmail(email)) {
      throw new Error('Ez az email cím már használatban van');
    }
    
    // ──────────────────────────────────────────────────────
    // 2️⃣ JELSZÓ HASH-ELÉSE
    // ──────────────────────────────────────────────────────
    
    const passwordHash = await bcrypt.hash(password, 10);
    // MIT CSINÁL:
    // - password: "titkos123"
    // - bcrypt.hash → "$2b$10$X7eFz..."  (hash)
    // 
    // MIÉRT KELL:
    // - SOHA ne tárolj jelszót plain text-ben!
    // - Ha valaki belemegy az adatbázisba, nem látja a jelszót
    // 
    // SALT ROUNDS (10):
    // - Minél nagyobb, annál lassabb, de biztonságosabb
    // - 10 = jó egyensúly (gyors + biztonságos)
    
    // ──────────────────────────────────────────────────────
    // 3️⃣ USER OBJEKTUM LÉTREHOZÁSA
    // ──────────────────────────────────────────────────────
    
    const user = new User({
      username,
      email,
      passwordHash  // NEM a sima jelszót, hanem a hash-t tároljuk!
    });
    
    // ──────────────────────────────────────────────────────
    // 4️⃣ MENTÉS IN-MEMORY STORAGE-BA
    // ──────────────────────────────────────────────────────
    
    users.set(user.id, user);
    // Map-be mentés: kulcs = user.id, érték = user objektum
    
    console.log(`[User] Created: ${user.username} (${user.id})`);
    
    return user;
  }
  
  // ════════════════════════════════════════════════════════════════
  // READ METHODS (Lekérdezések)
  // ════════════════════════════════════════════════════════════════
  
  /**
   * User keresése ID alapján
   */
  static findById(id) {
    return users.get(id) || null;
    // users.get(id) → user objektum vagy undefined
    // || null → ha nincs, akkor null-t adunk vissza
  }
  
  /**
   * User keresése username alapján
   */
  static findByUsername(username) {
    return Array.from(users.values())
      .find(user => user.username === username) || null;
    
    // MAGYARÁZAT:
    // users = Map { "id1": user1, "id2": user2, ... }
    // users.values() → Iterator [user1, user2, ...]
    // Array.from(...) → Tömb [user1, user2, ...]
    // .find(user => ...) → Első user ahol username egyezik
  }
  
  /**
   * User keresése email alapján
   */
  static findByEmail(email) {
    return Array.from(users.values())
      .find(user => user.email === email) || null;
  }
  
  /**
   * Összes user
   */
  static findAll() {
    return Array.from(users.values());
  }
  
  // ════════════════════════════════════════════════════════════════
  // UPDATE METHODS
  // ════════════════════════════════════════════════════════════════
  
  /**
   * Last login időpontjának frissítése
   */
  static updateLastLogin(id) {
    const user = users.get(id);
    if (user) {
      user.lastLogin = new Date();
      users.set(id, user);  // Frissített user visszamentése
    }
    return user;
  }
  
  // ════════════════════════════════════════════════════════════════
  // PASSWORD METHODS
  // ════════════════════════════════════════════════════════════════
  
  /**
   * Jelszó ellenőrzése
   * 
   * @param {string} password - Plain text jelszó
   * @returns {boolean} Helyes-e a jelszó
   */
  async comparePassword(password) {
    return bcrypt.compare(password, this.passwordHash);
    
    // MIT CSINÁL:
    // - password: "titkos123" (amit a user beírt)
    // - this.passwordHash: "$2b$10$X7eFz..." (ami az adatbázisban van)
    // - bcrypt.compare → true vagy false
    // 
    // HOGYAN:
    // - bcrypt újra hash-eli a password-ot ugyanazzal a salt-tal
    // - Összehasonlítja a két hash-t
    // - Ha egyezik → true (helyes jelszó)
  }
  
  // ════════════════════════════════════════════════════════════════
  // DELETE METHODS
  // ════════════════════════════════════════════════════════════════
  
  /**
   * User törlése
   */
  static delete(id) {
    return users.delete(id);
    // Map.delete() → true ha létezett és töröltük, false ha nem létezett
  }
  
  // ════════════════════════════════════════════════════════════════
  // UTILITY METHODS
  // ════════════════════════════════════════════════════════════════
  
  /**
   * User JSON formátumban (jelszó NÉLKÜL!)
   */
  toJSON() {
    return {
      id: this.id,
      username: this.username,
      email: this.email,
      // passwordHash NINCS benne! (biztonság)
      createdAt: this.createdAt,
      lastLogin: this.lastLogin
    };
  }
  
  /**
   * User-ek száma
   */
  static count() {
    return users.size;
  }
  
  /**
   * Összes adat törlése (teszt célokra)
   */
  static clearAll() {
    users.clear();
    console.log('[User] All users cleared');
  }
}

export default User;
```

### RÉSZLETES MAGYARÁZAT - bcrypt:

```javascript
// 🔐 BCRYPT HASH-ELÉS

// 1️⃣ REGISZTRÁCIÓNÁL:
const password = "titkos123";
const hash = await bcrypt.hash(password, 10);
// → "$2b$10$N9qo8uLOickgx2ZMRZoMye.dxUxF7wGw/R.kJ5e.2uQ"

// 2️⃣ BEJELENTKEZÉSNÉL:
const password = "titkos123";  // User beírja
const hash = "$2b$10$N9qo8uLOickgx2ZMRZoMye...";  // Adatbázisban
const isValid = await bcrypt.compare(password, hash);
// → true (helyes jelszó)

// ❌ ROSSZ JELSZÓ:
const password = "rossz";
const isValid = await bcrypt.compare(password, hash);
// → false (hibás jelszó)

// 🎯 MIÉRT BIZTONSÁGOS?
// - Azonos jelszóból is más hash lesz (random salt)
// - Vissza nem fejthető (one-way hash)
// - Időigényes (brute force védelem)
```

### RÉSZLETES MAGYARÁZAT - Map vs Array:

```javascript
// ❌ ARRAY-VAL (lassú):
const users = [
  { id: "1", username: "peter" },
  { id: "2", username: "anna" }
];

// Keresés ID alapján:
const user = users.find(u => u.id === "1");
// O(n) - végig kell nézni az egész tömböt

// ✅ MAP-PAL (gyors):
const users = new Map([
  ["1", { id: "1", username: "peter" }],
  ["2", { id: "2", username: "anna" }]
]);

// Keresés ID alapján:
const user = users.get("1");
// O(1) - azonnali lookup

// ELŐNY:
// - 1000 user esetén is instant
// - Kevesebb memória
// - Tisztább kód
```

---

## 📄 10. FÁJL: src/models/Village.js

### MIT CSINÁL EZ A FÁJL?

A **Village (falu) adatmodell** - minden falu adatát és műveletét kezeli:
- Falu létrehozása
- Nyersanyagok kezelése
- Termelési ráták
- Pontszám

### VILLAGE ADATSTRUKTÚRA:

```javascript
{
  id: "village-abc123",
  userId: "user-xyz789",
  name: "Péter falva",
  x: 45,  // Koordináta
  y: 67,
  resources: {
    wood: 1500,
    clay: 1200,
    iron: 900
  },
  storage: {
    wood: 10000,
    clay: 10000,
    iron: 10000
  },
  production: {
    wood: 62,   // óránként
    clay: 58,
    iron: 45
  },
  points: 156,
  lastResourceUpdate: Date,
  createdAt: Date
}
```

### KÓD:

**Fájl: `src/models/Village.js`**

```javascript
import { v4 as uuidv4 } from 'uuid';
import { STARTING_VILLAGE } from '../config/constants.js';

/**
 * VILLAGE MODEL - In-Memory
 */

// ════════════════════════════════════════════════════════════════
// IN-MEMORY STORAGE
// ════════════════════════════════════════════════════════════════

const villages = new Map();

// ════════════════════════════════════════════════════════════════
// VILLAGE CLASS
// ════════════════════════════════════════════════════════════════

export class Village {
  constructor(data) {
    this.id = data.id || uuidv4();
    this.userId = data.userId;  // Melyik user-é a falu
    this.name = data.name;
    this.x = data.x;  // Térkép koordináta
    this.y = data.y;
    
    // Nyersanyagok (aktuális mennyiség)
    this.resources = data.resources || { ...STARTING_VILLAGE.resources };
    
    // Tárolási limit
    this.storage = data.storage || { ...STARTING_VILLAGE.storage };
    
    // Termelési ráták (óránként)
    this.production = data.production || {
      wood: 30,
      clay: 30,
      iron: 25
    };
    
    // Pontszám
    this.points = data.points || 20;
    
    // Timestamps
    this.lastResourceUpdate = data.lastResourceUpdate || new Date();
    this.createdAt = data.createdAt || new Date();
  }
  
  // ════════════════════════════════════════════════════════════════
  // CREATE METHODS
  // ════════════════════════════════════════════════════════════════
  
  /**
   * Új falu létrehozása
   */
  static create({ userId, name, x, y }) {
    const village = new Village({
      userId,
      name: name || 'Falu',
      x: x || Math.floor(Math.random() * 100),  // Random koordináta ha nincs
      y: y || Math.floor(Math.random() * 100)
    });
    
    villages.set(village.id, village);
    
    console.log(`[Village] Created: ${village.name} (${village.id}) for user ${userId}`);
    
    return village;
  }
  
  // ════════════════════════════════════════════════════════════════
  // READ METHODS
  // ════════════════════════════════════════════════════════════════
  
  /**
   * Falu ID alapján
   */
  static findById(id) {
    return villages.get(id) || null;
  }
  
  /**
   * User összes faluja
   */
  static findByUserId(userId) {
    return Array.from(villages.values())
      .filter(village => village.userId === userId);
    
    // PÉLDA:
    // villages = [village1(user1), village2(user1), village3(user2)]
    // findByUserId("user1") → [village1, village2]
  }
  
  /**
   * Falu koordináta alapján
   */
  static findByCoordinates(x, y) {
    return Array.from(villages.values())
      .find(village => village.x === x && village.y === y) || null;
  }
  
  /**
   * Összes falu
   */
  static findAll() {
    return Array.from(villages.values());
  }
  
  // ════════════════════════════════════════════════════════════════
  // UPDATE METHODS
  // ════════════════════════════════════════════════════════════════
  
  /**
   * Falu név frissítése
   */
  static updateName(id, newName) {
    const village = villages.get(id);
    if (village) {
      village.name = newName;
      villages.set(id, village);
      console.log(`[Village] Name updated: ${id} -> ${newName}`);
    }
    return village;
  }
  
  /**
   * Nyersanyagok frissítése
   */
  static updateResources(id, resources) {
    const village = villages.get(id);
    if (village) {
      // Nyersanyagok limitálása (minimum 0, maximum storage)
      village.resources = {
        wood: Math.max(0, Math.min(resources.wood, village.storage.wood)),
        clay: Math.max(0, Math.min(resources.clay, village.storage.clay)),
        iron: Math.max(0, Math.min(resources.iron, village.storage.iron))
      };
      village.lastResourceUpdate = new Date();
      villages.set(id, village);
    }
    return village;
  }
  
  /**
   * Termelési ráta frissítése
   */
  static updateProduction(id, production) {
    const village = villages.get(id);
    if (village) {
      village.production = { ...village.production, ...production };
      villages.set(id, village);
    }
    return village;
  }
  
  /**
   * Pontszám frissítése
   */
  static updatePoints(id, points) {
    const village = villages.get(id);
    if (village) {
      village.points = points;
      villages.set(id, village);
    }
    return village;
  }
  
  // ════════════════════════════════════════════════════════════════
  // DELETE METHODS
  // ════════════════════════════════════════════════════════════════
  
  /**
   * Falu törlése
   */
  static delete(id) {
    return villages.delete(id);
  }
  
  // ════════════════════════════════════════════════════════════════
  // UTILITY METHODS
  // ════════════════════════════════════════════════════════════════
  
  /**
   * JSON formátum
   */
  toJSON() {
    return {
      id: this.id,
      userId: this.userId,
      name: this.name,
      x: this.x,
      y: this.y,
      resources: this.resources,
      storage: this.storage,
      production: this.production,
      points: this.points,
      lastResourceUpdate: this.lastResourceUpdate,
      createdAt: this.createdAt
    };
  }
  
  /**
   * Összes falu száma
   */
  static count() {
    return villages.size;
  }
  
  /**
   * Összes adat törlése
   */
  static clearAll() {
    villages.clear();
    console.log('[Village] All villages cleared');
  }
}

export default Village;
```

### RÉSZLETES MAGYARÁZAT - Math.max/min:

```javascript
// 🎯 NYERSANYAG LIMITÁLÁS

// Probléma: User módosíthatná a nyersanyagot negatívra vagy túl nagyra
resources.wood = -100;  // ❌ Hibás
resources.wood = 999999999;  // ❌ Túl sok (storage limit)

// Megoldás: Math.max és Math.min
Math.max(0, Math.min(value, storage))

// PÉLDA 1: Negatív érték
value = -50
Math.min(-50, 10000) = -50
Math.max(0, -50) = 0  ✅ Nem lehet negatív

// PÉLDA 2: Túl nagy érték
value = 15000
Math.min(15000, 10000) = 10000
Math.max(0, 10000) = 10000  ✅ Storage limiten belül

// PÉLDA 3: Normál érték
value = 5000
Math.min(5000, 10000) = 5000
Math.max(0, 5000) = 5000  ✅ OK
```

---

**FOLYTATJAM A BUILDING MODEL-LEL ÉS AZTÁN A CONTROLLERS-EKKEL?** 🎯

A Building model hasonló, majd jönnek a Controllers (ez a logika!)!