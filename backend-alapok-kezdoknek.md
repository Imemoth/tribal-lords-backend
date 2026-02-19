# 🎓 BACKEND ALAPOK KEZDŐKNEK
## Egyszerű magyarázattal, hogy megértsd mi történik

---

## 🤔 MI AZ A BACKEND?

Képzeld el így:

```
┌─────────────────────────────────────────────────────────────────┐
│                         ÉTTEREM ANALÓGIA                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  👤 VENDÉG (User/Frontend)                                       │
│     ↓                                                            │
│  📋 PINCÉR (API/Backend)                                         │
│     ↓                                                            │
│  👨‍🍳 SZAKÁCS (Business Logic/Services)                           │
│     ↓                                                            │
│  🏪 KAMRA (Database)                                             │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### A folyamat:

1. **Te (Frontend/React)** = Vendég az étteremben
2. **API (Backend endpoint)** = Pincér, aki felveszi a rendelést
3. **Business Logic (Controller/Service)** = Szakács, aki elkészíti az ételt
4. **Database (PostgreSQL)** = Kamra, ahol az alapanyagok vannak

### Példa a gyakorlatban:

```
USER ACTION:
"Fejlesztem a Fatelep-et 2-ről 3-ra"
       ↓
FRONTEND (React):
Küld egy kérést: POST /api/buildings/upgrade
       ↓
BACKEND (API):
Fogadja a kérést, ellenőrzi
       ↓
CONTROLLER:
"Van elég nyersanyag? Rendben, levonás!"
       ↓
DATABASE:
Elmenti: Fatelep szint = 3, nyersanyagok csökkentve
       ↓
BACKEND VÁLASZ:
{ success: true, newLevel: 3 }
       ↓
FRONTEND:
Megjeleníti: "Fatelep fejlesztve 3. szintre!"
```

---

## 🌐 MI AZ AZ API?

**API = Application Programming Interface**

Egyszerűen: **Olyan mint egy étlap az étteremben**

```
ÉTLAP (API DOKUMENTÁCIÓ):
┌─────────────────────────────────────────┐
│ 🍕 Pizza Margherita ........ 1200 Ft   │  →  GET /api/villages
│ 🍔 Hamburger ............... 1500 Ft   │  →  POST /api/buildings/upgrade
│ 🥗 Cézár saláta ............ 900 Ft    │  →  GET /api/troops
└─────────────────────────────────────────┘
```

### API Endpoint példák játékunkban:

```javascript
// ÉPÜLET FEJLESZTÉS
POST http://localhost:3000/api/buildings/upgrade
Request Body: {
  "villageId": "123",
  "buildingType": "lumber"
}
Response: {
  "success": true,
  "newLevel": 3,
  "cost": { wood: 100, clay: 120, iron: 80 }
}

// FALU LEKÉRÉSE
GET http://localhost:3000/api/villages/123
Response: {
  "id": "123",
  "name": "Saját falum",
  "resources": {
    "wood": 1500,
    "clay": 1200,
    "iron": 900
  },
  "buildings": [...]
}

// BEJELENTKEZÉS
POST http://localhost:3000/api/auth/login
Request Body: {
  "username": "peter",
  "password": "titkos123"
}
Response: {
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "456",
    "username": "peter"
  }
}
```

---

## 🗄️ MI AZ AZ ADATBÁZIS (DATABASE)?

**Adatbázis = Szervezett fiókok, ahol minden adat tárolva van**

Képzeld el mint egy Excel táblázat - de sokkal erősebb!

### PostgreSQL Táblák a játékban:

```sql
┌─────────────────────────────────────────────────────────────────┐
│                         USERS TÁBLA                              │
├──────┬────────────┬──────────────────┬────────────┬────────────┤
│  id  │  username  │      email       │  password  │ created_at │
├──────┼────────────┼──────────────────┼────────────┼────────────┤
│  1   │   peter    │  peter@email.hu  │  ********* │ 2025-01-15 │
│  2   │   anna     │  anna@email.hu   │  ********* │ 2025-01-16 │
│  3   │   bela     │  bela@email.hu   │  ********* │ 2025-01-17 │
└──────┴────────────┴──────────────────┴────────────┴────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                        VILLAGES TÁBLA                            │
├──────┬─────────┬──────────────┬──────┬──────┬──────┬───────────┤
│  id  │ user_id │     name     │  x   │  y   │ wood │   clay    │
├──────┼─────────┼──────────────┼──────┼──────┼──────┼───────────┤
│ 101  │    1    │ Péter falva  │  45  │  67  │ 1500 │   1200    │
│ 102  │    2    │ Anna városa  │  46  │  67  │ 2300 │   1800    │
│ 103  │    1    │ 2. falum     │  44  │  68  │  800 │    600    │
└──────┴─────────┴──────────────┴──────┴──────┴──────┴───────────┘

┌─────────────────────────────────────────────────────────────────┐
│                       BUILDINGS TÁBLA                            │
├──────┬────────────┬───────────────┬───────┬──────────────────────┤
│  id  │ village_id │ building_type │ level │   is_upgrading       │
├──────┼────────────┼───────────────┼───────┼──────────────────────┤
│ 501  │    101     │    lumber     │   5   │       false          │
│ 502  │    101     │     clay      │   4   │       false          │
│ 503  │    101     │     iron      │   3   │       true           │
│ 504  │    102     │    lumber     │   7   │       false          │
└──────┴────────────┴───────────────┴───────┴──────────────────────┘
```

### Hogyan használjuk?

```javascript
// SQL QUERY példa - Falu lekérése
const result = await db.query(`
  SELECT * FROM villages 
  WHERE user_id = $1 AND id = $2
`, [userId, villageId]);

const village = result.rows[0];
console.log(village.name); // "Péter falva"
console.log(village.wood);  // 1500

// SQL UPDATE - Nyersanyag levonás
await db.query(`
  UPDATE villages 
  SET wood = wood - $1, 
      clay = clay - $2, 
      iron = iron - $3
  WHERE id = $4
`, [100, 120, 80, villageId]);
```

---

## 🏗️ BACKEND ARCHITEKTÚRA (RÉTEGEK)

```
┌─────────────────────────────────────────────────────────────────┐
│                      BACKEND RÉTEGEK                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  1️⃣ ROUTES (Útvonalak)                                          │
│     "Melyik URL-re mi történjen?"                               │
│     POST /api/buildings/upgrade → buildingController.upgrade()  │
│                                                                  │
│  2️⃣ MIDDLEWARE (Közvetítők)                                     │
│     "Ellenőrizd, hogy be van-e jelentkezve!"                    │
│     Token check, validáció, error handling                      │
│                                                                  │
│  3️⃣ CONTROLLERS (Vezérlők)                                      │
│     "Koordinálják a folyamatot"                                 │
│     Fogadja a request-et, meghívja a service-t, válaszol       │
│                                                                  │
│  4️⃣ SERVICES (Üzleti Logika)                                    │
│     "Itt történik a számítás és döntés"                         │
│     Költség kalkuláció, nyersanyag ellenőrzés, stb.            │
│                                                                  │
│  5️⃣ MODELS (Adatmodellek)                                       │
│     "Adatbázis műveletek"                                       │
│     CRUD: Create, Read, Update, Delete                          │
│                                                                  │
│  6️⃣ DATABASE (Adatbázis)                                        │
│     "Minden adat itt van tárolva"                               │
│     PostgreSQL táblák                                           │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### PÉLDA A TELJES FOLYAMATRA:

**Felhasználó megnyomja: "Fejlesztés" gombot a Fatelepen**

```javascript
// 1️⃣ ROUTE (src/routes/building.routes.js)
router.post('/upgrade', authMiddleware, buildingController.upgrade);
//                      ↑ Előbb ellenőrzi a tokent

// 2️⃣ MIDDLEWARE (src/middleware/auth.middleware.js)
export const authMiddleware = (req, res, next) => {
  // Token ellenőrzés
  const token = req.headers.authorization;
  if (!token) return res.status(401).json({ error: 'Nem vagy bejelentkezve' });
  
  // Token dekódolás
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  req.userId = decoded.id; // userId hozzáadása a request-hez
  next(); // Mehet tovább a controller-hez
};

// 3️⃣ CONTROLLER (src/controllers/building.controller.js)
export const upgrade = async (req, res) => {
  try {
    const { villageId, buildingType } = req.body;
    const userId = req.userId; // Middleware-ből kapjuk
    
    // Service meghívása (itt van az üzleti logika)
    const result = await buildingService.upgradeBuilding(
      userId, 
      villageId, 
      buildingType
    );
    
    // Válasz küldése
    res.json({ success: true, ...result });
    
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// 4️⃣ SERVICE (src/services/building.service.js)
export const upgradeBuilding = async (userId, villageId, buildingType) => {
  // 1. Ellenőrizzük, hogy a faluja-e
  const village = await Village.findById(villageId);
  if (village.user_id !== userId) {
    throw new Error('Ez nem a te falvad!');
  }
  
  // 2. Épület lekérése
  const building = await Building.findOne(villageId, buildingType);
  
  // 3. Költség számítása
  const cost = calculateUpgradeCost(buildingType, building.level);
  
  // 4. Ellenőrizzük a nyersanyagokat
  if (village.wood < cost.wood || 
      village.clay < cost.clay || 
      village.iron < cost.iron) {
    throw new Error('Nincs elég nyersanyag!');
  }
  
  // 5. Nyersanyagok levonása
  await Village.updateResources(villageId, {
    wood: village.wood - cost.wood,
    clay: village.clay - cost.clay,
    iron: village.iron - cost.iron
  });
  
  // 6. Épület szint növelése
  await Building.incrementLevel(building.id);
  
  // 7. Pontok újraszámítása
  const newPoints = await calculateVillagePoints(villageId);
  await Village.updatePoints(villageId, newPoints);
  
  return {
    newLevel: building.level + 1,
    newPoints: newPoints,
    remainingResources: {
      wood: village.wood - cost.wood,
      clay: village.clay - cost.clay,
      iron: village.iron - cost.iron
    }
  };
};

// 5️⃣ MODEL (src/models/Village.js)
export class Village {
  static async findById(id) {
    const result = await db.query(
      'SELECT * FROM villages WHERE id = $1',
      [id]
    );
    return result.rows[0];
  }
  
  static async updateResources(id, resources) {
    await db.query(
      `UPDATE villages 
       SET wood = $1, clay = $2, iron = $3 
       WHERE id = $4`,
      [resources.wood, resources.clay, resources.iron, id]
    );
  }
  
  static async updatePoints(id, points) {
    await db.query(
      'UPDATE villages SET points = $1 WHERE id = $2',
      [points, id]
    );
  }
}
```

---

## 🔐 MI AZ A JWT (JSON Web Token)?

**JWT = Digitális "belépőkártya"**

```
HOGYAN MŰKÖDIK A BEJELENTKEZÉS?

1. User bejelentkezik:
   POST /api/auth/login
   { username: "peter", password: "titkos123" }

2. Backend ellenőrzi:
   - Username létezik? ✓
   - Jelszó helyes? ✓

3. Backend generál egy TOKEN-t:
   "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjEyMyIsInVzZXJuYW1lIjoicGV0ZXIifQ.xyz..."
   
   Ez a token tartalmazza:
   - User ID
   - Username
   - Lejárati idő (pl. 7 nap)

4. Frontend elmenti a tokent:
   localStorage.setItem('token', token);

5. Minden következő kérésnél elküldi:
   Headers: {
     Authorization: "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
   }

6. Backend ellenőrzi:
   - Token érvényes? ✓
   - Nem járt le? ✓
   - OK, ez a "peter" user, engedélyezve!
```

### Miért jobb mint a session?

```
RÉGI MÓD (Session):
User bejelentkezik → Server tárolja memóriában "peter bejelentkezve"
❌ Sok memória több ezer user-rel
❌ Load balancer problémák

ÚJ MÓD (JWT):
User bejelentkezik → Server ad egy aláírt tokent → User tárolja
✅ Server nem tárol semmit
✅ Könnyen skálázható
✅ Működik több szerveren is
```

---

## 🔌 MI AZ A WEBSOCKET?

**WebSocket = Telefonvonal a kliens és szerver között**

```
RÉGI MÓD (HTTP Request):
Frontend: "Van új üzenetem?" 
Backend: "Nincs"
... 5 másodperc múlva ...
Frontend: "Van új üzenetem?"
Backend: "Nincs"
... 5 másodperc múlva ...
Frontend: "Van új üzenetem?"
Backend: "Igen, itt van!"

❌ Pazarló, lassú, sok kérés

ÚJ MÓD (WebSocket):
Frontend csatlakozik → nyitott kapcsolat
Backend: *új üzenet érkezik*
Backend → Frontend: "Új üzenet érkezett!"
✅ Azonnali, hatékony, kétirányú
```

### Játékunkban WebSocket használata:

```javascript
// FRONTEND
const socket = io('http://localhost:3000');

// Csatlakozás egy falu "szobához"
socket.emit('join:village', villageId);

// Figyeljük a nyersanyag frissítéseket
socket.on('update:resources', (data) => {
  setResources({
    wood: data.wood,
    clay: data.clay,
    iron: data.iron
  });
});

// BACKEND
io.on('connection', (socket) => {
  // User csatlakozott
  
  socket.on('join:village', (villageId) => {
    socket.join(`village:${villageId}`);
    
    // Indítunk egy timert, ami másodpercenként frissít
    setInterval(() => {
      const resources = calculateResources(villageId);
      io.to(`village:${villageId}`).emit('update:resources', resources);
    }, 1000);
  });
});
```

**Használat játékban:**
- ✅ Nyersanyag termelés real-time frissítés
- ✅ Épület fejlesztés progress bar
- ✅ Hadsereg érkezés értesítés
- ✅ Támadás riasztás
- ✅ Chat üzenetek

---

## 📦 NPM PACKAGE-EK (Node Modules)

**NPM = App Store programozóknak**

```bash
npm install express
```

Ez letölt egy "package"-t (programcsomagot), amit használhatsz.

### Főbb package-ek játékunkban:

```javascript
// EXPRESS - Web szerver framework
import express from 'express';
const app = express();
app.get('/api/test', (req, res) => {
  res.json({ message: 'Hello' });
});

// CORS - Engedélyezi a frontend-backend kommunikációt
import cors from 'cors';
app.use(cors());

// DOTENV - Környezeti változók (.env fájl olvasása)
import dotenv from 'dotenv';
dotenv.config();
console.log(process.env.DB_PASSWORD);

// PG - PostgreSQL driver (adatbázis kapcsolat)
import pg from 'pg';
const pool = new pg.Pool({ ... });

// BCRYPT - Jelszó hash-elés (biztonság)
import bcrypt from 'bcrypt';
const hashedPassword = await bcrypt.hash('titkos123', 10);

// JSONWEBTOKEN - JWT token generálás
import jwt from 'jsonwebtoken';
const token = jwt.sign({ userId: 123 }, 'secret');

// SOCKET.IO - WebSocket real-time kapcsolat
import { Server } from 'socket.io';
const io = new Server(httpServer);
```

---

## 🚀 HOGYAN INDÍTUNK EL EGY NODE.JS SZERVERT?

```bash
# 1. Package-ek telepítése
npm install

# 2. .env fájl létrehozása
cp .env.example .env
# Szerkeszd meg a .env fájlt a saját adataiddal

# 3. Adatbázis migration (táblák létrehozása)
npm run db:migrate

# 4. Szerver indítás
npm start
# VAGY fejlesztői módban (auto-restart):
npm run dev
```

**Kimenet:**
```
═══════════════════════════════════════
🏰 Klánháború Backend Server
═══════════════════════════════════════
🚀 Server running on port 3000
📡 API: http://localhost:3000/api
🔌 WebSocket: ws://localhost:3000
🌍 Environment: development
═══════════════════════════════════════
```

Most a szervert lehet hívni:
```bash
curl http://localhost:3000/api/health
# { "status": "ok", "timestamp": "2025-02-16T10:30:00.000Z" }
```

---

## 🐛 HOGYAN DEBUGGOLUNK?

### 1. Console.log (legegyszerűbb)
```javascript
console.log('Request body:', req.body);
console.log('Village data:', village);
```

### 2. Postman / Thunder Client
- API tesztelésre
- Nem kell frontend, közvetlenül hívod az endpoint-okat

### 3. Node Inspector
```bash
node --inspect src/server.js
# Chrome DevTools-ban debuggolhatsz
```

---

## 📚 ÖSSZEFOGLALÁS

```
┌─────────────────────────────────────────────────────────────────┐
│              AMIT TUDNOD KELL A BACKEND-RŐL:                    │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ✅ Backend = Szerver, ami fogadja a kéréseket                  │
│  ✅ API = Endpoints (URL-ek), amiket a frontend hív             │
│  ✅ Database = Ahol minden adat tárolva van                     │
│  ✅ JWT = Digitális belépőkártya                                │
│  ✅ WebSocket = Nyitott vonal real-time kommunikációhoz         │
│  ✅ Routes → Controller → Service → Model → Database            │
│  ✅ Minden működést a backend ellenőriz (biztonság!)            │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## ❓ KÉRDÉSEK?

Ha valami nem világos, kérdezz bátran! 
Minden backend fejlesztő ezekkel kezdte. 😊

**Következő lépés**: Elkészítjük a teljes backend projektet fájlonként!

Készen állsz? 🚀