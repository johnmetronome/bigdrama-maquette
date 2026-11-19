"""V8.40 · préparation des images COMPLET (images ChatGPT fournies par Alex). V8.41 : maquette A, grain fort."""
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
detoure('4d1cafca-image.png', 'scotch-2.webp', 640)
detoure('d036df95-image.png', 'bande-complet.webp', 1000, remplir=True)
# grain argentique fort, deux échelles (grain fin + amas), tuile 320 px (V8.41)
rng = np.random.default_rng(7)
fin = rng.normal(0, 1, (320, 320))
amas = np.array(Image.fromarray((rng.normal(0, 1, (160, 160)) * 40 + 128).clip(0, 255).astype(np.uint8)).resize((320, 320), Image.BICUBIC), np.float32) - 128
Image.fromarray((fin * 34 + amas * .9 + 128).clip(0, 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(.6)).save(O + 'grain-fort.png', optimize=True)
print('ok')
