"""Big Drama V8 · régénère v8/ à partir des sources de v8-src/.

    cd bigdrama-maquette/v8-src
    python3 rebuild.py

1. build.py refait silhouettes.js (à partir de _outils.js et _rue.js).
2. Les sources sont copiées dans ../v8/.
3. Si optimiser.py a tourné (v8/assets/opt/carte.json), v8 pointe vers les images WebP légères.
4. Les huit feuilles de style deviennent une seule (site.css), et le JavaScript un seul fichier (app.js).
   Avec esbuild (npm i -g esbuild), les deux sont aussi compressés. Sans esbuild, tout marche quand même.
"""
from pathlib import Path
import runpy, shutil, os, re, json, subprocess

here = Path(__file__).resolve().parent
os.chdir(here)
runpy.run_path(str(here / 'build.py'))
out = here.parent / 'v8'
racine = here.parent
out.mkdir(exist_ok=True)
# Feuille de polices et notices suivies dans les sources, sorties générées.
(out / 'fonts').mkdir(exist_ok=True)
shutil.copy2(here / '_fonts.css', out / 'fonts' / 'fonts.css')
shutil.copy2(here / '_fonts-OFL.txt', out / 'fonts' / 'OFL.txt')
for source, target in [('apparitions.html', 'apparitions.html'), ('_app.js', 'app-source.js'), ('_style.css', 'style.css'),
                       ('silhouettes.js', 'silhouettes.js'), ('lieux.js', 'lieux.js'), ('index.template.html', 'index.html')]:
    shutil.copy2(here / source, out / target)

VERSION = re.search(r'style\.css\?v=([\w.]+)', (here / 'index.template.html').read_text(encoding='utf-8')).group(1)
esbuild = shutil.which('esbuild')

# ── 1 · images légères ──
carte_f = out / 'assets' / 'opt' / 'carte.json'
carte = json.loads(carte_f.read_text(encoding='utf-8')) if carte_f.exists() else {}


def vers_opt_js(texte):
    """'logos/x.png' et 'photos/x.jpg' (chemins depuis la racine, préfixés par A dans app.js) -> WebP."""
    def r(m):
        cle = m.group(0)
        return 'v8/assets/opt/' + carte[cle]['src'] if cle in carte else cle
    return re.sub(r'(?<![\w/.])(?:logos|photos)/[\w-]+\.(?:png|jpg)', r, texte)


for nom in ('lieux.js', 'silhouettes.js', 'app-source.js'):
    f = out / nom
    f.write_text(vers_opt_js(f.read_text(encoding='utf-8')), encoding='utf-8')

html = (out / 'index.html').read_text(encoding='utf-8')


def img(m):
    balise = m.group(0)
    src = re.search(r'src="([^"]+)"', balise).group(1)
    cle = (out / src).resolve()
    try:
        cle = cle.relative_to(racine.resolve()).as_posix()
    except ValueError:
        return balise
    if cle not in carte:
        return balise
    e = carte[cle]
    balise = balise.replace(f'src="{src}"', f'src="assets/opt/{e["src"]}"')
    if 'srcset' in e:
        jeu = ', '.join('assets/opt/' + x.strip() for x in e['srcset'].split(','))
        balise = balise.replace('<img ', f'<img srcset="{jeu}" sizes="100vw" ', 1)
    if 'decoding=' not in balise:
        balise = balise.replace('<img ', '<img decoding="async" ', 1)
    return balise


html = re.sub(r'<img [^>]*>', img, html)
# masques des titres de bandeaux : url('../logos/x.png')
html = re.sub(r"url\('\.\./(logos/[\w-]+\.png)'\)", lambda m: f"url('assets/opt/{carte[m.group(1)]['src']}')" if m.group(1) in carte else m.group(0), html)

# ── 2 · une seule feuille de style ──
FEUILLES = ['../v2/fonts.css', '../v2/theme-original.css', '../v2/custom-2023.css', '../v2/layout-restaure.css',
            '../v2/finitions.css', '../v2/cinema.css', 'fonts/fonts.css', 'style.css']


def relier(css, dossier):
    """Réécrit les url() relatives d'une feuille pour qu'elles marchent depuis v8/."""
    def r(m):
        u, fmt = m.group(2).strip(), m.group(3) or ''
        if re.match(r'^(data:|https?:|/|#|%)', u):
            return m.group(0)
        cible = (dossier / u.split('?')[0]).resolve()
        if cible.suffix == '.ttf':                               # police TTF : sa copie WOFF2, si optimiser.py l'a faite
            w2 = out / 'fonts' / 'v2' / (cible.stem + '.woff2')
            if w2.exists():
                return f'url("fonts/v2/{cible.stem}.woff2") format("woff2")'
        return 'url("' + os.path.relpath(cible, out.resolve()).replace(os.sep, '/') + '")' + fmt
    return re.sub(r'url\((["\']?)([^)"\']+)\1\)(\s*format\([^)]*\))?', r, css)


morceaux = []
for f in FEUILLES:
    chemin = (out / f).resolve()
    if chemin.exists():
        css = re.sub(r'@charset[^;]*;', '', chemin.read_text(encoding='utf-8'))
        morceaux.append(f'/* ── {f} ── */\n' + relier(css, chemin.parent))
(out / 'site.css').write_text('\n'.join(morceaux), encoding='utf-8')
if esbuild:
    subprocess.run([esbuild, str(out / 'site.css'), '--minify', '--allow-overwrite', '--log-level=warning', f'--outfile={out / "site.css"}'], check=True)
premier = True


def remplace_lien(m):
    global premier
    if premier:
        premier = False
        return f'<link rel="stylesheet" href="site.css?v={VERSION}">'
    return ''


html = re.sub(r'<link rel="stylesheet" href="(?:\.\./v2/[^"]*|fonts/fonts\.css|style\.css[^"]*)">', remplace_lien, html)

# ── 3 · un seul fichier JavaScript ──
if esbuild:
    subprocess.run([esbuild, str(out / 'app-source.js'), '--bundle', '--format=esm', '--minify', '--target=es2020',
                    '--log-level=warning', f'--outfile={out / "app.js"}'], check=True)
else:
    shutil.copy2(out / 'app-source.js', out / 'app.js')
    html = html.replace('<script type="module"', '<link rel="modulepreload" href="silhouettes.js"><link rel="modulepreload" href="lieux.js"><script type="module"', 1)
(out / 'app-source.js').unlink()

# ── 4 · le film d'accueil d'abord ──
html = html.replace('<link rel="preload" as="image" href="assets/films/hero-poster.jpg">',
                    '<link rel="preload" as="image" href="assets/films/hero-poster.jpg" fetchpriority="high">')
(out / 'index.html').write_text(html, encoding='utf-8')

# ── 5 · pages création et À propos (vraies pages) ──
runpy.run_path(str(here / 'creations.py'), run_name='lib')['generer'](carte, VERSION)
print(out, '· esbuild' if esbuild else '· sans esbuild (fichiers non compressés)', '· images légères' if carte else '')
