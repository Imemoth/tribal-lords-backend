import Village from '../models/Village.js';
import Building from '../models/Building.js';
import { HTTP_STATUS, ERRORS } from '../config/constants.js';
import { 
  calculateUpgradeCost, 
  calculateBuildTime,
  calculateVillagePoints,
  calculateProduction
} from '../services/building.service.js';
import { calculateResourceUpdate } from '../services/resource.service.js';
import { BUILDINGS } from '../config/constants.js';  // ← Ha még nincs az import-ok között

/**
 * BUILDING CONTROLLER
 */

// ════════════════════════════════════════════════════════════════
// GET BUILDINGS - Falu épületeinek lekérése
// ════════════════════════════════════════════════════════════════

export const getBuildings = async (req, res) => {
  try {
    // ──────────────────────────────────────────────────────
    // 1️⃣ PARAMÉTEREK KINYERÉSE
    // ──────────────────────────────────────────────────────
    
    const { villageId } = req.query;  // Query string: ?villageId=xxx
    const userId = req.userId;         // JWT token-ből
    
    // MIÉRT req.query?
    // GET /api/buildings?villageId=village-A
    //                    ↑ Ez a query string
    
    // ──────────────────────────────────────────────────────
    // 2️⃣ VALIDÁCIÓ
    // ──────────────────────────────────────────────────────
    
    if (!villageId) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        error: 'villageId paraméter kötelező'
      });
    }
    
    // ──────────────────────────────────────────────────────
    // 3️⃣ FALU LEKÉRÉSE ÉS BIZTONSÁGI ELLENŐRZÉS
    // ──────────────────────────────────────────────────────
    
    const village = Village.findById(villageId);
    
    if (!village) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        error: ERRORS.VILLAGE_NOT_FOUND
      });
    }
    
    if (village.userId !== userId) {
      return res.status(HTTP_STATUS.FORBIDDEN).json({
        success: false,
        error: ERRORS.NOT_YOUR_VILLAGE
      });
    }
    
    // ──────────────────────────────────────────────────────
    // 4️⃣ ÉPÜLETEK LEKÉRÉSE
    // ──────────────────────────────────────────────────────
    
    const buildings = Building.findByVillageId(villageId);
    
    // ──────────────────────────────────────────────────────
    // 5️⃣ VÁLASZ KÜLDÉSE
    // ──────────────────────────────────────────────────────
    
    res.json({
      success: true,
      buildings: buildings.map(b => b.toJSON()),
      count: buildings.length
    });
    
  } catch (error) {
    console.error('[Building] GetBuildings error:', error);
    res.status(HTTP_STATUS.INTERNAL_ERROR).json({
      success: false,
      error: ERRORS.INTERNAL_ERROR
    });
  }
};

// ════════════════════════════════════════════════════════════════
// UPGRADE BUILDING - ÉPÜLET FEJLESZTÉS ⚡
// ════════════════════════════════════════════════════════════════
// Ez a LEGFONTOSABB függvény!

export const upgradeBuilding = async (req, res) => {
  try {
    // ──────────────────────────────────────────────────────
    // 1️⃣ PARAMÉTEREK KINYERÉSE
    // ──────────────────────────────────────────────────────
    
    const { villageId, buildingType } = req.body;
    const userId = req.userId;
    
    // REQUEST PÉLDA:
    // POST /api/buildings/upgrade
    // Body: { villageId: "village-A", buildingType: "lumber" }
    
    // ──────────────────────────────────────────────────────
    // 2️⃣ VALIDÁCIÓ
    // ──────────────────────────────────────────────────────
    
    if (!villageId || !buildingType) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        error: 'villageId és buildingType megadása kötelező'
      });
    }
    
    // ──────────────────────────────────────────────────────
    // 3️⃣ FALU LEKÉRÉSE
    // ──────────────────────────────────────────────────────
    
    const village = Village.findById(villageId);
    
    if (!village) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        error: ERRORS.VILLAGE_NOT_FOUND
      });
    }
    
    // ──────────────────────────────────────────────────────
    // 4️⃣ BIZTONSÁGI ELLENŐRZÉS
    // ──────────────────────────────────────────────────────
    
    if (village.userId !== userId) {
      return res.status(HTTP_STATUS.FORBIDDEN).json({
        success: false,
        error: ERRORS.NOT_YOUR_VILLAGE
      });
    }
    
    // MIÉRT FONTOS?
    // User ne tudjon MÁSOK épületeit fejleszteni!
    
    // ──────────────────────────────────────────────────────
    // 5️⃣ NYERSANYAGOK FRISSÍTÉSE (TERMELÉS)
    // ──────────────────────────────────────────────────────
    
    const updated = calculateResourceUpdate(village);
    Village.updateResources(village.id, updated.resources);
    
    // MIÉRT KELL EZ?
    // Ha user 1 órája nem frissített → adjuk hozzá az 1 óra termelést
    // MOST, a fejlesztés előtt!
    
    const currentVillage = Village.findById(villageId);
    
    // ──────────────────────────────────────────────────────
    // 6️⃣ ÉPÜLET LEKÉRÉSE
    // ──────────────────────────────────────────────────────
    
    const building = Building.findOne(villageId, buildingType);
    
    if (!building) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        error: ERRORS.INVALID_BUILDING_TYPE
      });
    }
    
    // ──────────────────────────────────────────────────────
    // 7️⃣ FEJLESZTÉS ALATT VAN-E? (később használjuk)
    // ──────────────────────────────────────────────────────
    
    if (building.isUpgrading) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        error: ERRORS.BUILDING_UPGRADING,
        upgradeFinishTime: building.upgradeFinishTime
      });
    }
    
    // KÉSŐBB: Amikor bevezetjük az építési időt
    // Most egyszerűsítünk: azonnal kész a fejlesztés
    
    // ──────────────────────────────────────────────────────
    // 8️⃣ KÖLTSÉG KALKULÁCIÓ 💰
    // ──────────────────────────────────────────────────────
    
    const cost = calculateUpgradeCost(buildingType, building.level);
    
    // FORMULA: baseCost * (1.26 ^ currentLevel)
    // PÉLDA: Lumber szint 5-ről 6-ra
    // wood: 50 * (1.26 ^ 5) = 50 * 3.176 = 159
    // clay: 60 * (1.26 ^ 5) = 60 * 3.176 = 191
    // iron: 40 * (1.26 ^ 5) = 40 * 3.176 = 127
    
    console.log(`[Building] Upgrade cost for ${buildingType} (level ${building.level} → ${building.level + 1}):`, cost);
    
    // ──────────────────────────────────────────────────────
    // 9️⃣ NYERSANYAG ELLENŐRZÉS ⚠️
    // ──────────────────────────────────────────────────────
    
    if (currentVillage.resources.wood < cost.wood ||
        currentVillage.resources.clay < cost.clay ||
        currentVillage.resources.iron < cost.iron) {
      
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        error: ERRORS.INSUFFICIENT_RESOURCES,  // "Nincs elég nyersanyag"
        required: cost,                         // Mennyi kell
        current: currentVillage.resources       // Mennyi van
      });
    }
    
    // PÉLDA VÁLASZ (ha nincs elég):
    // {
    //   "error": "Nincs elég nyersanyag",
    //   "required": { wood: 159, clay: 191, iron: 127 },
    //   "current": { wood: 100, clay: 50, iron: 30 }
    // }
    
    // ──────────────────────────────────────────────────────
    // 🔟 NYERSANYAGOK LEVONÁSA ✅
    // ──────────────────────────────────────────────────────
    
    const newResources = {
      wood: currentVillage.resources.wood - cost.wood,
      clay: currentVillage.resources.clay - cost.clay,
      iron: currentVillage.resources.iron - cost.iron
    };
    
    Village.updateResources(villageId, newResources);
    
    console.log(`[Building] Resources deducted:`, cost);
    console.log(`[Building] Remaining resources:`, newResources);
    
    // ──────────────────────────────────────────────────────
    // 1️⃣1️⃣ ÉPÜLET SZINT NÖVELÉSE 📈
    // ──────────────────────────────────────────────────────
    
    Building.incrementLevel(villageId, buildingType);
    
    // building.level: 5 → 6 ✅
    
    // ──────────────────────────────────────────────────────
    // 1️⃣2️⃣ TERMELÉS FRISSÍTÉSE (ha termelő épület)
    // ──────────────────────────────────────────────────────
    
    if (['lumber', 'clay', 'iron'].includes(buildingType)) {
      // Ez egy termelő épület!
      
      const newProduction = calculateProduction(buildingType, building.level + 1);
      
      // FORMULA: baseProduction * (1.2 ^ (level - 1))
      // PÉLDA: Lumber szint 6
      // 30 * (1.2 ^ 5) = 30 * 2.49 = 75 fa/óra
      
      const productionUpdate = {};
      
      if (buildingType === 'lumber') productionUpdate.wood = newProduction;
      if (buildingType === 'clay') productionUpdate.clay = newProduction;
      if (buildingType === 'iron') productionUpdate.iron = newProduction;
      
      Village.updateProduction(villageId, productionUpdate);
      
      console.log(`[Building] Production updated:`, productionUpdate);
    }
    
    // ──────────────────────────────────────────────────────
    // 1️⃣3️⃣ PONTSZÁM ÚJRASZÁMÍTÁSA 🏆
    // ──────────────────────────────────────────────────────
    
    const newPoints = calculateVillagePoints(villageId);
    Village.updatePoints(villageId, newPoints);
    
    // FORMULA: Összes épület összköltsége / 10
    // PÉLDA: Ha 1000 nyersanyagot költöttél összesen → 100 pont
    
    console.log(`[Building] Village points updated: ${newPoints}`);
    
    // ──────────────────────────────────────────────────────
    // 1️⃣4️⃣ FRISSÍTETT ADATOK LEKÉRÉSE
    // ──────────────────────────────────────────────────────
    
    const updatedVillage = Village.findById(villageId);
    const updatedBuilding = Building.findOne(villageId, buildingType);

    // Név lekérése a BUILDINGS konstansból
    const buildingName = BUILDINGS[buildingType]?.name || buildingType;
    
    // ──────────────────────────────────────────────────────
    // 1️⃣5️⃣ VÁLASZ KÜLDÉSE 🎉
    // ──────────────────────────────────────────────────────
    
    console.log(`[Building] ✅ Upgraded: ${buildingType} → level ${updatedBuilding.level} (${villageId})`);
    
    res.json({
      success: true,
      message: `${buildingName} fejlesztve ${updatedBuilding.level}. szintre!`,
      building: updatedBuilding.toJSON(),
      village: {
        resources: updatedVillage.resources,      // Új nyersanyagok
        production: updatedVillage.production,    // Új termelés
        points: updatedVillage.points             // Új pontszám
      },
      cost  // Mennyibe került
    });
    
    // PÉLDA VÁLASZ:
    // {
    //   "success": true,
    //   "message": "Fatelep fejlesztve 6. szintre!",
    //   "building": {
    //     "buildingType": "lumber",
    //     "buildingName": "Fatelep",
    //     "level": 6,
    //     "maxLevel": 30
    //   },
    //   "village": {
    //     "resources": { "wood": 341, "clay": 309, "iron": 273 },
    //     "production": { "wood": 75, "clay": 58, "iron": 45 },
    //     "points": 168
    //   },
    //   "cost": { "wood": 159, "clay": 191, "iron": 127 }
    // }
    
  } catch (error) {
    console.error('[Building] UpgradeBuilding error:', error);
    res.status(HTTP_STATUS.INTERNAL_ERROR).json({
      success: false,
      error: ERRORS.INTERNAL_ERROR
    });
  }
};

// ════════════════════════════════════════════════════════════════
// EXPORT
// ════════════════════════════════════════════════════════════════

export default {
  getBuildings,
  upgradeBuilding
};