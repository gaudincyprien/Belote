import {
  validateRoundForm,
  isRoundFormValid,
  calculateRoundPoints,
  calculateTotalPoints,
  RoundFormData,
} from '../../src/renderer/utils/roundValidation';

describe('validateRoundForm', () => {
  describe('2 teams mode', () => {
    it('should return no errors for valid input', () => {
      const formData: RoundFormData = {
        callingTeam: 1,
        trumpSuit: 'pique',
        entryMode: '2_teams',
        pointsTeam1: '100',
        pointsTeam2: '62',
        announcementsTeam1: '0',
        announcementsTeam2: '0',
        beloteTeam: 0,
      };

      const errors = validateRoundForm(formData);
      expect(errors).toEqual({});
    });

    it('should return error for invalid total (without bonus)', () => {
      const formData: RoundFormData = {
        callingTeam: 1,
        trumpSuit: 'coeur',
        entryMode: '2_teams',
        pointsTeam1: '100',
        pointsTeam2: '50',
        announcementsTeam1: '0',
        announcementsTeam2: '0',
        beloteTeam: 0,
      };

      const errors = validateRoundForm(formData);
      expect(errors.general).toContain('Total doit être 162');
    });

    it('should accept valid total with announcements', () => {
      const formData: RoundFormData = {
        callingTeam: 1,
        trumpSuit: 'carreau',
        entryMode: '2_teams',
        pointsTeam1: '100',
        pointsTeam2: '32',
        announcementsTeam1: '30',
        announcementsTeam2: '0',
        beloteTeam: 0,
      };

      const errors = validateRoundForm(formData);
      expect(errors).toEqual({});
    });

    it('should accept valid total with belote', () => {
      const formData: RoundFormData = {
        callingTeam: 1,
        trumpSuit: 'trefle',
        entryMode: '2_teams',
        pointsTeam1: '100',
        pointsTeam2: '42',
        announcementsTeam1: '0',
        announcementsTeam2: '0',
        beloteTeam: 1,
      };

      const errors = validateRoundForm(formData);
      expect(errors).toEqual({});
    });

    it('should accept valid total with announcements and belote', () => {
      const formData: RoundFormData = {
        callingTeam: 1,
        trumpSuit: 'pique',
        entryMode: '2_teams',
        pointsTeam1: '120',
        pointsTeam2: '12',
        announcementsTeam1: '0',
        announcementsTeam2: '10',
        beloteTeam: 2,
      };

      const errors = validateRoundForm(formData);
      expect(errors).toEqual({});
    });

    it('should return error for negative points', () => {
      const formData: RoundFormData = {
        callingTeam: 1,
        trumpSuit: 'coeur',
        entryMode: '2_teams',
        pointsTeam1: '-10',
        pointsTeam2: '62',
        announcementsTeam1: '0',
        announcementsTeam2: '0',
        beloteTeam: 0,
      };

      const errors = validateRoundForm(formData);
      expect(errors.pointsTeam1).toBe('Points >= 0');
    });

    it('should return error for points > 162', () => {
      const formData: RoundFormData = {
        callingTeam: 1,
        trumpSuit: 'carreau',
        entryMode: '2_teams',
        pointsTeam1: '200',
        pointsTeam2: '62',
        announcementsTeam1: '0',
        announcementsTeam2: '0',
        beloteTeam: 0,
      };

      const errors = validateRoundForm(formData);
      expect(errors.pointsTeam1).toBe('Points <= 162');
    });

    it('should return error for non-numeric points', () => {
      const formData: RoundFormData = {
        callingTeam: 1,
        trumpSuit: 'trefle',
        entryMode: '2_teams',
        pointsTeam1: 'abc',
        pointsTeam2: '62',
        announcementsTeam1: '0',
        announcementsTeam2: '0',
        beloteTeam: 0,
      };

      const errors = validateRoundForm(formData);
      expect(errors.pointsTeam1).toBe('Nombre invalide');
    });

    it('should return error for empty points', () => {
      const formData: RoundFormData = {
        callingTeam: 1,
        trumpSuit: 'pique',
        entryMode: '2_teams',
        pointsTeam1: '',
        pointsTeam2: '62',
        announcementsTeam1: '0',
        announcementsTeam2: '0',
        beloteTeam: 0,
      };

      const errors = validateRoundForm(formData);
      expect(errors.pointsTeam1).toBe('Points requis');
    });

    it('should return error for announcements not multiple of 10', () => {
      const formData: RoundFormData = {
        callingTeam: 1,
        trumpSuit: 'coeur',
        entryMode: '2_teams',
        pointsTeam1: '100',
        pointsTeam2: '52',
        announcementsTeam1: '15',
        announcementsTeam2: '0',
        beloteTeam: 0,
      };

      const errors = validateRoundForm(formData);
      expect(errors.announcementsTeam1).toBe('Multiple de 10');
    });

    it('should return error for negative announcements', () => {
      const formData: RoundFormData = {
        callingTeam: 1,
        trumpSuit: 'carreau',
        entryMode: '2_teams',
        pointsTeam1: '100',
        pointsTeam2: '62',
        announcementsTeam1: '-10',
        announcementsTeam2: '0',
        beloteTeam: 0,
      };

      const errors = validateRoundForm(formData);
      expect(errors.announcementsTeam1).toBe('Annonces >= 0');
    });
  });

  describe('1 team mode', () => {
    it('should return no errors for valid input (no total check in 1 team mode)', () => {
      const formData: RoundFormData = {
        callingTeam: 1,
        trumpSuit: 'pique',
        entryMode: '1_team',
        pointsTeam1: '100',
        pointsTeam2: '',
        announcementsTeam1: '0',
        announcementsTeam2: '0',
        beloteTeam: 0,
      };

      const errors = validateRoundForm(formData);
      expect(errors).toEqual({});
    });

    it('should not require points for team 2 in 1 team mode', () => {
      const formData: RoundFormData = {
        callingTeam: 2,
        trumpSuit: 'coeur',
        entryMode: '1_team',
        pointsTeam1: '',
        pointsTeam2: '120',
        announcementsTeam1: '0',
        announcementsTeam2: '0',
        beloteTeam: 0,
      };

      const errors = validateRoundForm(formData);
      expect(errors.pointsTeam2).toBeUndefined();
    });
  });
});

describe('isRoundFormValid', () => {
  it('should return true for valid form', () => {
    const formData: RoundFormData = {
      callingTeam: 1,
      trumpSuit: 'pique',
      entryMode: '2_teams',
      pointsTeam1: '100',
      pointsTeam2: '62',
      announcementsTeam1: '0',
      announcementsTeam2: '0',
      beloteTeam: 0,
    };
    const errors = validateRoundForm(formData);

    expect(isRoundFormValid(formData, errors)).toBe(true);
  });

  it('should return false for form with errors', () => {
    const formData: RoundFormData = {
      callingTeam: 1,
      trumpSuit: 'coeur',
      entryMode: '2_teams',
      pointsTeam1: 'abc',
      pointsTeam2: '62',
      announcementsTeam1: '0',
      announcementsTeam2: '0',
      beloteTeam: 0,
    };
    const errors = validateRoundForm(formData);

    expect(isRoundFormValid(formData, errors)).toBe(false);
  });

  it('should return false for empty points in team 1', () => {
    const formData: RoundFormData = {
      callingTeam: 1,
      trumpSuit: 'carreau',
      entryMode: '2_teams',
      pointsTeam1: '',
      pointsTeam2: '62',
      announcementsTeam1: '0',
      announcementsTeam2: '0',
      beloteTeam: 0,
    };
    const errors = validateRoundForm(formData);

    expect(isRoundFormValid(formData, errors)).toBe(false);
  });

  it('should return false for empty points in team 2 (2 teams mode)', () => {
    const formData: RoundFormData = {
      callingTeam: 1,
      trumpSuit: 'trefle',
      entryMode: '2_teams',
      pointsTeam1: '100',
      pointsTeam2: '',
      announcementsTeam1: '0',
      announcementsTeam2: '0',
      beloteTeam: 0,
    };
    const errors = validateRoundForm(formData);

    expect(isRoundFormValid(formData, errors)).toBe(false);
  });

  it('should return true for valid 1 team mode (team 2 points not required)', () => {
    const formData: RoundFormData = {
      callingTeam: 1,
      trumpSuit: 'pique',
      entryMode: '1_team',
      pointsTeam1: '100',
      pointsTeam2: '',
      announcementsTeam1: '0',
      announcementsTeam2: '0',
      beloteTeam: 0,
    };
    const errors = validateRoundForm(formData);

    expect(isRoundFormValid(formData, errors)).toBe(true);
  });
});

describe('calculateRoundPoints', () => {
  describe('2 teams mode', () => {
    it('should return provided points for both teams', () => {
      const formData: RoundFormData = {
        callingTeam: 1,
        trumpSuit: 'coeur',
        entryMode: '2_teams',
        pointsTeam1: '100',
        pointsTeam2: '62',
        announcementsTeam1: '0',
        announcementsTeam2: '0',
        beloteTeam: 0,
      };

      const result = calculateRoundPoints(formData);
      expect(result.team1Points).toBe(100);
      expect(result.team2Points).toBe(62);
    });
  });

  describe('1 team mode', () => {
    it('should auto-calculate opponent points for team 1 calling', () => {
      const formData: RoundFormData = {
        callingTeam: 1,
        trumpSuit: 'pique',
        entryMode: '1_team',
        pointsTeam1: '100',
        pointsTeam2: '',
        announcementsTeam1: '0',
        announcementsTeam2: '0',
        beloteTeam: 0,
      };

      const result = calculateRoundPoints(formData);
      expect(result.team1Points).toBe(100);
      expect(result.team2Points).toBe(62); // 162 - 100
    });

    it('should auto-calculate opponent points for team 2 calling', () => {
      const formData: RoundFormData = {
        callingTeam: 2,
        trumpSuit: 'carreau',
        entryMode: '1_team',
        pointsTeam1: '',
        pointsTeam2: '120',
        announcementsTeam1: '0',
        announcementsTeam2: '0',
        beloteTeam: 0,
      };

      const result = calculateRoundPoints(formData);
      expect(result.team1Points).toBe(42); // 162 - 120
      expect(result.team2Points).toBe(120);
    });

    it('should account for announcements in auto-calculation', () => {
      const formData: RoundFormData = {
        callingTeam: 1,
        trumpSuit: 'trefle',
        entryMode: '1_team',
        pointsTeam1: '100',
        pointsTeam2: '',
        announcementsTeam1: '30',
        announcementsTeam2: '0',
        beloteTeam: 0,
      };

      const result = calculateRoundPoints(formData);
      expect(result.team1Points).toBe(100);
      expect(result.team2Points).toBe(32); // 162 - 100 - 30
    });

    it('should account for belote in auto-calculation', () => {
      const formData: RoundFormData = {
        callingTeam: 1,
        trumpSuit: 'coeur',
        entryMode: '1_team',
        pointsTeam1: '100',
        pointsTeam2: '',
        announcementsTeam1: '0',
        announcementsTeam2: '0',
        beloteTeam: 1,
      };

      const result = calculateRoundPoints(formData);
      expect(result.team1Points).toBe(100);
      expect(result.team2Points).toBe(42); // 162 - 100 - 20
    });
  });
});

describe('calculateTotalPoints', () => {
  it('should calculate total with base points only', () => {
    const formData: RoundFormData = {
      callingTeam: 1,
      trumpSuit: 'pique',
      entryMode: '2_teams',
      pointsTeam1: '100',
      pointsTeam2: '62',
      announcementsTeam1: '0',
      announcementsTeam2: '0',
      beloteTeam: 0,
    };

    const total = calculateTotalPoints(formData);
    expect(total).toBe(162);
  });

  it('should calculate total with announcements', () => {
    const formData: RoundFormData = {
      callingTeam: 1,
      trumpSuit: 'coeur',
      entryMode: '2_teams',
      pointsTeam1: '100',
      pointsTeam2: '32',
      announcementsTeam1: '30',
      announcementsTeam2: '0',
      beloteTeam: 0,
    };

    const total = calculateTotalPoints(formData);
    expect(total).toBe(162);
  });

  it('should calculate total with belote', () => {
    const formData: RoundFormData = {
      callingTeam: 1,
      trumpSuit: 'carreau',
      entryMode: '2_teams',
      pointsTeam1: '100',
      pointsTeam2: '42',
      announcementsTeam1: '0',
      announcementsTeam2: '0',
      beloteTeam: 1,
    };

    const total = calculateTotalPoints(formData);
    expect(total).toBe(162);
  });

  it('should calculate total with announcements and belote', () => {
    const formData: RoundFormData = {
      callingTeam: 1,
      trumpSuit: 'trefle',
      entryMode: '2_teams',
      pointsTeam1: '120',
      pointsTeam2: '12',
      announcementsTeam1: '0',
      announcementsTeam2: '10',
      beloteTeam: 2,
    };

    const total = calculateTotalPoints(formData);
    expect(total).toBe(162);
  });

  it('should calculate total in 1 team mode', () => {
    const formData: RoundFormData = {
      callingTeam: 1,
      trumpSuit: 'pique',
      entryMode: '1_team',
      pointsTeam1: '100',
      pointsTeam2: '',
      announcementsTeam1: '0',
      announcementsTeam2: '0',
      beloteTeam: 0,
    };

    const total = calculateTotalPoints(formData);
    expect(total).toBe(162);
  });
});
