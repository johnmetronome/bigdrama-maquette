"""Big Drama V8 · prépare des copies légères des images (WebP) dans v8/assets/opt/.

Les originaux ne sont jamais modifiés. rebuild.py lit ensuite v8/assets/opt/carte.json
et fait pointer v8 vers les copies légères. À relancer quand une image change :

    cd bigdrama-maquette/v8-src
    python3 optimiser.py      (demande Pillow : pip3 install pillow)
"""
from pathlib import Path
import json, re
from PIL import Image

ICI = Path(__file__).resolve().parent
RACINE = ICI.parent                      # le dépôt
OPT = RACINE / 'v8' / 'assets' / 'opt'
carte = {}                               # chemin d'origine (depuis la racine) -> {src, srcset}


def webp(src: Path, dest: Path, largeur_max: int, qualite: int, cote_max: int = 0):
    """Écrit une copie WebP, sans jamais agrandir. Rend la largeur obtenue."""
    dest.parent.mkdir(parents=True, exist_ok=True)
    im = Image.open(src)
    im = im.convert('RGBA' if im.mode in ('RGBA', 'LA', 'P') else 'RGB')
    if cote_max and max(im.size) > cote_max:
        largeur_max = min(largeur_max, round(im.width * cote_max / max(im.size)))
    if im.width > largeur_max:
        im = im.resize((largeur_max, round(im.height * largeur_max / im.width)), Image.LANCZOS)
    # on ne réécrit pas un fichier plus récent que sa source
    if not dest.exists() or dest.stat().st_mtime < src.stat().st_mtime or Image.open(dest).width != im.width:
        im.save(dest, 'WEBP', quality=qualite, method=6)
    return im.width


def relatif(p: Path) -> str:
    return p.relative_to(RACINE).as_posix()


# 1 · bandeaux des créations (photos de fond et titres), en deux tailles
html = (ICI / 'index.template.html').read_text(encoding='utf-8')
for chemin in sorted(set(re.findall(r'<img[^>]*src="([^"]+\.(?:jpe?g|png))"', html))):
    src = (RACINE / 'v8' / chemin).resolve()
    if not src.exists() or 'logos/cle' in chemin or 'Big-Drama-Logo' in chemin:
        continue
    titre = src.suffix == '.png'
    nom = src.stem + ('-titre' if titre else '')
    if titre:                                   # titre détouré : une seule taille suffit
        w = webp(src, OPT / 'bandeaux' / f'{nom}.webp', 1000, 88)
        carte[relatif(src)] = {'src': f'bandeaux/{nom}.webp'}
    else:
        grand = webp(src, OPT / 'bandeaux' / f'{nom}.webp', 2000, 80)
        petit = webp(src, OPT / 'bandeaux' / f'{nom}-900.webp', 900, 76)
        carte[relatif(src)] = {'src': f'bandeaux/{nom}.webp',
                               'srcset': f'bandeaux/{nom}-900.webp {petit}w, bandeaux/{nom}.webp {grand}w'}

# 2 · logos de la rue et des pages création
for src in sorted((RACINE / 'logos').glob('*.png')):
    # les titres des bandeaux s'en servent en grand (masques) : on garde 900 px, sauf le paon et le phénix, petits sur la rue
    webp(src, OPT / 'logos' / f'{src.stem}.webp', 900, 86, cote_max=420 if src.stem in ('paon', 'phenix') else 900)
    carte[relatif(src)] = {'src': f'logos/{src.stem}.webp'}

# 3 · photos des pages création
for src in sorted((RACINE / 'photos').glob('*.jpg')):
    webp(src, OPT / 'photos' / f'{src.stem}.webp', 1200, 76)
    carte[relatif(src)] = {'src': f'photos/{src.stem}.webp'}

# 4 · polices TTF du site d'origine (Open Sans…) : copies WOFF2 réduites à l'alphabet latin
try:
    from fontTools import subset
    for src in sorted((RACINE / 'v2' / 'assets' / 'fonts').glob('*.ttf')):
        dest = RACINE / 'v8' / 'fonts' / 'v2' / f'{src.stem}.woff2'
        dest.parent.mkdir(parents=True, exist_ok=True)
        if not dest.exists() or dest.stat().st_mtime < src.stat().st_mtime:
            o = subset.Options(); o.flavor = 'woff2'; o.layout_features = ['*']
            f = subset.load_font(str(src), o); s_ = subset.Subsetter(o)
            s_.populate(unicodes=list(range(0x20, 0x7F)) + list(range(0xA0, 0x180)) + [0x2018, 0x2019, 0x201C, 0x201D, 0x2026, 0x2013, 0x2014, 0x20AC, 0x2022, 0x202F])
            s_.subset(f); subset.save_font(f, str(dest), o)
except ImportError:
    print('fontTools absent : polices non converties (pip3 install fonttools brotli)')

# 5 · films des pages création : version 540p muette pour les téléphones (ffmpeg requis)
import shutil, subprocess
if shutil.which('ffmpeg'):
    for src in sorted((RACINE / 'videos').glob('*-169.mp4')):
        dest = OPT / 'videos' / f'{src.stem}-540.mp4'
        dest.parent.mkdir(parents=True, exist_ok=True)
        if not dest.exists() or dest.stat().st_mtime < src.stat().st_mtime:
            subprocess.run(['ffmpeg', '-loglevel', 'error', '-y', '-i', str(src), '-an', '-vf', 'scale=960:-2', '-c:v', 'libx264',
                            '-preset', 'slow', '-crf', '25', '-profile:v', 'high', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', str(dest)], check=True)
else:
    print('ffmpeg absent : films pour téléphone non préparés')

(OPT / 'carte.json').write_text(json.dumps(carte, indent=1, ensure_ascii=False), encoding='utf-8')
avant = sum((RACINE / k).stat().st_size for k in carte)
apres = sum((OPT / v['src']).stat().st_size for v in carte.values())
print(f'{len(carte)} images · {avant / 1e6:.1f} Mo -> {apres / 1e6:.1f} Mo (grande taille)')
