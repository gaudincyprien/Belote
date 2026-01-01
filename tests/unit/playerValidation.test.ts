import {
  validatePlayerName,
  isPlayerFormValid,
  type PlayerValidationErrors
} from '../../src/renderer/utils/playerValidation';

describe('validatePlayerName', () => {
  it('should return no errors for valid name', () => {
    const errors = validatePlayerName('Alice');
    expect(errors).toEqual({});
  });

  it('should return error for empty name', () => {
    const errors = validatePlayerName('');
    expect(errors.nom).toBe('Le nom est requis');
  });

  it('should return error for name with less than 2 characters', () => {
    const errors = validatePlayerName('A');
    expect(errors.nom).toBe('Minimum 2 caractères');
  });

  it('should return error for name with more than 30 characters', () => {
    const longName = 'A'.repeat(31);
    const errors = validatePlayerName(longName);
    expect(errors.nom).toBe('Maximum 30 caractères');
  });

  it('should trim whitespace before validation', () => {
    const errors = validatePlayerName('  Alice  ');
    expect(errors).toEqual({});
  });

  it('should accept name with exactly 2 characters', () => {
    const errors = validatePlayerName('AB');
    expect(errors).toEqual({});
  });

  it('should accept name with exactly 30 characters', () => {
    const name = 'A'.repeat(30);
    const errors = validatePlayerName(name);
    expect(errors).toEqual({});
  });

  it('should return error for whitespace-only name', () => {
    const errors = validatePlayerName('   ');
    expect(errors.nom).toBe('Le nom est requis');
  });

  it('should accept name with spaces in the middle', () => {
    const errors = validatePlayerName('Jean Paul');
    expect(errors).toEqual({});
  });
});

describe('isPlayerFormValid', () => {
  it('should return true for valid name', () => {
    const errors = validatePlayerName('Alice');
    expect(isPlayerFormValid('Alice', errors)).toBe(true);
  });

  it('should return false for empty name', () => {
    const errors = validatePlayerName('');
    expect(isPlayerFormValid('', errors)).toBe(false);
  });

  it('should return false if errors exist', () => {
    const errors: PlayerValidationErrors = { nom: 'Error' };
    expect(isPlayerFormValid('Alice', errors)).toBe(false);
  });

  it('should return false for name too short', () => {
    const errors = validatePlayerName('A');
    expect(isPlayerFormValid('A', errors)).toBe(false);
  });

  it('should return false for name too long', () => {
    const longName = 'A'.repeat(31);
    const errors = validatePlayerName(longName);
    expect(isPlayerFormValid(longName, errors)).toBe(false);
  });

  it('should return true after trimming valid whitespace', () => {
    const errors = validatePlayerName('  Alice  ');
    expect(isPlayerFormValid('  Alice  ', errors)).toBe(true);
  });

  it('should return false for whitespace-only string', () => {
    const errors = validatePlayerName('   ');
    expect(isPlayerFormValid('   ', errors)).toBe(false);
  });
});
