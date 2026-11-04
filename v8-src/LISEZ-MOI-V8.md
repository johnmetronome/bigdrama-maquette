# Big Drama · maquette V8

26.10.2026 · Claude · construite sur la V7.15 de Codex (v7 et v7-src restent intacts)

En ligne après push : https://johnmetronome.github.io/bigdrama-maquette/v8/

## Régénérer

```
cd bigdrama-maquette/v8-src
python3 optimiser.py   # seulement quand une image, une police ou un film change (Pillow, fonttools, ffmpeg)
python3 rebuild.py     # à chaque modification des sources
```

- `optimiser.py` fabrique des copies légères dans `v8/assets/opt/` (WebP, films 540p pour téléphone) et `v8/fonts/v2/` (WOFF2). Les originaux ne bougent pas.
- `rebuild.py` refait `silhouettes.js`, copie les sources dans `../v8/`, fait pointer v8 vers les copies légères, assemble les huit feuilles de style en `site.css` et le JavaScript en un seul `app.js`. Avec esbuild installé (`npm i -g esbuild`), il compresse aussi. Sans esbuild, tout marche, en plus lourd.
- Si une feuille de `v2/` change, relancer `rebuild.py` : `site.css` en contient une copie.

## Ce qui change par rapport à la V7

1. Deux étapes nettes. Le film plein écran, puis un seul geste vers le bas fait monter la rue, avec un bord doré. Les maisons sortent de terre une à une, en deux secondes environ. Un geste vers le haut depuis la rue rend le film. Le défilement de 330 % est supprimé.
2. Le film d'accueil est le showreel court de Rémi, ralenti deux fois avec des fondus d'image (`ralenti-1080.mp4`, `ralenti-720.mp4`). Le showreel à vitesse normale est le premier film du bouton ▷.
3. Le clic sur une maison descend jusqu'à la bannière de la création, qui s'allume un instant. Les bannières ouvrent toujours la page projet.
4. Mobile : la rue tient en un écran et se glisse du doigt de gauche à droite.
5. Norma (×1,85) et Close (×1,3) plus grands. Le logo Norma en néon bleu sur le mausolée. Burning Bar plus petit.
6. Close : fenêtres plus grandes, maison close (corsets, bas, boa, miroir, cancan, ombres derrière les rideaux roses), une mariée, le capitaine qui frappe à la porte. Chaque fenêtre anime son personnage et joue sa chanson au survol.
7. Parfum de Famille : le guetteur tient un revolver, un meurtre en ombres chinoises derrière un store.
8. Viva Barbessia : deux joueurs de pierre-feuille-ciseaux dans une grande fenêtre.
9. Better Together : des passants traversent derrière les fenêtres (une tasse, une guitare, un canapé porté à deux).
10. Burning Bar : terrasse de brasserie sous une guirlande, fumée en volutes et braises qui montent.
11. La Prophétie del Coco : trois noix de coco noires, le cocotier danse franchement au survol.
12. Scatolina : barque 1,5 fois plus grande.
13. Le sol de la rue est noir pur, comme le site.
14. Site : « Création » retiré sur Norma et Close, Parfum de Famille passe au-dessus d'Un Conte de Noëlle, bloc Partenaires retiré, bouton « Nous contacter » sous les réseaux sociaux, favicon clé dorée sans fond.
15. Clé de réglages du mode « Modifier » : `bigdrama-v8-reglages-1` (les réglages V7 enregistrés dans le navigateur ne s'appliquent plus).

## V8.1 · 26.10.2026

- Film d'accueil : Showreel_Montage_V9 (`accueil-v9-1080.mp4`, `accueil-v9-720.mp4`), vitesse normale.
- Arrivée sur la rue plus douce : glissé de 1,6 s, les maisons sortent de terre sans rebond, les petites animations attendent la fin de la construction.
- Musiques des créations à 15 % maximum.
- Le Phénix (logo fourni) sur une plaque au sommet de Close. Close garde son enseigne au néon.
- Close : sept personnages aux fenêtres au lieu de quinze. Animations corrigées (elles partaient en diagonale).
- Sous-titres au survol : Burning Bar « Création privée avec Grimbergen », Eros en Russie « Première création immersive pour The Family », La Prophétie del Coco « Création immersive pour Bacardi ».
- Zoom au survol plus lent (2,6 s) et plus léger.

## V8.2 · 26.10.2026

- Apparition de la rue : les silhouettes se posent en fondu, de gauche à droite, puis les fenêtres s'allument une maison après l'autre.
- Film d'accueil toujours muet.
- Close : seul le paon reste sur la plaque du toit (`logos/paon.png`), une seule fenêtre rose.
- Scatolina décalée vers la droite, séparée de La Prophétie del Coco.
- Pages projet : Norma sans sa dernière photo, Close réduit à six photos (sans les noir et blanc), plus de second film en bas quand le teaser tourne en tête, vidéos muettes.
- Un Conte de Noëlle : titre en clair sur la photo, repères plus foncés.
- Son : réglage par Web Audio, pour que le plafond de 15 % tienne aussi sur iPhone (Safari ignore le volume d'un élément audio).
- Responsive vérifié : iPhone portrait et paysage, iPad, portable, grand écran, très large. Le bouton « Modifier » est masqué sur les écrans tactiles.

## V8.3 et V8.4 · 26.10.2026

- Retour à la sortie de terre des maisons, déclenchée pendant le glissé : on voit la rue se dessiner pendant la transition.
- Close : le paon seul, petit, sans cadre, en enseigne sur le fronton.
- Téléphone et tablette en portrait (moins de 900 px) : pas de rue. Le film, puis les créations. Tout est centré.
- Bannières : tous les titres sur le même axe et à la même hauteur visible, sur ordinateur comme sur téléphone. Les logos des créations privées sont recalés sur leur silhouette réelle mesurée dans l'image.
- Filet de sécurité : la rue se construit dès qu'elle est à l'écran, et elle est entière au bout de 6 s quoi qu'il arrive.
- Prompts d'audit pour Google, Codex et Mistral : `AUDIT_PROMPTS_V8.md`.

## V8.5 · 26.10.2026 · corrections après les audits Google et Mistral

- Polices hébergées sur le site (`v8/fonts/`, licence OFL) : plus aucun appel à Google Fonts.
- Film d'accueil allégé et sans piste son : 21,7 Mo en 1080p (au lieu de 38), 9,3 Mo en 720p, 5,4 Mo en 540p pour les téléphones. Le showreel complet avec le son reste dans le bouton ▷.
- Politique de sécurité (CSP) en balise meta : tout vient du site lui-même. Referrer-Policy. Description et carte de partage (Open Graph).
- Musiques chargées au premier survol seulement (plus 17 Mo d'un coup à l'entrée).
- Accessibilité : focus clavier visible sur les maisons, page création en vrai dialogue (focus sur « Retour », page derrière inerte, focus rendu à la fermeture), bouton pause du film rétabli, ctrl + molette laisse zoomer, aucun défilement forcé en mode « réduire les animations ».
- Noms des créations harmonisés dans les libellés accessibles. Crédit photo Norma en double supprimé. Sous-titre Viva Barbessia : « Création privée pour My Little Paris ».
- Indice de la rue : « Survolez la rue, cliquez sur une maison ».
- Outils de test (`window.__bd`) exposés seulement avec `?edit` ou `?debug`.
- README sans chemin interne.

## V8.6 · 26.10.2026

- La rue se déplie comme un livre animé : de gauche à droite, chaque maison se relève sur son pied, d'abord sombre, puis éclairée, avec un léger rebond du papier.
- Survol : plus de zoom. La maison oscille sur son pli, comme une page de pop-up qu'on effleure.
- Close : la fenêtre rose a ses rideaux fermés.
- En-tête et bas du film calés sur les bords de la fenêtre, quelle que soit sa largeur. Le bouton pause reste, le bouton vers les autres films disparaît.
- La Veillée : nouveau bandeau (`v8/assets/la-veillee-bandeau.jpg`), même hauteur que les autres bannières sur ordinateur et sur téléphone.

## V8.7 · 26.10.2026 · la rue en livre animé

- Inspiration : le générique du Petit Nicolas (Kuntzel + Deygas). Chaque maison est un feuillet : un SVG à elle, posé sur la scène en vraie perspective CSS.
- Dépliage : le feuillet part couché sur la page, se relève sur sa charnière au sol (2,1 s), dépasse à peine la verticale et se pose. Les maisons suivent de gauche à droite toutes les 190 ms. Elles sont sombres en se relevant et s'éclairent quand elles sont debout.
- Survol : le feuillet se penche doucement vers vous (9°) puis revient. Plus de zoom ni d'oscillation.
- Nouveau bandeau La Veillée (bord blanc retiré). Sur téléphone, le cadrage garde le titre.

## V8.8 · 26.10.2026 · livre animé poussé, trois apparitions au choix

- Languettes : enseignes, marquises, néons, terrasses, signal du cocotier et barque se déplient après leur maison, un cran devant elle (marquées `D(...)` ou `devant:true` dans `_rue.js`).
- Survol très doux : 3° d'inclinaison, 2,4 s, sans oscillation.
- Néon Norma en jaune (filtre `neon-jaune`). La croix reste bleue.
- Patine : grain de film animé, fibres de papier, vignettage chaud, légère teinte sépia sur la rue (`.bd-grain`).
- Trois apparitions, au choix dans l'adresse :
  - `?apparition=pop` (défaut) : les maisons se relèvent de gauche à droite, puis leurs languettes.
  - `?apparition=livre` : la rue entière est une page qu'on tourne, puis les maisons se relèvent.
  - `?apparition=coulisses` : théâtre de papier, le ciel descend des cintres, chaque décor glisse depuis la coulisse la plus proche, les enseignes tombent des cintres.

## V8.9 · 26.10.2026 · plus de grain, quatre nouvelles apparitions

- Grain, fibres et sépia retirés.
- Survol : 3° d'inclinaison, 2,4 s, sans oscillation (inchangé depuis V8.8).
- Quatre apparitions, au choix dans l'adresse. Planche de comparaison en boucle : `v8/apparitions.html`.
  - `?apparition=encre` (défaut) : chaque maison se trace à la plume, trait crème, de gauche à droite, puis l'encre remplit le dessin et les lumières s'allument. Environ 7 s.
  - `?apparition=lanterne` : une lueur chaude traverse la rue, chaque maison sort du flou quand la lumière la touche.
  - `?apparition=rideau` : un rideau de velours rouge à frange dorée s'ouvre sur la rue éteinte, puis les fenêtres s'allument maison après maison.
  - `?apparition=ville` : la nuit d'abord, les silhouettes sortent de l'ombre, les fenêtres s'allument au hasard.
  - `?apparition=pop` : le livre animé de la V8.8, toujours disponible.
- Paramètres de test : `?rue` arrive directement sur la rue, `?boucle` rejoue l'apparition en boucle.
- Le filet de sécurité attend la fin de l'apparition choisie (durée + 1,5 s).

## V8.10 · 26.10.2026 · plume, rue étalée, chargement allégé

- Apparition par défaut `plume` : la rue se dessine à la plume, l'encre la remplit éteinte, puis une lanterne la traverse et allume les fenêtres une à une. Les néons (Norma, Close) clignotent en s'allumant. Environ 9 s. Les autres restent dans l'adresse (`?apparition=encre`, `lanterne`, `rideau`, `ville`, `pop`). Planche : `v8/apparitions.html`.
- Bougies de Norma étalées en éventail jusqu'au bas de la rue (190 au lieu de 145). L'eau de Scatolina s'étale vers la gauche avec une rive courbe.
- La Veillée : titre réduit à 75 % dans l'image, au même endroit.
- Chargement, mesuré sur la page d'accueil hors films : 10,1 Mo et 45 requêtes avant, 1,3 Mo et 37 requêtes après.
  - Images en WebP : bandeau Norma 6,9 Mo -> 150 Ko, autres bandeaux 140-480 Ko -> 20-80 Ko, en deux tailles selon l'écran.
  - Logos et photos des pages création en WebP.
  - Polices Open Sans du site d'origine en WOFF2 latin (122 Ko -> 19 Ko chacune).
  - Une seule feuille de style, un seul fichier JavaScript, compressés.
  - Téléphone : les images de la rue (masquée) ne se chargent plus. Films des pages création en 540p muet.
  - La rue met ses animations en pause quand elle sort de l'écran.

## V8.11 · 26.10.2026 · dessin simplifié, enseignes au survol

- Apparition `plume` (défaut) simplifiée, sans lanterne : la rue se dessine en lignes d'en bas à gauche vers en haut à droite (chaque trait part selon sa place), l'encre la remplit, puis les fenêtres, néons et enseignes s'allument au fur et à mesure dans le même sens. Environ 8 s. Réglages : `PLUME` dans `_app.js`.
- Survol : les enseignes (Viva Barbessia, Close, Parfum de Famille, Better Together…) ne disparaissent plus. La scène reste à plat hors du mode `pop`, la maison et ses enseignes montent ensemble de 4 px.

## V8.12 · 26.10.2026 · dessin qui monte du sol, clé qui flotte

- Apparition `plume` (défaut) : les immeubles sont là tout de suite, noirs, fenêtres éteintes. Pendant le glissé, un dessin au trait crème monte du sol sur chaque immeuble (de gauche à droite, 110 ms d'écart), puis s'efface. Les fenêtres, néons et enseignes s'allument ensuite au fur et à mesure, d'en bas à gauche vers en haut à droite. Environ 7 s.
- Le trait est une copie de chaque feuillet (`.bd-trait-calque`), révélée par un masque qui monte. Elle disparaît une fois la rue construite.
- Écran d'entrée : la clé flotte très légèrement (5 px, ±0,8°, 5,6 s).

## V8.13 · 26.10.2026 · le trait allume en montant

- Apparition `plume` : les immeubles sont noirs d'emblée. Le trait crème monte du sol (2,4 s par immeuble, 110 ms d'écart de gauche à droite) et chaque fenêtre, néon ou enseigne s'allume quand le trait l'atteint. Le trait s'efface ensuite. Environ 5 s. Réglages : `PLUME` dans `_app.js`.

## V8.14 · 26.10.2026 · trait et lumière ensemble, passage film -> rue plus doux

- Apparition `plume` : les immeubles sont noirs d'emblée. Une copie de chaque feuillet, déjà allumée et soulignée d'un trait crème lumineux, monte du sol par un masque : le trait et l'allumage passent exactement ensemble, sans retour au noir. Les enseignes et néons attendent que le trait de leur maison arrive à leur hauteur. Le trait s'efface ensuite, la rue reste allumée.
- Du film à la rue : glissé plus long (2,1 s). Le film s'assombrit, se floute légèrement et grossit de 4 % pendant qu'il part. Le filet doré est remplacé par un fondu de nuit qui recouvre le bas du film.

## V8.15 · 26.10.2026 · l'immeuble se dessine en montant, le trait crème reste

- Apparition `plume` : plus de masses noires avant. Chaque immeuble se révèle du sol vers le haut, tout ensemble (noirs, fenêtres allumées, néons, enseignes), de gauche à droite (2,4 s par immeuble, 110 ms d'écart). Les enseignes suivent la hauteur de leur maison.
- Le trait crème souligne désormais toute la rue en permanence (`.bd-trait-creme`, posé sur les formes noires, pas sur les lumières).
- La copie au trait de la V8.14 est supprimée : la page est plus légère.

## V8.16 · 26.10.2026 · montée plus fluide, contour crème complet, fleur, phare, chaudron

- Apparition `plume` plus fluide : chaque maison est dans une fenêtre (`.bd-revele`) qui monte du sol pendant que le dessin redescend d'autant. Deux translations calculées par la carte graphique, plus de masque animé. Courbe douce, 2,6 s par maison, 120 ms d'écart.
- Trait crème permanent et sans trous : un filtre (`#bd-contour`) trace le contour extérieur continu de chaque maison, en plus des traits intérieurs. Les branches et grilles noires passent en crème.
- Survol : les éléments posés devant leur maison (barque de Scatolina et sa fleur, terrasse, signal du cocotier…) s'animent de nouveau. La fleur qui pousse sur la barque revient.
- Phare de Scatolina : faisceau trois fois plus lumineux.
- Un Conte de Noëlle : au survol, le chaudron prend exactement la place du landau, sans monter ni grossir.

## V8.17 · 28.10.2026 · vraies pages création et À propos

- En-tête : À propos · Créations · Contact, sur l'accueil et sur toutes les pages.
- Une vraie page par création, avec sa propre adresse : `v8/creations/<nom>/` (norma, close, parfum-de-famille, un-conte-de-noelle, scatolina, better-together, la-prophetie-del-coco, burning-bar, viva-barbessia, eros-en-russie). Les bannières de l'accueil y mènent. Les anciens liens `#projet-<id>` redirigent vers la bonne page.
- Page `v8/a-propos/` : présentation, fondateurs, liste des créations.
- Visuel « nuit de la rue » : bleu nuit, trait crème, accents jaunes, titres en Bodoni. Tête photo + logo de la création, accroche, texte, chiffres, film, photos (visionneuse au clic, flèches du clavier), crédits courts, distribution complète repliable (Close), partenaires, création précédente et suivante.
- Contenus : textes de l'ancien site (copie dans `v2/`), relus et mis à jour. Ce qui reste à vérifier est surligné avec `?verif` dans l'adresse.
- Sources : tout le contenu est dans `v8-src/creations.py` (une entrée par création). `rebuild.py` génère les pages. Styles : `_creations.css`. Script : `_creations.js`.
- Les sauvegardes du dossier WEBSITE (2018, 2023) n'ont ni base de données ni photos : rien de plus à en tirer.

## V8.18 · 28.10.2026 · textes d'Ariane

- Les 10 pages création et l'À propos prennent les textes du document d'Ariane « Contenus site internet ». Ils sont dans `ARIANE` et `APROPOS` de `v8-src/creations.py`.
- Chaque création : accroche, texte, phrase de contexte en italique (lieu, public, client), extraits de presse pour Norma et Close.
- Chiffres harmonisés : Close 15 000 spectateurs, Norma 14 000. La ligne de chiffres non vérifiés est retirée.
- À propos : trois phrases d'ouverture, puis « Conteurs contemporains ».
- Ce qui reste à fournir ou à valider : document « Big Drama · demandes pour Ariane après ses textes ».

## V8.20 · 29.10.2026 · réponses d'Ariane, La Veillée

- Chiffres : Close « plus de 12 000 spectateurs », Norma 15 000, sur les fiches et dans l'À propos.
- Crédits de Norma et nouvelle présentation des crédits de Close, fournis par Ariane (`REPONSES` dans `creations.py`). Pas de crédits pour les autres créations.
- Close : logos partenaires (Truffaut, Make Up For Ever, Kapten) retirés.
- À propos : équipe sans portraits ni bios.
- La Veillée : page `v8/creations/la-veillee/` sur le même modèle (bandeau dessiné en tête, univers mur blanc et crayon). Textes, photos et crédits à fournir. Elle ouvre la liste des créations de l'À propos et la navigation précédente / suivante. La bannière de l'accueil y mène.
- Accueil : annonce « Nouvelle création · La Veillée » en haut à droite, sous la navigation, 2,2 s après l'entrée. Fermée une fois, elle ne revient pas pendant la visite.

## Fichiers à fournir

| Fichier | Contenu | Qui |
|---|---|---|
| `sons/close/chanson-01.mp3` … `chanson-08.mp3` | Huit chansons de Close. Les 20 fenêtres se les partagent. Sans fichier, la musique de Close joue | Alex |
| `sons/usine.mp3` | Le son « Chaussée aux Moines » pour Burning Bar | Alex |
| `sons/bar.mp3` | Le refrain Suno de Better Together (remplace l'actuel) | Ariane |
| Photo de Norma avec Rosy | Pour la bannière Norma. Donner le nom du fichier | Alex |

## À vérifier dans un vrai navigateur

- Les films MP4 (le test automatique ne lit pas le H.264).
- Le son au survol des fenêtres de Close une fois les chansons posées.
- Safari et iPhone : le passage forcé film ↔ rue et le glisser horizontal.

## V8.19 · 29.10.2026 · composition et identités des créations

- Navigation basse : « Retour ». Crédits affichés seulement si des contributions utiles sont renseignées. Une attribution générique à Big Drama ou au client ne crée plus de section vide.
- Composition centrée : accroches, contexte, titres de section, partenaires et photographies isolées. Les paragraphes restent alignés à gauche dans une colonne de lecture.
- Dix palettes et signes graphiques discrets, gabarit, en-tête et pied communs. Les effets littéraux du brief sont volontairement réduits pour garder les pages sobres.
- À propos : seule l’ouverture « Depuis 2017… », équipe Ariane Raynaud, Alexis Pivot, Rémi, initiales dans des cadres carrés en attendant les portraits. Aucun rôle ajouté pour Rémi.
- Quatre créations grand public séparées des six partenariats, noms des marques et grilles équilibrées.
- Bandeau de l’accueil : logo, « Créateurs de spectacles immersifs », lien À propos, sur ordinateur et téléphone.
- Polices existantes uniquement. Yeseva One, déjà dans `v8/fonts/v2/`, déclarée pour les intertitres du conte et du bistrot. Les sources `_fonts.css` et `_fonts-OFL.txt` sont recopiées par `rebuild.py`, sans édition manuelle de `v8/`.
- Prompts indépendants : `PROMPT_GOOGLE_V8.19.md` et `PROMPT_MISTRAL_V8.19.md`. Leurs audits doivent distinguer la version publique et la V8.19 locale non poussée.

Contenu à fournir : nom de famille et rôle de Rémi, les trois portraits, bios courtes et crédits des créations hors Close. Rien de provisoire n’est inventé dans les pages.

Sauvegarde avant intervention : `../_sauvegardes/v8.18-avant-v8.19/code.tgz`, avec manifeste SHA-256. Aucun commit ni push effectué par Codex.

## V8.21 · 01.11.2026 · La Veillée, repasse, version en ligne

- La Veillée : nouveau visuel « La veillée sur mur décrépit » (Drive, 31.10) sur la bande de l'accueil, l'annonce, la page création et l'À propos. Fichier : `v8/assets/la-veillee-mur.jpg`. L'ancien bandeau reste dans le dépôt, il n'est plus utilisé.
- La Veillée : texte de la page tiré du doc d'Ariane « Contenu com - La Veillée », partie lore (quatre paragraphes, tels quels). Le reste du doc (déroulé du spectacle, poèmes) n'est pas publié.
- Annonce : repliée quand la bande La Veillée est à l'écran, repliée sur téléphone dès qu'on descend, compacte sur téléphone couché.
- Atelier de la rue (bouton « Modifier » de Codex) : visible seulement avec `?edit`. Sans `?edit`, les réglages enregistrés dans le navigateur sont ignorés : tout le monde voit la même rue.
- Lisibilité téléphone : navigation de l'accueil passée de 8 à 9 et 10 px, cibles tactiles plus hautes, petits libellés agrandis. Testé de 320 à 1920 px, téléphone couché compris.
- Nouvelles pages : `v8/contact/` (contact@bigdrama.fr, adresse de l'ancienne politique de confidentialité, à confirmer) et `v8/mentions-legales/`, `v8/cgv/`, `v8/confidentialite/`. Le site ne renvoie plus vers les pages v2.
- Pages légales : texte de l'ancien site, tel quel, dans `v8-src/_legal/*.html`. Remplacer ces trois fichiers par la version validée d'Ariane puis relancer `rebuild.py`.
- Bandeaux des pages création : deux tailles (900 et 2000 px), le téléphone charge la petite.

### Version en ligne : `exporter.py`

```
cd v8-src
python3 rebuild.py
python3 exporter.py https://www.bigdrama.fr ../../bigdrama-en-ligne
```

Produit un dossier autonome (environ 260 Mo, 180 fichiers) avec le site à la racine : `/`, `/a-propos/`, `/creations/close/`, `/contact/`. Seuls les fichiers utilisés sont copiés : pas de `v8-src`, pas de notes ni de prompts, pas de v6 ni v7. Ajoute `robots.txt`, `sitemap.xml`, `404.html`, `.nojekyll`, les adresses canoniques et les aperçus de partage en adresse absolue. `--noindex` garde l'interdiction d'indexation pour une préversion. Le script prévient tant que les pages légales sont celles de l'ancien site.

Avant la mise en ligne officielle :
1. Pages légales validées par Ariane (et relues par un juriste), puis `rebuild.py`.
2. Adresse contact@bigdrama.fr confirmée, ou changer `CONTACT` dans `creations.py`.
3. Domaine bigdrama.fr repris chez Gandi, puis DNS vers l'hébergeur choisi.
4. Publier le dossier exporté, pas le dépôt de la maquette : le dépôt contient les sources, les notes de travail et l'ancien site v2.

## V8.22 · 01.11.2026 · page La Veillée complète et billetterie

- Textes d'Ariane : « Pour que les histoires ne meurent jamais », la devise, le synopsis à la 3e personne, la citation de *Fahrenheit 451*, l'appel (radio du Centre, message des Veilleurs). Passages barrés retirés, indications sonores entre crochets non publiées. Le synopsis à la 1re personne n'est pas utilisé. Le texte « lore » d'Aliosha est retiré.
- Paquet de Rémi : dates (26 et 27 novembre 2026), lieu et infos pratiques, tarif 25 €, équipe en crédits. Rémi Large, Production, dans l'équipe de l'À propos.
- Billetterie : le module Billetweb n'utilise pas leur script `export.js`. Le site affiche la page Billetweb dans un cadre, seulement après un clic sur « Choisir ses places ». Avant le clic, aucune requête ni cookie Billetweb. Lien de secours vers un nouvel onglet. CSP des pages création : `frame-src https://www.billetweb.fr` uniquement.
- Bouton « Réserver · 25 € » en tête de page, annonce de l'accueil avec les dates.
- Données d'événement schema.org (dates sans horaire) pour Google.
- Typographie : espaces fines insécables avant : ? ! ; » et après « sur toutes les pages générées.
- À fournir : horaires des deux séances (rien n'est affiché en attendant), photos du spectacle.

## V8.23 · 01.11.2026 · billetterie partout, La Veillée de nuit, films de tête

- Navigation : Billetterie (lien direct Billetweb, nouvel onglet), À propos, Créations, Contact (ouvre un mail à contact@bigdrama.fr). Sur téléphone, « Créations » est masqué : le logo Big Drama y mène.
- Logo Big Drama sur toutes les pages : retour aux bandeaux des créations de l'accueil, sans repasser par la clé.
- Accueil : bande « La Veillée » en bas du film (mur V2, dates, « Prendre son billet », lien Billetweb). L'annonce en fenêtre est retirée (la bande la remplace). Bande La Veillée des créations : mur V2.
- Rue et bandeaux : les logos seuls. Sous-titres retirés (rue, « Enquête en ligne », « Fable immersive »). Les sous-titres restent visibles dans l'atelier (`?edit`).
- Contact : plus de page `v8/contact/` (supprimée), tous les liens Contact ouvrent un mail. « Une histoire à raconter ? » retiré partout. « Nous contacter » seulement en bas de l'accueil.
- Pages création : plus de Précédente et Suivante, seulement Retour.
- La Veillée : film « LaVeillee_V3_3 » (Packshot V2, 8 s) en tête, muet, en boucle, 1080p et 540p (`v8/assets/films/la-veillee-*`). Page de nuit : fond noir chaud, grain léger, lueur de bougie. Nouvelle création, 26 et 27 novembre 2026 · Paris 20e, bouton Réserver vers Billetweb (sans tarif). Appel, billetterie intégrée et infos pratiques retirés. Questions fréquentes : modèle de la FAQ Norma, seulement les réponses connues pour La Veillée.
- Norma et Close : leur film devient le bandeau de tête, muet, en boucle, sans commandes. Plus de film en bas de page. Close : photo du général (`close-04`) retirée.

## V8.24 · 01.11.2026 · mise en ligne FTP, film 4K de La Veillée

- La Veillée : film de tête remplacé par `LaVeillee_V3_3pourUPSCALE&Ralenti_4_apo8_prob4_hyp1.mp4` (4K, 7,7 s), réduit en 1080p (2,2 Mo) et 540p (0,4 Mo) pour le site.
- Bande de l'accueil et bandeau des créations : `la-veillee-bande.jpg`, le mur V2 prolongé vers la droite (3126 × 427). Le titre « La Veillée » se lit en entier, bande un peu plus haute.
- Crédits, distribution, FAQ, équipe : une seule typographie sobre (Bodoni Moda, Montserrat) sur toutes les pages. Plus de gothique sur Norma.
- `exporter.py` ajoute un `.htaccess` pour un hébergeur Apache : pas de liste de dossiers, `index.html` en premier, page 404, en-têtes de sécurité, tout fichier PHP ou script serveur refusé, cache des médias.

### Mise en ligne : `deployer.sh`

Il faut lftp sur le Mac : `brew install lftp`.

```
cd v8-src
python3 exporter.py https://www.bigdrama.fr ../../bigdrama-en-ligne
bash deployer.sh test            # crée ftp.conf au premier lancement : le remplir, puis relancer
bash deployer.sh sauvegarde      # copie le serveur actuel, avant toute modification
bash deployer.sh essai           # liste ce qui partirait
bash deployer.sh envoi           # envoie, ne supprime rien
bash deployer.sh envoi-propre    # envoie et retire du serveur l'ancien site (confirmation « SUPPRIMER »)
```

`ftp.conf` contient l'hôte, l'identifiant, le dossier et le protocole (sftp recommandé, puis ftps). Il n'est pas versionné. Le mot de passe est demandé à chaque lancement et n'est écrit nulle part. Testé sur un serveur FTP local : envoi complet, puis suppression des anciens fichiers PHP avec `envoi-propre`, serveur identique au dossier exporté.

## V8.25 · 01.11.2026 · films en tête partout où il y en a

- Plus de « Grand public » ni « Pour Pernod Ricard », « Pour Hermès × Apple »… en tête des pages création. La Veillée garde « Nouvelle création ».
- Film en tête, muet, en boucle, sur toutes les pages qui en ont un : Norma, Close, Better Together, La Prophétie del Coco, Viva Barbessia, Eros en Russie (plus de film en bas de page). Affiches tirées des films : `v8/assets/films/{bar,arbre,tour,lune}-poster.jpg`.
- Sans film (Parfum de Famille, Scatolina, Burning Bar, Un Conte de Noëlle) : plus de photo en tête, le titre seul sur la couleur du spectacle. Les photos restent dans la galerie.
- `exporter.py` met à jour le dossier de sortie sur place au lieu de le supprimer (le partage SMB du NAS refusait de vider `videos/`).

## V8.26 · 01.11.2026 · pages courtes

- Parfum de Famille et Scatolina (pas de film) : page courte. Titre, une grande image, accroche et texte, partenaires, Retour. Plus de galerie ni de citations de presse sur ces deux pages.

## V8.27 · 01.11.2026 · mise en ligne réparée, sécurité, vidéos plus légères

- `deployer.sh` : envoi sans recopier les droits du NAS (700, illisibles par le serveur : erreur 403 sur tout le site), puis droits de lecture remis sur tout le dossier. Nouveau mode `bash deployer.sh droits`.
- Vidéos de tête des pages création : versions muettes et légères `v8/assets/films/tete-*-720.mp4` (29 Mo pour les six au lieu de 59).
- `.htaccess` : interdiction d affichage dans le cadre d un autre site (CSP frame-ancestors), HTTPS imposé au navigateur (HSTS 6 mois), isolation de la fenêtre, compression des textes, cache des médias ramené à 7 jours.

## V8.28 · 02.11.2026 · page Billetterie, retours de Mistral

- Nouvelle page `v8/billetterie/` dans l univers de La Veillée : film en tête, les deux séances avec un bouton « Choisir ses places » chacune (lien direct Billetweb, nouvel onglet), tarif, infos pratiques. Le menu Billetterie, la bande de l accueil et le bouton Réserver de La Veillée y mènent.
- `.htaccess` (audit Mistral) : `AddDefaultCharset UTF-8`, HSTS 2 ans avec `includeSubDomains`, cache 30 jours pour CSS, JS, images et films, polices 1 an immuables. La redirection HTTP vers HTTPS se règle dans le panneau Gandi (une règle derrière Varnish risquerait une boucle).
- Page 404 : même politique de sécurité que les autres pages. Script v2 de l accueil versionné.
- Audit Mistral : `AUDIT-MISTRAL-V8.27.md`.

## V8.29 · 02.11.2026 · nouvelle adresse, Burning Bar, Noëlle, Norma, retours Gemini

- Adresse de contact : contact@big-drama.fr partout (`CONTACT` dans `creations.py`, `index.template.html`, pages légales). Les pages légales nomment aussi www.big-drama.fr.
- Burning Bar : page simple (titre, une image, l'histoire), comme Parfum de Famille et Scatolina.
- Un Conte de Noëlle : diaporama lent en tête de page, 10 photos de la sélection d'Alex (6 s chacune, fondus de 1,5 s, 60 s en boucle sans à-coup). `assets/films/tete-noelle-720.mp4` (7,4 Mo), `tete-noelle-540.mp4` (3,6 Mo). Copies 2560 px des photos : V3/3-medias-sources/un-conte-de-noelle-diaporama.
- Norma : photo DSC06981 d'Alessandro Clemenza en tête de galerie (`photos/norma-rosy.jpg`).
- La Veillée, données structurées : `endDate` et `image` ajoutés (retour Gemini O8). Lieu et prix y étaient déjà.
- Focus clavier visible sur les bandeaux de l'accueil (retour Gemini O11).
- Déjà en place, contrairement à l'audit Gemini : `Sitemap:` dans robots.txt (O9), `preload="none"` et `saveData` pour le film d'accueil (O3).
- `exporter.py` : adresse par défaut https://www.big-drama.fr.
- À faire : boucle courte de 20 s pour l'accueil sur téléphone, d'après les points de coupe d'Alex. Le film d'accueil se termine sur « www.bigdrama.fr » (ancien domaine).

## V8.30 · 02.11.2026 · module de vente Billetweb dans la page Billetterie

- Événement Billetweb de Rémi : `la-veillee-bigdrama` (remplace `la-veillee2`). `BILLETTERIE` dans `creations.py`.
- Page Billetterie : séances avec horaires (portes 19 h 30, spectacle 20 h, proposition de Rémi), deux tarifs (20 € sans consommation, 25 € avec), module de vente Billetweb dans la page, lien de secours vers Billetweb dans un nouvel onglet.
- Le module est un cadre (iframe) vers billetweb.fr, comme le code d'intégration de Rémi, mais sans leur script `export.js` : aucun script tiers ne tourne sur big-drama.fr (leur script lit aussi les cookies Facebook et Google Analytics). `creations.js` reçoit seulement les messages du cadre (hauteur, défilement, plein écran), origine vérifiée.
- CSP : `frame-src https://www.billetweb.fr` sur la seule page Billetterie. `.htaccess` : `payment` autorisé pour billetweb.fr (paiement dans le cadre). `.htaccess` testé dans Apache 2.4 (Syntax OK, pages 200, PHP 403).
- Le code « pop-up » de Rémi n'est pas repris : il demande du JavaScript dans la page (bloqué par la CSP) et devient un simple onglet sur téléphone. Le lien de secours fait la même chose.
- La Veillée : FAQ « À quelle heure ? », « Où acheter les billets ? » renvoie vers la page Billetterie. Données structurées : heure de début, d'ouverture des portes, de fin (21 h 30), deux offres.
- Visuels Billetweb (carré 2160 px, affiche A3 2480 × 3508 px) : V3/3-medias-sources/la-veillee/billetweb/.

## V8.31 · 02.11.2026 · retours de Rémi

- Lieu de La Veillée : « Paris 20e » seulement (Alex). Nom du lieu, adresse, entrée de l'impasse, métro et bus retirés de la FAQ, des infos pratiques, de la description et des données structurées.
- Page FAQ à part (`/faq/`) : « Le théâtre immersif » (Qu'est-ce que le théâtre immersif ?, Suis-je obligé de participer ?, réponses reprises des FAQ d'Ariane pour Close et Norma) et « La Veillée ». La page La Veillée renvoie vers la FAQ. Lien FAQ dans le menu (masqué sur téléphone, comme Créations), le pied de page et la page 404.
- Accueil : menu fixe en haut, fond sombre dès qu'on défile (`bd-defile` dans `_app.js`).
- Bandeau La Veillée : dates en clair sur plaque sombre, en gras, visibles aussi sur tablette et téléphone.
- Ordre des créations (accueil, précédent / suivant) : La Veillée, Norma, Close, Un Conte de Noëlle, Better Together, La Prophétie del Coco, Viva Barbessia, Eros en Russie, Scatolina, Burning Bar, Parfum de Famille (`ORDRE` dans `creations.py`, bandeaux de `index.template.html`).
- Réseaux sociaux : ouverture dans un nouvel onglet (accueil et pages).
- 404 : menu à jour (l'ancien lien /contact/ menait à une page supprimée).
- Visuels Billetweb refaits avec « Paris 20ᵉ ». Fonds sans texte (PNG) : V3/3-medias-sources/la-veillee/billetweb/sans-texte/.

## V8.32 · 02.11.2026 · film d'accueil allégé sur téléphone, visuels HD

- Le film d'accueil reste le teaser d'Alex (93 s). Sur téléphone tenu droit, nouvelle version `assets/films/hero-portrait-640.mp4` : cadrage vertical 3:4 pris au centre de l'image (là où le téléphone affiche le film), 480 × 640, léger débruitage, deux passes à 250 kb/s. 2,95 Mo au lieu de 5,4 Mo (−45 %), image plus nette à l'écran. `hero-540.mp4` reste pour les petits écrans en paysage.
- Visuels Billetweb refaits sur les fonds agrandis par Alex (Topaz) et optimisés : carré 2160 (0,4 Mo), A3 web 2480 × 3508 (1 Mo), A3 impression 3508 × 4961 à 300 dpi (3,2 Mo). Fonds sans texte en JPEG : carré 3456 (1,1 Mo au lieu de 13,5), A3 2916 × 4125 (1,6 au lieu de 16,7), 8K (2,5 au lieu de 35), 4K (0,65). Dans __REFS/Banners/optimise/ et V3/3-medias-sources/la-veillee/billetweb/.

## V8.33 · 02.11.2026 · retours d'Ariane (document « Doc Retour Site internet 2026 »)

- DA unifiée sur toutes les pages : fond noir, Montserrat seule (plus de serif ni d'italique, sauf les citations de presse), plus d'ornements ni de filets, couleurs propres aux spectacles neutralisées (bloc V8.33 de `_creations.css`).
- Pages spectacles : film ou photo de tête en pleine largeur, titre et sous-titre dessous (plus rien par-dessus l'image). Sous-titres du récapitulatif d'Ariane (`SOUS_TITRES`), sans année. Accroche plus petite. Crédits dans un seul menu « Crédits ». Galerie : chaque photo entière, jamais agrandie au-delà de sa définition.
- Films de tête remontés sans cartons ni incrustations : Norma (teaser V3 0:00–0:11 + plans bleus du cimetière), Close (6 plans), Viva Barbessia (5,0–21,5 s), Eros en Russie (0,4–9,8 s, avant les paroles incrustées), Prophétie (sans le titre du début). Versions 540p dédiées.
- Norma : logo néon officiel (`logos/norma-neon.png`) en tête, sur l'accueil ; tracé du néon pour la rue (`logos/norma.png`, ancien gardé en `norma-ancien.png`).
- Better Together : nouvelle accroche, deux photos remises à l'endroit, photo « brand show » retirée. Prophétie : mention sanitaire retirée, logo Bacardí ajouté (version blanche). Eros : « Avec » retiré. Scatolina : photo d'Anthony en tête, logos Hermès et Apple recadrés (Apple plus grand). Burning Bar, Parfum de Famille : photo en tête.
- La Veillée : sous-titre « Théâtre musical clandestin », film coupé à 7,2 s, sans boucle : l'ampoule s'allume et l'image se fige sur le titre. Billetterie : cartes de séances et « Découvrir le spectacle » retirés.
- FAQ retirée du site vitrine (questions gardées dans `faq_billetterie` pour la billetterie).
- À propos : le texte d'Ariane seul, titre dans la typo du menu. Paragraphe supplémentaire prêt dans `APROPOS_PLUS`.
- Accueil : bandeaux refaits sur un seul modèle (logo + sous-titre en texte, même taille), Scatolina après Noëlle, ancre « Créations » pile sur les bandeaux, sous-titres dans la rue, titre et signal de la Prophétie plus grands et cliquables, glissement film → rue plus court et sans blocage à l'arrivée. Logo des pages à la taille de l'accueil.
- Reste à fournir : crédits (Better Together, Prophétie, Barbessia, Eros, Scatolina, Burning Bar, Parfum de Famille), logo Grimbergen, logos des médias cités, nouvelles photos (Eros, Barbessia, Scatolina, Norma, Close).

## V8.34 · 02.11.2026 · billetterie

- Synopsis de La Veillée (accroche et texte d'Ariane) sous le titre de la page Billetterie. Tarifs retirés du texte : ils sont dans le module Billetweb (Alex).

## V8.35 · 04.11.2026 · La Veillée canon, packshot V23

- Texte canon d'Alex (04.11.2026) : titre, « Théâtre musical clandestin », citation de Fahrenheit 451, puis « Synopsis » à la première personne. Accroche et devise retirées de la page. Même bloc sur la Billetterie.
- Film de tête : packshot Blender V23 (240 images, 24 i/s, 10 s), joué une fois puis figé sur sa dernière image. Ordinateur `la-veillee-v23-1080.mp4` (3,9 Mo), tablette `la-veillee-v23-540.mp4` (0,7 Mo), téléphone tenu droit `la-veillee-v23-portrait.mp4` (4:5 tiré de la version 9:16, 2,3 Mo). Master 16:9 et rendus dans V3/3-medias-sources/la-veillee/v23-video.
- Images tirées du packshot : affiche 16:9 et 4:5, image de partage 1200 × 630 (`assets/la-veillee-partage.jpg`), bandeau d'accueil `assets/la-veillee-bande-v23.jpg`.
- Visuels Billetweb V23 (carré 2160, A3 web, A3 impression 300 dpi) : V3/3-medias-sources/la-veillee/billetweb/v23/.
