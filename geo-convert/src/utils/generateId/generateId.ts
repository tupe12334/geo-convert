/**
 * Generate a unique identifier for conversion history records.
 *
 * The identifier ensures each stored record can be reliably referenced.
 */
export const generateId = (): string => {
  return Date.now().toString() + Math.random().toString(36).slice(2, 11);
};
