# Big Drama · maquette du nouveau site (v5)

Une rue de Paris en 1918. Chaque maison est une création de Big Drama.
Survol : le logo se dessine. Clic : le bâtiment se trace en plan bleu et son histoire se déroule.

Maquette de travail, non référencée (`noindex`). Textes provisoires en lorem ipsum.

## Voir en local

```bash
cd bigdrama-maquette
python3 -m http.server 8000
```

Puis ouvrir http://127.0.0.1:8000

## Publier sur GitHub Pages

```bash
cd /Volumes/PROD/2026_10_BigDramaWebsite_V1/_Tests/maison-3d/v5/bigdrama-maquette
git init
git add .
git commit -m "Maquette v5 : la rue"
git branch -M main
gh repo create bigdrama-maquette --public --source=. --push
gh api -X POST "repos/{owner}/bigdrama-maquette/pages" -f "source[branch]=main" -f "source[path]=/"
```

L'adresse publique s'affiche dans Settings → Pages du dépôt après une à deux minutes.
Sans l'outil `gh` : créer le dépôt vide sur github.com, puis `git remote add origin <adresse>`, `git push -u origin main`, et activer Pages dans Settings → Pages (branche `main`, dossier racine).

## Fichiers

- `index.html` : la page, ses styles et son script.
- `silhouettes.js` : le dessin de la rue et les plans des bâtiments.
- `lieux.js` : les créations, leurs résumés, infos, pièces et supports.
- `logos/` : logos à l'encre, fond transparent.
- `sons/` : ambiances par lieu, à fournir.
