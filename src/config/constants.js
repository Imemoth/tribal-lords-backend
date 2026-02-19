/**
 * TRIBAL LORDS - JÁTÉK KONSTANSOK
 * 
 * Minden hardcoded érték itt van egy helyen.
 * Ha változtatni akarsz a játékon (pl. drágább épületek),
 * csak ezt a fájlt kell szerkeszteni!
 */

// ════════════════════════════════════════════════════════════════
// ÉPÜLET TÍPUSOK ÉS TULAJDONSÁGAIK
// ════════════════════════════════════════════════════════════════

export const BUILDINGS = {
  // NYERSANYAG TERMELŐ ÉPÜLETEK
  
  lumber: {
    name: 'Fatelep',
    nameEn: 'Lumber Mill',
    baseProduction: 30,  // óránként ennyi fát termel 1. szinten
    baseCost: {          // 1. szintről 2-re fejlesztés költsége
      wood: 50,
      clay: 60,
      iron: 40
    },
    maxLevel: 30
  },
  
  clay: {
    name: 'Agyagbánya',
    nameEn: 'Clay Pit',
    baseProduction: 30,  // óránként ennyi agyagot termel
    baseCost: {
      wood: 65,
      clay: 50,
      iron: 40
    },
    maxLevel: 30
  },
  
  iron: {
    name: 'Vasbánya',
    nameEn: 'Iron Mine',
    baseProduction: 25,  // óránként ennyi vasat termel
    baseCost: {
      wood: 75,
      clay: 65,
      iron: 70
    },
    maxLevel: 30
  },
  
  // TÁMOGATÓ ÉPÜLETEK
  
  headquarters: {
    name: 'Főépület',
    nameEn: 'Headquarters',
    baseCost: {
      wood: 90,
      clay: 80,
      iron: 70
    },
    maxLevel: 30,
    speedBonus: 0.05  // minden szint 5%-kal gyorsítja az építéseket
  },
  
  // KATONAI ÉPÜLETEK
  
  barracks: {
    name: 'Kaszárnya',
    nameEn: 'Barracks',
    baseCost: {
      wood: 200,
      clay: 170,
      iron: 90
    },
    maxLevel: 25
  },
  
  // VÉDELEM
  
  wall: {
    name: 'Palánk',
    nameEn: 'Wall',
    baseCost: {
      wood: 50,
      clay: 100,
      iron: 20
    },
    maxLevel: 20,
    defenseBonus: 0.04  // minden szint 4%-kal növeli a védelmet
  }
};

// ════════════════════════════════════════════════════════════════
// ÉPÜLET FORMULÁK
// ════════════════════════════════════════════════════════════════

export const BUILDING_FORMULAS = {
  // Költség növekedés szintenként
  // Példa: 1. szint: 100, 2. szint: 126, 3. szint: 159
  costMultiplier: 1.26,
  
  // Termelés növekedés szintenként
  // Példa: 1. szint: 30/óra, 2. szint: 36/óra, 3. szint: 43/óra
  productionMultiplier: 1.2,
  
  // Építési idő formulához (később használjuk)
  timeMultiplier: 1.18,
  baseTime: 180  // másodpercben (3 perc)
};

// ════════════════════════════════════════════════════════════════
// KEZDŐ FALU ALAPÉRTÉKEI
// ════════════════════════════════════════════════════════════════

export const STARTING_VILLAGE = {
  // Kezdő nyersanyagok
  resources: {
    wood: 500,   // kezdő fa
    clay: 500,   // kezdő agyag
    iron: 400    // kezdő vas
  },
  
  // Tárolási limitek kezdéskor
  storage: {
    wood: 1000,
    clay: 1000,
    iron: 1000
  },
  
  // Kezdő épületek szintjei
  buildings: {
    lumber: 1,       // Fatelep szint 1
    clay: 1,         // Agyagbánya szint 1
    iron: 1,         // Vasbánya szint 1
    headquarters: 1, // Főépület szint 1
    barracks: 0,     // Kaszárnya nincs még
    wall: 0          // Palánk nincs még
  }
};

// ════════════════════════════════════════════════════════════════
// HTTP STATUS CODES (segédlet)
// ════════════════════════════════════════════════════════════════

export const HTTP_STATUS = {
  OK: 200,                  // Siker
  CREATED: 201,             // Létrehozva (pl. új user)
  BAD_REQUEST: 400,         // Rossz kérés (hiányzó adat)
  UNAUTHORIZED: 401,        // Nincs token / hibás token
  FORBIDDEN: 403,           // Token OK, de nincs jog (pl. más user faluja)
  NOT_FOUND: 404,           // Nem található (pl. village ID nem létezik)
  CONFLICT: 409,            // Ütközés (pl. username már létezik)
  INTERNAL_ERROR: 500       // Szerverhiba
};

// ════════════════════════════════════════════════════════════════
// HIBAÜZENETEK (magyar)
// ════════════════════════════════════════════════════════════════

export const ERRORS = {
  // Auth hibák
  INVALID_CREDENTIALS: 'Hibás felhasználónév vagy jelszó',
  USER_EXISTS: 'Ez a felhasználónév már foglalt',
  EMAIL_EXISTS: 'Ez az email cím már használatban van',
  UNAUTHORIZED: 'Nincs jogosultságod ehhez a művelethez',
  
  // Resource hibák
  INSUFFICIENT_RESOURCES: 'Nincs elég nyersanyag',
  
  // Building hibák
  BUILDING_UPGRADING: 'Ez az épület már fejlesztés alatt áll',
  BUILDING_MAX_LEVEL: 'Az épület elérte a maximum szintet',
  INVALID_BUILDING_TYPE: 'Érvénytelen épület típus',
  
  // Village hibák
  VILLAGE_NOT_FOUND: 'A falu nem található',
  NOT_YOUR_VILLAGE: 'Ez nem a te falvad',
  
  // Általános
  INTERNAL_ERROR: 'Szerverhiba történt'
};

// Default export (importáláshoz)
export default {
  BUILDINGS,
  BUILDING_FORMULAS,
  STARTING_VILLAGE,
  HTTP_STATUS,
  ERRORS
};