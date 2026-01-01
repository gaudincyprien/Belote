# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Belote Scorer is a cross-platform desktop application built with Electron, React, and TypeScript for managing scores during Belote card game parties. The application supports both 4-player (2 teams) and 3-player modes with comprehensive statistics tracking.

## Stack Technique

**Frontend:**
- Electron + React
- TypeScript
- Tailwind CSS

**Backend (Electron):**
- Node.js (native with Electron)
- Better-SQLite3 (synchronous SQLite)
- Electron-store for user preferences

**Build/Package:**
- Electron Builder (cross-platform: Windows, Linux, Mac)

**Testing:**
- Jest (unit tests)
- Playwright (E2E tests)

**CI/CD:**
- GitHub Actions with automated builds and releases

## Project Structure

```
/src
  /main         - Electron main process
    /database   - DatabaseService, migrations, models
    /ipc        - IPC handlers
  /renderer     - React UI
    /components - Reusable components
    /pages      - Page components
    /hooks      - Custom React hooks
    /utils      - Utility functions
    /styles     - CSS/Tailwind styles
  /shared       - Common TypeScript types and constants
/tests
  /unit         - Jest unit tests
  /e2e          - Playwright E2E tests
/doc
  /avancement.md - Development tickets and progress tracking
```

## Database Schema

The application uses SQLite with the following main tables:
- `joueurs` - Players
- `parties` - Games
- `manches` - Rounds within games
- `parties_joueurs` - Many-to-many relationship between games and players
- `migrations` - Database version tracking

Database location: `app.getPath('userData')/belote.db`

## Development Commands

**Setup:**
```bash
npm install
```

**Development:**
```bash
npm start          # Start Electron app in dev mode with hot reload
```

**Testing:**
```bash
npm test           # Run all tests
npm run test:unit  # Run Jest unit tests with coverage
npm run test:e2e   # Run Playwright E2E tests
npm run lint       # Run ESLint
npm run lint:fix   # Fix linting issues
```

**Building:**
```bash
npm run build:win    # Build for Windows
npm run build:linux  # Build for Linux
npm run build:all    # Build for all platforms
```

## Git Workflow

**Branch Strategy:**
- `main` - Production-ready code
- `dev` - Development branch (integration branch)
- `feat/description` - Feature branches for each ticket

**Development Process:**
1. Create a new branch from `dev` for each ticket: `git checkout -b feat/ticket-number_description`
2. Implement the ticket on the feature branch
3. Commit with meaningful messages referencing the ticket: `git commit -m "feat/ticket-number_description"`
4. Merge the feature branch into `dev` when the ticket is complete
5. Delete the feature branch after successful merge

**Example:**
```bash
git checkout dev
git checkout -b feat-000-init-electron
# ... make changes ...
git add .
git commit -m "feat-000: Initialize Electron project with React and TypeScript"
git checkout dev
git merge feat-000-init-electron
git branch -d feat-000-init-electron
```

## Branch Protection Rules

### Protection pour `main`

**Restrictions obligatoires:**
- ❌ Interdiction de suppression de la branche
- ❌ Interdiction de commit direct (no direct commits)
- ❌ Interdiction de force push

**Merges autorisés uniquement depuis:**
- ✅ Branche `dev` (après validation complète)
- ✅ Branches `hotfix/*` (pour les corrections urgentes en production)

**Prérequis avant merge:**
- ✅ Pull Request obligatoire avec review
- ✅ CI/CD doit passer (tests + build)
- ✅ Pas de conflits
- ✅ Code review approuvé (minimum 1 reviewer)

### Protection pour `dev`

**Restrictions obligatoires:**
- ❌ Interdiction de suppression de la branche
- ❌ Interdiction de force push
- ⚠️ Commits directs déconseillés (préférer les PRs)

**Merges autorisés uniquement depuis:**
- ✅ Branches `feat/XXX*` (feature branches)
- ✅ Branches `hotfix/*` (si nécessaire de synchroniser)

**Prérequis avant merge:**
- ✅ Tests unitaires passent
- ✅ Pas de conflits
- ✅ Code lint validé

### Branches `hotfix/*`

**Usage:**
- Pour corriger des bugs critiques en production
- Créées depuis `main`
- Mergées dans `main` ET `dev` pour synchronisation

**Exemple:**
```bash
git checkout main
git checkout -b hotfix/fix-critical-crash
# ... fix bug ...
git commit -m "hotfix: Fix critical crash on score validation"
# Merge vers main
git checkout main
git merge hotfix/fix-critical-crash
git tag -a v1.0.1 -m "Hotfix: Critical crash fix"
# Merge vers dev pour synchronisation
git checkout dev
git merge hotfix/fix-critical-crash
# Cleanup
git branch -d hotfix/fix-critical-crash
```

### Configuration GitHub

Pour activer ces protections sur GitHub:

1. **Settings** → **Branches** → **Add branch protection rule**

2. **Pour `main`:**
   - Branch name pattern: `main`
   - ✅ Require pull request before merging
   - ✅ Require approvals (minimum: 1)
   - ✅ Require status checks to pass before merging
   - ✅ Require branches to be up to date before merging
   - ✅ Do not allow bypassing the above settings
   - ✅ Restrict who can push to matching branches
   - ✅ Allow only: `dev` et `hotfix/*` branches

3. **Pour `dev`:**
   - Branch name pattern: `dev`
   - ✅ Require pull request before merging (recommandé)
   - ✅ Require status checks to pass before merging
   - ✅ Require branches to be up to date before merging
   - ✅ Allow only: `DEV-*` et `hotfix/*` branches

## Important Workflow Guidelines

### 1. Documentation Updates

**CRITICAL:** When completing tickets or adding features:
- Update `README.md` with new functionality
- Update `doc/avancement.md` to mark tickets as completed (✅)
- Keep documentation in sync with code

### 2. Testing Requirements

All code must include:
- **Unit tests** for business logic, calculations, validations, and database operations
- **Integration tests** for component interactions
- Tests must be executable by CI/CD pipeline
- Target coverage: 70% minimum (configured in jest.config.js)

### 3. Validation and Calculations

**Score validation rules:**
- Mode 2 teams: Total points = 162 (base) + annonces + belote
- Mode 1 team: Auto-calculate opposing team
- Annonces: Multiples of 10, >= 0
- Belote: +20 points to the team

**Game modes:**
- 4 players: 2 teams of 2 players
- 3 players: Individual scores with rotating "au pot" (dealer who doesn't play)

### 4. Database Operations

- Always use DatabaseService singleton
- Implement proper error handling for all DB operations
- Use transactions for multi-table operations
- Follow the migration system for schema changes
- Test CRUD operations thoroughly

### 5. CI/CD Pipeline

The GitHub Actions workflow runs on push and automatically:
1. Runs linting (ESLint)
2. Executes unit tests (Jest)
3. Executes E2E tests (Playwright)
4. Builds application for target platforms
5. Creates releases on tag creation

All tests must pass before merge.

## Key Business Logic

### Score Calculation
- Base round points: 162
- Additional points: annonces (multiples of 10) + belote (20)
- Winning condition: Configurable threshold (default: 1000 points)

### 3-Player Rotation
- Each round, one player is "au pot" (dealer position)
- Rotation formula: `manche.numero % 3`
- Only 2 players compete per round

### Statistics Tracking
- Win rate per player/team
- Trump suit distribution and success rates
- Best rounds per player
- Total annonces and belote counts
- Partner performance (4-player mode)

## Settings and Preferences

Stored via `electron-store`:
- `seuilVictoire` (number, default: 1000)
- `confirmationSuppression` (boolean, default: true)
- `theme` ('light' | 'dark' | 'auto')
- `taillePolice` ('small' | 'medium' | 'large')
- `raccourcisActives` (boolean, default: true)
- `sonNotifications` (boolean, default: false)
- `langue` (string, default: 'fr')

## Development Tickets

All development work is organized in tickets within `doc/avancement.md`:
- **PHASE 0:** Project setup (DEV-000 to DEV-001)
- **EPIC 1:** Simple game MVP (DEV-002 to DEV-006)
- **EPIC 2:** Player management and history (DEV-007 to DEV-009)
- **EPIC 3:** Advanced statistics (DEV-010 to DEV-011)
- **EPIC 4:** Polish and bonus features (DEV-012 to DEV-016)
- **EPIC 5:** CI/CD and automation (DEV-017)

When working on tickets, always reference the ticket number in commits and update the progress in `doc/avancement.md`.
