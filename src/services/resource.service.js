import Village from '../models/Village.js';
import { io } from '../server.js';

/**
 * RESOURCE SERVICE
 * Nyersanyag termelés számítások
 */

// ════════════════════════════════════════════════════════════════
// NYERSANYAG FRISSÍTÉS SZÁMÍTÁSA
// ════════════════════════════════════════════════════════════════

export const calculateResourceUpdate = (village) => {
  const now = new Date();
  const lastUpdate = new Date(village.lastResourceUpdate);
  
  // Eltelt idő órában
  const hoursElapsed = (now - lastUpdate) / (1000 * 60 * 60);
  
  // PÉLDA:
  // lastUpdate: 10:00
  // now: 12:30
  // hoursElapsed: 2.5 óra
  
  // Nyersanyag növekmény = termelés * eltelt idő
  const woodGained = village.production.wood * hoursElapsed;
  const clayGained = village.production.clay * hoursElapsed;
  const ironGained = village.production.iron * hoursElapsed;
  
  // PÉLDA:
  // production.wood: 75 fa/óra
  // hoursElapsed: 2.5 óra
  // woodGained: 75 * 2.5 = 187.5 fa
  
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
  
  // Math.min = nem mehet túl a storage limiten!
  
  return {
    resources: newResources,
    lastUpdate: now
  };
};

// ════════════════════════════════════════════════════════════════
// VALÓS IDEJŰ RESOURCE UPDATER (WebSocket)
// ════════════════════════════════════════════════════════════════

export const startResourceUpdater = (socketIo) => {
  console.log('[Resource Service] Starting real-time updater...');
  
  // Minden 5 másodpercben frissít
  setInterval(() => {
    const allVillages = Village.findAll();
    
    allVillages.forEach(village => {
      // Nyersanyag frissítés számítása
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
    
  }, 5000); // 5000 ms = 5 másodperc
  
  // HOGYAN MŰKÖDIK:
  // 1. Minden 5 másodpercben lefut
  // 2. Végigmegy az összes falun
  // 3. Frissíti a nyersanyagokat
  // 4. WebSocket-en elküldi a frontend-nek
  // 5. Frontend automatikusan frissíti a UI-t
};

export default {
  calculateResourceUpdate,
  startResourceUpdater
};