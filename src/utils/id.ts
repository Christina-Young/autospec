/**
 * Generate a unique ID
 * Uses crypto.randomUUID() if available, otherwise falls back to timestamp-based ID
 */
export function generateId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    try {
      return crypto.randomUUID();
    } catch (e) {
      // Fall through to fallback
    }
  }
  // Fallback for environments without crypto.randomUUID
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

