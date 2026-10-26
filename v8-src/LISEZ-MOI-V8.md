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

## Fichiers à fournir

| Fichier | Contenu | Qui |
|---|---|---|
| `logos/phenix.png` | Le Phénix de Close, fond transparent. Remplace le dessin dès qu'il existe | Ariane |
| `sons/close/chanson-01.mp3` … `chanson-08.mp3` | Huit chansons de Close. Les 20 fenêtres se les partagent. Sans fichier, la musique de Close joue | Alex |
| `sons/usine.mp3` | Le son « Chaussée aux Moines » pour Burning Bar | Alex |
| `sons/bar.mp3` | Le refrain Suno de Better Together (remplace l'actuel) | Ariane |
| Photo de Norma avec Rosy | Pour la bannière Norma. Donner le nom du fichier | Alex |

## À vérifier dans un vrai navigateur

- Les films MP4 (le test automatique ne lit pas le H.264).
- Le son au survol des fenêtres de Close une fois les chansons posées.
- Safari et iPhone : le passage forcé film ↔ rue et le glisser horizontal.
