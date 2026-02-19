/**
 * HELPER FUNCTIONS
 * Általános segédfüggvények
 */

// ════════════════════════════════════════════════════════════════
// VÉLETLENSZERŰ KOORDINÁTA GENERÁLÁS
// ════════════════════════════════════════════════════════════════

export const generateRandomCoordinates = (min = 0, max = 99) => {
  return {
    x: Math.floor(Math.random() * (max - min + 1)) + min,
    y: Math.floor(Math.random() * (max - min + 1)) + min
  };
};

// HASZNÁLAT:
// generateRandomCoordinates()
// → { x: 45, y: 67 }

// ════════════════════════════════════════════════════════════════
// TÁVOLSÁG SZÁMÍTÁS KÉT KOORDINÁTA KÖZÖTT
// ════════════════════════════════════════════════════════════════

export const calculateDistance = (x1, y1, x2, y2) => {
  return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
};

// HASZNÁLAT:
// calculateDistance(45, 67, 50, 70)
// → 5.83 mező

// ════════════════════════════════════════════════════════════════
// IDŐ FORMÁZÁS (másodperc → óra:perc:másodperc)
// ════════════════════════════════════════════════════════════════

export const formatTime = (seconds) => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

// HASZNÁLAT:
// formatTime(412)
// → "00:06:52"

// ════════════════════════════════════════════════════════════════
// SZÁMOK FORMÁZÁSA (1000 → 1,000)
// ════════════════════════════════════════════════════════════════

export const formatNumber = (num) => {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

// HASZNÁLAT:
// formatNumber(1500000)
// → "1,500,000"

// ════════════════════════════════════════════════════════════════
// DÁTUM FORMÁZÁS MAGYAR FORMÁTUMBAN
// ════════════════════════════════════════════════════════════════

export const formatDate = (date) => {
  const d = new Date(date);
  return d.toLocaleString('hu-HU', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// HASZNÁLAT:
// formatDate(new Date())
// → "2025. 02. 16. 14:30"

// ════════════════════════════════════════════════════════════════
// VÉLETLENSZERŰ ID GENERÁLÁS (ha nem UUID kell)
// ════════════════════════════════════════════════════════════════

export const generateId = (length = 8) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

// HASZNÁLAT:
// generateId(12)
// → "aB3xYz9pQw12"

export default {
  generateRandomCoordinates,
  calculateDistance,
  formatTime,
  formatNumber,
  formatDate,
  generateId
};