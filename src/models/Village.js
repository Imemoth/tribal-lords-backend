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
    
    // ÚJ:
    this.isBarbarian = data.isBarbarian || false;

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
      isBarbarian: this.isBarbarian,  // ← ÚJ
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
