"""V8.39 · COMPLET en bouts de scotch + mur de journaux + feuille de journal salie.
Sources : frame du packshot v23 (mur réel) + textures CC0 ambientCG du dossier LaVeillee_V3_3."""
import math, random, sys
import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageChops, ImageOps, ImageEnhance

random.seed(39); np.random.seed(39)
TX = '/mnt/user-data/uploads/2026_10_Laveillée_Visuels/2026_11_01_PackshotV2/LaVeillee_V3_3/textures_cc0/'
OUT = sys.argv[1] if len(sys.argv) > 1 else '/home/claude/vis/out'
import os; os.makedirs(OUT, exist_ok=True)

FRAME = Image.open('/home/claude/vis/f100.png').convert('RGB')
SMEAR = Image.open(TX + 'Smear004/Smear004_2K-JPG_Color.jpg').convert('L')
LEAK = Image.open(TX + 'Leaking004/Leaking004_2K-JPG_Opacity.jpg').convert('L')
FING = Image.open(TX + 'Fingerprints001/Fingerprints001_2K-JPG_Opacity.jpg').convert('L')
PAPER = Image.open(TX + 'Paper006/Paper006_2K-JPG_Color.jpg').convert('RGB')


def crop_tex(tex, w, h, scale=1.0):
    tw, th = int(w * scale), int(h * scale)
    tw, th = min(tw, tex.width), min(th, tex.height)
    x = random.randint(0, tex.width - tw); y = random.randint(0, tex.height - th)
    return tex.crop((x, y, x + tw, y + th)).resize((w, h), Image.LANCZOS)


def grain(w, h, amt=18, blur=0.6):
    n = np.random.normal(0, amt, (h, w)).astype(np.float32)
    im = Image.fromarray(np.clip(n + 128, 0, 255).astype(np.uint8))
    return im.filter(ImageFilter.GaussianBlur(blur)) if blur else im


# ---------------------------------------------------------------- scotch
def strip(L, w, col, opa=236):
    """Un bout de scotch toilé sombre, horizontal, bouts déchirés."""
    pad = 14
    W, H = int(L + 2 * pad), int(w + 2 * pad)
    m = Image.new('L', (W, H), 0)
    d = ImageDraw.Draw(m)
    pts = []
    # côté haut (légère ondulation)
    for x in range(pad, W - pad + 1, 9):
        pts.append((x, pad + random.uniform(-1.2, 1.2)))
    # bout droit déchiré
    y = pad
    while y < H - pad:
        pts.append((W - pad + random.uniform(-7, 5), y)); y += random.uniform(2, 5)
    for x in range(W - pad, pad - 1, -9):
        pts.append((x, H - pad + random.uniform(-1.2, 1.2)))
    y = H - pad
    while y > pad:
        pts.append((pad + random.uniform(-5, 7), y)); y -= random.uniform(2, 5)
    d.polygon(pts, fill=opa)
    # fibres arrachées aux bouts
    for _ in range(int(w / 5)):
        yy = random.uniform(pad, H - pad)
        for xe, sgn in ((W - pad, 1), (pad, -1)):
            if random.random() < .5:
                ln = random.uniform(2, 9)
                d.line([(xe, yy), (xe + sgn * ln, yy + random.uniform(-2, 2))], fill=int(opa * .7), width=1)
    m = m.filter(ImageFilter.GaussianBlur(.6))
    # matière : stries dans la longueur + smear + plis
    a = np.zeros((H, W), np.float32)
    stries = np.random.normal(0, 1, (H, 1)).astype(np.float32)
    stries = np.array(Image.fromarray(((stries - stries.min()) / (np.ptp(stries) + 1e-6) * 255).astype(np.uint8)).resize((1, H)).filter(ImageFilter.GaussianBlur(1)), np.float32) / 255 - .5
    a += stries * 14
    sm = np.array(crop_tex(SMEAR, W, H, 1.4), np.float32) / 255
    a += (sm - sm.mean()) * 70
    a += (np.array(grain(W, H, 22, .5), np.float32) - 128) * .35
    im = Image.new('RGB', (W, H), col)
    arr = np.array(im, np.float32) + a[..., None]
    # reflet satiné en travers + bords qui se décollent (plus clairs)
    yy = np.linspace(0, 1, H)[:, None]
    arr += (np.exp(-((yy - random.uniform(.25, .45)) ** 2) / .01) * 6)[..., None]
    for _ in range(random.randint(1, 3)):  # plis
        x0 = random.uniform(pad, W - pad); k = random.uniform(-.5, .5)
        xs = np.arange(W)[None, :]; ys = np.arange(H)[:, None]
        dist = np.abs((xs - x0) - k * (ys - H / 2))
        arr += (np.exp(-dist ** 2 / 2.5) * random.uniform(4, 9))[..., None]
    rgb = Image.fromarray(np.clip(arr, 0, 255).astype(np.uint8))
    # transparence irrégulière : on devine le papier dessous par endroits
    t = np.array(m, np.float32) * (0.9 + 0.1 * (sm - sm.mean() + .5))
    rgba = rgb.convert('RGBA'); rgba.putalpha(Image.fromarray(np.clip(t, 0, 255).astype(np.uint8)))
    return rgba


def poser(canvas, ombre, p0, p1, w, col, over=(5, 16)):
    (x0, y0), (x1, y1) = p0, p1
    ang = math.degrees(math.atan2(y1 - y0, x1 - x0)) + random.uniform(-1.6, 1.6)
    L = math.hypot(x1 - x0, y1 - y0)
    o0, o1 = random.uniform(*over), random.uniform(*over)
    s = strip(L + o0 + o1, w * random.uniform(.94, 1.06), col)
    r = s.rotate(-ang, expand=True, resample=Image.BICUBIC)
    ux, uy = (x1 - x0) / L, (y1 - y0) / L
    cx = (x0 + x1) / 2 + ux * (o1 - o0) / 2; cy = (y0 + y1) / 2 + uy * (o1 - o0) / 2
    pos = (int(cx - r.width / 2), int(cy - r.height / 2))
    sh = Image.new('RGBA', r.size, (0, 0, 0, 0)); sh.putalpha(r.getchannel('A').point(lambda v: v * .55))
    ombre.alpha_composite(sh, (pos[0] + 2, pos[1] + 3))
    canvas.alpha_composite(r, pos)


LETTRES = {  # largeur (en H), segments (fonction de Wl, H, h)
    'C': (.60, lambda W, H, h: [((h, -4), (h, H + 4)), ((0, h), (W, h)), ((0, H - h), (W, H - h))]),
    'O': (.70, lambda W, H, h: [((h, -4), (h, H + 4)), ((W - h, -4), (W - h, H + 4)), ((0, h), (W, h)), ((0, H - h), (W, H - h))]),
    'M': (.86, lambda W, H, h: [((h, -4), (h, H + 4)), ((W - h, -4), (W - h, H + 4)), ((h, h * .6), (W / 2, H * .6)), ((W - h, h * .6), (W / 2, H * .6))]),
    'P': (.60, lambda W, H, h: [((h, -4), (h, H + 4)), ((0, h), (W, h)), ((0, H * .52), (W, H * .52)), ((W - h, 0), (W - h, H * .56))]),
    'L': (.54, lambda W, H, h: [((h, -4), (h, H + 4)), ((0, H - h), (W, H - h))]),
    'E': (.56, lambda W, H, h: [((h, -4), (h, H + 4)), ((0, h), (W, h)), ((0, H / 2), (W * .84, H / 2)), ((0, H - h), (W, H - h))]),
    'T': (.66, lambda W, H, h: [((0, h), (W, h)), ((W / 2, -2), (W / 2, H + 4))]),
}
BRUNS = [(30, 23, 17), (35, 27, 20), (26, 20, 15), (39, 30, 22), (23, 18, 14)]
ROUGE = (112, 34, 25)


def mot(texte, H, stroke, marge=40, rouge=None):
    larg = sum(LETTRES[c][0] * H for c in texte) + (len(texte) - 1) * .2 * H
    Wc, Hc = int(larg + 2 * marge), int(H + 2 * marge)
    ombre = Image.new('RGBA', (Wc, Hc), (0, 0, 0, 0)); scotch = Image.new('RGBA', (Wc, Hc), (0, 0, 0, 0))
    x = marge
    for i, c in enumerate(texte):
        wl, segs = LETTRES[c]
        Wl = wl * H
        dy = random.uniform(-.04, .04) * H; rot = random.uniform(-.04, .04)
        ss = segs(Wl, H, stroke / 2)
        for k, (a, b) in enumerate(ss):
            def tr(p):
                px, py = p[0] - Wl / 2, p[1] - H / 2
                px, py = px - rot * py, py + rot * px
                return (x + Wl / 2 + px + random.uniform(-3, 3), marge + dy + H / 2 + py + random.uniform(-3, 3))
            col = random.choice(BRUNS)
            if rouge and (i, k) == rouge: col = ROUGE
            poser(scotch, ombre, tr(a), tr(b), stroke, col)
        x += Wl + .2 * H
    ombre = ombre.filter(ImageFilter.GaussianBlur(4))
    ombre.alpha_composite(scotch)
    return ombre


# ---------------------------------------------------------------- mur de journaux
def patchs_frame(n):
    fr = np.array(FRAME, np.float32); lum = fr.mean(2)
    out = []
    while len(out) < n:
        w = random.randint(110, 260); h = int(w * random.uniform(.6, 1.5))
        x = random.randint(160, 1700 - w); y = random.randint(120, 960 - h)
        z = lum[y:y + h, x:x + w]
        if z.mean() < 70 or (z < 60).mean() > .01: continue  # pas de scotch, pas de trou noir
        p = FRAME.crop((x, y, x + w, y + h))
        arr = np.array(p, np.float32); arr *= (150 * random.uniform(.78, 1.12)) / arr.mean()
        out.append(Image.fromarray(np.clip(arr, 0, 255).astype(np.uint8)))
    return out


def dechire(im, amp=4):
    w, h = im.size; m = Image.new('L', (w, h), 0); d = ImageDraw.Draw(m); pts = []
    for x in range(0, w, 6): pts.append((x, random.uniform(0, amp)))
    for y in range(0, h, 6): pts.append((w - random.uniform(0, amp), y))
    for x in range(w, 0, -6): pts.append((x, h - random.uniform(0, amp)))
    for y in range(h, 0, -6): pts.append((random.uniform(0, amp), y))
    d.polygon(pts, fill=255); im = im.convert('RGBA'); im.putalpha(m); return im


def mur(W, H, lum_centre=(.5, .32), n=760):
    random.seed(7)
    c = Image.new('RGBA', (W, H), (48, 34, 21, 255))
    ps = patchs_frame(160)
    for _ in range(n):
        p = random.choice(ps)
        s = random.uniform(.55, 1.25)
        p = p.resize((int(p.width * s), int(p.height * s)))
        if random.random() < .5: p = ImageOps.mirror(p)
        p = dechire(p).rotate(random.uniform(-10, 10), expand=True, resample=Image.BICUBIC)
        x = random.randint(-p.width // 2, W - p.width // 2); y = random.randint(-p.height // 2, H - p.height // 2)
        sh = Image.new('RGBA', p.size, (0, 0, 0, 0)); sh.putalpha(p.getchannel('A').point(lambda v: v * .5))
        c.alpha_composite(sh.filter(ImageFilter.GaussianBlur(5)), (x + 4, y + 6))
        c.alpha_composite(p, (x, y))
    arr = np.array(c.convert('RGB'), np.float32)
    yy, xx = np.mgrid[0:H, 0:W]
    d = np.sqrt(((xx / W - lum_centre[0]) * 1.25) ** 2 + ((yy / H - lum_centre[1]) * 1.0) ** 2)
    light = np.clip(1.15 - d * 1.55, .08, 1.15) ** 1.6
    arr *= light[..., None]
    arr *= np.array([1.0, .95, .84])  # lampe chaude
    # crasse : smear, coulures, empreintes
    sm = np.array(crop_tex(SMEAR, W, H, 1.0), np.float32) / 255
    arr *= (1 - .35 * (1 - sm / max(sm.max(), 1e-3)) * .5)[..., None]
    lk = np.array(crop_tex(LEAK, W, H, 1.0), np.float32) / 255
    arr *= (1 - .3 * lk)[..., None]
    fg = np.array(crop_tex(FING, W, H, 1.0), np.float32) / 255
    arr *= (1 - .18 * fg)[..., None]
    arr += (np.array(grain(W, H, 26, .7), np.float32)[..., None] - 128) * .3
    return Image.fromarray(np.clip(arr, 0, 255).astype(np.uint8))


# ---------------------------------------------------------------- feuille de journal salie
from PIL import ImageFont
FD = '/usr/share/fonts/truetype/dejavu/'
MOTS = ("le la les de des du un une et en à au aux par pour sur dans avec sans sous entre vers chez "
        "nuit soir ville maison porte rue quartier conseil mairie hier demain lundi mardi samedi "
        "habitants marché travaux école théâtre salle place gare pluie froid hiver lampe bougie "
        "nouvelle séance public voisins réunion annonce semaine heures rendez-vous ouverture fermeture "
        "selon depuis encore toujours jamais déjà aussi plus moins très bien après avant pendant").split()


def phrase(n):
    return ' '.join(random.choice(MOTS) for _ in range(n))


def imprime(im, W, H):
    k = 2; big = Image.new('L', (W * k, H * k), 0); d = ImageDraw.Draw(big)
    fb = ImageFont.truetype(FD + 'DejaVuSerifCondensed.ttf', 10 * k)
    ft = ImageFont.truetype(FD + 'DejaVuSerifCondensed-Bold.ttf', 30 * k)
    fs = ImageFont.truetype(FD + 'DejaVuSerifCondensed-Bold.ttf', 15 * k)
    m = 30 * k; cols = 5; g = 14 * k; cw = (W * k - 2 * m - (cols - 1) * g) / cols
    y = 26 * k
    d.text((m, y), phrase(4).upper(), font=ft, fill=60); y += 46 * k
    d.line((m, y, W * k - m, y), fill=170, width=2 * k); y += 10 * k
    for ci in range(cols):
        x = m + ci * (cw + g); yy = y
        while yy < H * k - 20 * k:
            r = random.random()
            if r < .05:
                for _ in range(2):
                    d.text((x, yy), phrase(3), font=fs, fill=150); yy += 18 * k
                yy += 6 * k; continue
            ligne = ''
            while d.textlength(ligne + ' x', font=fb) < cw and len(ligne) < 200:
                ligne += ' ' + random.choice(MOTS)
            if random.random() < .1: ligne = ligne[: len(ligne) // 2]; yy += 0
            d.text((x, yy), ligne.strip(), font=fb, fill=random.randint(150, 205)); yy += 12 * k
            if random.random() < .04: yy += 10 * k
        if ci < cols - 1: d.line((x + cw + g / 2, y, x + cw + g / 2, H * k - 20 * k), fill=110, width=1 * k)
    msk = big.resize((W, H), Image.LANCZOS).filter(ImageFilter.GaussianBlur(.5)).point(lambda v: v * .40)
    encre = Image.new('RGB', (W, H), (38, 33, 27))
    im = im.copy(); im.paste(encre, (0, 0), msk); return im

def feuille(W, H):
    random.seed(11)
    base = crop_tex(PAPER, W, H, .9)
    arr = np.array(base, np.float32)
    arr = arr * .35 + np.array([218, 204, 172]) * .65  # papier journal jauni, clair
    im = Image.fromarray(np.clip(arr, 0, 255).astype(np.uint8))
    im = imprime(im, W, H)
    im = im.filter(ImageFilter.GaussianBlur(.7))
    arr = np.array(im, np.float32)
    yy, xx = np.mgrid[0:H, 0:W]
    # bords brûlés / jaunis
    e = np.minimum.reduce([xx, yy, W - xx, H - yy]).astype(np.float32)
    arr *= (1 - .32 * np.exp(-e / 60))[..., None]
    arr *= (1 - .16 * np.exp(-e / 14))[..., None] * np.array([1, .97, .9])
    # pli vertical + pli horizontal
    for k, (cx, axis) in enumerate(((W * random.uniform(.45, .55), 'x'), (H * random.uniform(.42, .58), 'y'))):
        dd = (xx - cx) if axis == 'x' else (yy - cx)
        arr *= (1 - .10 * np.exp(-dd ** 2 / 30) + .05 * np.exp(-(dd - 4) ** 2 / 40))[..., None]
    # crasse
    sm = np.array(crop_tex(SMEAR, W, H, 1.0), np.float32) / 255
    arr *= (1 - .3 * sm)[..., None]
    lk = np.array(crop_tex(LEAK, W, H, .8), np.float32) / 255
    arr *= (1 - .22 * lk * (yy / H < .6))[..., None] * np.array([1, .96, .88]) ** lk[..., None]
    fg = np.array(crop_tex(FING, W, H, 1.0), np.float32) / 255
    arr *= (1 - .2 * fg * (np.random.rand() + .3))[..., None]
    # rond de café + taches de doigts noirs
    for _ in range(2):
        cx, cy, r = random.uniform(.15, .85) * W, random.uniform(.15, .85) * H, random.uniform(60, 110)
        rr = np.sqrt((xx - cx) ** 2 + (yy - cy) ** 2)
        th = np.arctan2(yy - cy, xx - cx); r2 = r * (1 + .06 * np.sin(3 * th + random.uniform(0, 6)) + .03 * np.sin(7 * th))
        part = np.clip(np.sin(th + random.uniform(0, 6)) + .6, 0, 1)
        ring = np.exp(-(rr - r2) ** 2 / 14) * .2 * part + (rr < r2) * .035
        arr *= (1 - ring[..., None] * np.array([.6, .8, 1.1]))
    arr += (np.array(grain(W, H, 24, .5), np.float32)[..., None] - 128) * .28
    return Image.fromarray(np.clip(arr, 0, 255).astype(np.uint8))


def bandeau(out):
    random.seed(5)
    p = feuille(1000, 330)
    arr = np.array(p, np.float32) * .93; p = Image.fromarray(np.clip(arr, 0, 255).astype(np.uint8))
    p = dechire(p, amp=16)
    c = Image.new('RGBA', (1060, 390), (0, 0, 0, 0))
    sh = Image.new('RGBA', p.size, (0, 0, 0, 0)); sh.putalpha(p.getchannel('A').point(lambda v: v * .6))
    c.alpha_composite(sh.filter(ImageFilter.GaussianBlur(8)), (36, 40)); c.alpha_composite(p, (30, 30))
    random.seed(21)
    w = mot('COMPLET', 190, 42, marge=30, rouge=(5, 3))
    w = w.resize((int(w.width * 940 / w.width), int(w.height * 940 / w.width)), Image.LANCZOS)
    c.alpha_composite(w, ((c.width - w.width) // 2, (c.height - w.height) // 2 + 4))
    c.save(out, quality=84, method=6)


if __name__ == '__main__':
    m = mot('COMPLET', 230, 50, rouge=(5, 3))
    m.save(OUT + '/complet-scotch.png'); m.save(OUT + '/complet-scotch.webp', quality=86, method=6)
    random.seed(77)
    sc = Image.new('RGBA', (420, 120), (0, 0, 0, 0)); o = Image.new('RGBA', (420, 120), (0, 0, 0, 0))
    poser(sc, o, (40, 60), (380, 60), 46, (40, 30, 22), over=(0, 0))
    o = o.filter(ImageFilter.GaussianBlur(3)); o.alpha_composite(sc); o.save(OUT + '/scotch.webp', quality=86, method=6)
    mur(1600, 1000).save(OUT + '/mur-journaux.jpg', quality=78, optimize=True, progressive=True)
    feuille(1200, 1200).save(OUT + '/journal-sale.jpg', quality=80, optimize=True, progressive=True)
    bandeau(OUT + "/complet-bandeau.webp")
    print("ok")

