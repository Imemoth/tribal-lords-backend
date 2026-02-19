import Village from '../models/Village.js';
import Building from '../models/Building.js';
import { HTTP_STATUS, ERRORS } from '../config/constants.js';
import { calculateResourceUpdate } from '../services/resource.service.js';

/**
 * VILLAGE CONTROLLER
 */

// ════════════════════════════════════════════════════════════════
// GET VILLAGES - User összes faluja
// ════════════════════════════════════════════════════════════════

export const getVillages = async (req, res) => {
  try {
    // ──────────────────────────────────────────────────────
    // 1️⃣ USER ID LEKÉRÉSE
    // ──────────────────────────────────────────────────────
    
    const userId = req.userId;  // authMiddleware-ből
    
    // ──────────────────────────────────────────────────────
    // 2️⃣ USER FALVAINAK LEKÉRÉSE
    // ──────────────────────────────────────────────────────
    
    const villages = Village.findByUserId(userId);
    
    // ──────────────────────────────────────────────────────
    // 3️⃣ NYERSANYAGOK FRISSÍTÉSE MINDEGYIK FALUBAN
    // ──────────────────────────────────────────────────────
    
    const updatedVillages = villages.map(village => {
      // Számítsd ki mennyi nyersanyag termelődött az utolsó frissítés óta
      const updated = calculateResourceUpdate(village);
      
      // Frissítsd a village nyersanyagait
      Village.updateResources(village.id, updated.resources);
      
      // Kérd le a frissített village-t
      return Village.findById(village.id);
    });
    
    // MIÉRT KELL EZ?
    // Ha user 1 órája nem frissített → 1 óra termelést hozzáadunk MOST!
    
    // ──────────────────────────────────────────────────────
    // 4️⃣ VÁLASZ KÜLDÉSE
    // ──────────────────────────────────────────────────────
    
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

// ════════════════════════════════════════════════════════════════
// GET VILLAGE BY ID - Konkrét falu részletei
// ════════════════════════════════════════════════════════════════

export const getVillageById = async (req, res) => {
  try {
    // ──────────────────────────────────────────────────────
    // 1️⃣ PARAMÉTEREK KINYERÉSE
    // ──────────────────────────────────────────────────────
    
    const { id } = req.params;  // URL-ből: /api/villages/:id
    const userId = req.userId;   // JWT token-ből
    
    // ──────────────────────────────────────────────────────
    // 2️⃣ FALU LEKÉRÉSE
    // ──────────────────────────────────────────────────────
    
    const village = Village.findById(id);
    
    if (!village) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        error: ERRORS.VILLAGE_NOT_FOUND
      });
    }
    
    // ──────────────────────────────────────────────────────
    // 3️⃣ ELLENŐRZÉS: Ez a user faluja?
    // ──────────────────────────────────────────────────────
    
    if (village.userId !== userId) {
      return res.status(HTTP_STATUS.FORBIDDEN).json({
        success: false,
        error: ERRORS.NOT_YOUR_VILLAGE  // "Ez nem a te falvad"
      });
    }
    
    // MIÉRT FONTOS?
    // Biztonsági védelem! User ne láthassa más falu adatait!
    
    // ──────────────────────────────────────────────────────
    // 4️⃣ NYERSANYAGOK FRISSÍTÉSE
    // ──────────────────────────────────────────────────────
    
    const updated = calculateResourceUpdate(village);
    Village.updateResources(village.id, updated.resources);
    
    // ──────────────────────────────────────────────────────
    // 5️⃣ FRISSÍTETT FALU ÉS ÉPÜLETEK LEKÉRÉSE
    // ──────────────────────────────────────────────────────
    
    const updatedVillage = Village.findById(id);
    const buildings = Building.findByVillageId(id);
    
    // ──────────────────────────────────────────────────────
    // 6️⃣ VÁLASZ KÜLDÉSE
    // ──────────────────────────────────────────────────────
    
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

// ════════════════════════════════════════════════════════════════
// UPDATE VILLAGE NAME - Falu átnevezése
// ════════════════════════════════════════════════════════════════

export const updateVillageName = async (req, res) => {
  try {
    // ──────────────────────────────────────────────────────
    // 1️⃣ PARAMÉTEREK KINYERÉSE
    // ──────────────────────────────────────────────────────
    
    const { id } = req.params;  // URL paraméter
    const { name } = req.body;  // Request body
    const userId = req.userId;
    
    // ──────────────────────────────────────────────────────
    // 2️⃣ VALIDÁCIÓ
    // ──────────────────────────────────────────────────────
    
    if (!name || name.trim().length === 0) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        error: 'A falu neve nem lehet üres'
      });
    }
    
    // ──────────────────────────────────────────────────────
    // 3️⃣ FALU LEKÉRÉSE ÉS ELLENŐRZÉS
    // ──────────────────────────────────────────────────────
    
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
    
    // ──────────────────────────────────────────────────────
    // 4️⃣ NÉV FRISSÍTÉSE
    // ──────────────────────────────────────────────────────
    
    const updatedVillage = Village.updateName(id, name.trim());
    
    console.log(`[Village] Name updated: ${id} -> ${name}`);
    
    // ──────────────────────────────────────────────────────
    // 5️⃣ VÁLASZ KÜLDÉSE
    // ──────────────────────────────────────────────────────
    
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

// ════════════════════════════════════════════════════════════════
// EXPORT
// ════════════════════════════════════════════════════════════════

export default {
  getVillages,
  getVillageById,
  updateVillageName
};