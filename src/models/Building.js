import { v4 as uuidv4 } from 'uuid';
import { BUILDINGS, STARTING_VILLAGE } from '../config/constants.js';

/**
 * BUILDING MODEL - In-Memory (NESTED MAP!)
 */

const buildings = new Map();

export class Building {
  constructor(data) {
    this.id = data.id || uuidv4();
    this.villageId = data.villageId;
    this.buildingType = data.buildingType;
    this.level = data.level || 0;
    this.isUpgrading = data.isUpgrading || false;
    this.upgradeFinishTime = data.upgradeFinishTime || null;
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
  }
  
  // Falu alapértelmezett épületei
  static createDefaultBuildings(villageId) {
    const villageBuildings = new Map();
    
    Object.keys(STARTING_VILLAGE.buildings).forEach(buildingType => {
      const level = STARTING_VILLAGE.buildings[buildingType];
      const building = new Building({ villageId, buildingType, level });
      villageBuildings.set(buildingType, building);
    });
    
    buildings.set(villageId, villageBuildings);
    console.log(`[Building] Default buildings created for village ${villageId}`);
    return Array.from(villageBuildings.values());
  }
  
  // Falu összes épülete
  static findByVillageId(villageId) {
    const villageBuildings = buildings.get(villageId);
    return villageBuildings ? Array.from(villageBuildings.values()) : [];
  }
  
  // Konkrét épület
  static findOne(villageId, buildingType) {
    const villageBuildings = buildings.get(villageId);
    return villageBuildings ? villageBuildings.get(buildingType) || null : null;
  }
  
  // Szint növelése
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
  
  // JSON formátum
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
  
  static deleteAllByVillage(villageId) {
    return buildings.delete(villageId);
  }
  
  static clearAll() {
    buildings.clear();
    console.log('[Building] All buildings cleared');
  }
}

export default Building;
