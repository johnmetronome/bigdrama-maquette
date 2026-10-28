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
