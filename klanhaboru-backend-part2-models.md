# BACKEND PROJEKT - PART 2: MODELS (In-Memory)

---

## 📦 src/models/User.js

```javascript
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcrypt';

/**
 * USER MODEL - In-Memory
 * 
 * Mivel nincs database, mindent memóriában tárolunk
 * FIGYELEM: Szerver újraindítás után elvesznek az adatok!
 */

// In-memory storage
const users = new Map();

export class User {
  constructor(data) {
    this.id = data.id || uuidv4();
    this.username = data.username;
    this.email = data.email;
    this.passwordHash = data.passwordHash;
    this.createdAt = data.createdAt || new Date();
    this.lastLogin = data.lastLogin || null;
  }
  
  // --- CREATE METHODS ---
  
  /**
   * Új user létrehozása
   */
  static async create({ username, email, password }) {
    // Ellenőrzések
    if (this.findByUsername(username)) {
      throw new Error('Ez a felhasználónév már foglalt');
    }
    
    if (this.findByEmail(email)) {
      throw new Error('Ez az email cím már használatban van');
    }
    
    // Jelszó hash-elése
    const passwordHash = await bcrypt.hash(password, 10);
    
    // User létrehozása
    const user = new User({
      username,
      email,
      passwordHash
    });
    
    // Mentés
    users.set(user.id, user);
    
    console.log(`[User] Created: ${user.username} (${user.id})`);
    
    return user;
  }
  
  // --- READ METHODS ---
  
  /**
   * User keresése ID alapján
   */
  static findById(id) {
    return users.get(id) || null;
  }
  
  /**
   * User keresése username alapján
   */
  static findByUsername(username) {
    return Array.from(users.values())
      .find(user => user.username === username) || null;
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
  
  // --- UPDATE METHODS ---
  
  /**
   * Last login frissítése
   */
  static updateLastLogin(id) {
    const user = users.get(id);
    if (user) {
      user.lastLogin = new Date();
      users.set(id, user);
    }
    return user;
  }
  
  // --- PASSWORD METHODS ---
  
  /**
   * Jelszó ellenőrzése
   */
  async comparePassword(password) {
    return bcrypt.compare(password, this.passwordHash);
  }
  
  // --- DELETE METHODS ---
  
  /**
   * User törlése
   */
  static delete(id) {
    return users.delete(id);
  }
  
  // --- UTILITY METHODS ---
  
  /**
   * User adatok JSON formátumban (jelszó nélkül!)
   */
  toJSON() {
    return {
      id: this.id,
      username: this.username,
      email: this.email,
      createdAt: this.createdAt,
      lastLogin: this.lastLogin
    };
  }
  
  /**
   * Összes user száma
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

---

## 📦 src/models/Village.js

```javascript
import { v4 as uuidv4 } from 'uuid';
import { STARTING_VILLAGE } from '../config/constants.js';

/**
 * VILLAGE MODEL - In-Memory
 */

// In-memory storage
const villages = new Map();

export class Village {
  constructor(data) {
    this.id = data.id || uuidv4();
    this.userId = data.userId;
    this.name = data.name;
    this.x = data.x;
    this.y = data.y;
    
    // Nyersanyagok
    this.resources = data.resources || { ...STARTING_VILLAGE.resources };
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
  
  // --- CREATE METHODS ---
  
  /**
   * Új falu létrehozása
   */
  static create({ userId, name, x, y }) {
    const village = new Village({
      userId,
      name: name || 'Falu',
      x: x || Math.floor(Math.random() * 100),
      y: y || Math.floor(Math.random() * 100)
    });
    
    villages.set(village.id, village);
    
    console.log(`[Village] Created: ${village.name} (${village.id}) for user ${userId}`);
    
    return village;
  }
  
  // --- READ METHODS ---
  
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
  
  // --- UPDATE METHODS ---
  
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
  
  // --- DELETE METHODS ---
  
  /**
   * Falu törlése
   */
  static delete(id) {
    return villages.delete(id);
  }
  
  // --- UTILITY METHODS ---
  
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

---

## 📦 src/models/Building.js

```javascript
import { v4 as uuidv4 } from 'uuid';
import { BUILDINGS, STARTING_VILLAGE } from '../config/constants.js';

/**
 * BUILDING MODEL - In-Memory
 */

// In-memory storage
// Key: villageId, Value: Map of building types to building data
const buildings = new Map();

export class Building {
  constructor(data) {
    this.id = data.id || uuidv4();
    this.villageId = data.villageId;
    this.buildingType = data.buildingType;
    this.level = data.level || 0;
    
    // Upgrade status
    this.isUpgrading = data.isUpgrading || false;
    this.upgradeFinishTime = data.upgradeFinishTime || null;
    
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
  }
  
  // --- CREATE METHODS ---
  
  /**
   * Falu alapértelmezett épületei
   */
  static createDefaultBuildings(villageId) {
    const villageBuildings = new Map();
    
    // Kezdő épületek létrehozása
    Object.keys(STARTING_VILLAGE.buildings).forEach(buildingType => {
      const level = STARTING_VILLAGE.buildings[buildingType];
      
      const building = new Building({
        villageId,
        buildingType,
        level
      });
      
      villageBuildings.set(buildingType, building);
    });
    
    buildings.set(villageId, villageBuildings);
    
    console.log(`[Building] Default buildings created for village ${villageId}`);
    
    return Array.from(villageBuildings.values());
  }
  
  /**
   * Egyedi épület létrehozása
   */
  static create({ villageId, buildingType, level = 0 }) {
    let villageBuildings = buildings.get(villageId);
    
    if (!villageBuildings) {
      villageBuildings = new Map();
      buildings.set(villageId, villageBuildings);
    }
    
    const building = new Building({
      villageId,
      buildingType,
      level
    });
    
    villageBuildings.set(buildingType, building);
    
    return building;
  }
  
  // --- READ METHODS ---
  
  /**
   * Falu összes épülete
   */
  static findByVillageId(villageId) {
    const villageBuildings = buildings.get(villageId);
    return villageBuildings ? Array.from(villageBuildings.values()) : [];
  }
  
  /**
   * Konkrét épület lekérése
   */
  static findOne(villageId, buildingType) {
    const villageBuildings = buildings.get(villageId);
    return villageBuildings ? villageBuildings.get(buildingType) || null : null;
  }
  
  /**
   * Fejlesztés alatt álló épületek
   */
  static findUpgrading(villageId) {
    const villageBuildings = buildings.get(villageId);
    if (!villageBuildings) return [];
    
    return Array.from(villageBuildings.values())
      .filter(building => building.isUpgrading);
  }
  
  // --- UPDATE METHODS ---
  
  /**
   * Épület szint növelése
   */
  static incrementLevel(villageId, buildingType) {
    const villageBuildings = buildings.get(villageId);
    if (!villageBuildings) return null;
    
    const building = villageBuildings.get(buildingType);
    if (building) {
      building.level += 1;
      building.updatedAt = new Date();
      villageBuildings.set(buildingType, building);
    }
    
    return building;
  }
  
  /**
   * Fejlesztés állapot beállítása
   */
  static setUpgrading(villageId, buildingType, isUpgrading, finishTime = null) {
    const villageBuildings = buildings.get(villageId);
    if (!villageBuildings) return null;
    
    const building = villageBuildings.get(buildingType);
    if (building) {
      building.isUpgrading = isUpgrading;
      building.upgradeFinishTime = finishTime;
      building.updatedAt = new Date();
      villageBuildings.set(buildingType, building);
    }
    
    return building;
  }
  
  // --- DELETE METHODS ---
  
  /**
   * Falu összes épületének törlése
   */
  static deleteAllByVillage(villageId) {
    return buildings.delete(villageId);
  }
  
  // --- UTILITY METHODS ---
  
  /**
   * JSON formátum
   */
  toJSON() {
    return {
      id: this.id,
      villageId: this.villageId,
      buildingType: this.buildingType,
      buildingName: BUILDINGS[this.buildingType]?.name || this.buildingType,
      level: this.level,
      isUpgrading: this.isUpgrading,
      upgradeFinishTime: this.upgradeFinishTime,
      maxLevel: BUILDINGS[this.buildingType]?.maxLevel || 30,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }
  
  /**
   * Összes épület száma
   */
  static count() {
    let total = 0;
    buildings.forEach(villageBuildings => {
      total += villageBuildings.size;
    });
    return total;
  }
  
  /**
   * Összes adat törlése
   */
  static clearAll() {
    buildings.clear();
    console.log('[Building] All buildings cleared');
  }
}

export default Building;
```

---

**MODELS KÉSZ! ✅**

Következnek a **Controllers, Routes, Services**!

Folytatjam? 🚀