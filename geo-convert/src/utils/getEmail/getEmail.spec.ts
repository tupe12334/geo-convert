import { describe, it, expect } from 'vitest';
import { getEmail } from './getEmail';

describe('getEmail', () => {
  it('should return the hardcoded email address', () => {
    const email = getEmail();
    expect(email).toBe('ofek.gabay.he@gmail.com');
  });

  it('should return a valid email format', () => {
    const email = getEmail();
    expect(email).toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
  });
});
