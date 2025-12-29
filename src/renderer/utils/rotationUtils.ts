/**
 * Calcule quel joueur est "au pot" (dealer, ne joue pas) pour une manche donnée
 * @param roundNumber Numéro de la manche (commence à 1)
 * @returns 1, 2, ou 3 selon le joueur au pot
 */
export function getPlayerAuPot(roundNumber: number): 1 | 2 | 3 {
  const playerIndex = (roundNumber - 1) % 3;
  return (playerIndex + 1) as 1 | 2 | 3;
}

/**
 * Détermine les deux joueurs actifs pour une manche donnée
 * @param roundNumber Numéro de la manche (commence à 1)
 * @returns Array de 2 joueurs (parmi 1, 2, 3) qui jouent cette manche
 */
export function getActivePlayers(roundNumber: number): [1 | 2 | 3, 1 | 2 | 3] {
  const auPot = getPlayerAuPot(roundNumber);
  const allPlayers: (1 | 2 | 3)[] = [1, 2, 3];
  const active = allPlayers.filter(p => p !== auPot) as [1 | 2 | 3, 1 | 2 | 3];
  return active;
}

/**
 * Retourne le nom du joueur au pot pour affichage
 * @param roundNumber Numéro de la manche
 * @param playerNames Array de noms [nom1, nom2, nom3]
 * @returns Nom du joueur au pot
 */
export function getPlayerAuPotName(roundNumber: number, playerNames: [string, string, string]): string {
  const auPot = getPlayerAuPot(roundNumber);
  return playerNames[auPot - 1];
}
