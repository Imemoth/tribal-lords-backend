import { BUILDINGS, BUILDING_FORMULAS } from '../config/constants.js';
import Building from '../models/Building.js';

/**
 * BUILDING SERVICE
 * Épület számítások
 */

// ════════════════════════════════════════════════════════════════
// FEJLESZTÉSI KÖLTSÉG SZÁMÍTÁSA
// ════════════════════════════════════════════════════════════════

export const calculateUpgradeCost = (buildingType, currentLevel) => {
  const building = BUILDINGS[buildingType];
  
  if (!building) {
    throw new Error('Érvénytelen épület típus');
  }
  
  // FORMULA: baseCost * (1.26 ^ currentLevel)
  const multiplier = Math.pow(BUILDING_FORMULAS.costMultiplier, currentLevel);
  
  return {
    wood: Math.floor(building.baseCost.wood * multiplier),
    clay: Math.floor(building.baseCost.clay * multiplier),
    iron: Math.floor(building.baseCost.iron * multiplier)
  };
  
  // PÉLDA:
  // calculateUpgradeCost("lumber", 5)
  // baseCost: { wood: 50, clay: 60, iron: 40 }
  // multiplier: 1.26 ^ 5 = 3.176
  // → { wood: 159, clay: 191, iron: 127 }
};

// ════════════════════════════════════════════════════════════════
// ÉPÍTÉSI IDŐ SZÁMÍTÁSA (később használjuk)
// ════════════════════════════════════════════════════════════════

export const calculateBuildTime = (buildingType, level) => {
  const building = BUILDINGS[buildingType];
  
  if (!building) {
    throw new Error('Érvénytelen épület típus');
  }
  
  // FORMULA: baseTime * buildTimeMultiplier * (1.18 ^ level)
  const timeMultiplier = Math.pow(BUILDING_FORMULAS.timeMultiplier, level);
  const buildTime = BUILDING_FORMULAS.baseTime * 
                    building.buildTimeMultiplier * 
                    timeMultiplier;
  
  return Math.floor(buildTime); // másodpercben
  
  // PÉLDA:
  // calculateBuildTime("lumber", 5)
  // baseTime: 180 sec (3 perc)
  // timeMultiplier: 1.18 ^ 5 = 2.29
  // → 180 * 1.0 * 2.29 = 412 sec (6.8 perc)
};

// ════════════════════════════════════════════════════════════════
// TERMELÉS SZÁMÍTÁSA
// ════════════════════════════════════════════════════════════════

export const calculateProduction = (buildingType, level) => {
  const building = BUILDINGS[buildingType];
  
  if (!building || !building.baseProduction) {
    return 0;
  }
  
  // FORMULA: baseProduction * (1.2 ^ (level - 1))
  return Math.floor(
    building.baseProduction * 
    Math.pow(BUILDING_FORMULAS.productionMultiplier, level - 1)
  );
  
  // PÉLDA:
  // calculateProduction("lumber", 6)
  // baseProduction: 30
  // multiplier: 1.2 ^ 5 = 2.49
  // → 30 * 2.49 = 75 fa/óra
};

// ════════════════════════════════════════════════════════════════
// FALU PONTSZÁM ÚJRASZÁMÍTÁSA
// ════════════════════════════════════════════════════════════════

export const calculateVillagePoints = (villageId) => {
  const buildings = Building.findByVillageId(villageId);
  
  let totalPoints = 0;
  
  // Minden épület költségének összege
  buildings.forEach(building => {
    // Végigmegyünk minden szinten 0-tól current level-ig
    for (let i = 0; i < building.level; i++) {
      const cost = calculateUpgradeCost(building.buildingType, i);
      totalPoints += (cost.wood + cost.clay + cost.iron) / 10;
    }
  });
  
  return Math.floor(totalPoints);
  
  // PÉLDA:
  // Lumber szint 3:
  //   Szint 0→1: (50+60+40)/10 = 15 pont
  //   Szint 1→2: (63+76+50)/10 = 19 pont
  //   Szint 2→3: (79+95+63)/10 = 24 pont
  //   Összesen: 15+19+24 = 58 pont csak a lumber-ből
};

export default {
  calculateUpgradeCost,
  calculateBuildTime,
  calculateProduction,
  calculateVillagePoints
};