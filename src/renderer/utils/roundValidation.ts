import type { TrumpSuit } from '../../shared/types';

export interface RoundFormData {
  callingTeam: 1 | 2 | 3;
  trumpSuit: TrumpSuit;
  entryMode: '2_teams' | '1_team';
  pointsTeam1: string;
  pointsTeam2: string;
  announcementsTeam1: string;
  announcementsTeam2: string;
  beloteTeam: 0 | 1 | 2 | 3;
}

export interface RoundValidationErrors {
  pointsTeam1?: string;
  pointsTeam2?: string;
  announcementsTeam1?: string;
  announcementsTeam2?: string;
  general?: string;
}

/**
 * Validate round form inputs
 */
export function validateRoundForm(formData: RoundFormData): RoundValidationErrors {
  const errors: RoundValidationErrors = {};

  // Parse values
  const points1 = parseInt(formData.pointsTeam1);
  const points2 = parseInt(formData.pointsTeam2);
  const announcements1 = parseInt(formData.announcementsTeam1);
  const announcements2 = parseInt(formData.announcementsTeam2);

  // Validate points Team 1
  if (formData.pointsTeam1.trim() === '') {
    errors.pointsTeam1 = 'Points requis';
  } else if (isNaN(points1)) {
    errors.pointsTeam1 = 'Nombre invalide';
  } else if (points1 < 0) {
    errors.pointsTeam1 = 'Points >= 0';
  } else if (points1 > 162) {
    errors.pointsTeam1 = 'Points <= 162';
  }

  // Validate points Team 2 (only if 2 teams mode)
  if (formData.entryMode === '2_teams') {
    if (formData.pointsTeam2.trim() === '') {
      errors.pointsTeam2 = 'Points requis';
    } else if (isNaN(points2)) {
      errors.pointsTeam2 = 'Nombre invalide';
    } else if (points2 < 0) {
      errors.pointsTeam2 = 'Points >= 0';
    } else if (points2 > 162) {
      errors.pointsTeam2 = 'Points <= 162';
    }
  }

  // Validate announcements Team 1
  if (formData.announcementsTeam1.trim() !== '') {
    if (isNaN(announcements1)) {
      errors.announcementsTeam1 = 'Nombre invalide';
    } else if (announcements1 < 0) {
      errors.announcementsTeam1 = 'Annonces >= 0';
    } else if (announcements1 % 10 !== 0) {
      errors.announcementsTeam1 = 'Multiple de 10';
    }
  }

  // Validate announcements Team 2
  if (formData.announcementsTeam2.trim() !== '') {
    if (isNaN(announcements2)) {
      errors.announcementsTeam2 = 'Nombre invalide';
    } else if (announcements2 < 0) {
      errors.announcementsTeam2 = 'Annonces >= 0';
    } else if (announcements2 % 10 !== 0) {
      errors.announcementsTeam2 = 'Multiple de 10';
    }
  }

  // Validate total in 2 teams mode
  if (formData.entryMode === '2_teams' && !errors.pointsTeam1 && !errors.pointsTeam2 && !errors.announcementsTeam1 && !errors.announcementsTeam2) {
    const ann1 = isNaN(announcements1) ? 0 : announcements1;
    const ann2 = isNaN(announcements2) ? 0 : announcements2;
    const beloteBonus = formData.beloteTeam !== 0 ? 20 : 0;
    const total = points1 + points2 + ann1 + ann2 + beloteBonus;

    if (total !== 162) {
      errors.general = `Total doit être 162 (actuellement: ${total})`;
    }
  }

  return errors;
}

/**
 * Check if the round form is valid
 */
export function isRoundFormValid(
  formData: RoundFormData,
  errors: RoundValidationErrors
): boolean {
  // Check if there are any errors
  if (Object.keys(errors).length > 0) {
    return false;
  }

  // Check if required fields are filled
  if (formData.pointsTeam1.trim() === '') {
    return false;
  }

  if (formData.entryMode === '2_teams' && formData.pointsTeam2.trim() === '') {
    return false;
  }

  return true;
}

/**
 * Calculate points for each team based on entry mode
 */
export function calculateRoundPoints(formData: RoundFormData): {
  team1Points: number;
  team2Points: number;
} {
  const points1 = parseInt(formData.pointsTeam1) || 0;
  const points2 = parseInt(formData.pointsTeam2) || 0;

  if (formData.entryMode === '2_teams') {
    return {
      team1Points: points1,
      team2Points: points2,
    };
  }

  // 1 team mode: auto-calculate opponent points
  const callingPoints = formData.callingTeam === 1 ? points1 : points2;
  const callingAnnouncements = formData.callingTeam === 1
    ? (parseInt(formData.announcementsTeam1) || 0)
    : (parseInt(formData.announcementsTeam2) || 0);
  const beloteBonus = formData.beloteTeam === formData.callingTeam ? 20 : 0;
  const opponentPoints = 162 - callingPoints - callingAnnouncements - beloteBonus;

  return {
    team1Points: formData.callingTeam === 1 ? callingPoints : opponentPoints,
    team2Points: formData.callingTeam === 2 ? callingPoints : opponentPoints,
  };
}

/**
 * Calculate total points including announcements and belote
 */
export function calculateTotalPoints(formData: RoundFormData): number {
  const { team1Points, team2Points } = calculateRoundPoints(formData);
  const announcements1 = parseInt(formData.announcementsTeam1) || 0;
  const announcements2 = parseInt(formData.announcementsTeam2) || 0;
  const beloteBonus = formData.beloteTeam !== 0 ? 20 : 0;

  return team1Points + team2Points + announcements1 + announcements2 + beloteBonus;
}
