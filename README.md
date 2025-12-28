# Belote Scorer

Application de bureau cross-platform pour gérer les scores lors de parties de belote.

## Description

Belote Scorer est une application Electron construite avec React et TypeScript qui permet de suivre et gérer les scores pendant vos parties de belote. L'application supporte les modes 4 joueurs (2 équipes de 2) et 3 joueurs avec un système complet de statistiques.

## Stack Technique

**Frontend:**
- Electron + React
- TypeScript
- Tailwind CSS

**Backend (Electron):**
- Node.js (natif avec Electron)
- Better-SQLite3 (SQLite synchrone)
- Electron-store pour les préférences utilisateur

**Build/Package:**
- Electron Forge avec Webpack
- Cross-platform: Windows, Linux, Mac

**Testing:**
- Jest (tests unitaires)
- Playwright (tests E2E)

## Installation

```bash
npm install
```

## Développement

```bash
npm start
```

## Tests

```bash
npm test              # Tous les tests
npm run test:unit     # Tests unitaires Jest
npm run test:e2e      # Tests E2E Playwright
```

## Linting

```bash
npm run lint          # Vérifier le code
npm run lint:fix      # Corriger automatiquement
```

## Build

```bash
npm run package       # Package l'application
npm run make          # Créer les installeurs
```

## Structure du Projet

```
/src
  /main         - Processus principal Electron
    /database   - DatabaseService, migrations, modèles
    /ipc        - Gestionnaires IPC
  /renderer     - Interface React
    /components - Composants réutilisables
    /pages      - Composants de pages
    /hooks      - Hooks React personnalisés
    /utils      - Fonctions utilitaires
    /styles     - Styles CSS/Tailwind
  /shared       - Types TypeScript et constantes communs
/tests
  /unit         - Tests unitaires Jest
  /e2e          - Tests E2E Playwright
```

## Documentation

Voir le dossier `/doc` pour la documentation complète :
- `CLAUDE.md` - Guide pour Claude Code
- `avancement.md` - Tickets de développement et progression

## Licence

MIT
