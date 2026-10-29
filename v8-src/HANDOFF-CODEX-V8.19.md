# Handoff Codex · Big Drama V8.19

28.10.2026 · de Claude (chef de projet V8) à Codex · demandes d'Alex

Point de départ : V8.18 (textes d'Ariane intégrés). À livrer : V8.19.

## 0. Règles

1. Dépôt : `johnmetronome/bigdrama-maquette`. Sur le NAS : `/Volumes/PROD/2026_10_BigDramaWebsite_V1/_Tests/maison-3d/v5/bigdrama-maquette`.
2. Modifier seulement les sources de `v8-src/`. Ne jamais éditer `v8/` à la main : `v8/` est régénéré par `rebuild.py`.
3. Ne pas toucher : `v2/`, `v7/`, `v7-src/`, la racine, `site-bigdrama-gandi/` (production), la sauvegarde `www.bigdrama.fr/` (PHP piraté et données clients : lecture seule, jamais exécuter).
4. Aucun script ni police tiers chargé depuis l'extérieur. Tout est servi par le site (CSP `default-src 'self'`). Une nouvelle police : fichier WOFF2 OFL hébergé dans `v8/fonts/` (copie depuis Fontsource), déclarée dans `v8/fonts/fonts.css`, licence à jour dans `v8/fonts/OFL.txt`.
5. Sauvegarde avant modification :
   ```
   cd bigdrama-maquette && mkdir -p ../_sauvegardes/v8.18-avant-v8.19 && tar czf ../_sauvegardes/v8.18-avant-v8.19/code.tgz v8 v8-src
   ```
6. Ne jamais révéler la solution de Parfum de Famille (coupable, indices) dans un texte, un commentaire ou un nom de fichier.
7. Ne rien inventer : nom, rôle, chiffre, citation. Ce qui manque reste vide et va dans la liste de la section 6.
8. Ne pas pousser. Alex pousse lui-même (commande en section 7).

## 1. Où sont les choses

| Fichier | Rôle |
|---|---|
| `v8-src/index.template.html` | Accueil (devient `v8/index.html`) |
| `v8-src/_style.css` | Styles de l'accueil (fondus dans `v8/site.css` par `rebuild.py`) |
| `v8-src/_app.js` | Script de l'accueil (rue, survols, défilement) |
| `v8-src/creations.py` | Contenu et gabarits des pages création et À propos. Données : `CREATIONS` (base, anciens textes), `ARIANE` (textes d'Ariane, prioritaires), `APROPOS` |
| `v8-src/_creations.css` | Styles des pages création et À propos (devient `v8/creations/creations.css`) |
| `v8-src/_creations.js` | Visionneuse photo, marque `?verif` |
| `v8-src/rebuild.py` | Régénère tout `v8/`, appelle `creations.py` |
| `v8-src/optimiser.py` | Copies WebP et vidéos légères dans `v8/assets/opt/` (à relancer seulement si une image change) |
| `v8-src/lieux.js` | Données de la rue (`SUPPORTS` décrit l'univers graphique de chaque création, base de la section 4) |
| `logos/`, `photos/`, `videos/` (racine) | Médias d'origine, ne pas modifier |

Régénérer : `cd v8-src && python3 rebuild.py` (avec `esbuild` installé : `npm i -g esbuild`).

## 2. Accueil : bandeau « à propos »

Fichier : `v8-src/index.template.html`, section `<section id="manifeste" class="bd-brand">` (sous la rue, avant les bannières). Styles : `.bd-brand` dans `v8-src/_style.css` (plusieurs règles, lignes ~322, 342, 357, 401, 441, 533 : la règle `.bd-brand>p{display:none!important}` est à retirer).

Contenu demandé, centré, sur fond noir :
1. Le logo Big Drama (`../v2/assets/brand-white.svg`, déjà là).
2. Dessous, une ligne : « Créateurs de spectacles immersifs ».
3. Dessous, un lien cliquable « À propos » vers `a-propos/` (même style que les boutons de la page création : capitales espacées, filet crème, survol jaune `#FFE34D`).

Rien d'autre dans ce bandeau. Le même bandeau existe en version téléphone : `<section id="mobile-manifeste" class="bd-brand">`, dans le bloc `version-mobile`. Le modifier de la même façon.

## 3. Page À propos

Fichier : `v8-src/creations.py`, fonction `page_apropos()` et dictionnaire `APROPOS`. Styles : `v8-src/_creations.css`.

1. Retirer ces deux phrases de `APROPOS['ouverture']` :
   - « Nous croyons tellement aux histoires que nous avons décidé de les rendre réelles. »
   - « Nous aimons les grandes tragédies, les petites arnaques, les gens qui se trompent et les familles qui se choisissent. »
   Garder la troisième (« Depuis 2017… ») comme ouverture, en accroche.
2. Remplacer « Les fondateurs » par « L'équipe ». Trois personnes, dans cet ordre : Ariane Raynaud, Alexis Pivot, Rémi.
   - Ariane Raynaud : « Cofondatrice · mise en scène, écriture ».
   - Alexis Pivot : « Cofondateur · direction artistique, écriture, musique ».
   - Rémi : nom de famille et rôle **à demander à Alex**. Ne rien inventer. En attendant, afficher seulement « Rémi » et laisser le rôle vide.
   - Prévoir l'emplacement d'un portrait carré par personne (photos à venir) : sans photo, un cadre au trait crème avec l'initiale en Bodoni.
3. Séparer la liste en deux blocs :
   - **Créations** (grand public) : Norma, Close, Parfum de Famille, Un Conte de Noëlle.
   - **Partenariats avec des marques** : Scatolina (Hermès × Apple), Better Together (Pernod Ricard), La Prophétie del Coco (Bacardí), Burning Bar (Grimbergen), Viva Barbessia (My Little Paris), Eros en Russie (The Family).
   - Ajouter un champ `type: 'public' | 'marque'` dans `CREATIONS` et trier dessus. Sous chaque partenariat, afficher le nom de la marque.
4. Équilibrer la mise en page (demande d'Alex) :
   - Aujourd'hui, la grille de 10 cases laisse une dernière ligne de 2 et un grand vide.
   - Créations : 4 cases sur une ligne (2 × 2 sur téléphone).
   - Partenariats : 3 colonnes × 2 lignes (2 colonnes sur tablette, 1 sur téléphone).
   - Mêmes hauteurs de cases, logos centrés dans une boîte de hauteur fixe, aucune case vide.
   - Rythme vertical : même espace entre l'ouverture, « Conteurs contemporains », L'équipe, Créations, Partenariats.
   - Vérifier à 1440, 1024, 768 et 390 px de large.

## 4. Pages création : une direction artistique par création

Fichiers : `v8-src/creations.py` (ajouter un champ `da` à chaque création) et `v8-src/_creations.css`.

Principe :
- La structure des pages ne change pas : tête photo et logo, accroche, texte, contexte en italique, presse, film, photos, crédits, partenaires, suite.
- Seuls changent les couleurs, la police des titres, un motif graphique et le traitement du logo.
- L'en-tête (À propos · Créations · Contact) et le pied restent communs à toutes les pages.

Mise en œuvre :
1. `page()` reçoit le slug. `<body class="cr cr-<slug>">`.
2. Dans `_creations.css`, chaque création redéfinit les variables existantes sous `.cr-<slug>` : `--nuit`, `--nuit-2`, `--creme`, `--creme-2`, `--lumiere`, `--filet`, `--titre`, plus `--motif` si besoin.
3. Une règle de motif par création, en CSS ou en SVG inline dans le CSS (data URI). Aucune image externe.
4. Le logo de chaque création est blanc ou clair. Sur un fond clair (Parfum de Famille, Viva Barbessia), le passer en encre avec `filter:brightness(0)`, ou en couleur de la DA.
5. Contraste AA (4,5:1) minimum pour le texte courant. Tester chaque page.

Directions, tirées de `SUPPORTS` dans `lieux.js` et des visuels existants. Les couleurs sont un point de départ à ajuster à l'œil.

| Création | Univers | Fond | Texte | Accent | Titres | Motif |
|---|---|---|---|---|---|---|
| Norma | Faire-part de deuil gothique, néon | `#0c0a14` | `#efe8da` | néon jaune `#FFE34D` (halo), croix bleue `#4fb3d9` | UnifrakturMaguntia pour les intertitres, Bodoni pour le texte | Double filet noir et blanc de faire-part autour des blocs. Logo en néon jaune (déjà en place) |
| Close | Carte de maison close 1918, art nouveau (Mucha) | noir bordeaux `#120a0c` | crème `#f3e6c8` | or `#c9a35b`, rose rideau `#D6AEB6` | Bodoni Moda italique | Filets art nouveau en coup de fouet (SVG), coins ornés, petit paon (`logos/paon.png`) en fleuron |
| Parfum de Famille | Dossier d'enquête new-yorkais, chemise kraft, machine à écrire | kraft `#cdb38b`, feuilles `#f4efe4` | encre `#1c1a17` | rouge tampon `#a3262a` | Special Elite | Trombone dessiné en CSS sur la tête, tampon « DOSSIER » incliné, lignes de dactylographie. Logo en encre |
| Un Conte de Noëlle | Livre pour enfants, papier épais, étoiles découpées | bleu nuit `#14213d` | papier `#f6efe0` | or étoile `#f2c14e`, rouge `#c0392b` | Yeseva One (déjà dans `v2/fonts.css`, à héberger en WOFF2 dans `v8/fonts/`) | Étoiles découpées (SVG) en bordure, coins de page arrondis |
| Scatolina | Boîte orange, carte vénitienne, ruban | lagune `#123e4d` | crème `#f6eee2` | orange `#F37021`, ruban brun `#4a2c1d` | Bodoni Moda | Bande orange en tête et en pied comme un couvercle de boîte, ruban brun en filet. Pas d'imitation du logo ni de la typo Hermès |
| Better Together | Ardoise de bistrot à la craie, cadre bois | ardoise `#2b2f2e` | craie `#f1efe6` | bois `#8a5a35`, jaune `#f2c14e` | une police craie OFL auto-hébergée (au choix de Codex, licence OFL), sinon Yeseva One | Cadre bois autour de l'accroche, grain de craie léger en CSS |
| La Prophétie del Coco | Étiquette de boîte à cigares cubaine, dorures, palmes | vert tropical `#12382e` | crème `#f4e7c5` | or `#d4af37`, rouge `#a8322d` | Bodoni Moda 600 | Cadre d'étiquette doré à double filet, palmes en SVG dans les coins |
| Burning Bar | Étiquette de brasserie du Nord aux bords brûlés | charbon `#120d0a` | crème `#efe1c6` | braise `#e8642c`, ambre `#d9a441` | Bodoni Moda 600 en capitales | Bords brûlés (masque CSS irrégulier) sur la tête et les photos, lueur de braise au survol |
| Viva Barbessia | Parchemin des Balkans, frise brodée rouge et noire, sceau de cire | parchemin `#efe3c6` | encre `#1d1a16` | rouge broderie `#b3202a` | Bodoni Moda | Frise brodée au point de croix (motif SVG répété) en haut et en bas, sceau de cire rouge près du titre. Logo en encre |
| Eros en Russie | Affiche de cabaret tsigane du XIXe, rouge et or, papier vieilli | rouge `#5e0d12` | crème `#f1e2c2` | or `#d9b25a` | Bodoni Moda italique | Cadre d'affiche à double filet or, étoiles et rinceaux aux coins |

Les animations restent légères, et toutes sont coupées avec `prefers-reduced-motion`.

## 5. Vérifier avant de rendre

1. `cd v8-src && python3 rebuild.py` sans erreur. `node --check ../v8/app.js`.
2. Serveur local depuis la racine du dépôt : `python3 -m http.server 8000`, puis ouvrir :
   - http://localhost:8000/v8/?direct (bandeau À propos sous la rue, lien vers la page)
   - http://localhost:8000/v8/a-propos/
   - les 10 pages : http://localhost:8000/v8/creations/norma/ … `close`, `parfum-de-famille`, `un-conte-de-noelle`, `scatolina`, `better-together`, `la-prophetie-del-coco`, `burning-bar`, `viva-barbessia`, `eros-en-russie`
3. Pour chaque page : aucune erreur console, aucun 404, aucune requête vers un autre domaine. Contraste vérifié. Rendu à 1440 et à 390 px.
4. Mettre à jour `v8-src/LISEZ-MOI-V8.md` avec une section « V8.19 ».
5. Monter la version : `?v=8.17` devient `?v=8.19` dans `index.template.html` (la V8.18 n'a changé que les pages création).

## 6. Ce qui manque encore (ne pas inventer)

- Rémi : nom de famille, rôle, photo. À demander à Alex.
- Portraits d'Ariane et d'Alexis, bios courtes.
- Crédits de Norma et crédits courts des autres créations (demandés à Ariane dans le Google Doc « Big Drama · site · questions pour Ariane »).
- Photos manquantes (Norma avec Rosy, Burning Bar, Parfum de Famille, Viva Barbessia, Eros en Russie).

## 7. Livraison

Alex pousse depuis son Mac :
```
R=$(ls -d /Volumes/PROD*/2026_10_BigDramaWebsite_V1/_Tests/maison-3d/v5/bigdrama-maquette 2>/dev/null | head -1)
cd "$R" && git add v8 v8-src && git commit -m "V8.19 : bandeau À propos, page À propos équipe et partenariats, DA par création" && git pull --rebase origin main && git push origin main
```
