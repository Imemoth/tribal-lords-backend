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
GET http://localhost:3000/api/health

2. **Regisztráció:**
POST http://localhost:3000/api/auth/register
Body: { "username": "teszt", "email": "teszt@email.com", "password": "teszt123" }

3. **Bejelentkezés:**
POST http://localhost:3000/api/auth/login
Body: { "username": "teszt", "password": "teszt123" }
→ Mentsd el a "token"-t!

4. **Falvak lekérése:**
GET http://localhost:3000/api/villages
Headers: Authorization: Bearer <token>

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
PORT=3001

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