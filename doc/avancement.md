# 🎴 Belote Scorer - Tickets de développement

## 📋 Table des matières
- [Stack technique](#-stack-technique)
- [Phase 0 : Setup projet](#phase-0--setup-projet)
- [EPIC 1 : Partie simple (MVP)](#epic-1--partie-simple-mvp)
- [EPIC 2 : Gestion des joueurs et historique](#epic-2--gestion-des-joueurs-et-historique)
- [EPIC 3 : Statistiques avancées](#epic-3--statistiques-avancées)
- [EPIC 4 : Polish & Features bonus](#epic-4--polish--features-bonus)
- [EPIC 5 : CI/CD & Automatisation](#epic-5--cicd--automatisation)
- [Priorisation](#-priorisation-recommandée)

---

## 🛠️ Stack technique

**Frontend :**
- Electron + React
- TypeScript
- Tailwind CSS

**Backend (dans Electron) :**
- Node.js (natif avec Electron)
- Better-SQLite3 (SQLite synchrone)
- Electron-store pour les préférences utilisateur

**Build/Package :**
- Electron Builder (cross-platform Windows/Linux)

**Testing :**
- Jest (tests unitaires)
- Playwright (tests E2E)

**CI/CD :**
- GitHub Actions
- Automatisation des builds et releases

**Migration DB :**
- Système de migrations custom ou Knex.js

---

## PHASE 0 : Setup projet

### **✅ DEV-000 : Initialisation du projet Electron** [TERMINÉ]

**Objectif :** Projet Electron fonctionnel avec React/TypeScript

**Tâches :**
- `npm init electron-app@latest belote-scorer -- --template=webpack-typescript`
- Installer React + React-DOM
- Configurer Tailwind CSS
- Créer structure de dossiers :
  ```
  /src
    /main (processus Electron principal)
    /renderer (UI React)
    /shared (types TypeScript communs)
    /database (modèles + migrations)
  /tests
    /unit
    /e2e
  ```
- Configurer ESLint + Prettier
- Test : fenêtre Electron s'ouvre avec "Hello World" en React

**Définition de "Done" :**
- ✅ App démarre sur Windows et Linux
- ✅ Hot reload fonctionne en dev
- ✅ Build de production possible
- ✅ Linting configuré

---

### **✅ DEV-001 : Setup base de données SQLite** [TERMINÉ]

**Objectif :** Base de données SQLite opérationnelle avec migrations

**Tâches :**
- Installer `better-sqlite3`
- Créer service `DatabaseService` (singleton)
- Créer schéma initial :

```sql
CREATE TABLE joueurs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nom TEXT NOT NULL UNIQUE,
  date_creation DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE parties (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  date DATETIME DEFAULT CURRENT_TIMESTAMP,
  mode TEXT CHECK(mode IN ('4_joueurs', '3_joueurs')),
  equipe1_nom TEXT,
  equipe2_nom TEXT,
  score_equipe1 INTEGER DEFAULT 0,
  score_equipe2 INTEGER DEFAULT 0,
  gagnant INTEGER, -- 1 ou 2, NULL si partie en cours
  terminee BOOLEAN DEFAULT 0,
  duree_minutes INTEGER -- calculé à la fin
);

CREATE TABLE manches (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  partie_id INTEGER NOT NULL,
  numero INTEGER NOT NULL,
  atout TEXT CHECK(atout IN ('pique', 'coeur', 'carreau', 'trefle', 'sans_atout', 'tout_atout')),
  preneur_equipe INTEGER CHECK(preneur_equipe IN (1, 2)),
  points_equipe1 INTEGER NOT NULL,
  points_equipe2 INTEGER NOT NULL,
  annonces_equipe1 INTEGER DEFAULT 0,
  annonces_equipe2 INTEGER DEFAULT 0,
  belote_equipe INTEGER CHECK(belote_equipe IN (0, 1, 2)), -- 0=personne, 1=eq1, 2=eq2
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (partie_id) REFERENCES parties(id) ON DELETE CASCADE
);

CREATE TABLE parties_joueurs (
  partie_id INTEGER NOT NULL,
  joueur_id INTEGER NOT NULL,
  equipe INTEGER CHECK(equipe IN (1, 2)),
  FOREIGN KEY (partie_id) REFERENCES parties(id) ON DELETE CASCADE,
  FOREIGN KEY (joueur_id) REFERENCES joueurs(id),
  PRIMARY KEY (partie_id, joueur_id)
);

CREATE TABLE migrations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  version INTEGER NOT NULL UNIQUE,
  applied_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

- Implémenter système de migrations (versionning)
- Localiser la DB : `app.getPath('userData')/belote.db`
- Créer méthodes CRUD de base pour chaque table

**Définition de "Done" :**
- ✅ DB créée au premier lancement
- ✅ Requêtes CRUD fonctionnent
- ✅ Fichier `belote.db` visible dans userData
- ✅ Tests unitaires des opérations DB
- ✅ Système de migrations opérationnel

---

## EPIC 1 : Partie simple (MVP)

### **✅ DEV-002 : Interface - Écran d'accueil** [TERMINÉ]

**Objectif :** Menu principal avec navigation

**Composants :**
- Logo/Titre "Belote Scorer"
- Bouton "Nouvelle partie"
- Bouton "Historique des parties" (désactivé initialement)
- Bouton "Statistiques" (désactivé initialement)
- Bouton "Paramètres"
- Bouton "Quitter"

**Design :**
- Layout centré, responsive
- Boutons avec icônes
- Animation au survol

**Définition de "Done" :**
- ✅ Clic sur "Nouvelle partie" → ouvre écran de configuration
- ✅ Design responsive et agréable
- ✅ Navigation fonctionnelle
- ✅ Tests E2E de navigation

---

### **DEV-003 : Interface - Configuration de partie**

**Objectif :** Choisir mode et joueurs

**Écran :**

**1. Choix du mode :**
- Radio button "4 joueurs (2 équipes de 2)"
- Radio button "3 joueurs"

**2. Si 4 joueurs :**
- Input "Nom joueur 1" (Équipe A)
- Input "Nom joueur 2" (Équipe B)
- Input "Nom joueur 3" (Équipe A)
- Input "Nom joueur 4" (Équipe B)
- Indication visuelle des équipes (couleurs différentes : bleu/rouge par exemple)

**3. Si 3 joueurs :**
- Input "Nom joueur 1"
- Input "Nom joueur 2"
- Input "Nom joueur 3"
- Message : "Chacun joue pour soi, rotation du joueur au pot"

**4. Boutons :**
- "Retour"
- "Démarrer la partie" (désactivé si formulaire invalide)

**Logique :**
- Validation : au moins 2 caractères par nom
- Pas de doublons de noms dans la même partie
- Trim des espaces
- Créer partie en DB avec statut "en cours"
- Créer les joueurs s'ils n'existent pas
- Router vers écran de jeu

**Définition de "Done" :**
- ✅ Partie créée en DB
- ✅ Noms des joueurs sauvegardés
- ✅ Validation formulaire
- ✅ Navigation vers écran de jeu
- ✅ Tests unitaires de validation

---

### **DEV-004 : Interface - Écran de jeu principal (4 joueurs)**

**Objectif :** Saisie des manches et affichage du score

**Layout :**
```
┌─────────────────────────────────────────────────────┐
│  PARTIE #1 - 15/12/2024                             │
│  Équipe A: J1 & J3  |  Équipe B: J2 & J4           │
│  Score: 245         |  Score: 180                   │
├─────────────────────────────────────────────────────┤
│  📝 NOUVELLE MANCHE (Manche #4)                     │
│                                                     │
│  Qui a pris ?                                       │
│  ○ Équipe A    ○ Équipe B                          │
│                                                     │
│  Atout :                                            │
│  ○ ♠ Pique      ○ ♥ Cœur                           │
│  ○ ♦ Carreau    ○ ♣ Trèfle                         │
│  ○ Sans atout   ○ Tout atout                       │
│                                                     │
│  Mode de saisie :                                   │
│  ○ Points des 2 équipes                             │
│  ○ Points d'une seule équipe                        │
│                                                     │
│  [Si mode 2 équipes]                                │
│  Points Équipe A : [___]                            │
│  Points Équipe B : [___]                            │
│  Total: 162 ✓ / ✗                                   │
│                                                     │
│  [Si mode 1 équipe]                                 │
│  Points équipe preneuse : [___]                     │
│  → Points adversaire : 162 - [___] = XXX            │
│                                                     │
│  Annonces (optionnel) :                             │
│  Équipe A : [___] points                            │
│  Équipe B : [___] points                            │
│                                                     │
│  Belote/Rebelote (20 pts) :                         │
│  ○ Aucune  ○ Équipe A  ○ Équipe B                  │
│                                                     │
│  [Valider la manche] [Annuler]                      │
├─────────────────────────────────────────────────────┤
│  📊 HISTORIQUE DES MANCHES                          │
│                                                     │
│  #3 - ♥ Cœur - Équipe B - 95/67 (+20 belote)      │
│  #2 - ♠ Pique - Équipe A - 120/42                  │
│  #1 - ♦ Carreau - Équipe A - 85/77 (+30 annonces) │
│                                                     │
│  [Terminer la partie] [Menu]                        │
└─────────────────────────────────────────────────────┘
```

**Logique :**
- **Validation :**
  - En mode 2 équipes : total points = 162 (base) + annonces + belote
  - En mode 1 équipe : calcul auto de l'autre équipe
  - Annonces : multiples de 10, >= 0
  - Belote : +20 pts à l'équipe concernée
  - Interdire saisie invalide (messages d'erreur clairs)

- **Calculs :**
  - Total manche = points_equipe1 + points_equipe2 + annonces + belote = 162 + bonus
  - Score cumulé mis à jour après chaque manche
  - Détection automatique de fin de partie (seuil configurable, défaut 1000)

- **Persistance :**
  - Sauvegarde automatique en DB à chaque validation
  - Mise à jour du score de la partie
  - Timestamp de la manche

**Définition de "Done" :**
- ✅ Saisie de manche fonctionne (2 modes)
- ✅ Calculs corrects (tests unitaires exhaustifs)
- ✅ Validation robuste
- ✅ Scores mis à jour en temps réel
- ✅ Historique visible et scrollable
- ✅ Possibilité d'annuler la dernière manche (bonus)

---

### **DEV-005 : Logique - Fin de partie et statistiques basiques**

**Objectif :** Détecter fin de partie et afficher résumé

**Conditions de fin :**
- Une équipe atteint le seuil de victoire (défaut 1000 points, paramétrable)
- OU bouton "Terminer la partie" forcé par l'utilisateur

**Écran de fin :**
```
┌─────────────────────────────────────────────────────┐
│  🏆 FIN DE LA PARTIE                                │
│                                                     │
│  GAGNANT : Équipe A (J1 & J3)                      │
│  Score final : 1035 - 745                           │
│                                                     │
│  📊 STATISTIQUES DE LA PARTIE                       │
│                                                     │
│  Nombre de manches : 12                             │
│  Durée : 45 minutes                                 │
│                                                     │
│  ──────────────────────────────────────────────     │
│  RÉPARTITION DES PRISES :                           │
│  Équipe A : 7 manches (58%)                         │
│  Équipe B : 5 manches (42%)                         │
│                                                     │
│  ──────────────────────────────────────────────     │
│  ATOUTS JOUÉS :                                     │
│  ♠ Pique : 3    | ♥ Cœur : 4                       │
│  ♦ Carreau : 2  | ♣ Trèfle : 3                     │
│  Sans atout : 0 | Tout atout : 0                   │
│                                                     │
│  ──────────────────────────────────────────────     │
│  TAUX DE RÉUSSITE (prises gagnées) :                │
│  Équipe A : 6/7 prises réussies (86%)               │
│  Équipe B : 3/5 prises réussies (60%)               │
│                                                     │
│  ──────────────────────────────────────────────     │
│  MEILLEURES MANCHES :                               │
│  Équipe A : 142 pts (manche #5, ♠ Pique)           │
│  Équipe B : 120 pts (manche #8, ♥ Cœur)            │
│                                                     │
│  ANNONCES TOTALES :                                 │
│  Équipe A : 80 pts                                  │
│  Équipe B : 50 pts                                  │
│                                                     │
│  BELOTE/REBELOTE :                                  │
│  Équipe A : 2 fois (40 pts)                         │
│  Équipe B : 1 fois (20 pts)                         │
│                                                     │
│  ──────────────────────────────────────────────     │
│                                                     │
│  [Nouvelle partie] [Retour accueil] [Exporter]      │
└─────────────────────────────────────────────────────┘
```

**Logique :**
- Calculer la durée : `partie.date_fin - partie.date_creation`
- Marquer partie comme `terminee = 1` en DB
- Enregistrer le gagnant (`gagnant = 1 ou 2`)
- Calculer toutes les stats depuis les manches :
  - Nombre de prises par équipe
  - Répartition des atouts
  - Taux de réussite (prises où l'équipe preneuse a gagné la manche)
  - Meilleure manche par équipe
  - Total annonces et belotes

- **Export optionnel :** Sauvegarder en JSON/CSV pour partage

**Définition de "Done" :**
- ✅ Stats calculées correctement
- ✅ Partie marquée terminée en DB
- ✅ Impossible de modifier une partie terminée
- ✅ Affichage clair et lisible
- ✅ Tests unitaires des calculs de stats

---

### **DEV-006 : Mode 3 joueurs**

**Objectif :** Gérer la rotation du joueur au pot

**Règles :**
- À chaque manche, 1 joueur est "au pot" (ne joue pas, position de donneur)
- Rotation automatique : J1 au pot → J2 au pot → J3 au pot → J1...
- Les 2 autres joueurs s'affrontent
- Score individuel pour chaque joueur

**Adaptations écran de jeu :**
```
┌─────────────────────────────────────────────────────┐
│  PARTIE #1 - Mode 3 joueurs                         │
│                                                     │
│  Manche #5 - 🃏 Joueur 2 au pot                     │
│                                                     │
│  Scores :                                           │
│  Joueur 1 : 245  |  Joueur 2 : 180  |  Joueur 3 : 210 │
│                                                     │
│  📝 NOUVELLE MANCHE                                 │
│                                                     │
│  Qui a pris ?                                       │
│  ○ Joueur 1    ○ Joueur 3                          │
│                                                     │
│  Atout : [même interface que 4 joueurs]             │
│                                                     │
│  Points Joueur 1 : [___]                            │
│  Points Joueur 3 : [___] (auto-calculé)             │
│                                                     │
│  [Valider] [Annuler]                                │
├─────────────────────────────────────────────────────┤
│  📊 HISTORIQUE                                      │
│  #4 - J3 au pot - J1 vs J2 - ♥ - 95/67             │
│  #3 - J2 au pot - J1 vs J3 - ♠ - 120/42            │
└─────────────────────────────────────────────────────┘
```

**Logique :**
- Déterminer automatiquement le joueur au pot selon `manche.numero % 3`
- Les 2 autres joueurs s'affrontent
- Points attribués individuellement
- Écran de fin adapté avec 3 colonnes de stats

**Adaptations DB :**
- Utiliser `equipe = 1, 2, 3` pour différencier les joueurs en mode 3
- `preneur_equipe` désigne le joueur preneur (1, 2 ou 3)
- Calculs de stats adaptés

**Définition de "Done" :**
- ✅ Rotation fonctionne correctement
- ✅ Scores individuels calculés
- ✅ Stats adaptées au mode 3 joueurs
- ✅ Tests unitaires mode 3 joueurs

---

## EPIC 2 : Gestion des joueurs et historique

### **DEV-007 : CRUD Joueurs**

**Objectif :** Gérer une base de joueurs réutilisables

**Écran "Gestion des joueurs" :**
- Accessible depuis le menu principal
- Liste des joueurs existants (tableau) :
  - Nom
  - Date de création
  - Nombre de parties jouées
  - Actions (Modifier, Supprimer, Voir stats)

- Bouton "➕ Ajouter un joueur"
- Recherche par nom (input avec filtre en temps réel)

**Fonctionnalités :**
- **Ajouter :** Modal avec input nom
- **Modifier :** Modal pour renommer
- **Supprimer :** 
  - Confirmation obligatoire
  - Si joueur a joué des parties : proposer de remplacer par "Joueur supprimé" dans l'historique OU bloquer la suppression
- **Voir stats :** Redirection vers DEV-011

**Validation :**
- Pas de doublons de noms
- Nom : 2-30 caractères

**Définition de "Done" :**
- ✅ CRUD complet fonctionne
- ✅ Recherche opérationnelle
- ✅ Intégrité DB préservée (foreign keys)
- ✅ Tests E2E du CRUD

---

### **DEV-008 : Autocomplete joueurs dans nouvelle partie**

**Objectif :** Proposer joueurs existants lors de la création de partie

**Fonctionnalité :**
- Dans l'écran de configuration de partie (DEV-003)
- Input avec autocomplete/dropdown
- Proposer les joueurs de la DB triés par :
  1. Fréquence d'utilisation (parties jouées)
  2. Ordre alphabétique

- Permettre de créer un nouveau joueur à la volée
- Icône/badge indiquant "🆕 nouveau" vs "👤 existant"

**Comportement :**
- Frappe 2+ caractères → suggestions apparaissent
- Sélection → input rempli
- Si nom inexistant saisi et validé → création automatique du joueur en DB

**Définition de "Done" :**
- ✅ Autocomplete fluide (debounce 200ms)
- ✅ Création auto de nouveau joueur si nom inexistant
- ✅ UX claire (indications visuelles)

---

### **DEV-009 : Historique des parties**

**Objectif :** Voir toutes les parties jouées

**Écran liste :**
```
┌─────────────────────────────────────────────────────┐
│  📚 HISTORIQUE DES PARTIES                          │
│                                                     │
│  Filtres :                                          │
│  Date : [Du : ___] [Au : ___]                       │
│  Joueur : [Dropdown tous joueurs]                   │
│  Mode : [Tous | 4 joueurs | 3 joueurs]              │
│  [Appliquer] [Réinitialiser]                        │
│                                                     │
│  ──────────────────────────────────────────────     │
│  Trier par : [Date ▼] [Durée] [Nb manches]          │
│  ──────────────────────────────────────────────     │
│                                                     │
│  #125 | 27/12/2024 15:30 | 4 joueurs               │
│  J1 & J3 vs J2 & J4 | 1005 - 745 | 45 min | 12 manches │
│  [Voir détail] [Supprimer]                          │
│                                                     │
│  #124 | 26/12/2024 20:15 | 3 joueurs               │
│  J1, J2, J3 | J1 : 980, J2 : 650, J3 : 820 | 38 min │
│  [Voir détail] [Supprimer]                          │
│                                                     │
│  [...] Pagination [<] 1 2 3 ... [>]                │
└─────────────────────────────────────────────────────┘
```

**Fonctionnalités :**
- **Filtres :**
  - Par date (date picker range)
  - Par joueur (dropdown avec recherche)
  - Par mode (4 ou 3 joueurs)
  
- **Tri :**
  - Par date (défaut : plus récent d'abord)
  - Par durée
  - Par nombre de manches

- **Pagination :** 20 parties par page

- **Clic sur "Voir détail" :** Écran détail (voir ci-dessous)

**Écran détail d'une partie :**
- Reprise complète de l'écran de fin de partie (DEV-005)
- Historique détaillé des manches (tableau complet)
- Bouton "🗑️ Supprimer la partie" (avec confirmation)
- Bouton "◀️ Retour à l'historique"

**Définition de "Done" :**
- ✅ Liste complète visible
- ✅ Filtres fonctionnent (requêtes SQL optimisées)
- ✅ Tri opérationnel
- ✅ Détail affiche toutes les infos
- ✅ Suppression sécurisée (cascade DB)
- ✅ Performance OK avec 100+ parties

---

## EPIC 3 : Statistiques avancées

### **DEV-010 : Dashboard statistiques globales**

**Objectif :** Vue d'ensemble toutes parties confondues

**Écran avec onglets :**

**1️⃣ Vue générale :**
- Nombre total de parties jouées
- Nombre total de manches jouées
- Temps de jeu total (heures:minutes)
- Date de la première partie
- Date de la dernière partie
- Partie la plus longue (durée + nombre de manches)

**2️⃣ Classement des joueurs :**
```
┌─────────────────────────────────────────────────────┐
│  Rang | Joueur    | Parties | Victoires | Taux    │
│  🥇 1  | Joueur 1  | 45      | 28        | 62.2%   │
│  🥈 2  | Joueur 2  | 42      | 24        | 57.1%   │
│  🥉 3  | Joueur 3  | 38      | 18        | 47.4%   │
│     4  | Joueur 4  | 35      | 15        | 42.9%   │
└─────────────────────────────────────────────────────┘
```
- Trier par : Taux de victoire, Nombre de parties, Nombre de victoires
- Graphique : Évolution du nombre de victoires par joueur dans le temps (courbes)

**3️⃣ Statistiques par atout :**
```
Fréquence de chaque atout :
♠ Pique : 45 fois (28%)
♥ Cœur : 38 fois (24%)
♦ Carreau : 35 fois (22%)
♣ Trèfle : 32 fois (20%)
Sans atout : 6 fois (4%)
Tout atout : 4 fois (2%)

Taux de réussite par atout :
♠ Pique : 65% de prises réussies
♥ Cœur : 58%
...
```
- Graphique circulaire (pie chart) de la répartition
- Graphique en barres du taux de réussite

**4️⃣ Records :**
- 🏆 Meilleur score en une manche : 152 pts (Joueur X, Partie #45, ♠ Pique)
- ⏱️ Partie la plus rapide : 18 minutes (Partie #23)
- 🔥 Plus longue série de victoires : 8 parties (Joueur Y)
- 👥 Duo le plus performant (mode 4 joueurs) : J1 & J3 (85% victoires sur 20 parties)
- 💯 Partie avec le plus de manches : 25 manches (Partie #67)

**Technologies :**
- Graphiques : Chart.js ou Recharts
- Calculs : Requêtes SQL optimisées + agrégations

**Définition de "Done" :**
- ✅ Tous les onglets implémentés
- ✅ Stats calculées correctement
- ✅ Graphiques clairs et interactifs
- ✅ Performance OK même avec 100+ parties (< 1s de chargement)
- ✅ Design responsive

---

### **DEV-011 : Stats individuelles par joueur**

**Objectif :** Profil détaillé d'un joueur

**Accessible depuis :**
- Liste des joueurs (DEV-007) → clic sur "Voir stats"
- Écran de fin de partie → clic sur nom du joueur
- Dashboard global → clic sur joueur dans classement

**Écran :**
```
┌─────────────────────────────────────────────────────┐
│  👤 PROFIL DE JOUEUR 1                              │
│                                                     │
│  📊 Carte d'identité                                │
│  Membre depuis : 01/01/2024                         │
│  Parties jouées : 45                                │
│  Victoires : 28 (62.2%)                             │
│  Défaites : 17 (37.8%)                              │
│                                                     │
│  ──────────────────────────────────────────────     │
│  📈 Évolution du taux de victoire                   │
│  [Graphique courbe montrant l'évolution]            │
│                                                     │
│  ──────────────────────────────────────────────     │
│  🃏 Atouts préférés                                 │
│  ♠ Pique : 15 prises (65% réussite)                │
│  ♥ Cœur : 12 prises (58% réussite)                 │
│  ♦ Carreau : 8 prises (50% réussite)               │
│  ♣ Trèfle : 10 prises (70% réussite)               │
│                                                     │
│  Atout le plus efficace : ♣ Trèfle                 │
│  Atout le moins efficace : ♦ Carreau               │
│                                                     │
│  ──────────────────────────────────────────────     │
│  👥 Partenaires favoris (mode 4 joueurs)            │
│  Avec Joueur 3 : 20 parties, 17 victoires (85%)    │
│  Avec Joueur 2 : 15 parties, 8 victoires (53%)     │
│  Avec Joueur 4 : 10 parties, 3 victoires (30%)     │
│                                                     │
│  ──────────────────────────────────────────────     │
│  🏆 Records personnels                              │
│  Meilleure manche : 148 pts (Partie #34, ♠)        │
│  Plus long streak de victoires : 6 parties         │
│  Moyenne de points par partie : 562 pts            │
│  Nombre total de prises : 45                        │
│  Nombre de belote/rebelote : 12                     │
│                                                     │
│  ──────────────────────────────────────────────     │
│  📅 Activité récente                                │
│  Dernière partie : 27/12/2024 (Victoire)            │
│  Parties ce mois-ci : 8 (5 victoires)               │
│                                                     │
│  [◀️ Retour]                                        │
└─────────────────────────────────────────────────────┘
```

**Définition de "Done" :**
- ✅ Page dédiée par joueur
- ✅ Stats fiables et complètes
- ✅ Graphiques lisibles
- ✅ Calcul correct des partenaires (mode 4 joueurs)
- ✅ Performance optimale

---

## EPIC 4 : Polish & Features bonus

### **DEV-012 : Settings/Préférences**

**Objectif :** Paramètres personnalisables de l'application

**Écran paramètres :**
```
┌─────────────────────────────────────────────────────┐
│  ⚙️ PARAMÈTRES                                      │
│                                                     │
│  🎮 Jeu                                             │
│  Seuil de victoire : [1000] points                  │
│  Confirmation avant suppression : [✓]               │
│  Son des notifications : [✓]                        │
│                                                     │
│  🎨 Apparence                                       │
│  Thème : ○ Clair  ● Sombre  ○ Auto (système)      │
│  Taille police : ○ Petit  ● Moyen  ○ Grand         │
│                                                     │
│  ⌨️ Raccourcis clavier                              │
│  Activer les raccourcis : [✓]                       │
│  [Voir la liste des raccourcis]                     │
│                                                     │
│  🌍 Langue (optionnel)                              │
│  ○ Français  ○ English                             │
│                                                     │
│  💾 Données                                         │
│  Emplacement de la base : /path/to/belote.db        │
│  Taille : 2.5 MB                                    │
│  [Exporter] [Importer] [Réinitialiser]              │
│                                                     │
│  [Sauvegarder] [Annuler]                            │
└─────────────────────────────────────────────────────┘
```

**Stockage :** `electron-store` (fichier JSON dans userData)

**Paramètres disponibles :**
- `seuilVictoire` (number, défaut 1000)
- `confirmationSuppression` (boolean, défaut true)
- `theme` ('light' | 'dark' | 'auto')
- `taillePolice` ('small' | 'medium' | 'large')
- `raccourcisActives` (boolean, défaut true)
- `sonNotifications` (boolean, défaut false)
- `langue` (string, défaut 'fr')

**Définition de "Done" :**
- ✅ Settings persistés entre sessions
- ✅ Changements appliqués immédiatement (sans redémarrage)
- ✅ Validation des valeurs (ex: seuil > 0)

---

### **DEV-013 : Raccourcis clavier**

**Objectif :** Navigation rapide au clavier

**Raccourcis globaux :**
- `Ctrl+N` : Nouvelle partie
- `Ctrl+H` : Historique des parties
- `Ctrl+S` : Statistiques
- `Ctrl+,` : Paramètres
- `Ctrl+Q` : Quitter l'application
- `Échap` : Retour/Annuler
- `F1` : Aide (liste des raccourcis)

**Raccourcis en jeu :**
- `Ctrl+Enter` : Valider la manche courante
- `Ctrl+Z` : Annuler la dernière manche
- `Tab` : Navigation entre champs du formulaire
- `Échap` : Annuler la saisie en cours

**Implémentation :**
- Utiliser `electron.globalShortcut` pour raccourcis globaux
- Event listeners clavier pour raccourcis contextuels
- Affichage des raccourcis dans tooltips

**Définition de "Done" :**
- ✅ Tous les raccourcis fonctionnent sur Windows et Linux
- ✅ Désactivables depuis les paramètres
- ✅ Documentation accessible (modal d'aide)
- ✅ Pas de conflit avec raccourcis système

---

### **DEV-014 : Export/Import données**

**Objectif :** Sauvegarder et restaurer les données

**Export :**
- Bouton "📤 Exporter toutes les données" dans Paramètres
- Format : **JSON complet de la DB**
- Nom fichier : `belote_backup_YYYY-MM-DD_HHhMM.json`
- Contenu :
  ```json
  {
    "version": "1.0.0",
    "export_date": "2024-12-27T15:30:00Z",
    "joueurs": [...],
    "parties": [...],
    "manches": [...],
    "parties_joueurs": [...]
  }
  ```
- Dialog de sauvegarde natif Electron

**Import :**
- Bouton "📥 Importer des données" dans Paramètres
- Dialog de sélection de fichier
- **Choix :**
  1. **Fusionner** : Ajouter les nouvelles données (gestion des doublons par nom)
  2. **Remplacer** : Écraser toutes les données existantes (confirmation obligatoire)

- **Validation :**
  - Vérifier format JSON
  - Vérifier version compatible
  - Vérifier intégrité des foreign keys
  - Afficher résumé avant import (X joueurs, Y parties, Z manches)

**Gestion des conflits (fusion) :**
- Joueurs : Si nom identique → demander de renommer ou fusionner
- Parties : Toujours ajouter (pas de conflit)

**Cas d'usage :**
- Backup avant réinstallation
- Transfert entre PC
- Partage de stats avec amis

**Définition de "Done" :**
- ✅ Export fonctionne (fichier JSON valide)
- ✅ Import restaure correctement
- ✅ Gestion des conflits robuste
- ✅ Messages d'erreur clairs en cas de problème

---

### **DEV-015 : Mode sombre/clair**

**Objectif :** Thème visuel personnalisable

**Implémentation :**
- 3 modes :
  1. **Clair** : Couleurs claires (fond blanc, texte noir)
  2. **Sombre** : Couleurs sombres (fond noir/gris foncé, texte blanc)
  3. **Auto** : Suit le thème système (utiliser `nativeTheme.shouldUseDarkColors`)

- **Tailwind CSS** : Utiliser classes `dark:` pour thème sombre

**Variables CSS (exemples) :**
```css
:root {
  --bg-primary: #ffffff;
  --text-primary: #000000;
  --accent: #3b82f6;
}

.dark {
  --bg-primary: #1a1a1a;
  --text-primary: #ffffff;
  --accent: #60a5fa;
}
```

**Toggle :**
- Switch dans Paramètres (DEV-012)
- Icône ☀️/🌙 dans header (optionnel)

**Définition de "Done" :**
- ✅ 2 thèmes complets (tous les composants)
- ✅ Transition fluide (CSS transition)
- ✅ Mode auto fonctionne
- ✅ Préférence sauvegardée

---

### **DEV-016 : Packaging final**

**Objectif :** Distribuer l'application pour Windows et Linux

**Configuration Electron Builder :**

**`electron-builder.yml` :**
```yaml
appId: com.belote.scorer
productName: Belote Scorer

directories:
  output: dist

files:
  - "**/*"
  - "!**/*.ts"
  - "!*.map"

win:
  target:
    - nsis
  icon: build/icon.ico

nsis:
  oneClick: false
  allowToChangeInstallationDirectory: true
  createDesktopShortcut: true
  createStartMenuShortcut: true

linux:
  target:
    - AppImage
    - deb
  icon: build/icon.png
  category: Game

publish: null
```

**Tâches :**
1. Créer icônes :
   - `build/icon.ico` (Windows, 256x256)
   - `build/icon.png` (Linux, 512x512)
   - Design : cartes de belote stylisées

2. Configurer scripts NPM :
   ```json
   "scripts": {
     "build:win": "electron-builder --win",
     "build:linux": "electron-builder --linux",
     "build:all": "electron-builder -mwl"
   }
   ```

3. Tester builds :
   - Windows : `belote-scorer-setup-1.0.0.exe`
   - Linux : `belote-scorer-1.0.0.AppImage` + `belote-scorer_1.0.0_amd64.deb`

4. Vérifier :
   - Installation/désinstallation propre
   - DB créée dans le bon dossier (userData)
   - Pas de dépendances système manquantes

5. **(Optionnel) Auto-update :**
   - Intégrer `electron-updater`
   - Serveur de release (GitHub Releases)

6. **(Optionnel) Signature de code :**
   - Windows : Certificat Authenticode
   - Linux : GPG signing

**Livrables finaux :**
- `belote-scorer-1.0.0-win.exe` (installeur Windows)
- `belote-scorer-1.0.0.AppImage` (portable Linux)
- `belote-scorer_1.0.0_amd64.deb` (paquet Debian/Ubuntu)

**Définition de "Done" :**
- ✅ Installeurs fonctionnent sur Windows 10+ et Ubuntu 20.04+
- ✅ App portable (pas besoin d'install séparée de dépendances)
- ✅ DB créée au bon endroit sur chaque OS
- ✅ Icône correcte dans OS
- ✅ Désinstallation propre (supprime fichiers app, garde DB)

---

## EPIC 5 : CI/CD & Automatisation

### **DEV-017 : Configuration CI/CD avec GitHub Actions**

**Objectif :** Automatiser les tests, builds et releases

**Fichier `.github/workflows/ci.yml` :**

```yaml
name: CI/CD

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]
  release:
    types: [ created ]

jobs:
  test:
    name: Tests unitaires et E2E
    runs-on: ${{ matrix.os }}
    
    strategy:
      matrix:
        os: [ubuntu-latest, windows-latest]
        node-version: [18.x, 20.x]
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v3
      
      - name: Setup Node.js ${{ matrix.node-version }}
        uses: actions/setup-node@v3
        with:
          node-version: ${{ matrix.node-version }}
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Lint code
        run: npm run lint
      
      - name: Run unit tests
        run: npm run test:unit
      
      - name: Run E2E tests
        run: npm run test:e2e
        env:
          CI: true
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3
        if: matrix.os == 'ubuntu-latest' && matrix.node-version == '20.x'
        with:
          files: ./coverage/coverage-final.json

  build:
    name: Build application
    needs: test
    runs-on: ${{ matrix.os }}
    
    strategy:
      matrix:
        os: [ubuntu-latest, windows-latest]
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: 20.x
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build application (Windows)
        if: matrix.os == 'windows-latest'
        run: npm run build:win
      
      - name: Build application (Linux)
        if: matrix.os == 'ubuntu-latest'
        run: npm run build:linux
      
      - name: Upload artifacts (Windows)
        if: matrix.os == 'windows-latest'
        uses: actions/upload-artifact@v3
        with:
          name: windows-build
          path: dist/*.exe
      
      - name: Upload artifacts (Linux)
        if: matrix.os == 'ubuntu-latest'
        uses: actions/upload-artifact@v3
        with:
          name: linux-build
          path: |
            dist/*.AppImage
            dist/*.deb

  release:
    name: Create GitHub Release
    needs: build
    runs-on: ubuntu-latest
    if: github.event_name == 'release'
    
    steps:
      - name: Download Windows artifacts
        uses: actions/download-artifact@v3
        with:
          name: windows-build
          path: ./dist
      
      - name: Download Linux artifacts
        uses: actions/download-artifact@v3
        with:
          name: linux-build
          path: ./dist
      
      - name: Create checksums
        run: |
          cd dist
          sha256sum * > checksums.txt
      
      - name: Upload release assets
        uses: softprops/action-gh-release@v1
        with:
          files: |
            dist/*.exe
            dist/*.AppImage
            dist/*.deb
            dist/checksums.txt
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

**Configuration des tests :**

**`package.json` (scripts) :**
```json
{
  "scripts": {
    "test": "npm run test:unit && npm run test:e2e",
    "test:unit": "jest --coverage",
    "test:e2e": "playwright test",
    "lint": "eslint src --ext .ts,.tsx",
    "lint:fix": "eslint src --ext .ts,.tsx --fix"
  }
}
```

**Configuration Jest (`jest.config.js`) :**
```javascript
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/tests/unit'],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70
    }
  }
};
```

**Configuration Playwright (`playwright.config.ts`) :**
```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
```

**Tests à créer :**

**1. Tests unitaires (Jest) :**
- `DatabaseService.test.ts` : Tests CRUD toutes tables
- `calculs.test.ts` : Tests des calculs de scores, stats
- `validation.test.ts` : Tests de validation de formulaires
- `migrations.test.ts` : Tests des migrations DB

**2. Tests E2E (Playwright) :**
- `nouvelle-partie.spec.ts` : Créer une partie complète
- `saisie-manche.spec.ts` : Saisir plusieurs manches
- `stats.spec.ts` : Vérifier affichage des stats
- `historique.spec.ts` : Filtrer et consulter historique
- `crud-joueurs.spec.ts` : Gérer les joueurs

**Badges GitHub (README.md) :**
```markdown
![CI/CD](https://github.com/user/belote-scorer/workflows/CI%2FCD/badge.svg)
![Coverage](https://codecov.io/gh/user/belote-scorer/branch/main/graph/badge.svg)
```

**Définition de "Done" :**
- ✅ CI/CD fonctionne sur GitHub Actions
- ✅ Tests passent sur Ubuntu et Windows
- ✅ Builds automatiques à chaque push
- ✅ Release automatique lors de création de tag
- ✅ Coverage > 70% (ou seuil défini)
- ✅ Artifacts téléchargeables depuis Actions

---

## 🗓️ Priorisation recommandée

### **Sprint 1 : Foundation (1-2 semaines)**
- ✅ DEV-000 : Init projet Electron [TERMINÉ]
- ✅ DEV-001 : Setup DB SQLite [TERMINÉ]
- ✅ DEV-002 : Écran d'accueil [TERMINÉ]
- ⏳ DEV-017 : CI/CD basique (tests + lint) [EN COURS]

### **Sprint 2 : MVP (2-3 semaines)**
- ✅ DEV-003 : Config partie 4 joueurs
- ✅ DEV-004 : Écran de jeu
- ✅ DEV-005 : Fin de partie et stats basiques

### **Sprint 3 : Mode 3 joueurs (1 semaine)**
- ✅ DEV-006 : Mode 3 joueurs

### **Sprint 4 : Gestion joueurs (1-2 semaines)**
- ✅ DEV-007 : CRUD joueurs
- ✅ DEV-008 : Autocomplete
- ✅ DEV-009 : Historique

### **Sprint 5 : Stats avancées (2 semaines)**
- ✅ DEV-010 : Dashboard stats
- ✅ DEV-011 : Stats individuelles

### **Sprint 6 : Polish (1-2 semaines)**
- ✅ DEV-012 : Paramètres
- ✅ DEV-013 : Raccourcis clavier
- ✅ DEV-014 : Export/Import
- ✅ DEV-015 : Thème sombre/clair

### **Sprint 7 : Release (1 semaine)**
- ✅ DEV-016 : Packaging
- ✅ DEV-017 : Finalisation CI/CD (release automatique)
- ✅ Tests complets
- ✅ Documentation utilisateur

---

## 📝 Notes complémentaires

### **Structure de dossiers finale :**
```
belote-scorer/
├── .github/
│   └── workflows/
│       └── ci.yml
├── build/
│   ├── icon.ico
│   └── icon.png
├── src/
│   ├── main/
│   │   ├── index.ts (processus principal)
│   │   ├── database/
│   │   │   ├── DatabaseService.ts
│   │   │   ├── migrations/
│   │   │   └── models/
│   │   └── ipc/ (handlers IPC)
│   ├── renderer/
│   │   ├── App.tsx
│   │   ├── components/
│   │   ├── pages/
│   │   ├── hooks/
│   │   ├── utils/
│   │   └── styles/
│   └── shared/
│       ├── types.ts
│       └── constants.ts
├── tests/
│   ├── unit/
│   └── e2e/
├── package.json
├── tsconfig.json
├── tailwind.config.js
├── jest.config.js
├── playwright.config.ts
├── electron-builder.yml
└── README.md
```

### **Stack de dépendances (package.json) :**
```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "better-sqlite3": "^9.2.0",
    "electron-store": "^8.1.0",
    "chart.js": "^4.4.0",
    "react-chartjs-2": "^5.2.0",
    "date-fns": "^2.30.0"
  },
  "devDependencies": {
    "@electron-forge/cli": "^7.2.0",
    "electron": "^28.0.0",
    "typescript": "^5.3.0",
    "@types/react": "^18.2.0",
    "@types/better-sqlite3": "^7.6.0",
    "tailwindcss": "^3.4.0",
    "jest": "^29.7.0",
    "@playwright/test": "^1.40.0",
    "eslint": "^8.56.0",
    "prettier": "^3.1.0",
    "electron-builder": "^24.9.0"
  }
}
```

---

**Total : 17 tickets** couvrant toutes les fonctionnalités du MVP à la release finale ! 🚀