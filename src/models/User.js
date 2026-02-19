import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcrypt';

/**
 * USER MODEL - In-Memory
 * 
 * FIGYELEM: In-memory storage!
 * - Minden adat memóriában (Map)
 * - Szerver újraindítás → minden adat elvész!
 * - Később PostgreSQL-re cseréljük
 */

// ════════════════════════════════════════════════════════════════
// IN-MEMORY STORAGE
// ════════════════════════════════════════════════════════════════

const users = new Map();
// Map adatstruktúra: kulcs-érték párok
// Kulcs: user.id (UUID)
// Érték: User objektum

// ════════════════════════════════════════════════════════════════
// USER CLASS
// ════════════════════════════════════════════════════════════════

export class User {
  constructor(data) {
    this.id = data.id || uuidv4();  // UUID generálás ha nincs ID
    this.username = data.username;
    this.email = data.email;
    this.passwordHash = data.passwordHash;  // Hash-elt jelszó!
    this.createdAt = data.createdAt || new Date();
    this.lastLogin = data.lastLogin || null;
  }
  
  // ════════════════════════════════════════════════════════════════
  // CREATE METHODS
  // ════════════════════════════════════════════════════════════════
  
  /**
   * Új user létrehozása
   * 
   * @param {Object} userData - { username, email, password }
   * @returns {User} Létrehozott user
   */
  static async create({ username, email, password }) {
    // ──────────────────────────────────────────────────────
    // 1️⃣ ELLENŐRZÉSEK
    // ──────────────────────────────────────────────────────
    
    // Username már létezik?
    if (this.findByUsername(username)) {
      throw new Error('Ez a felhasználónév már foglalt');
    }
    
    // Email már létezik?
    if (this.findByEmail(email)) {
      throw new Error('Ez az email cím már használatban van');
    }
    
    // ──────────────────────────────────────────────────────
    // 2️⃣ JELSZÓ HASH-ELÉSE
    // ──────────────────────────────────────────────────────
    
    const passwordHash = await bcrypt.hash(password, 10);
    // MIT CSINÁL:
    // - password: "titkos123"
    // - bcrypt.hash → "$2b$10$X7eFz..."  (hash)
    // 
    // MIÉRT KELL:
    // - SOHA ne tárolj jelszót plain text-ben!
    // - Ha valaki belemegy az adatbázisba, nem látja a jelszót
    // 
    // SALT ROUNDS (10):
    // - Minél nagyobb, annál lassabb, de biztonságosabb
    // - 10 = jó egyensúly (gyors + biztonságos)
    
    // ──────────────────────────────────────────────────────
    // 3️⃣ USER OBJEKTUM LÉTREHOZÁSA
    // ──────────────────────────────────────────────────────
    
    const user = new User({
      username,
      email,
      passwordHash  // NEM a sima jelszót, hanem a hash-t tároljuk!
    });
    
    // ──────────────────────────────────────────────────────
    // 4️⃣ MENTÉS IN-MEMORY STORAGE-BA
    // ──────────────────────────────────────────────────────
    
    users.set(user.id, user);
    // Map-be mentés: kulcs = user.id, érték = user objektum
    
    console.log(`[User] Created: ${user.username} (${user.id})`);
    
    return user;
  }
  
  // ════════════════════════════════════════════════════════════════
  // READ METHODS (Lekérdezések)
  // ════════════════════════════════════════════════════════════════
  
  /**
   * User keresése ID alapján
   */
  static findById(id) {
    return users.get(id) || null;
    // users.get(id) → user objektum vagy undefined
    // || null → ha nincs, akkor null-t adunk vissza
  }
  
  /**
   * User keresése username alapján
   */
  static findByUsername(username) {
    return Array.from(users.values())
      .find(user => user.username === username) || null;
    
    // MAGYARÁZAT:
    // users = Map { "id1": user1, "id2": user2, ... }
    // users.values() → Iterator [user1, user2, ...]
    // Array.from(...) → Tömb [user1, user2, ...]
    // .find(user => ...) → Első user ahol username egyezik
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
  
  // ════════════════════════════════════════════════════════════════
  // UPDATE METHODS
  // ════════════════════════════════════════════════════════════════
  
  /**
   * Last login időpontjának frissítése
   */
  static updateLastLogin(id) {
    const user = users.get(id);
    if (user) {
      user.lastLogin = new Date();
      users.set(id, user);  // Frissített user visszamentése
    }
    return user;
  }
  
  // ════════════════════════════════════════════════════════════════
  // PASSWORD METHODS
  // ════════════════════════════════════════════════════════════════
  
  /**
   * Jelszó ellenőrzése
   * 
   * @param {string} password - Plain text jelszó
   * @returns {boolean} Helyes-e a jelszó
   */
  async comparePassword(password) {
    return bcrypt.compare(password, this.passwordHash);
    
    // MIT CSINÁL:
    // - password: "titkos123" (amit a user beírt)
    // - this.passwordHash: "$2b$10$X7eFz..." (ami az adatbázisban van)
    // - bcrypt.compare → true vagy false
    // 
    // HOGYAN:
    // - bcrypt újra hash-eli a password-ot ugyanazzal a salt-tal
    // - Összehasonlítja a két hash-t
    // - Ha egyezik → true (helyes jelszó)
  }
  
  // ════════════════════════════════════════════════════════════════
  // DELETE METHODS
  // ════════════════════════════════════════════════════════════════
  
  /**
   * User törlése
   */
  static delete(id) {
    return users.delete(id);
    // Map.delete() → true ha létezett és töröltük, false ha nem létezett
  }
  
  // ════════════════════════════════════════════════════════════════
  // UTILITY METHODS
  // ════════════════════════════════════════════════════════════════
  
  /**
   * User JSON formátumban (jelszó NÉLKÜL!)
   */
  toJSON() {
    return {
      id: this.id,
      username: this.username,
      email: this.email,
      // passwordHash NINCS benne! (biztonság)
      createdAt: this.createdAt,
      lastLogin: this.lastLogin
    };
  }
  
  /**
   * User-ek száma
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
