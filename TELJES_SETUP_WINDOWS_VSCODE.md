# 🚀 KLÁNHÁBORÚ BACKEND - TELJES SETUP ÚTMUTATÓ (VS CODE + WINDOWS)

## 🎯 Amit most fogsz csinálni (20 perc):

1. ✅ Node.js ellenőrzés/telepítés
2. ✅ Projekt mappa létrehozása VS Code-ban
3. ✅ Fájlok létrehozása (egyszerű copy-paste)
4. ✅ Dependencies telepítése (`npm install`)
5. ✅ Szerver indítása
6. ✅ Postman tesztelés

---

## LÉPÉS 1: NODE.JS ELLENŐRZÉS (2 perc)

### 1.1 Ellenőrizd van-e Node.js

1. Nyomd meg: `Windows + R`
2. Írd be: `cmd` és Enter
3. Írd be: `node --version`

**HA LÁTOD pl. `v20.11.0`** → Skip Step 1.2, menj Step 2-re  
**HA "not recognized" hibát kapsz** → Telepítsd:

### 1.2 Node.js Telepítése

1. Menj: **https://nodejs.org/**
2. Klikk az **LTS** gombra (zöld, nagy)
3. Let öltés után futtatsd (node-v20....msi)
4. Next, Next, Install, Finish
5. **FONTOS:** Zárd be a CMD ablakot és nyiss egy ÚJAT!
6. Ellenőrzés: `node --version` és `npm --version`

---

## LÉPÉS 2: PROJEKT MAPPA (VS CODE) (5 perc)

### 2.1 Mappa létrehozása

1. **Windows Explorer-ben** menj pl. Documents mappába
2. **Jobb klikk** → New → Folder
3. Név: `klanhaboru-backend`

### 2.2 VS Code megnyitása

1. **Nyisd meg VS Code-ot**
2. **File** → **Open Folder**
3. Válaszd ki: `klanhaboru-backend` mappát
4. **Select Folder**

### 2.3 Terminal megnyitása VS Code-ban

**VS Code-ban:**
- **Terminal** menü → **New Terminal**
- Vagy: `Ctrl + Shift + `` (backtick)

Most látod lent a terminal-t:
```
PS C:\Users\...\Documents\klanhaboru-backend>
```

---

## LÉPÉS 3: FÁJLOK LÉTREHOZÁSA (10 perc)

Most létre kell hozni 20 fájlt. **Ne félj, egyszerű copy-paste!** 📋

### 3.1 Könyvtár struktúra létrehozása

**VS Code Terminal-ban** (lent a terminal ablakban) írd be:

```powershell
mkdir src
mkdir src\config
mkdir src\middleware
mkdir src\models
mkdir src\controllers
mkdir src\routes
mkdir src\services
mkdir src\utils
```

Most a bal oldali **Explorer**-ben látod a mappákat!

### 3.2 Fájlok létrehozása

**Minden fájlhoz:**
1. Bal oldalon (Explorer) → jobb klikk a mappán → **New File**
2. Írd be a fájlnevet
3. Másold be a kódot alább

---

## 📄 FÁJL 1: package.json (GYÖKÉR MAPPA)

**Jobb klikk az üres területen → New File → `package.json`**

```json
{
  "name": "klanhaboru-backend-simple",
  "version": "1.0.0",
  "description": "Klánháború backend - egyszerű in-memory verzió",
  "main": "src/server.js",
  "type": "module",
  "scripts": {
    "start": "node src/server.js",
    "dev": "nodemon src/server.js"
  },
  "keywords": ["game", "strategy", "mmo"],
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

---

## 📄 FÁJL 2: .env.example (GYÖKÉR MAPPA)

**New File → `.env.example`**

```env
# Szerver beállítások
PORT=3000
NODE_ENV=development

# JWT Secret (FONTOS: változtasd meg!)
JWT_SECRET=valami-random-szoveg-12345678-CHANGE-THIS

# JWT Token élettartam
JWT_EXPIRES_IN=7d

# Frontend URL
FRONTEND_URL=http://localhost:5173
```

---

## 📄 FÁJL 3: .gitignore (GYÖKÉR MAPPA)

**New File → `.gitignore`**

```
node_modules/
.env
*.log
.DS_Store
Thumbs.db
.vscode/
```

---

## 📄 FÁJL 4: src/config/constants.js

**Jobb klikk `src/config` mappán → New File → `constants.js`**

```javascript
export const BUILDINGS = {
  lumber: {
    name: 'Fatelep',
    baseProduction: 30,
    baseCost: { wood: 50, clay: 60, iron: 40 },
    maxLevel: 30
  },
  clay: {
    name: 'Agyagbánya',
    baseProduction: 30,
    baseCost: { wood: 65, clay: 50, iron: 40 },
    maxLevel: 30
  },
  iron: {
    name: 'Vasbánya',
    baseProduction: 25,
    baseCost: { wood: 75, clay: 65, iron: 70 },
    maxLevel: 30
  },
  headquarters: {
    name: 'Főépület',
    baseCost: { wood: 90, clay: 80, iron: 70 },
    maxLevel: 30
  },
  barracks: {
    name: 'Kaszárnya',
    baseCost: { wood: 200, clay: 170, iron: 90 },
    maxLevel: 25
  },
  wall: {
    name: 'Palánk',
    baseCost: { wood: 50, clay: 100, iron: 20 },
    maxLevel: 20
  }
};

export const BUILDING_FORMULAS = {
  costMultiplier: 1.26,
  productionMultiplier: 1.2
};

export const STARTING_VILLAGE = {
  resources: { wood: 500, clay: 500, iron: 400 },
  storage: { wood: 1000, clay: 1000, iron: 1000 },
  buildings: { lumber: 1, clay: 1, iron: 1, headquarters: 1, barracks: 0, wall: 0 }
};

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

export const ERRORS = {
  INVALID_CREDENTIALS: 'Hibás felhasználónév vagy jelszó',
  USER_EXISTS: 'Ez a felhasználónév már foglalt',
  UNAUTHORIZED: 'Nincs jogosultságod',
  INSUFFICIENT_RESOURCES: 'Nincs elég nyersanyag',
  VILLAGE_NOT_FOUND: 'Falu nem található',
  NOT_YOUR_VILLAGE: 'Ez nem a te falvad'
};
```

---

## 💾 GYORSÍTOTT VERZIÓ - LETÖLTÉS

**Ha nem akarsz 15x copy-paste-elni:**

Töltsd le a teljes projektet ZIP-ben (külön elkülöm neked)  
VAGY  
Folytasd itt az összes fájl kódjával...

---

## ❓ KÉRDÉS HOZZÁD:

**A) "Folytatd, add az összes fájl kódját!"**  
   → Elküldom mind a 15 fájl tartalmát  

**B) "Inkább készíts ZIP-et vagy GitHub repo-t!"**  
   → Csomagolom az egészet letölthetően

**C) "Kérdésem van..."**  
   → Kérdezz bátran!

**Melyik?** 🤔