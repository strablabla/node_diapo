# Notes de développement - node_diapo

Ce fichier documente les améliorations et modifications apportées au projet node_diapo lors de nos sessions de travail avec Claude.

**Période de collaboration:** 19 décembre 2025 - 23 décembre 2025

---

## 📅 19 Décembre 2025 - Jour 1

### Bibliothèques en local
**Commit:** `6b9d1f3` - "lib in local"
- Déplacement des bibliothèques JavaScript tierces en local pour une meilleure performance

### Documentation README
**Commit:** `f191b6d` - "readme"
- Création/mise à jour de la documentation du projet

### Corrections multiples importantes
**Commit:** `d1713b4` - "corr when moving image, corr for colored text, corr for moving equations, hid button in text editor and ToC button, corr bug diap disappearing"

**Problèmes résolus:**
1. **Déplacement d'images** - Correction du positionnement des images lors du déplacement
2. **Texte coloré** - Correction du rendu du texte avec couleurs
3. **Déplacement d'équations** - Correction du positionnement des équations mathématiques
4. **Interface de l'éditeur de texte** - Masquage de boutons inutiles dans l'éditeur
5. **Bouton Table des matières** - Amélioration de l'affichage
6. **Bug de disparition de diapo** - Correction d'un bug critique où les diapos disparaissaient

**Fichiers modifiés:**
- `html_app.js` - Logique serveur améliorée (140 lignes ajoutées)
- `views/diapo.html` - Interface diapo (71 lignes)
- `lib/straptoc.js` - Table des matières (24 lignes)
- `static/js/count_lines.js` - Comptage de lignes
- `views/text.html`, `views/textarea.html` - Éditeur de texte

### Raccourcis clavier
**Commit:** `46696d1` - "keyboard shortcut in Readme"
- Documentation des raccourcis clavier dans le README

---

## 📅 20 Décembre 2025 - Jour 2

### Système de glisser-déposer d'images
**Commit:** `df7d9f8` - "drop images and rename them easily"

**Nouvelle fonctionnalité majeure:**
- **Upload d'images par glisser-déposer** - Possibilité de faire glisser des images directement dans les diapos
- **Renommage facile** - Système de renommage intuitif des images
- **Intégration Multer** - Ajout de la bibliothèque Multer pour gérer l'upload de fichiers

**Dépendances ajoutées:**
- `multer` - Middleware pour gérer l'upload de fichiers multipart/form-data
- `busboy` - Parser pour les données multipart
- `mkdirp` - Création de répertoires
- `streamsearch` - Recherche dans les flux

**Fichiers modifiés:**
- `html_app.js` - 77 lignes ajoutées pour gérer l'upload
- `static/js/modify_html.js` - 115 lignes pour l'interface de glisser-déposer
- `views/diapo.html` - 78 lignes pour l'intégration

---

## 📅 21 Décembre 2025 - Jour 3

### Améliorations plein écran et slider
**Commit:** `0c8fd39` - "full screen only with F11, pos slider, head, foot are ok, solved index inside miniatures"

**Modifications importantes:**

1. **Plein écran avec F11**
   - Standardisation: plein écran uniquement avec F11
   - Suppression d'autres raccourcis conflictuels

2. **Positionnement du slider**
   - Amélioration de la position et du comportement du slider

3. **En-tête et pied de page**
   - Correction du positionnement de l'en-tête et du pied de page
   - Affichage correct en mode normal et plein écran

4. **Index dans les miniatures**
   - Correction d'un bug d'affichage de l'index dans la vue miniatures

5. **Nettoyage**
   - Suppression des fichiers template diapo*.html inutilisés (diapo0.html à diapo17.html)

**Fichiers modifiés:**
- `views/diapo.html` - 180 lignes modifiées pour le plein écran
- `views/slider.html` - 104 lignes pour améliorer le slider
- `lib/screenfull.js` - Ajustements pour F11
- `static/js/util.js` - Utilitaires améliorés
- Suppression de 17 fichiers template inutilisés

---

## 📅 22 Décembre 2025 - Jour 4

### Correction du comptage et visualisation progressive
**Commit:** `9d340d5` - "Corr for conting diap and create diapo.html, 3 points for prog visu and up arrow to go back"

**Améliorations:**

1. **Comptage des diapos**
   - Correction du système de comptage des diapositives
   - Amélioration de la création automatique de diapo.html

2. **Visualisation progressive**
   - Ajout d'un indicateur à 3 points pour la progression
   - Permet de voir visuellement où on en est dans la présentation

3. **Navigation**
   - Flèche haut pour revenir en arrière
   - Navigation plus intuitive

**Fichiers modifiés:**
- `html_app.js` - 30 lignes pour le comptage
- `views/diapo.html` - 54 lignes pour l'indicateur de progression
- Recréation des fichiers template diapo*.html (10 fichiers)

### Adaptation du slider en plein écran
**Commit:** `964bd65` - "Adapting slider size when switching to fullscreen mode.."

**Fonctionnalité:**
- Le slider s'adapte automatiquement quand on passe en mode plein écran
- Redimensionnement dynamique pour une meilleure expérience

**Fichiers modifiés:**
- `views/slider.html` - 38 lignes pour l'adaptation dynamique
- `views/diapo.html` - Intégration des événements

### Raccourcis clavier et README
**Commit:** `637b1f6` - "Changing some shortcut and the Readme"
- Modification de certains raccourcis clavier
- Mise à jour de la documentation

### Corrections slider
**Commit:** `0bf3246` - "Corrections for slider"
- Corrections diverses pour améliorer le comportement du slider

### Défilement automatique vers la diapo courante
**Commit:** `0019da5` - "Scrolling to current slide after Alt + A"

**Fonctionnalité:**
- Après avoir appuyé sur Alt+A (vue globale), la page défile automatiquement vers la diapo courante
- Navigation plus fluide entre les vues

**Fichiers modifiés:**
- `views/diapo.html` - 14 lignes pour la détection
- `views/diapo_all.html` - 40 lignes pour le défilement automatique

### Corrections aspect miniatures
**Commit:** `62ee130` - "few corrections for miniatures aspect etc.."

**Améliorations:**
- Amélioration de l'aspect visuel des miniatures
- Corrections CSS diverses
- Configuration mise à jour

**Fichiers modifiés:**
- `views/diapo_all_small.html` - 138 lignes pour améliorer l'affichage
- `views/iframe_mini_small.html` - Ajustements CSS
- `config.json` - Paramètres mis à jour

### Nettoyage
**Commit:** `dc26d3d` - "cleaning"
- Nettoyage du code et des fichiers

---

## 📅 23 Décembre 2025 - Jour 5 (Session actuelle)

### Nettoyage et organisation
**Commits multiples:**
- `7f735d0` - "removing node_modules"
- `a9f361f` - "cleaning"
- `9abb2b8` - "cleaning examples"
- `193425d` - "cleaning"

**Actions:**
- Suppression de node_modules du versionnement
- Nettoyage des exemples
- Organisation générale du projet

### Remplacement iframes par vignettes PNG
**Commit:** `f1868af` - "Thumbnails instead of iframes for global views to go faster.."

**(Détaillé dans la section "Session du 2025-12-23" ci-dessous)**

### Gestion Git des vignettes
**Commit:** `dbed33d` - "Add thumbnails to gitignore"

**(Détaillé dans la section "Session du 2025-12-23" ci-dessous)**

---

## Sessions précédentes (résumé détaillé)

### Amélioration de la page /all_mini (miniatures)

**Contexte:** La page de miniatures (`/all_mini`) présentait plusieurs problèmes d'affichage et de navigation.

#### 1. Modification du titre de la page

**Problème:** Le titre de la page n'était pas approprié

**Solution:**
- Changement du titre dans `diapo_all_small.html`

#### 2. Correction des marges du bandeau de titre

**Problème:** Le bandeau orange du titre de la première diapo n'était pas symétrique

**Solution:**
- Ajout de `margin-left` et `margin-right` au style du titre dans `views/diapo.html`
- Création d'un dictionnaire CSS avec marges symétriques de 100px
```javascript
var dictit = {'position':'relative','font-size':'300%',
             'text-align':'center', 'top':'100px',
             'background-color':'orange', 'color':'white',
             'margin-left':'100px', 'margin-right':'100px'}
```

#### 3. Ajout d'overlays cliquables sur les iframes

**Problème:** Les iframes n'étaient pas cliquables pour naviguer vers les diapos

**Solution:**
- Création de divs overlay transparents positionnés au-dessus des iframes
- Ajout de gestionnaires de clics pour la navigation
- Fichier: `views/diapo_all_small.html`

#### 4. Ajustement des dimensions des iframes

**Problème:** Les iframes n'utilisaient pas le bon ratio d'écran

**Solution:**
- Calcul dynamique des dimensions basé sur le ratio de la fenêtre
- Adaptation automatique lors du passage en plein écran
```javascript
var windowRatio = window.innerWidth / window.innerHeight
var iframeWidth = Math.round(maxIframeWidth)
var iframeHeight = Math.round(iframeWidth / windowRatio)
```

#### 5. Gestion de l'overflow

**Tentatives multiples pour gérer les problèmes d'overflow:**

**a) Élimination de l'overflow vertical dans les miniatures**
- Ajout de `overflow-y: hidden` et `height: 100vh` à body/html
- Problème: cela a augmenté la bande du bas au lieu de la réduire
- Correction: utilisation de `padding-bottom: 0px`, `padding-top: 0px`

**b) Marges asymétriques dans les iframes**
- Suppression de `top: 30px` du CSS des iframes dans `iframe_mini_small.html`
- Ajustement des paddings dans `diapo.html` pour égaliser les marges

**c) Overflow dans le mode de base**
- Ajout de `overflow: hidden` à body et html dans `diapo.html` pour cacher l'overflow en mode normal

**d) Overflow dans la page /all_mini**
- Ajout de `overflow-y: auto` dans `diapo_all_small.html` pour permettre le défilement

**e) Tentative de cacher l'overflow dans les iframes**
- Essai de création de wrapper divs avec overflow hidden
- **Échec:** Cette approche n'a pas fonctionné et a été entièrement annulée

#### 6. Positionnement du numéro de diapo

**Problème:** Le numéro de diapo n'était pas bien centré

**Solution:**
- Calcul du centre de chaque miniature
- Positionnement du numéro au-dessus et au centre
```javascript
var posxd = posx + scaledWidth/2  // pos x centrée
var posyd = posy + 15              // pos y ajustée
```

#### 7. Configuration du nombre de colonnes

**Fonctionnalité:** Possibilité de configurer le nombre de colonnes dans la mosaïque

**Implémentation:**
- Paramètre `nb_horiz_mosaic` dans `config.json` (valeur: 4)
- Calcul automatique du nombre de lignes en fonction du nombre total de diapos

### Corrections de bugs

#### 1. Erreurs de syntaxe dans create_thumbnails()

**Problèmes identifiés dans `html_app.js`:**
- Ligne 70: Mauvaise syntaxe de boucle for (virgules au lieu de points-virgules)
- Manque du mot-clé `async` sur la fonction
- Manque des mots-clés `await` sur tous les appels Puppeteer

**Corrections appliquées:**
```javascript
// Avant (incorrect)
for (var num_diap=0, num_diap<1, num_diap++)

// Après (correct)
async function create_thumbnails(){
    for (var num_diap=0; num_diap<1; num_diap++){
        const browser = await puppeteer.launch();
        // ... avec await sur tous les appels async
    }
}
```

### Gestion Git

#### Création du .gitignore

**Contenu initial:**
- `node_modules/` - Dépendances
- `examples/` - Données d'exemple
- `*.log`, `npm-debug.log*` - Fichiers de log
- `.DS_Store`, `Thumbs.db` - Fichiers système
- `.vscode/`, `.idea/` - Dossiers IDE

### Amélioration de la fonction format()

**Question:** Est-il possible d'utiliser format() avec plusieurs arguments pour des `{}` successifs?

**Réponse:** Oui, c'est possible!

**Exemple:**
```javascript
// Au lieu de:
var addr_diap = 'http://127.0.0.1:{}'.format(port) + '/d{}'.format(num_diap)

// On peut utiliser:
var addr_diap = 'http://127.0.0.1:{}/d{}'.format(port, num_diap)
```

---

## Session du 2025-12-23

### Optimisation de la création de vignettes

**Problème initial:** Timeout de Puppeteer lors de la création des vignettes

**Solutions apportées:**

1. **Déplacement de l'appel à `create_thumbnails()`**
   - Retiré de la fonction `addget()` (appelée trop tôt)
   - Déplacé après le démarrage complet du serveur avec un délai de 2 secondes
   - Fichier: `html_app.js` lignes 592-598

2. **Optimisations de performance**
   - Réutilisation d'un seul navigateur Puppeteer au lieu d'en créer un nouveau pour chaque diapo
   - Traitement en parallèle par lots de 3 vignettes
   - Gain de performance: 3 à 5 fois plus rapide
   - Fichier: `html_app.js` lignes 74-142

3. **Configuration des captures**
   - Masquage des éléments d'aide (`#help_keys`, `#help_voice_cmds`) avant la capture
   - Utilisation de `waitUntil: 'networkidle0'` pour s'assurer du chargement complet
   - Timeout de 30 secondes par vignette
   - Fichier: `html_app.js` lignes 101-125

### Remplacement des iframes par des images dans /all_mini

**Objectif:** Améliorer la performance de la page de miniatures

**Modifications:**

1. **Structure HTML** (`views/diapo_all_small.html`)
   - Remplacement des `<iframe>` par des `<img>` chargeant directement les vignettes PNG
   - Suppression de l'include `iframe_mini_small.html`
   - Lignes 19-22

2. **Simplification du JavaScript**
   - Suppression des calculs complexes de dimensions avec ratio et scaling
   - Dimensions fixes: 240x160 pixels (20% de 1200x800)
   - Suppression des overlays (images directement cliquables)
   - Code beaucoup plus simple et maintenable
   - Lignes 26-117

3. **Positionnement des numéros**
   - Numéros centrés au-dessus des vignettes avec `transform: translateX(-50%)`
   - Taille de police: 11px (0.7 fois plus petit que l'original)
   - Position: 30px au-dessus de chaque vignette
   - Lignes 67-75

4. **Configuration du serveur**
   - Ajout de la route statique `/thumbnails` pour servir les fichiers PNG
   - Fichier: `html_app.js` ligne 247

### Mise à jour automatique des vignettes

**Fonctionnalité:** Régénération automatique des vignettes après modification d'une diapo

**Implémentation:**

1. **Fonction `updateSingleThumbnail()`**
   - Permet de mettre à jour la vignette d'une seule diapo
   - Lance un navigateur Puppeteer temporaire
   - Fichier: `html_app.js` lignes 127-142

2. **Déclencheurs de mise à jour:**
   - Après **Ctrl+S** (sauvegarde des positions d'images/équations)
     - Émission de l'événement socket `update_thumbnail`
     - Fichier: `views/diapo.html` ligne 963

   - Après **retour de l'éditeur de texte**
     - Événement socket `return`
     - Fichier: `html_app.js` lignes 566-568

3. **Gestion côté serveur**
   - Socket event `update_thumbnail`
   - Fichier: `html_app.js` lignes 647-651

### Gestion Git

**Modifications au .gitignore:**
- Ajout de `views/thumbnails/` pour exclure les vignettes du versionnement
- Les vignettes sont générées automatiquement et ne doivent pas être versionnées
- Fichier: `.gitignore` ligne 20

**Nettoyage du dépôt:**
- Suppression des vignettes existantes du suivi git avec `git rm -r --cached views/thumbnails/`
- 12 fichiers PNG retirés du versionnement

### Corrections diverses

1. **Simplification de la fonction `format()`**
   - Utilisation de plusieurs arguments au lieu de concaténation
   - Avant: `'http://127.0.0.1:{}'.format(port) + '/d{}'.format(num_diap)`
   - Après: `'http://127.0.0.1:{}/d{}'.format(port, num_diap)`
   - Fichier: `html_app.js` ligne 105

## Avantages des modifications

### Performance
- Création de vignettes 3 à 5 fois plus rapide
- Page /all_mini beaucoup plus réactive (images au lieu d'iframes)
- Chargement instantané des miniatures

### Maintenabilité
- Code JavaScript simplifié dans diapo_all_small.html
- Moins de calculs complexes de dimensions
- Logique plus claire et compréhensible

### Expérience utilisateur
- Vignettes automatiquement mises à jour après modifications
- Pas besoin de recharger manuellement
- Interface plus fluide et réactive

## Architecture technique

### Stack technologique
- **Backend:** Node.js + Express
- **Templating:** Nunjucks
- **Real-time:** Socket.io
- **Screenshots:** Puppeteer
- **Frontend:** jQuery

### Flux de création de vignettes

1. Au démarrage du serveur (après 2 secondes)
   - Lancement de `create_thumbnails()`
   - Traitement en parallèle par lots de 3

2. Après modification d'une diapo
   - Détection de l'événement (Ctrl+S ou retour éditeur)
   - Appel de `updateSingleThumbnail(diapo_index)`
   - Mise à jour uniquement de la vignette modifiée

### Structure des fichiers clés

```
node_diapo/
├── html_app.js                    # Serveur principal
├── views/
│   ├── diapo.html                 # Template de diapo individuelle
│   ├── diapo_all_small.html       # Page de miniatures
│   ├── thumbnails/                # Vignettes générées (non versionnées)
│   └── diapos/
│       ├── d0.html, d1.html...    # Contenu des diapos
│       └── diapo.html             # Template Nunjucks
└── .gitignore                     # Exclusions git
```

---

## 📅 26 Décembre 2025 - Jour 6

### Système de mémos amélioré

**Améliorations visuelles et fonctionnelles du système de mémo:**

1. **Titre du panneau de mémo**
   - Changement de "Mémo X" à "note X"
   - Ajout d'une croix de Lorraine rouge (‡) avant le titre
   - Titre en gris (#666), police normale sans relief
   - Fichier: `views/memos/memo.js`

2. **Bouton de fermeture**
   - Ajout d'un bouton × (times) en haut à droite du panneau
   - Taille: 24px avec effet hover
   - Fichier: `views/memos/memo.js` lignes 115-135

3. **Positionnement du panneau**
   - Déplacement du panneau de la gauche vers la droite de l'écran
   - Positionnement dynamique: aligné verticalement avec la phrase cliquée
   - Décalage de 50px à droite de la phrase
   - Fichier: `views/memos/memo.js` lignes 208-217

4. **Espacement et marges**
   - 50px d'espace sous le titre
   - Contenu décalé de -100px vers la gauche
   - Fichier: `views/memos/memo.js` lignes 104, 165

5. **Indicateur visuel de mémo actif**
   - Ajout d'une croix de Lorraine (‡) rouge après la phrase cliquée
   - Position: légèrement en exposant
   - Suppression automatique lors de la fermeture ou du clic sur un autre mémo
   - Fichier: `views/memos/memo.js` lignes 195-206

6. **Correction du conflit avec visualisation progressive**
   - Exclusion du contenu des mémos (`#infos, #infos *`) de la visualisation progressive
   - Empêche la disparition du texte lors de l'utilisation des flèches haut/bas
   - Fichier: `views/diapo.html` ligne 283

### Navigation améliorée

**Nouvelles touches de navigation:**
- **Page Down**: Avancer à la diapo suivante (équivalent à flèche droite)
- **Page Up**: Retourner à la diapo précédente (équivalent à flèche gauche)
- Fichier: `views/diapo.html` lignes 151-165

### Refactorisation et modularisation du code

**Organisation en modules:**

1. **Système de mémo** (`views/memos/memo.js`)
   - Extraction de tout le code relatif aux mémos
   - Inclusion via Nunjucks: `{% include 'memos/memo.js' %}`
   - Fichiers concernés:
     - Création: `views/memos/memo.js` (280 lignes)
     - Modification: `views/diapo.html` (suppression de ~200 lignes)

2. **Fonctions de décoration** (`views/decorate/decorate.htm`)
   - Extraction des fonctions `make_head()` et `make_foot()`
   - Inclusion via Nunjucks: `{% include 'decorate/decorate.htm' %}`
   - Fichiers concernés:
     - Création: `views/decorate/decorate.htm` (35 lignes)
     - Modification: `views/diapo.html`

3. **Fonctions de première page** (`views/first_page/first_page.htm`)
   - Extraction et renommage des fonctions de page de titre
   - `make_title()` → `make_deck_title()`
   - Instruction markdown: `!title` → `!deck_title`
   - Inclusion via Nunjucks: `{% include 'first_page/first_page.htm' %}`
   - Fichiers concernés:
     - Création: `views/first_page/first_page.htm` (61 lignes)
     - Modification: `views/diapo.html`

**Structure du projet améliorée:**

```
node_diapo/
├── views/
│   ├── memos/
│   │   └── memo.js              # Système de mémos complet
│   ├── decorate/
│   │   └── decorate.htm         # Fonctions header/footer
│   ├── first_page/
│   │   └── first_page.htm       # Fonctions de page de titre
│   └── diapo.html               # Template principal (simplifié)
```

### Système de redimensionnement d'images amélioré

**Améliorations du menu contextuel:**

1. **Sauvegarde de la taille dans le fichier markdown**
   - Création du module `lib/image_size.js`
   - Socket event `size_img` pour transmettre les nouvelles dimensions
   - Pattern de mise à jour: `WIDTHxHEIGHT` dans `!['text' WxH %id%](imgs/...)`
   - Fichiers:
     - `lib/image_size.js` (95 lignes)
     - `lib/websocket.js` (ajout du handler)

2. **Gestion des IDs d'images**
   - Nettoyage des IDs (suppression du suffixe numérique aléatoire)
   - Fonction `escapeRegExp()` pour échapper les caractères spéciaux
   - Pattern matching robuste avec RegExp
   - Fichier: `lib/image_size.js` lignes 11-13, 43-60

### Déplacement de config.json

**Relocalisation du fichier de configuration:**
- **Ancien emplacement:** `views/config/config.json`
- **Nouvel emplacement:** `config.json` (racine du projet)
- **Raison:** Meilleure organisation (config à la racine)
- **Fichiers mis à jour:**
  - `lib/thumbnails.js`
  - `lib/routing.js`
  - `lib/generate_pdf.js`
  - `lib/update_viewport.js`
  - `README.md`
  - `Claude.md`

### Détection et sauvegarde des dimensions d'écran

**Amélioration de la détection viewport:**

1. **Détection unique par session serveur**
   - Flag `viewportDimensionsDetected` pour éviter les mises à jour répétées
   - Sauvegarde dans `config.json`
   - Fichier: `lib/update_viewport.js` lignes 3, 14-17, 37

2. **Utilisation de screen.width/height**
   - Au lieu de window.innerWidth/innerHeight
   - Plus fiable et précis
   - Fichier: `views/diapo.html` lignes 1495-1497

---

## Notes pour le futur

### Mémos
- Utiliser `!memo0`, `!memo1`, etc. dans le texte pour marquer les phrases
- Utiliser `$memo0`, `$memo1`, etc. pour définir le contenu du mémo
- Activer/désactiver avec Ctrl+M
- Cliquer sur une phrase marquée pour afficher le mémo

### Instructions markdown spéciales
- `!deck_title` - Titre de la présentation (page de garde)
- `!author` - Auteur de la présentation
- `!date` - Date de la présentation
- `!head` - En-tête de diapo
- `!foot` - Pied de page de diapo
- `!eq` - Équation mathématique
- `!pos` - Positionnement d'image/équation
- `!memo` - Référence à un mémo

### Configuration
- Le fichier `config.json` à la racine contient:
  - Dimensions du viewport
  - Nombre de colonnes pour la mosaïque (`nb_horiz_mosaic`)
  - Port du serveur

### Vignettes
- Les vignettes sont générées automatiquement, pas besoin de les créer manuellement
- Le dossier `views/thumbnails/` doit exister mais son contenu n'est pas versionné
- Pour régénérer toutes les vignettes: redémarrer le serveur
- Pour régénérer une vignette: modifier la diapo et sauvegarder (Ctrl+S)

---

## 📅 27 Décembre 2025 - Jour 7

### Panneau d'aide à la syntaxe pour l'éditeur

**Nouvelle fonctionnalité:**
- Double-clic sur les numéros de ligne ouvre un menu avec bouton "Syntax"
- Clic sur "Syntax" affiche un panneau avec toutes les balises markdown (!tit, !fb, !fr, etc.)

**Implémentation:**

1. **Fichier créé:** `lib/syntax_help.js` (210 lignes)
   - Fonction `setupSyntaxHelper(editor)`
   - Détection de double-clic sur gutter CodeMirror
   - Panel Quick Menu (120x150px) avec bouton Syntax centré en bas
   - Panel d'aide avec liste complète des balises markdown
   - Gestion des clics extérieurs pour fermer les panels

2. **Intégration dans text.html:**
   - Inclusion du script: `<script src="/syntax_help.js"></script>`
   - Initialisation: `setupSyntaxHelper(editor)`

3. **Challenges résolus:**
   - Problème 404: fichier déplacé de `views/` vers `lib/` (servi par Express)
   - Panel se fermant immédiatement: ajout de `e.stopPropagation()` et délai de 300ms
   - Centrage du bouton: utilisation de flexbox avec `flex-direction: column`, `justify-content: flex-end`, `align-items: center`

### Système d'upload de favicon

**Fonctionnalité:** Upload de favicon par drag & drop avec préfixe `fav_`

**Implémentation:**

1. **Modifications dans `lib/upload_image.js`:**
   - Nouvelle fonction `handleFaviconUpload()`
   - Détection des fichiers commençant par "fav_"
   - Stockage dans `public/favicons/`
   - Sauvegarde du nom dans `config.json`
   - Appel de `reloadConfig()` pour mettre à jour Nunjucks

2. **Modifications dans `html_app.js`:**
   - Chargement de `config.json` au démarrage
   - Passage de la config à Nunjucks via `addGlobal('config', config)`
   - Fonction `reloadConfig()` pour recharger après upload
   - Passage de `reloadConfig` à `handle_upload_image()`

3. **Modifications dans `views/header.html`:**
   - Ajout de balise conditionnelle:
   ```html
   {% if config.favicon %}
   <link rel="icon" href="/favicons/{{ config.favicon }}">
   {% endif %}
   ```

### Système d'image de fond avec opacité

**Fonctionnalité:** Upload d'image de fond par drag & drop avec préfixe `bg_`

**Implémentation:**

1. **Upload et stockage (`lib/upload_image.js`):**
   - Nouvelle fonction `handleBackgroundUpload()`
   - Détection des fichiers commençant par "bg_"
   - Initialement stocké dans `public/`, puis déplacé vers `public/bckgrds/`
   - Sauvegarde du nom dans `config.json` (puis migré vers `config_desk.yaml`)

2. **Affichage du background (`views/modif_css.html`):**
   - CSS pour forcer les backgrounds transparents sur `html`, `body`, `body > xmp`
   - JavaScript pour créer un overlay fixe avec l'image
   - Opacité: 0.1
   - z-index: -999999
   - Multiple exécutions (0ms, 500ms, 1000ms, 2000ms) pour contourner Strapdown
   - Force transparent sur tous les éléments blancs

3. **Challenges résolus:**
   - Strapdown appliquant du blanc après chargement: solution avec multiples setTimeout
   - Overlay pas visible: utilisation de z-index très négatif et backgrounds forcés à transparent
   - Plusieurs itérations avant de trouver la bonne approche

### Migration vers fichiers YAML

**Objectif:** Remplacer JSON par YAML pour les fichiers de configuration

**Modifications:**

1. **Migration de config.json vers config.yaml:**
   - Installation de `js-yaml` (déjà présent via Puppeteer)
   - Conversion du contenu JSON en YAML
   - Fichiers modifiés:
     - `html_app.js`: `yaml.load(fs.readFileSync('config.yaml'))`
     - `lib/upload_image.js`: écriture avec `yaml.dump()`
     - `lib/update_viewport.js`: lecture/écriture YAML
     - `lib/generate_pdf.js`: lecture YAML
     - `lib/routing.js`: lecture YAML
     - `lib/thumbnails.js`: lecture YAML

2. **Création de config_desk.yaml:**
   - Nouveau fichier `views/config_desk.yaml`
   - Déplacement de la propriété `background` de config.json vers ce fichier
   - Séparation config générale (config.yaml) / config présentation (config_desk.yaml)
   - Chargement dans `html_app.js`: `nunjucksEnv.addGlobal('config_desk', config_desk)`

3. **Avantages:**
   - Format plus lisible
   - Support natif des commentaires (ex: `#background: fichier.jpg`)
   - Possibilité de désactiver le background en commentant la ligne

### Refactorisation du code background

**Objectif:** Centraliser tout le code lié au background dans `decorate.js`

**Évolution:**

1. **Première étape:** Déplacement du JavaScript de `modif_css.html` vers `decorate.js`
   - Création de la fonction `setupBackground(backgroundImage)`
   - Passage de la config via `window.config_desk_background`

2. **Deuxième étape:** Tentative de renommer en `decorate.html`
   - Ajout de balises `<script>` et `<style>` dans le fichier
   - Intégration des templates Nunjucks `{% if config_desk.background %}`
   - **Problème:** Erreur de syntaxe car `diapo.html` inclut déjà dans un contexte `<script>`

3. **Solution finale:** Retour à `decorate.js` sans balises
   - Le fichier contient uniquement du JavaScript pur
   - Templates Nunjucks intégrés directement dans le code JS
   - CSS pour backgrounds transparents reste dans `modif_css.html`
   - Include dans `diapo.html`: `{% include 'decorate/decorate.js' %}`

**Structure finale:**

```javascript
// decorate.js
// ... fonctions de décoration existantes ...

// Pass background config to JavaScript
{% if config_desk.background %}
window.config_desk_background = '{{ config_desk.background }}';
{% endif %}

function setupBackground(backgroundImage) {
    // ... création overlay ...
}

$(document).ready(function() {
    if (typeof window.config_desk_background !== 'undefined' && window.config_desk_background) {
        setupBackground(window.config_desk_background);
        setTimeout(function() { setupBackground(window.config_desk_background); }, 500);
    }
});
```

### Architecture des fichiers de configuration

**Organisation finale:**

1. **config.yaml** (racine du projet)
   - Configuration générale de l'application
   - Dimensions viewport
   - Configuration mosaïque
   - Email
   - Favicon

2. **views/config_desk.yaml**
   - Configuration spécifique à la présentation
   - Image de fond (background)
   - Possibilité de commenter pour désactiver

### Leçons apprises

1. **Templates Nunjucks dans fichiers inclus:**
   - Les fichiers .js peuvent contenir des templates Nunjucks `{% if %}`
   - Ils sont traités par Nunjucks avant d'être envoyés au client
   - Ne PAS ajouter de balises `<script>` si le fichier est inclus dans un contexte déjà script

2. **Ordre de chargement:**
   - Strapdown peut appliquer des styles après le chargement de la page
   - Solution: multiples exécutions avec setTimeout
   - Forcer les backgrounds à transparent de manière répétée

3. **Séparation des responsabilités:**
   - CSS dans `modif_css.html`
   - JavaScript dans `decorate.js`
   - Configuration dans fichiers YAML séparés

---

## 📅 28 Décembre 2025 - Jour 8

### Système de gestion des diapos amélioré

#### 1. Nettoyage des fichiers diapo{n}.html inutiles

**Problème identifié:**
- Les fichiers `diapo0.html`, `diapo1.html`, etc. étaient générés mais jamais utilisés
- Le routage utilise uniquement `diapo.html` (template générique) avec le paramètre `diapo_index`
- Ces fichiers redondants étaient créés à chaque sauvegarde et modification

**Solution:**
- Suppression de tous les fichiers `diapo{n}.html` existants
- Modification de `create_md_jinja()` pour ne créer que les fichiers markdown (`d{n}.html`)
- Désactivation de `new_jinja()` (fonction vide conservée pour compatibilité)
- Suppression des tentatives de création/suppression dans `slide_operations.js`

**Fichiers modifiés:**
- `static/js/modify_html.js` - lignes 46-54, 180-189
- `lib/slide_operations.js` - lignes 10-28, 30-50, 52-96

**Avantages:**
- ~50% de fichiers en moins
- Code plus simple et maintenable
- Moins d'opérations I/O
- Architecture plus claire

#### 2. Amélioration du panneau d'aide aux raccourcis clavier

**Modifications apportées:**

1. **Suppression de la section "Touches bloquées"**
   - Retrait de la documentation sur F5 et Ctrl+R
   - Section inutile car le blocage est déjà effectif

2. **Bouton de fermeture circulaire**
   - Style cohérent avec le panneau markdown
   - Bouton × circulaire blanc avec bordure noire
   - Effet hover gris (#e0e0e0)

3. **Traduction en anglais**
   - Tout le texte passé en anglais
   - "Navigation", "Editor", "Global views", "Slide management", "Advanced features"

**Fichiers modifiés:**
- `lib/shortcuts_help.js` - lignes 26-68, 94-102
- `lib/syntax_help.js` - lignes 135-141 (effet hover cohérent)

#### 3. Visualisation progressive bidirectionnelle avec touche B

**Fonctionnalité:** La touche B permet maintenant une navigation bidirectionnelle dans la visualisation progressive

**Comportement:**
- **Flèche bas** : toujours vers l'avant (comportement original)
- **Flèche haut** : toujours vers l'arrière (comportement original)
- **Touche B** : va-et-vient automatique
  - Descend jusqu'en bas
  - Un clic supplémentaire ne fait rien (neutre)
  - Puis remonte
  - Un clic en haut ne fait rien (neutre)
  - Puis redescend

**Implémentation:**
- Variables d'état: `maxSteps`, `bDirection` (1 ou -1), `bPendingClick` (flag neutre)
- Handlers séparés pour `down`, `b`, et `up`
- Détection automatique des bornes (top et bottom)

**Fichiers modifiés:**
- `views/step_by_step_visu/step_by_step_visu.js` - lignes 110-152
- `lib/shortcuts_help.js` - ligne 37 (documentation)

#### 4. Auto-masquage du curseur de la souris

**Fonctionnalité:** Le curseur de la souris disparaît après 2 secondes d'inactivité

**Implémentation:**
- Détection du mouvement de la souris avec `mousemove`
- Timer de 2 secondes (`setTimeout`)
- Ajout de la classe CSS `hide-cursor` sur `body` et `html`
- CSS avec `cursor: none !important` et sélecteurs forts
- Réapparition immédiate lors du mouvement

**Première tentative (échouée):**
- Ne fonctionnait qu'en mode plein écran
- Problème de détection de fullscreen

**Solution finale:**
- Fonctionne tout le temps (pas seulement en plein écran)
- Sélecteurs CSS très forts pour override

**Fichiers modifiés:**
- `views/decorate/decorate.js` - lignes 155-204

#### 5. Correction et amélioration de la suppression de diapos

**Problèmes identifiés:**
1. Race condition: navigation avant l'émission du socket event
2. Pas de gestion d'erreurs dans les opérations fichiers
3. Possibilité de supprimer la diapo 0 (invalide)
4. Pas de confirmation utilisateur

**Solutions implémentées:**

1. **Dialog de confirmation personnalisé**
   - Remplacement de `alert()` par un dialog stylé
   - Overlay semi-transparent
   - Deux boutons: Cancel (gris) et OK (rouge)
   - Callbacks pour gérer les actions
   - Fonction `showDeleteConfirmation(slideIndex, callback)`

2. **Protection de la diapo 0**
   - Vérification côté client ET serveur
   - Message d'erreur spécifique si tentative de suppression
   - `if (parseInt(namediap) === 0)` avec message ❌

3. **Correction de la race condition**
   - Ordre inversé: `socket.emit('delete')` PUIS navigation
   - Délai de 100ms avant `window.location.href`

4. **Gestion d'erreurs robuste**
   - `try/catch` remplacé par callbacks avec `console.error`
   - Logs détaillés pour chaque opération
   - Emojis pour clarté: 🗑️, ✅, ❌

5. **Régénération des thumbnails**
   - Appel automatique après suppression réussie
   - `thumbnails.create_thumbnails()` dans le callback de routing
   - Broadcast du nouveau `maxdiap` à tous les clients

6. **Correction du bug d'index après suppression**
   - Problème: après suppression de la diapo 10, affichage "10/9" au lieu de "9/9"
   - Cause: `state.diapo_index` pas mis à jour côté serveur WebSocket
   - Solution: `state.diapo_index = state.diapo_index - 1` si suppression de la diapo courante ou précédente
   - Broadcast de `maxdiap` pour mettre à jour tous les clients

**Fichiers modifiés:**
- `views/create_delete/create_delete.js` - lignes 48-186 (dialog + handler)
- `lib/slide_operations.js` - lignes 10-28 (error handling)
- `lib/websocket.js` - lignes 128-198 (validation + thumbnails + diapo_index)

#### 6. Amélioration de la création de nouvelles diapos (Ctrl+P)

**Évolution de la fonctionnalité:**

**Avant:**
- Créait une diapo vide à la fin
- Simple `alert()` pour notifier
- Pas de navigation automatique
- `maxdiap` pas mis à jour

**Après:**
- Crée la diapo juste **après la diapo courante**
- Décale toutes les diapos suivantes
- Navigation automatique vers la nouvelle diapo
- Notification stylée verte "Creating new slide..."
- Broadcast de `maxdiap` à tous les clients

**Implémentation:**

1. **Nouvelle fonction `insert_slide_after()`** (`lib/slide_operations.js`)
   - Décale les diapos de la fin vers la position d'insertion
   - Renommage `d{i}.html` → `d{i+1}.html` en ordre inverse
   - Callback asynchrone pour séquencer les opérations
   - Compteur `completedOps` pour tracker la fin

2. **Handler WebSocket amélioré** (`lib/websocket.js`)
   - Reçoit `insert_after_index` du client
   - Appelle `insert_slide_after()` avec callback
   - Crée la nouvelle diapo au bon index
   - Reroute et broadcast `maxdiap`
   - Émet `new_slide_created` pour navigation

3. **Client amélioré** (`views/create_delete/create_delete.js`)
   - Envoie `diapo_index` courant au serveur
   - Notification verte (#28a745)
   - Écoute `new_slide_created` pour naviguer
   - Délai de 100ms avant navigation

**Fichiers modifiés:**
- `lib/slide_operations.js` - lignes 52-96 (nouvelle fonction)
- `lib/websocket.js` - lignes 78-106 (handler amélioré)
- `views/create_delete/create_delete.js` - lignes 7-46 (client)

#### 7. Correction du bug de visualisation progressive avec Ctrl+H

**Problème identifié:**
- Quand l'utilisateur ouvrait le panneau d'aide aux raccourcis (Ctrl+H)
- Seuls les titres de sections (h4) étaient visibles
- Le contenu des listes (li) était caché par la visualisation progressive

**Cause:**
- La fonction `progressive_visualization()` cache tous les éléments `li` et `p`
- Le panneau d'aide contient des listes (`<li>`) pour chaque raccourci
- Ces éléments n'étaient pas exclus de la logique de masquage

**Solution:**
- Ajout de `#shortcuts-panel, #shortcuts-panel *` à la liste d'exclusion
- Similaire à l'exclusion déjà existante pour `#infos` (système de mémos)

**Fichier modifié:**
- `views/step_by_step_visu/step_by_step_visu.js` - ligne 50

**Code modifié:**
```javascript
// Avant
$('li, p').not('#num, #footlim, .foot, .head, #infos, #infos *').each(function(){

// Après
$('li, p').not('#num, #footlim, .foot, .head, #infos, #infos *, #shortcuts-panel, #shortcuts-panel *').each(function(){
```

**Résultat:**
- Le panneau d'aide affiche maintenant correctement tout son contenu
- Les listes de raccourcis sont visibles
- Pas d'interférence avec la visualisation progressive

#### 8. Nouvelle fonctionnalité: Duplication de diapo (Ctrl+D)

**Fonctionnalité:** Dupliquer la diapo courante juste après elle

**Workflow:**
1. Lecture du contenu de la diapo source
2. Décalage des diapos suivantes (appel à `insert_slide_after()`)
3. Création de la copie à l'index suivant
4. Rerouting et mise à jour de `numdiap`
5. Broadcast de `maxdiap`
6. Navigation automatique vers la diapo dupliquée

**Implémentation:**

1. **Fonction `duplicate_slide()`** (`lib/slide_operations.js`)
   - Lit le contenu avec `fs.readFile()`
   - Appelle `insert_slide_after()` pour faire de la place
   - Écrit le contenu copié avec `fs.writeFile()`
   - Callback avec `(err, duplicate_index)`

2. **Handler WebSocket** (`lib/websocket.js`)
   - Événement `duplicate_diap`
   - Gestion d'erreurs avec `duplicate_error`
   - Émission de `slide_duplicated` avec le nouvel index

3. **Client** (`views/create_delete/create_delete.js`)
   - Raccourci Ctrl+D
   - Notification bleue (#17a2b8) "Duplicating slide..."
   - Navigation automatique vers la copie
   - Gestion d'erreurs avec message rouge

4. **Documentation mise à jour** (`lib/shortcuts_help.js`)
   - Ajout de "Ctrl + D - Duplicate current slide"

**Fichiers modifiés:**
- `lib/slide_operations.js` - lignes 98-138 (fonction de duplication)
- `lib/websocket.js` - lignes 108-137 (handler)
- `views/create_delete/create_delete.js` - lignes 48-111 (client)
- `lib/shortcuts_help.js` - ligne 56 (documentation)

### Architecture et organisation

**Simplification de la structure:**
```
views/diapos/
├── d0.html, d1.html, d2.html...    # Contenu markdown des diapos
└── diapo.html                       # Template générique unique
```

**Avant:** 2 × N fichiers (d{n}.html + diapo{n}.html)
**Après:** N + 1 fichiers (d{n}.html + 1 template générique)

**Modules de gestion des diapos:**
- `lib/slide_operations.js` - Opérations sur les fichiers (delete, shift, insert, duplicate)
- `lib/websocket.js` - Handlers Socket.io pour toutes les opérations
- `views/create_delete/create_delete.js` - Interface client (raccourcis clavier)

### Leçons apprises

1. **Gestion des callbacks asynchrones:**
   - Problème: opérations asynchrones non séquencées causent des race conditions
   - Solution: callbacks imbriqués et compteurs pour tracker la complétion

2. **Synchronisation client-serveur:**
   - `state.diapo_index` doit être maintenu à jour sur le serveur
   - Broadcast de `maxdiap` à tous les clients après toute modification
   - Délais de navigation (100ms) pour laisser le serveur traiter

3. **Patterns de notification utilisateur:**
   - Vert (#28a745): succès/création
   - Bleu (#17a2b8): information/duplication
   - Rouge (#dc3545): erreur/suppression

4. **Réutilisation de code:**
   - `insert_slide_after()` utilisée par création ET duplication
   - Fonction générique avec callback pour maximum de flexibilité

### Raccourcis clavier (état actuel)

**Navigation:**
- → / Page Down: Diapo suivante
- ← / Page Up: Diapo précédente
- ↓ / B: Visualisation progressive (ligne suivante)
- ↑: Visualisation progressive (ligne précédente)

**Éditeur:**
- Alt + T: Toggle éditeur de texte
- Ctrl + S: Sauvegarder positions

**Vues globales:**
- Alt + A: Vue globale (liste complète)
- Alt + M: Vue miniatures (mosaïque)

**Gestion des diapos:**
- Ctrl + P: Créer nouvelle diapo (après la courante)
- Ctrl + D: Dupliquer diapo courante
- Alt + Ctrl + X: Supprimer diapo courante

**Fonctions avancées:**
- Alt + Ctrl + P: Générer PDF
- Ctrl + M: Toggle mémos
- Alt + V: Aide commandes vocales
- Ctrl + V: Toggle reconnaissance vocale
- Ctrl + H: Afficher aide raccourcis

---

#### 9. Extraction et sauvegarde du titre du deck pour nommage automatique des PDF

**Fonctionnalité:** Le système détecte automatiquement le titre du deck depuis la balise `!deck_title` de la première diapo et l'utilise pour nommer les fichiers PDF générés.

**Balise utilisée:**
```markdown
!deck_title les supraconducteurs de type I et II, l'histoire continue !!!
```

**Workflow:**

1. **Extraction automatique lors de la sauvegarde**
   - Quand l'utilisateur sauvegarde la première diapo (d0.html)
   - Le système détecte la ligne commençant par `!deck_title`
   - Extrait le texte qui suit la balise
   - Ignore la balise dans les titres (ligne avec `#`)

2. **Sauvegarde dans views/config_deck.yaml**
   - Le titre est stocké dans `views/config_deck.yaml`
   - Format: `deck_title: titre complet ici`
   - Fichier créé automatiquement s'il n'existe pas

3. **Utilisation pour le PDF**
   - Lors de la génération du PDF (Alt+Ctrl+P)
   - Le système lit le titre depuis `views/config_deck.yaml`
   - Sanitize le titre pour créer un nom de fichier valide
   - **Avec titre**: génère `titre_sanitized.pdf`
   - **Sans titre**: génère `slides_timestamp.pdf`

**Exemples de transformation:**
```
Avec titre:
  Titre original: les supraconducteurs de type I et II, l'histoire continue !!!
  Nom de fichier: les_supraconducteurs_de_type_i_et_ii_lhistoire_con.pdf

Sans titre:
  Nom de fichier: slides_1766943437971.pdf
```

**Règles de sanitization:**
- Espaces → underscores (_)
- Caractères spéciaux → supprimés
- Tout en minuscules
- Limité à 50 caractères

**Nouveau module créé:** `lib/deck_title.js`

**Fonctions:**
- `extractDeckTitle(text)` - Extrait le titre du markdown
- `saveDeckTitle(title)` - Sauvegarde dans views/config_deck.yaml
- `getDeckTitle()` - Lit le titre depuis views/config_deck.yaml
- `sanitizeTitleForFilename(title)` - Convertit en nom de fichier valide
- `updateDeckTitleFromFirstSlide()` - Workflow complet d'extraction/sauvegarde

**Fichiers modifiés:**
- `lib/deck_title.js` - nouveau module (147 lignes)
- `lib/websocket.js` - lignes 28, 72-78 (appel lors de la sauvegarde)
- `lib/generate_pdf.js` - lignes 5, 30-43 (utilisation du titre avec logique conditionnelle)
- `views/create_pdf/create_pdf.js` - lignes 28-36 (préservation du nom)
- `html_app.js` - lignes 47, 109 (renommage config_desk → config_deck)
- `lib/upload_image.js` - lignes 116, 119, 128 (renommage config_desk → config_deck)
- `lib/syntax_help.js` - lignes 62-76 (ajout section "Title Page" avec !deck_title)

**Structure du fichier views/config_deck.yaml:**
```yaml
deck_title: les supraconducteurs de type I et II, l'histoire continue !!!
```

**Avantages:**
- PDFs nommés automatiquement de façon descriptive
- Pas besoin de renommer manuellement les fichiers
- Titre toujours synchronisé avec la première diapo
- Noms de fichiers safe pour tous les systèmes d'exploitation

---

#### 10. Correction CRITIQUE: Race condition lors de la sauvegarde de diapos

**Problème identifié:**
- Corruption massive de fichiers lors de navigation rapide et upload de fond
- La diapo 10 a été écrasée avec le contenu de la diapo 2
- La diapo 4 a été écrasée avec le contenu de la diapo 0
- Cause: asynchronisme entre `state.diapo_index` (serveur) et l'index réel du client

**Analyse détaillée:**

Le problème était une **race condition classique** dans la communication WebSocket:

1. **État initial:** Utilisateur édite la diapo 0 dans l'éditeur
2. **Navigation rapide:** Appui sur flèche droite → diapo 10
3. **Événement 'numdiap':** `state.diapo_index` mis à jour à 10 (asynchrone)
4. **Sauvegarde déclenchée:** Ctrl+S pendant que l'éditeur contient encore la diapo 0
5. **Handler 'return':** Utilise `state.diapo_index = 10` mais `new_text = contenu diapo 0`
6. **Résultat:** Le contenu de la diapo 0 écrase la diapo 10 ❌

**Même problème pour les uploads d'images:**
- `websocketState.diapo_index` utilisé dans `handle_upload_image()`
- Valeur stale lors de navigation rapide
- Images ajoutées à la mauvaise diapo

**Solution implémentée:**

**1. Client envoie toujours son propre index**

Avant ([text.html:63](views/text.html#L63)):
```javascript
socket.emit('return', new_text);  // Juste le texte
```

Après:
```javascript
socket.emit('return', {text: new_text, diapo_index: diapo_index});  // Texte + index
```

**2. Serveur utilise l'index fourni par le client**

Avant ([websocket.js:70](lib/websocket.js#L70)):
```javascript
socket.on('return', function(new_text) {
    modify.modify_html_with_newtext(socket, fs, util, new_text, state.diapo_index)
    // Utilise state.diapo_index du serveur (potentiellement stale)
```

Après:
```javascript
socket.on('return', function(data) {
    var new_text, slide_index;
    if (typeof data === 'string') {
        // Legacy: fallback sur serveur (avec warning)
        new_text = data;
        slide_index = state.diapo_index;
        console.log('⚠️  Legacy save format - using server diapo_index:', slide_index);
    } else {
        // Nouveau format: utilise l'index du client
        new_text = data.text;
        slide_index = data.diapo_index;
        console.log('✅ Client-provided diapo_index:', slide_index);
    }
    modify.modify_html_with_newtext(socket, fs, util, new_text, slide_index)
```

**3. Sécurité supplémentaire dans upload_image**

Ajout de validations robustes ([upload_image.js:157-190](lib/upload_image.js#L157-L190)):
```javascript
// CRITICAL: Ensure diapo_idx is defined
var diapo_idx = req.body.diapo_index !== undefined ? parseInt(req.body.diapo_index) : diapo_index

console.log('=== Image Upload Debug ===')
console.log('Final diapo_idx:', diapo_idx)

// SAFETY CHECK: Validate diapo_idx before proceeding
if (diapo_idx === undefined || diapo_idx === null || isNaN(diapo_idx)) {
    console.error('❌ CRITICAL ERROR: Invalid diapo_idx:', diapo_idx)
    return res.status(400).json({ error: 'Invalid diapo index' })
}
```

**Fichiers modifiés:**
- [views/text.html](views/text.html#L63) - lignes 63, 68 (envoi objet au lieu de string)
- [lib/websocket.js](lib/websocket.js#L69-L98) - lignes 69-98 (gestion nouveau format)
- [lib/upload_image.js](lib/upload_image.js#L157-L190) - lignes 157-190 (validation + debug)

**Récupération des fichiers corrompus:**
```bash
git show ec81c2e:views/diapos/d10.html > /tmp/d10_backup.html
cp /tmp/d10_backup.html views/diapos/d10.html
git show ec81c2e:views/diapos/d4.html > views/diapos/d4.html
```

**Principes de la correction:**

1. **Source de vérité unique:** Le client connaît TOUJOURS la diapo qu'il édite
2. **Pas de confiance implicite:** Le serveur ne suppose jamais que son état est synchronisé
3. **Compatibilité descendante:** Support du format legacy (string) avec warning
4. **Défense en profondeur:** Validations multiples (client, serveur, upload)
5. **Debugging facilitant:** Logs détaillés avec emojis (⚠️, ✅, ❌)

**Pourquoi c'est critique:**
- **Perte de données** potentielle (contenu écrasé)
- **Corruption silencieuse** (pas d'erreur visible)
- **Difficile à reproduire** (timing dependent)
- **Impact utilisateur majeur** (travail perdu)

**Leçon apprise:**
> Dans une architecture client-serveur avec état asynchrone, toujours inclure le contexte nécessaire dans chaque requête. Ne jamais supposer que l'état du serveur est synchronisé avec le client.

---

## 📅 29 Décembre 2025 - Jour 9

### Séparation de !pdf_title et !deck_title

**Fonctionnalité:** Distinction claire entre le titre utilisé pour le nom du PDF et le titre affiché sur la page de garde.

**Modifications:**

1. **Renommage du module**
   - `lib/deck_title.js` → `lib/pdf_title.js`
   - Fonctions renommées: `extractPdfTitle()`, `savePdfTitle()`, `getPdfTitle()`

2. **Deux balises distinctes:**
   - `!pdf_title` - Définit le nom du fichier PDF (extrait de `# Titre !pdf_title`)
   - `!deck_title` - Reste pour le titre affiché sur la page de garde (géré par first_page.js)

3. **Extraction et sauvegarde au démarrage**
   - Nouvelle fonction `init_system.js` pour centraliser l'initialisation
   - Extrait `!pdf_title` depuis d0.html au démarrage du serveur
   - Sauvegarde dans `views/config_deck.yaml`

**Fichiers modifiés:**
- `lib/pdf_title.js` - renommé et adapté (lignes 11-40)
- `lib/init_system.js` - nouveau module d'initialisation (32 lignes)
- `lib/websocket.js` - ligne 28, 86-92 (extraction lors de la sauvegarde de d0)
- `lib/generate_pdf.js` - ligne 5, 32-35 (utilisation du pdf_title)
- `lib/syntax_help.js` - lignes 64-71 (documentation mise à jour)
- `html_app.js` - lignes 23-24, 125-132 (intégration init_system)

### Éditeur de configuration des marges (Ctrl+Shift+C, devenu le panneau de configuration)

**Fonctionnalité:** Panneau graphique pour ajuster les marges gauches des headers et listes.

**Implémentation:**

1. **Interface avec sliders**
   - Deux glissières: "Margin" (h1, h2, h3) et "UL Margin" (ul)
   - Valeurs en pourcentage (0% à 50%)
   - Conversion automatique des valeurs px existantes en %
   - Sauvegarde dans `views/slide_config/slide_config.yaml`

2. **Configuration YAML dynamique**
   - Chargement du YAML au démarrage
   - Application des styles CSS via jQuery
   - Format: sélecteurs jQuery comme clés, propriétés CSS comme valeurs
   - Section `hide:` pour masquer des éléments

3. **Résolution du problème d'affichage du textarea (initialement prévu)**
   - Problème: `flex: 1` ne fonctionnait pas pour afficher le texte
   - Solution finale: Remplacement par interface à sliders (plus ergonomique)
   - Fichier créé: `views/slide_config/slide_config_editor.js` (345 lignes)

**Fichiers modifiés:**
- `views/slide_config/slide_config_editor.js` - nouveau module (345 lignes)
- `views/slide_config/slide_config.yaml` - configuration des styles (46 lignes)
- `views/slide_config/slide_config.js` - chargement et application (40 lignes)
- `html_app.js` - lignes 75-101 (routes pour charger/sauvegarder le YAML)
- `views/diapo.html` - ligne 3, 45 (inclusion js-yaml et éditeur)
- `public/js-yaml.min.js` - bibliothèque YAML côté client

**Structure du YAML:**
```yaml
css:
  h1:
    margin-left: 13%
  h2:
    margin-left: 13%
  h3:
    margin-left: 13%
  ul:
    margin-left: 7.5%
hide:
  - .navbar-inner
  - '#toc'
```

### Menu contextuel au-dessus des images

**Problème:** Le menu contextuel (clic droit) apparaissait sous les images.

**Solution:**
- z-index maximum: `2147483647` (Int32 max)
- CSS avec `!important` dans balise `<style>` pour forcer le style
- Position: `fixed !important`

**Fichier modifié:**
- `views/context_menu/context_menu.js` - lignes 6-16 (style global forcé)

### Visualisation progressive avec numéro de step (!stp=X)

**Fonctionnalité:** Afficher un élément à un step spécifique au lieu de séquentiellement.

**Syntaxe:**
- `!stp` - Comportement séquentiel normal (step 1, 2, 3...)
- `!stp=0` - Affiche l'élément au step 0 (caché avant, visible après premier appui sur ↓)
- `!stp=2` - Affiche l'élément au step 2

**Implémentation:**
- Extraction du numéro de step avec regex `/!stp=(\d+)/`
- Stockage dans attribut `data-stp-num`
- Logique conditionnelle: `if (stp >= targetStep) show() else hide()`
- Application aux paragraphes (images) en plus des listes

**Fichiers modifiés:**
- `views/step_by_step_visu/step_by_step_visu.js` - lignes 5-29, 46-96
- `lib/syntax_help.js` - lignes 142-145 (documentation ajoutée)

**Cas d'usage:**
```markdown
!pos866/433
!['img' 268x254 %id%](imgs/image.jpeg) !stp=1
```
→ L'image sera cachée au départ et apparaîtra au step 1

### Documentation mise à jour

**Aide à la syntaxe (double-clic sur numéros de ligne):**
- Ajout de `!stp=X` dans la section "Progressive Display"
- Ajout de la touche B pour navigation bidirectionnelle
- Documentation du clic droit pour redimensionner/supprimer images

**Fichiers:**
- `lib/syntax_help.js` - lignes 136-157

### Architecture technique

**Nouveaux modules:**
```
lib/
├── pdf_title.js          # Extraction et gestion du titre PDF
├── init_system.js        # Initialisation centralisée au démarrage
```

**Nouveaux composants client:**
```
views/slide_config/
├── slide_config.yaml           # Configuration des styles
├── slide_config.js             # Application des styles
└── slide_config_editor.js      # Panneau de configuration (Ctrl+Shift+C)
```

### Leçons apprises

1. **Problème de visibilité CSS:**
   - `flex: 1` peut ne pas fonctionner pour les textarea dans certains contextes
   - Solution: `height: 500px` avec `display: block`
   - Alternative: Interface graphique plus ergonomique que textarea brut

2. **z-index et !important:**
   - Pour forcer un élément au-dessus de tout, utiliser z-index max avec `!important`
   - Appliquer via balise `<style>` dans le head plutôt que jQuery `.css()`

3. **Visualisation progressive:**
   - Possibilité de mélanger comportement séquentiel (!stp) et absolu (!stp=X)
   - Important d'exclure tous les panneaux d'aide de la logique de masquage

4. **Configuration centralisée:**
   - YAML plus lisible que JSON pour configuration utilisateur
   - Permet commentaires et structure hiérarchique claire
   - jQuery peut utiliser les sélecteurs YAML directement
