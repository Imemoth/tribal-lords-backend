import Village from '../models/Village.js';
import Building from '../models/Building.js';
import { STARTING_VILLAGE } from '../config/constants.js';

/**
 * BARBARIAN SERVICE
 * Barbár falvak generálása és AI fejlesztés
 */

const BARBARIAN_NAMES = [
  'Elhagyott falu',
  'Barbár erőd',
  'Ódon település',
  'Rablók tanyája',
  'Vad törzsek faluja',
  'Nomád tábor',
  'Erdei kunyhók',
  'Vadászok faluja',
  'Ősi romok',
  'Kiürült település'
];

/**
 * Barbár falvak generálása user faluja körül
 */
export const generateBarbarianVillagesNearby = (userVillage, count = 5) => {
  const barbarianVillages = [];
  const minDistance = 5;
  const maxDistance = 15;
  
  console.log(`[Barbarian] Generating ${count} villages near ${userVillage.name}`);
  
  for (let i = 0; i < count; i++) {
    const distance = minDistance + Math.random() * (maxDistance - minDistance);
    const angle = Math.random() * 2 * Math.PI;
    
    const x = Math.round(userVillage.x + distance * Math.cos(angle));
    const y = Math.round(userVillage.y + distance * Math.sin(angle));
    
    const finalX = Math.max(0, Math.min(99, x));
    const finalY = Math.max(0, Math.min(99, y));
    
    const existingVillage = Village.findByCoordinates(finalX, finalY);
    if (existingVillage) continue;
    
    const name = BARBARIAN_NAMES[Math.floor(Math.random() * BARBARIAN_NAMES.length)];
    
    const barbarianVillage = Village.create({
      userId: null,  // NINCS TULAJDONOSA
      name,
      x: finalX,
      y: finalY
    });
    
    barbarianVillage.resources = {
      wood: 500 + Math.floor(Math.random() * 1500),
      clay: 500 + Math.floor(Math.random() * 1500),
      iron: 500 + Math.floor(Math.random() * 1500)
    };
    
    Building.createDefaultBuildings(barbarianVillage.id);
    
    const buildingTypes = ['lumber', 'clay', 'iron', 'headquarters'];
    buildingTypes.forEach(type => {
      const randomLevel = 1 + Math.floor(Math.random() * 3);
      for (let level = 1; level < randomLevel; level++) {
        Building.incrementLevel(barbarianVillage.id, type);
      }
    });
    
    barbarianVillage.isBarbarian = true;
    barbarianVillages.push(barbarianVillage);
    
    console.log(`[Barbarian] Created: ${name} at ${finalX}|${finalY}`);
  }
  
  return barbarianVillages;
};

/**
 * AI - Barbár falvak fejlődése
 */
export const startBarbarianAI = () => {
  console.log('[Barbarian AI] Starting...');
  
  setInterval(() => {
    const allVillages = Village.findAll();
    const barbarianVillages = allVillages.filter(v => v.userId === null);
    
    barbarianVillages.forEach(village => {
      if (Math.random() < 0.5) {
        const buildings = Building.findByVillageId(village.id);
        const developable = buildings.filter(b => b.level < 10);
        
        if (developable.length > 0) {
          const randomBuilding = developable[Math.floor(Math.random() * developable.length)];
          Building.incrementLevel(village.id, randomBuilding.buildingType);
          
          console.log(`[Barbarian AI] ${village.name} - ${randomBuilding.buildingType} → level ${randomBuilding.level + 1}`);
        }
      }
    });
  }, 3600000); // 1 óra (teszteléshez: 60000 = 1 perc)
};

export default {
  generateBarbarianVillagesNearby,
  startBarbarianAI
};