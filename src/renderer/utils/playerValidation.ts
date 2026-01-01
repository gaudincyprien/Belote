export interface PlayerFormData {
  nom: string;
}

export interface PlayerValidationErrors {
  nom?: string;
}

/**
 * Validate player name
 * Rules:
 * - 2-30 characters
 * - No leading/trailing whitespace after trim
 */
export function validatePlayerName(nom: string): PlayerValidationErrors {
  const errors: PlayerValidationErrors = {};
  const trimmedNom = nom.trim();

  if (trimmedNom.length === 0) {
    errors.nom = 'Le nom est requis';
  } else if (trimmedNom.length < 2) {
    errors.nom = 'Minimum 2 caractères';
  } else if (trimmedNom.length > 30) {
    errors.nom = 'Maximum 30 caractères';
  }

  return errors;
}

/**
 * Check if player form is valid
 */
export function isPlayerFormValid(
  nom: string,
  errors: PlayerValidationErrors
): boolean {
  const trimmedNom = nom.trim();
  return trimmedNom.length >= 2 &&
         trimmedNom.length <= 30 &&
         Object.keys(errors).length === 0;
}
