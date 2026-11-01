"""Big Drama V8 · prépare la version en ligne, autonome, à partir de v8/.

    cd bigdrama-maquette/v8-src
    python3 rebuild.py
    python3 exporter.py                                   # adresse par défaut : https://www.bigdrama.fr
    python3 exporter.py https://www.bigdrama.fr ../../bigdrama-en-ligne

Le dossier produit contient seulement les fichiers dont le site a besoin :
pas de sources, pas de notes, pas d'anciennes versions (v6, v7-src…), pas de fichiers de test.
Le site y est à la racine : /, /a-propos/, /creations/close/, /contact/…
Ajouts : robots.txt, sitemap.xml, 404.html, .nojekyll, adresses canoniques, aperçus de partage absolus.
Option --noindex : garde l'interdiction d'indexation (pour une préversion).
Le dossier de sortie est vidé puis refait à chaque lancement.
"""
from pathlib import Path, PurePosixPath
import os, re, shutil, sys, posixpath, datetime

ICI = Path(__file__).resolve().parent
RACINE = ICI.parent
args = [a for a in sys.argv[1:] if not a.startswith('--')]
BASE = (args[0] if args else 'https://www.bigdrama.fr').rstrip('/')
SORTIE = Path(args[1]).resolve() if len(args) > 1 else (RACINE.parent / 'bigdrama-en-ligne')
NOINDEX = '--noindex' in sys.argv
if SORTIE == RACINE or RACINE in SORTIE.parents:
    sys.exit('Le dossier de sortie doit être en dehors du dépôt.')

MEDIAS = r'(?:jpe?g|png|webp|svg|gif|mp4|webm|mp3|m4a|woff2?|ttf|css|js|json|ico|txt)'
PAGES = ['v8/index.html'] + sorted(p.relative_to(RACINE).as_posix() for p in (RACINE / 'v8').glob('*/index.html')) \
        + sorted(p.relative_to(RACINE).as_posix() for p in (RACINE / 'v8' / 'creations').glob('*/index.html'))
EXCLUS = {'v8/apparitions.html'}


def cible(p):
    """Chemin dans la version en ligne : v8/x -> x, le reste garde son dossier (v2/, photos/, logos/…)."""
    return p[3:] if p.startswith('v8/') else p


def resoudre(depuis, ref):
    """Référence relative trouvée dans le fichier `depuis` -> chemin depuis la racine du dépôt (ou None)."""
    if re.match(r'^(?:[a-z]+:|//|#|%23|data:|\{|\$)', ref) or not ref.strip():
        return None
    chemin = ref.split('#')[0].split('?')[0]
    if not chemin:
        return None
    p = posixpath.normpath(posixpath.join(posixpath.dirname(depuis), chemin))
    if p.startswith('..'):
        return None
    if (RACINE / p).is_dir():
        p = p.rstrip('/') + '/index.html'
    return p if (RACINE / p).is_file() else None


def relatif(de, vers, ref):
    """Réécrit `ref` (vers le chemin dépôt `vers`) pour le fichier en ligne `de`."""
    chemin = ref.split('#')[0].split('?')[0]
    suite = ref[len(chemin):]
    v = cible(vers)
    dossier = vers.endswith('index.html') and (chemin.endswith('/') or chemin in ('.', '..'))
    if dossier:
        v = v[:-len('index.html')] or './'
    r = posixpath.relpath(v if v != './' else '.', posixpath.dirname(cible(de)) or '.')
    if dossier:
        r = (r.rstrip('/') + '/') if r != '.' else './'
    return r + suite


a_copier, vus, file = set(), set(), list(PAGES)
contenus = {}
manquants = []


def noter(depuis, ref):
    p = resoudre(depuis, ref)
    if p is None:
        if not re.match(r'^(?:[a-z]+:|//|#|%23|data:|\{|\$)', ref) and ref.strip() and not ref.startswith('?'):
            manquants.append(f'{depuis} -> {ref}')
        return None
    if p not in vus and p not in EXCLUS:
        vus.add(p); file.append(p)
    return p


def traiter_html(f, t):
    def attr(m):
        nom, val = m.group(1), m.group(2)
        if nom == 'srcset':
            morceaux = []
            for part in val.split(','):
                bouts = part.strip().split()
                p = noter(f, bouts[0]) if bouts else None
                morceaux.append(' '.join([relatif(f, p, bouts[0]) if p else bouts[0]] + bouts[1:]))
            return f'{nom}="{", ".join(morceaux)}"'
        p = noter(f, val)
        return f'{nom}="{relatif(f, p, val)}"' if p else m.group(0)
    t = re.sub(r'\b(src|href|srcset|poster|data-src|data-grand|data-href)="([^"]*)"', attr, t)
    for m in re.findall(r'https://johnmetronome\.github\.io/bigdrama-maquette/([\w./-]+)', t):   # images d'aperçu de partage
        if (RACINE / m).is_file() and m not in vus:
            vus.add(m); file.append(m)

    def url(m):
        p = noter(f, m.group(2))
        return f"url({m.group(1)}{relatif(f, p, m.group(2)) if p else m.group(2)}{m.group(1)})"
    t = re.sub(r"url\((['\"]?)([^)'\"]+)\1\)", url, t)

    def json_src(m):                                        # films de la visionneuse (#collection-data)
        p = noter(f, m.group(1))
        return f'"{relatif(f, p, m.group(1))}"' if p else m.group(0)
    t = re.sub(r'(?<=: )"((?:\.\./)*[\w%./-]+\.' + MEDIAS + r')"', json_src, t)
    return t


def traiter_css(f, t):
    def url(m):
        p = noter(f, m.group(2))
        return f'url({m.group(1)}{relatif(f, p, m.group(2)) if p else m.group(2)}{m.group(1)})'
    return re.sub(r"url\((['\"]?)([^)'\"]+)\1\)", url, t)


def traiter_js(f, t):
    """Chemins depuis la racine du dépôt (préfixés par A) et chemins relatifs à la page."""
    for m in set(re.findall(r'(?<![\w./-])((?:v8/assets|v7|v2|photos|logos|videos|sons)/[\w%./-]+\.' + MEDIAS + r')', t)):
        if (RACINE / m).is_file():
            vus.add(m) if m in vus else (vus.add(m), file.append(m))
    for m in set(re.findall(r'(?<![\w./-])(assets/[\w%./-]+\.' + MEDIAS + r')', t)):
        noter('v8/index.html', m)
    # films 16:9 des créations : leur version 540p est composée dans le code
    for m in set(re.findall(r'videos/([\w-]+)\.mp4', t)):
        p = f'v8/assets/opt/videos/{m}-540.mp4'
        if (RACINE / p).is_file() and p not in vus:
            vus.add(p); file.append(p)
    return t.replace('v8/assets/', 'assets/')


vus.update(PAGES)
while file:
    f = file.pop(0)
    src = RACINE / f
    if f.endswith(('.html', '.css', '.js')):
        t = src.read_text(encoding='utf-8')
        if f.endswith('.html'):
            t = traiter_html(f, t)
        elif f.endswith('.css'):
            t = traiter_css(f, t)
        else:
            t = traiter_js(f, t)
        contenus[f] = t
    a_copier.add(f)

# ── écriture ──
if SORTIE.exists():
    shutil.rmtree(SORTIE)
SORTIE.mkdir(parents=True)
for f in sorted(a_copier):
    d = SORTIE / cible(f)
    d.parent.mkdir(parents=True, exist_ok=True)
    if f in contenus:
        t = contenus[f]
        if f.endswith('.html'):
            adresse = BASE + '/' + cible(f)[:-len('index.html')]
            t = re.sub(r'<meta name="robots"[^>]*>', '<meta name="robots" content="noindex,nofollow">' if NOINDEX else '', t)
            t = re.sub(r'https://johnmetronome\.github\.io/bigdrama-maquette/([\w./-]+)', lambda m: BASE + '/' + cible(m.group(1)), t)
            t = t.replace('<meta charset="utf-8">', f'<meta charset="utf-8"><link rel="canonical" href="{adresse}">', 1)
            if f == 'v8/index.html':
                t = t.replace('<meta charset="utf-8">', '<meta charset="utf-8"><meta name="bd-racine" content="./">', 1)
            if 'og:image' in t and 'og:url' not in t:
                t = t.replace('<meta property="og:type"', f'<meta property="og:url" content="{adresse}"><meta property="og:type"', 1)
        d.write_text(t, encoding='utf-8')
    else:
        shutil.copy2(RACINE / f, d)

pages = [cible(p)[:-len('index.html')] for p in PAGES]
jour = datetime.date.today().isoformat()
(SORTIE / 'sitemap.xml').write_text('<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
                                     + ''.join(f'<url><loc>{BASE}/{p}</loc><lastmod>{jour}</lastmod></url>\n' for p in pages) + '</urlset>\n', encoding='utf-8')
(SORTIE / 'robots.txt').write_text('User-agent: *\nDisallow: /\n' if NOINDEX else f'User-agent: *\nAllow: /\nSitemap: {BASE}/sitemap.xml\n', encoding='utf-8')
(SORTIE / '.nojekyll').write_text('', encoding='utf-8')
CSP = "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; object-src 'none'; base-uri 'self'; form-action 'self'"
(SORTIE / '404.html').write_text(f'''<!doctype html><html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex"><meta http-equiv="Content-Security-Policy" content="{CSP}"><title>Page introuvable · Big Drama</title>
<link rel="stylesheet" href="/fonts/fonts.css"><link rel="stylesheet" href="/creations/creations.css"><link rel="icon" type="image/png" href="/favicon.png"></head>
<body class="cr cr-simple"><header class="cr-entete"><a class="cr-marque" href="/" aria-label="Big Drama, accueil"><img src="/v2/assets/brand-white.svg" alt="Big Drama"></a>
<nav aria-label="Navigation principale"><a href="/a-propos/">À propos</a><a href="/?direct#content">Créations</a><a href="/contact/">Contact</a></nav></header>
<main id="contenu"><section class="cr-tete cr-tete-simple"><div class="cr-tete-contenu"><p class="cr-cadre">Erreur 404</p><h1 class="cr-titre-texte">Cette porte ne mène nulle part</h1></div></section>
<article class="cr-corps cr-contact"><p class="cr-contact-mail"><a href="/">Revenir dans la rue</a></p></article></main></body></html>
''', encoding='utf-8')

taille = sum(p.stat().st_size for p in SORTIE.rglob('*') if p.is_file())
print(f'{len(a_copier)} fichiers · {taille / 1e6:.0f} Mo · {SORTIE}')
print('adresse :', BASE, '· indexation', 'interdite' if NOINDEX else 'autorisée')
if manquants:
    print('Références introuvables :'); [print('  ', m) for m in sorted(set(manquants))[:40]]
legal = [p.name for p in (ICI / '_legal').glob('*.html') if 'texte repris tel quel' in p.read_text(encoding='utf-8')]
if legal and not NOINDEX:
    print('ATTENTION : pages légales encore reprises de l’ancien site, à valider avant la mise en ligne :', ', '.join(sorted(legal)))
