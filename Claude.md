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
