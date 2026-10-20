#!/usr/bin/env python3
"""Compose v6/index.html : la page d'accueil v2 (film plein écran + site classique) + la rue qui se construit."""
import re, sys, pathlib
ici = pathlib.Path(__file__).parent
src = pathlib.Path(sys.argv[1]).read_text(encoding='utf-8')
out = ici / 'dist'
out.mkdir(exist_ok=True)

PROJETS = {'closeprojet': 'maison', 'norma': 'cimetiere', 'parfumdefamilleprojet': 'serre', 'scatolina': 'scatolina',
           'bettertogether': 'bar', 'noelle': 'creche', 'erosenrussieprojet': 'lune', 'vivabarbessia': 'tour',
           'bacardi': 'arbre', 'burningbar': 'usine'}
h = src
# les feuilles, scripts et médias de la v2 restent dans ../v2/
h = re.sub(r'(href|src)="(fonts|theme-original|custom-2023|layout-restaure|finitions|cinema)\.css', r'\1="../v2/\2.css', h)
h = re.sub(r'src="(script|media)\.js', r'src="../v2/\1.js', h)
h = h.replace('"assets/', '"../v2/assets/').replace('url(assets/', 'url(../v2/assets/').replace("url('assets/", "url('../v2/assets/")
# les pages de création ouvrent la page hybride de la v6
for page, lid in PROJETS.items():
    h = h.replace(f'href="{page}.html"', f'href="#projet-{lid}" data-projet="{lid}"')
h = h.replace('href="index.html#', 'href="#').replace('href="index.html"', 'href="./"')
h = re.sub(r'href="(contactform|mentionslegales|cgv|politiqueconfidentialite)\.html"', r'href="../v2/\1.html"', h)
h = h.replace('class="entry-enter" href="#manifeste"', 'class="entry-enter" href="#rue"')

TETE = '''<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Bodoni+Moda:ital,opsz,wght@0,6..96,400;0,6..96,600;1,6..96,400&family=Montserrat:wght@300;400;500&family=Special+Elite&family=UnifrakturMaguntia&display=swap"><link rel="stylesheet" href="style.css?v=6"><link rel="icon" href="../logos/big-drama-clef.png">'''
h = h.replace('</head>', TETE + '</head>', 1)

SEUIL = '''<div class="bd-seuil" id="bd-seuil"><button id="bd-entrer" type="button" aria-label="Cliquer pour entrer"><img src="../logos/cle.png" alt=""><span>Cliquer pour entrer</span></button></div>'''
h = re.sub(r'(<body[^>]*>)', r'\1' + SEUIL, h, count=1)

RUE = '''<section class="bd-rue" id="rue" aria-label="La rue Big Drama, Paris 1918"><div class="bd-collant"><div class="bd-scene" id="bd-scene"><svg id="bd-svg" viewBox="0 0 1600 900" preserveAspectRatio="xMidYMax slice" role="group" aria-label="La rue, chaque maison est une création"></svg><div class="bd-voile" id="bd-voile"></div><div class="bd-logo" id="bd-logo" aria-hidden="true"></div><p class="bd-indice" id="bd-indice">Survolez la rue</p></div></div></section>'''
fin_hero = h.index('</section>', h.index('class="cinema-entry"')) + len('</section>')
h = h[:fin_hero] + RUE + h[fin_hero:]

PIED = '''<article class="bd-projet" id="bd-projet" aria-label="Création"></article><div class="bd-lumiere" id="bd-lumiere" role="dialog" aria-label="Photo agrandie"></div><button class="bd-son" id="bd-son" type="button" aria-pressed="true" aria-label="Couper ou remettre la musique" title="Musique">♪</button><script type="module" src="app.js?v=6"></script>'''
h = h.replace('</body>', PIED + '</body>', 1)

(out / 'index.html').write_text(h, encoding='utf-8')
(out / 'style.css').write_text((ici / '_style.css').read_text(encoding='utf-8'), encoding='utf-8')
(out / 'app.js').write_text((ici / '_app.js').read_text(encoding='utf-8'), encoding='utf-8')
for f in ('silhouettes.js', 'lieux.js'):
    (out / f).write_text((ici / f).read_text(encoding='utf-8'), encoding='utf-8')
print('ok', len(h))
