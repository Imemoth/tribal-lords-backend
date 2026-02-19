// ════════════════════════════════════════════════════════════════
// IMPORTOK
// ════════════════════════════════════════════════════════════════

import { startBarbarianAI } from './services/barbarian.service.js';
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

   // ÚJ:
  startBarbarianAI();
  console.log('🤖 Barbarian AI started');
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

