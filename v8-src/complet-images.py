"""V8.40 · préparation des images COMPLET (retours ChatGPT images via Alex, direction A de Mistral)."""
import numpy as np
from PIL import Image, ImageFilter
from scipy import ndimage
U = '/mnt/user-data/uploads/'; O = '/home/claude/v840/'

def jpg(src, dst, q=80, w=None):
    im = Image.open(U + src).convert('RGB')
    if w and im.width > w: im = im.resize((w, round(im.height * w / im.width)), Image.LANCZOS)
    im.save(O + dst, quality=q, optimize=True, progressive=True, subsampling=2)

def detoure(src, dst, w, seuil=14, doux=10, remplir=False, q=82):
    im = Image.open(U + src).convert('RGB'); a = np.array(im).astype(np.float32)
    m = a.max(2)
    alpha = np.clip((m - seuil) / doux, 0, 1)
    if remplir:
        plein = ndimage.binary_fill_holes(alpha > .5)
        plein = ndimage.binary_opening(plein, iterations=2)
        lab, n = ndimage.label(plein); taille = ndimage.sum(plein, lab, range(1, n + 1))
        plein = lab == (np.argmax(taille) + 1)
        alpha = np.maximum(alpha * plein, ndimage.binary_erosion(plein, iterations=3) * 1.0)
    A = Image.fromarray((alpha * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(.8))
    rgba = im.convert('RGBA'); rgba.putalpha(A)
    rgba = rgba.crop(A.point(lambda v: 255 if v > 8 else 0).getbbox())
    rgba = rgba.resize((w, round(rgba.height * w / rgba.width)), Image.LANCZOS)
    rgba.save(O + dst, quality=q, method=6)

jpg('49bf1037-image.png', 'mur-complet-16x9.jpg', 80)
jpg('fd097924-image.png', 'mur-complet-4x5.jpg', 80)
detoure('906061dc-image.png', 'feuille-journal.webp', 1254, seuil=32, doux=1, remplir=True, q=80)  # feuille détourée de son fond sombre
detoure('4bc46eaf-image.png', 'scotch-1.webp', 640)
detoure('4d1cafca-image.png', 'scotch-2.webp', 640)
detoure('d036df95-image.png', 'bande-complet.webp', 1000, remplir=True)
# grain argentique en tuile (remplace le filtre SVG : Safari applique mal filter:url() sur du HTML)
rng = np.random.default_rng(840)
g = rng.normal(128, 38, (240, 240)).clip(0, 255).astype(np.uint8)
Image.fromarray(g).filter(ImageFilter.GaussianBlur(.45)).save(O + 'grain.png', optimize=True)
print('ok')
