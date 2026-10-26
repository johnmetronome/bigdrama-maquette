# Big Drama · maquette V8

26.10.2026 · Claude · construite sur la V7.15 de Codex (v7 et v7-src restent intacts)

En ligne après push : https://johnmetronome.github.io/bigdrama-maquette/v8/

## Régénérer

```
cd bigdrama-maquette/v8-src
python3 rebuild.py
```

`rebuild.py` refait `silhouettes.js` (à partir de `_outils.js` et `_rue.js`) et copie tout dans `../v8/`. Les films sont dans `v8/assets/films/`.

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
