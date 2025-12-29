import { getPlayerAuPot, getActivePlayers, getPlayerAuPotName } from '../../src/renderer/utils/rotationUtils';

describe('getPlayerAuPot', () => {
  it('should return player 1 for round 1', () => {
    expect(getPlayerAuPot(1)).toBe(1);
  });

  it('should return player 2 for round 2', () => {
    expect(getPlayerAuPot(2)).toBe(2);
  });

  it('should return player 3 for round 3', () => {
    expect(getPlayerAuPot(3)).toBe(3);
  });

  it('should cycle back to player 1 for round 4', () => {
    expect(getPlayerAuPot(4)).toBe(1);
  });

  it('should cycle back to player 2 for round 5', () => {
    expect(getPlayerAuPot(5)).toBe(2);
  });

  it('should cycle back to player 3 for round 6', () => {
    expect(getPlayerAuPot(6)).toBe(3);
  });

  it('should handle large round numbers', () => {
    expect(getPlayerAuPot(100)).toBe(1); // (100-1) % 3 = 0 → player 1
    expect(getPlayerAuPot(101)).toBe(2);
    expect(getPlayerAuPot(102)).toBe(3);
  });
});

describe('getActivePlayers', () => {
  it('should return players 2 and 3 when player 1 is au pot', () => {
    expect(getActivePlayers(1)).toEqual([2, 3]);
  });

  it('should return players 1 and 3 when player 2 is au pot', () => {
    expect(getActivePlayers(2)).toEqual([1, 3]);
  });

  it('should return players 1 and 2 when player 3 is au pot', () => {
    expect(getActivePlayers(3)).toEqual([1, 2]);
  });

  it('should return players 2 and 3 for round 4 (player 1 au pot)', () => {
    expect(getActivePlayers(4)).toEqual([2, 3]);
  });

  it('should return players 1 and 3 for round 5 (player 2 au pot)', () => {
    expect(getActivePlayers(5)).toEqual([1, 3]);
  });

  it('should return players 1 and 2 for round 6 (player 3 au pot)', () => {
    expect(getActivePlayers(6)).toEqual([1, 2]);
  });
});

describe('getPlayerAuPotName', () => {
  const playerNames: [string, string, string] = ['Alice', 'Bob', 'Charlie'];

  it('should return first player name for round 1', () => {
    expect(getPlayerAuPotName(1, playerNames)).toBe('Alice');
  });

  it('should return second player name for round 2', () => {
    expect(getPlayerAuPotName(2, playerNames)).toBe('Bob');
  });

  it('should return third player name for round 3', () => {
    expect(getPlayerAuPotName(3, playerNames)).toBe('Charlie');
  });

  it('should cycle correctly', () => {
    expect(getPlayerAuPotName(4, playerNames)).toBe('Alice');
    expect(getPlayerAuPotName(5, playerNames)).toBe('Bob');
    expect(getPlayerAuPotName(6, playerNames)).toBe('Charlie');
  });
});
