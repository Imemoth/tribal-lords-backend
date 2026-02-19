# BACKEND PROJEKT - PART 3: CONTROLLERS

---

## 📦 src/controllers/auth.controller.js

```javascript
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Village from '../models/Village.js';
import Building from '../models/Building.js';
import { HTTP_STATUS, ERRORS } from '../config/constants.js';

/**
 * AUTH CONTROLLER
 * Regisztráció, bejelentkezés, user info
 */

/**
 * JWT Token generálás
 */
const generateToken = (userId) => {
  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

/**
 * REGISTER - Új user regisztrációja
 * POST /api/auth/register
 */
export const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    
    // Validáció
    if (!username || !email || !password) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        error: 'Minden mező kitöltése kötelező'
      });
    }
    
    if (username.length < 3) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        error: 'A felhasználónév legalább 3 karakter kell legyen'
      });
    }
    
    if (password.length < 6) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        error: 'A jelszó legalább 6 karakter kell legyen'
      });
    }
    
    // User létrehozása
    const user = await User.create({ username, email, password });
    
    // Kezdő falu létrehozása
    const village = Village.create({
      userId: user.id,
      name: `${username} falva`,
      x: Math.floor(Math.random() * 100),
      y: Math.floor(Math.random() * 100)
    });
    
    // Falu alapértelmezett épületei
    Building.createDefaultBuildings(village.id);
    
    // JWT token generálás
    const token = generateToken(user.id);
    
    console.log(`[Auth] User registered: ${username} (${user.id})`);
    
    res.status(HTTP_STATUS.CREATED).json({
      success: true,
      message: 'Sikeres regisztráció',
      token,
      user: user.toJSON(),
      village: village.toJSON()
    });
    
  } catch (error) {
    console.error('[Auth] Register error:', error);
    
    // User already exists error
    if (error.message.includes('felhasználónév') || error.message.includes('email')) {
      return res.status(HTTP_STATUS.CONFLICT).json({
        success: false,
        error: error.message
      });
    }
    
    res.status(HTTP_STATUS.INTERNAL_ERROR).json({
      success: false,
      error: ERRORS.INTERNAL_ERROR
    });
  }
};

/**
 * LOGIN - Bejelentkezés
 * POST /api/auth/login
 */
export const login = async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // Validáció
    if (!username || !password) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        error: 'Felhasználónév és jelszó megadása kötelező'
      });
    }
    
    // User keresése
    const user = User.findByUsername(username);
    
    if (!user) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        error: ERRORS.INVALID_CREDENTIALS
      });
    }
    
    // Jelszó ellenőrzés
    const isPasswordValid = await user.comparePassword(password);
    
    if (!isPasswordValid) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        error: ERRORS.INVALID_CREDENTIALS
      });
    }
    
    // Last login frissítése
    User.updateLastLogin(user.id);
    
    // JWT token generálás
    const token = generateToken(user.id);
    
    // User falvai
    const villages = Village.findByUserId(user.id);
    
    console.log(`[Auth] User logged in: ${username} (${user.id})`);
    
    res.json({
      success: true,
      message: 'Sikeres bejelentkezés',
      token,
      user: user.toJSON(),
      villages: villages.map(v => v.toJSON())
    });
    
  } catch (error) {
    console.error('[Auth] Login error:', error);
    res.status(HTTP_STATUS.INTERNAL_ERROR).json({
      success: false,
      error: ERRORS.INTERNAL_ERROR
    });
  }
};

/**
 * GET ME - Aktuális user adatai
 * GET /api/auth/me
 * Requires: JWT token
 */
export const getMe = async (req, res) => {
  try {
    // req.userId a middleware-ből jön
    const user = User.findById(req.userId);
    
    if (!user) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        error: 'User nem található'
      });
    }
    
    // User falvai
    const villages = Village.findByUserId(user.id);
    
    res.json({
      success: true,
      user: user.toJSON(),
      villages: villages.map(v => v.toJSON())
    });
    
  } catch (error) {
    console.error('[Auth] GetMe error:', error);
    res.status(HTTP_STATUS.INTERNAL_ERROR).json({
      success: false,
      error: ERRORS.INTERNAL_ERROR
    });
  }
};

export default {
  register,
  login,
  getMe
};
```

---

## 📦 src/controllers/village.controller.js

```javascript
import Village from '../models/Village.js';
import Building from '../models/Building.js';
import { HTTP_STATUS, ERRORS } from '../config/constants.js';
import { calculateResourceUpdate } from '../services/resource.service.js';

/**
 * VILLAGE CONTROLLER
 */

/**
 * GET VILLAGES - User összes faluja
 * GET /api/villages
 */
export const getVillages = async (req, res) => {
  try {
    const userId = req.userId;
    
    const villages = Village.findByUserId(userId);
    
    // Nyersanyagok frissítése mindegyik faluban
    const updatedVillages = villages.map(village => {
      const updated = calculateResourceUpdate(village);
      Village.updateResources(village.id, updated.resources);
      return Village.findById(village.id);
    });
    
    res.json({
      success: true,
      villages: updatedVillages.map(v => v.toJSON()),
      count: updatedVillages.length
    });
    
  } catch (error) {
    console.error('[Village] GetVillages error:', error);
    res.status(HTTP_STATUS.INTERNAL_ERROR).json({
      success: false,
      error: ERRORS.INTERNAL_ERROR
    });
  }
};

/**
 * GET VILLAGE BY ID - Konkrét falu részletei
 * GET /api/villages/:id
 */
export const getVillageById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;
    
    const village = Village.findById(id);
    
    if (!village) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        error: ERRORS.VILLAGE_NOT_FOUND
      });
    }
    
    // Ellenőrzés: a user faluja-e
    if (village.userId !== userId) {
      return res.status(HTTP_STATUS.FORBIDDEN).json({
        success: false,
        error: ERRORS.NOT_YOUR_VILLAGE
      });
    }
    
    // Nyersanyagok frissítése
    const updated = calculateResourceUpdate(village);
    Village.updateResources(village.id, updated.resources);
    
    // Frissített falu lekérése
    const updatedVillage = Village.findById(id);
    
    // Épületek lekérése
    const buildings = Building.findByVillageId(id);
    
    res.json({
      success: true,
      village: updatedVillage.toJSON(),
      buildings: buildings.map(b => b.toJSON())
    });
    
  } catch (error) {
    console.error('[Village] GetVillageById error:', error);
    res.status(HTTP_STATUS.INTERNAL_ERROR).json({
      success: false,
      error: ERRORS.INTERNAL_ERROR
    });
  }
};

/**
 * UPDATE VILLAGE NAME - Falu átnevezése
 * PATCH /api/villages/:id
 */
export const updateVillageName = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    const userId = req.userId;
    
    if (!name || name.trim().length === 0) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        error: 'A falu neve nem lehet üres'
      });
    }
    
    const village = Village.findById(id);
    
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
    
    // Név frissítése
    const updatedVillage = Village.updateName(id, name.trim());
    
    console.log(`[Village] Name updated: ${id} -> ${name}`);
    
    res.json({
      success: true,
      message: 'Falu átnevezve',
      village: updatedVillage.toJSON()
    });
    
  } catch (error) {
    console.error('[Village] UpdateVillageName error:', error);
    res.status(HTTP_STATUS.INTERNAL_ERROR).json({
      success: false,
      error: ERRORS.INTERNAL_ERROR
    });
  }
};

export default {
  getVillages,
  getVillageById,
  updateVillageName
};
```

---

## 📦 src/controllers/building.controller.js

```javascript
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

/**
 * BUILDING CONTROLLER
 */

/**
 * GET BUILDINGS - Falu épületei
 * GET /api/buildings?villageId=xxx
 */
export const getBuildings = async (req, res) => {
  try {
    const { villageId } = req.query;
    const userId = req.userId;
    
    if (!villageId) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        error: 'villageId paraméter kötelező'
      });
    }
    
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
    
    const buildings = Building.findByVillageId(villageId);
    
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

/**
 * UPGRADE BUILDING - Épület fejlesztése
 * POST /api/buildings/upgrade
 */
export const upgradeBuilding = async (req, res) => {
  try {
    const { villageId, buildingType } = req.body;
    const userId = req.userId;
    
    // Validáció
    if (!villageId || !buildingType) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        error: 'villageId és buildingType megadása kötelező'
      });
    }
    
    // Falu ellenőrzés
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
    
    // Nyersanyagok frissítése
    const updated = calculateResourceUpdate(village);
    Village.updateResources(village.id, updated.resources);
    const currentVillage = Village.findById(villageId);
    
    // Épület lekérése
    const building = Building.findOne(villageId, buildingType);
    
    if (!building) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        error: ERRORS.INVALID_BUILDING_TYPE
      });
    }
    
    // Ellenőrzés: fejlesztés alatt van-e
    if (building.isUpgrading) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        error: ERRORS.BUILDING_UPGRADING,
        upgradeFinishTime: building.upgradeFinishTime
      });
    }
    
    // Költség számítása
    const cost = calculateUpgradeCost(buildingType, building.level);
    
    // Ellenőrzés: van elég nyersanyag?
    if (currentVillage.resources.wood < cost.wood ||
        currentVillage.resources.clay < cost.clay ||
        currentVillage.resources.iron < cost.iron) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        error: ERRORS.INSUFFICIENT_RESOURCES,
        required: cost,
        current: currentVillage.resources
      });
    }
    
    // Nyersanyagok levonása
    const newResources = {
      wood: currentVillage.resources.wood - cost.wood,
      clay: currentVillage.resources.clay - cost.clay,
      iron: currentVillage.resources.iron - cost.iron
    };
    
    Village.updateResources(villageId, newResources);
    
    // Épület szint növelése (egyszerűsített - azonnal)
    Building.incrementLevel(villageId, buildingType);
    
    // Ha termelő épület, frissítjük a termelést
    if (['lumber', 'clay', 'iron'].includes(buildingType)) {
      const newProduction = calculateProduction(buildingType, building.level + 1);
      const productionUpdate = {};
      
      if (buildingType === 'lumber') productionUpdate.wood = newProduction;
      if (buildingType === 'clay') productionUpdate.clay = newProduction;
      if (buildingType === 'iron') productionUpdate.iron = newProduction;
      
      Village.updateProduction(villageId, productionUpdate);
    }
    
    // Pontszám újraszámítása
    const newPoints = calculateVillagePoints(villageId);
    Village.updatePoints(villageId, newPoints);
    
    // Frissített adatok
    const updatedVillage = Village.findById(villageId);
    const updatedBuilding = Building.findOne(villageId, buildingType);
    
    console.log(`[Building] Upgraded: ${buildingType} to level ${updatedBuilding.level} in village ${villageId}`);
    
    res.json({
      success: true,
      message: `${updatedBuilding.buildingName} fejlesztve ${updatedBuilding.level}. szintre`,
      building: updatedBuilding.toJSON(),
      village: {
        resources: updatedVillage.resources,
        production: updatedVillage.production,
        points: updatedVillage.points
      },
      cost
    });
    
  } catch (error) {
    console.error('[Building] UpgradeBuilding error:', error);
    res.status(HTTP_STATUS.INTERNAL_ERROR).json({
      success: false,
      error: ERRORS.INTERNAL_ERROR
    });
  }
};

export default {
  getBuildings,
  upgradeBuilding
};
```

---

**CONTROLLERS KÉSZ! ✅**

Következnek a **Routes** és **Services**!

Folytatjam? 🚀