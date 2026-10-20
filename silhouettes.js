// Big Drama · silhouettes.js · v5 · 20.10.2026 · auteur : Claude (chef de projet)
// À partir de la v5, une seule variante : LA RUE (Paris, 1918). Le manoir est abandonné.
// Dessin de référence de chaque lieu dans le cadre 1600 × 900 (y vers le bas).
//
// Format : SILHOUETTES.rue = { decor: [Forme], lieux: { [id]: [Forme] } }
//   Forme : { d: "<path SVG>", fill: "noir" | "jaune" | "lumiere" | "blanc" | "orange", plan?: n, anim?: "flotte" | "tourne" (centre) | "scintille" | "flamme" }
// COUPES.rue[id] = { contour, pieces: [{ id, boite, mobilier }] } : le blueprint au clic.
// Règle de lecture : sur le ciel, silhouette noire. Dans la masse noire, découpe jaune en réserve.

export const COULEURS = {
  jaune: "#F2D10F", lumiere: "#FFE34D", noir: "#0A0A0A", blanc: "#F5F3EE",
  orange: "#F37021",   // les boîtes de Scatolina, seule exception
  plan: "#1F4E8C", trait: "#EAF2FF"
};
export const POLICES = {
  enseigne: '"Bodoni Moda", Didot, "Bodoni 72", Georgia, serif',
  machine: '"Special Elite", "Courier New", Courier, monospace'
};

/* ───────── outils de dessin ───────── */
const f = n => Math.round(n * 10) / 10;
const R = (x, y, w, h) => `M${f(x)} ${f(y)}h${f(w)}v${f(h)}h${f(-w)}Z`;
const P = pts => "M" + pts.map(p => f(p[0]) + " " + f(p[1])).join("L") + "Z";
const arche = (x, y, w, h) => `M${f(x)} ${f(y + h)}V${f(y + w / 2)}A${f(w / 2)} ${f(w / 2)} 0 0 1 ${f(x + w)} ${f(y + w / 2)}V${f(y + h)}Z`;
const ogive = (x, y, w, h) => { const ys = y + 0.866 * w; return `M${f(x)} ${f(y + h)}V${f(ys)}A${f(w)} ${f(w)} 0 0 1 ${f(x + w / 2)} ${f(y)}A${f(w)} ${f(w)} 0 0 1 ${f(x + w)} ${f(ys)}V${f(y + h)}Z`; };
const C = (cx, cy, r) => `M${f(cx - r)} ${f(cy)}a${f(r)} ${f(r)} 0 1 0 ${f(2 * r)} 0a${f(r)} ${f(r)} 0 1 0 ${f(-2 * r)} 0Z`;
const E = (cx, cy, rx, ry) => `M${f(cx - rx)} ${f(cy)}a${f(rx)} ${f(ry)} 0 1 0 ${f(2 * rx)} 0a${f(rx)} ${f(ry)} 0 1 0 ${f(-2 * rx)} 0Z`;
const anneau = (cx, cy, r1, r2) => `M${f(cx - r1)} ${f(cy)}a${f(r1)} ${f(r1)} 0 1 0 ${f(2 * r1)} 0a${f(r1)} ${f(r1)} 0 1 0 ${f(-2 * r1)} 0Z` + `M${f(cx - r2)} ${f(cy)}a${f(r2)} ${f(r2)} 0 1 1 ${f(2 * r2)} 0a${f(r2)} ${f(r2)} 0 1 1 ${f(-2 * r2)} 0Z`; // trou par sens inverse
const etoile = (cx, cy, r1, r2, rot = -Math.PI / 2, n = 5) => {
  const pts = [];
  for (let i = 0; i < n * 2; i++) { const r = i % 2 ? r2 : r1, a = rot + i * Math.PI / n; pts.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]); }
  return P(pts);
};
const tourner = (pts, cx, cy, a) => pts.map(([x, y]) => [cx + (x - cx) * Math.cos(a) - (y - cy) * Math.sin(a), cy + (x - cx) * Math.sin(a) + (y - cy) * Math.cos(a)]);
const croix = (x, y, h, e = 5, pente = 0) => P(tourner([[-e / 2, 0], [-e / 2, -h * 0.66], [-h * 0.3, -h * 0.66], [-h * 0.3, -h * 0.66 - e], [-e / 2, -h * 0.66 - e], [-e / 2, -h], [e / 2, -h], [e / 2, -h * 0.66 - e], [h * 0.3, -h * 0.66 - e], [h * 0.3, -h * 0.66], [e / 2, -h * 0.66], [e / 2, 0]].map(([a, b]) => [x + a, y + b]), x, y, pente));
const stele = (x, y, w, h, pente = 0) => { // pierre tombale à tête ronde, penchée
  const pts = [[x, y], [x, y - h + w / 2]]; for (let i = 0; i <= 8; i++) { const a = Math.PI + i * Math.PI / 8; pts.push([x + w / 2 + Math.cos(a) * w / 2, y - h + w / 2 + Math.sin(a) * w / 2]); } pts.push([x + w, y]);
  return P(tourner(pts, x + w / 2, y, pente));
};
// ruban effilé le long d'une courbe de Bézier quadratique (troncs, palmes, tiges)
function ruban(p0, p1, p2, w0, w1, n = 14) {
  const pts = [];
  for (let i = 0; i <= n; i++) { const t = i / n, u = 1 - t; pts.push([u * u * p0[0] + 2 * u * t * p1[0] + t * t * p2[0], u * u * p0[1] + 2 * u * t * p1[1] + t * t * p2[1]]); }
  return epaissir(pts, i => w0 + (w1 - w0) * (i / n));
}
function epaissir(pts, largeur) {
  const g = [], d = [];
  pts.forEach((p, i) => {
    const a = pts[Math.max(0, i - 1)], b = pts[Math.min(pts.length - 1, i + 1)];
    let nx = -(b[1] - a[1]), ny = b[0] - a[0]; const L = Math.hypot(nx, ny) || 1; nx /= L; ny /= L;
    const w = largeur(i) / 2;
    g.push([p[0] + nx * w, p[1] + ny * w]); d.unshift([p[0] - nx * w, p[1] - ny * w]);
  });
  return P(g.concat(d));
}
// ligne brisée effilée, angles vifs (le chemin en zigzag de l'affiche)
function zigzag(pts, w0, w1) {
  const n = pts.length - 1, w = i => (w0 + (w1 - w0) * i / n) / 2, g = [], d = [];
  for (let i = 0; i <= n; i++) {
    const a = pts[Math.max(0, i - 1)], p = pts[i], b = pts[Math.min(n, i + 1)];
    const u1 = norm([p[0] - a[0], p[1] - a[1]]), u2 = norm([b[0] - p[0], b[1] - p[1]]);
    const n1 = i === 0 ? [-u2[1], u2[0]] : [-u1[1], u1[0]], n2 = i === n ? n1 : [-u2[1], u2[0]];
    let m = norm([n1[0] + n2[0], n1[1] + n2[1]]); const k = Math.min(4, 1 / Math.max(0.25, m[0] * n1[0] + m[1] * n1[1]));
    g.push([p[0] + m[0] * w(i) * k, p[1] + m[1] * w(i) * k]); d.unshift([p[0] - m[0] * w(i) * k, p[1] - m[1] * w(i) * k]);
  }
  return P(g.concat(d));
}
const norm = ([x, y]) => { const L = Math.hypot(x, y) || 1; return [x / L, y / L]; };
// spirale effilée (branches à la Burton, volutes art nouveau)
function spirale(cx, cy, r0, tours, a0, w0, w1, sens = 1, n = 40) {
  const pts = [];
  for (let i = 0; i <= n; i++) { const t = i / n, a = a0 + sens * t * tours * 2 * Math.PI, r = r0 * (1 - t * 0.85); pts.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]); }
  return epaissir(pts, i => w0 + (w1 - w0) * i / n);
}
const fenetres = (x0, y0, cols, rangs, w, h, gx, gy, forme = arche) => { let d = ""; for (let j = 0; j < rangs; j++) for (let i = 0; i < cols; i++) d += forme(x0 + i * (w + gx), y0 + j * (h + gy), w, h); return d; };
const carre = (x, y, w, h) => R(x, y, w, h);
const volets = (x, y, w, h) => { let d = ""; for (let k = 0; k < 4; k++) d += R(x + 3, y + 6 + k * (h - 8) / 4, w - 6, 2.2); return d; };
function phenix(cx, cy, s) {
  return P([[cx, cy + s * 0.9], [cx - s * 0.18, cy + s * 0.2], [cx - s * 1.1, cy - s * 0.55], [cx - s * 0.62, cy - s * 0.08], [cx - s * 1.05, cy - s * 0.95], [cx - s * 0.4, cy - s * 0.3], [cx - s * 0.55, cy - s * 1.05], [cx - s * 0.12, cy - s * 0.45], [cx, cy - s * 0.85], [cx + s * 0.12, cy - s * 0.45], [cx + s * 0.55, cy - s * 1.05], [cx + s * 0.4, cy - s * 0.3], [cx + s * 1.05, cy - s * 0.95], [cx + s * 0.62, cy - s * 0.08], [cx + s * 1.1, cy - s * 0.55], [cx + s * 0.18, cy + s * 0.2]]);
}
const N = d => ({ d, fill: "noir" }), J = d => ({ d, fill: "jaune" }), L = d => ({ d, fill: "lumiere" }), B = d => ({ d, fill: "blanc" }), O = d => ({ d, fill: "orange" });
const ondes = (x0, y0, x1, y1, pas, graine, trous = []) => {
  let s = graine, d = "";
  const r = () => (s = (s * 16807) % 2147483647) / 2147483647;
  for (let y = y0 + 6; y < y1; y += pas) { let x = x0 + r() * 30; while (x < x1 - 10) { const l = 10 + r() * 34; const fin = Math.min(x + l, x1 - 4); if (!trous.some(t => x < t[2] && fin > t[0] && y > t[1] && y < t[3])) d += R(x, y, fin - x, 2); x += l + 10 + r() * 30; } }
  return d;
};

/* ───────── SIGNATURES : un objet par création, lisible en silhouette ───────── */

// Close · le Phénix, maison close, Paris 1918, Mucha moderne : médaillon-auréole et phénix, volutes coup de fouet, lampadaires à la Guimard
function aureoleMucha(cx, cy, r) {
  let perles = ""; for (let i = 0; i < 16; i++) { const a = i * Math.PI / 8; perles += C(cx + Math.cos(a) * r * 1.16, cy + Math.sin(a) * r * 1.16, r * 0.07); }
  return {
    noir: C(cx, cy, r * 1.3) + spirale(cx - r * 1.55, cy + r * 0.55, r * 0.75, 1.1, -0.2, r * 0.2, r * 0.05, -1) + spirale(cx + r * 1.55, cy + r * 0.55, r * 0.75, 1.1, Math.PI + 0.2, r * 0.2, r * 0.05, 1),
    lumiere: anneau(cx, cy, r, r * 0.86) + perles + phenix(cx, cy + r * 0.05, r * 0.62)
  };
}
function lampadaireGuimard(x, y, h, sens = 1) { // tige en lumière (ferronnerie qui brille dans la masse noire), deux globes tombants
  const haut = [x + sens * h * 0.08, y - h];
  return ruban([x, y], [x - sens * h * 0.12, y - h * 0.6], haut, h * 0.08, h * 0.035)
    + ruban(haut, [haut[0] + sens * h * 0.28, haut[1] - h * 0.08], [haut[0] + sens * h * 0.3, haut[1] + h * 0.14], h * 0.035, h * 0.02)
    + ruban(haut, [haut[0] - sens * h * 0.2, haut[1] - h * 0.1], [haut[0] - sens * h * 0.24, haut[1] + h * 0.1], h * 0.035, h * 0.02)
    + E(haut[0] + sens * h * 0.3, haut[1] + h * 0.2, h * 0.055, h * 0.08) + E(haut[0] - sens * h * 0.24, haut[1] + h * 0.16, h * 0.05, h * 0.075);
}
// Parfum de Famille · roman noir : le revolver dans la serre, l'ampoule nue, le château d'eau new-yorkais
function revolver(x, y, s) { // canon vers la gauche, x, y = pointe du canon
  const k = v => v * s;
  return P([[x, y], [x + k(1.0), y], [x + k(1.0), y - k(0.06)], [x + k(1.08), y - k(0.06)], [x + k(1.08), y], [x + k(1.55), y], [x + k(1.62), y - k(0.12)], [x + k(1.72), y - k(0.1)], [x + k(1.74), y + k(0.05)], [x + k(1.66), y + k(0.14)], [x + k(1.9), y + k(0.7)], [x + k(1.62), y + k(0.78)], [x + k(1.44), y + k(0.3)], [x + k(1.3), y + k(0.3)], [x + k(1.26), y + k(0.2)], [x + k(1.0), y + k(0.2)], [x + k(1.0), y + k(0.16)], [x, y + k(0.16)]])
    + R(x + k(1.04), y - k(0.02), k(0.42), k(0.3))
    + ruban([x + k(1.3), y + k(0.28)], [x + k(1.24), y + k(0.5)], [x + k(1.44), y + k(0.48)], k(0.04), k(0.04), 8);
}
const reserveRevolver = (x, y, s) => R(x + s * 1.06, y + s * 0.03, s * 0.38, s * 0.05) + R(x + s * 1.06, y + s * 0.13, s * 0.38, s * 0.05); // cannelures du barillet
function chateauDeau(x, y, s) { // x, y = pied gauche
  return R(x, y - s * 0.55, s * 0.08, s * 0.55) + R(x + s * 0.92, y - s * 0.55, s * 0.08, s * 0.55) + P([[x + s * 0.04, y - s * 0.05], [x + s * 0.96, y - s * 0.5], [x + s * 0.96, y - s * 0.42], [x + s * 0.04, y + s * 0.03]])
    + R(x - s * 0.06, y - s * 1.15, s * 1.12, s * 0.6) + P([[x - s * 0.12, y - s * 1.15], [x + s * 0.5, y - s * 1.5], [x + s * 1.12, y - s * 1.15]]);
}
// Scatolina · Venise, douceur : barque à proue recourbée, trois boîtes orange, île au campanile et cyprès
function barque(x, y, l) {
  return `M${f(x)} ${f(y)}Q${f(x + l * 0.5)} ${f(y + l * 0.22)} ${f(x + l)} ${f(y)}L${f(x + l * 1.06)} ${f(y - l * 0.16)}L${f(x + l * 1.1)} ${f(y - l * 0.14)}L${f(x + l * 0.98)} ${f(y + l * 0.06)}Q${f(x + l * 0.5)} ${f(y + l * 0.3)} ${f(x + l * 0.02)} ${f(y + l * 0.06)}L${f(x - l * 0.08)} ${f(y - l * 0.1)}Z`;
}
const cypres = (x, y, h) => `M${f(x)} ${f(y - h)}Q${f(x + h * 0.14)} ${f(y - h * 0.5)} ${f(x + h * 0.08)} ${f(y)}L${f(x - h * 0.08)} ${f(y)}Q${f(x - h * 0.14)} ${f(y - h * 0.5)} ${f(x)} ${f(y - h)}Z`;
// Better Together · tiki bar (manoir), brasserie à l'ancienne (rue)
function paillote(x, y, w, h) { // x, y = pied gauche
  let franges = ""; const n = Math.round(w / 9);
  for (let i = 0; i < n; i++) franges += P([[x - w * 0.12 + i * (w * 1.24 / n), y - h * 0.62], [x - w * 0.12 + (i + 0.5) * (w * 1.24 / n), y - h * 0.5 + (i % 2) * 4], [x - w * 0.12 + (i + 1) * (w * 1.24 / n), y - h * 0.62]]);
  return P([[x - w * 0.14, y - h * 0.6], [x + w * 0.5, y - h], [x + w * 1.14, y - h * 0.6]]) + franges + R(x, y - h * 0.62, w * 0.06, h * 0.62) + R(x + w * 0.94, y - h * 0.62, w * 0.06, h * 0.62) + R(x + w * 0.08, y - h * 0.3, w * 0.84, h * 0.3);
}
function tiki(x, y, h) { // totem : x, y = pied centre
  return { noir: P([[x - h * 0.16, y], [x - h * 0.16, y - h * 0.82], [x - h * 0.22, y - h * 0.86], [x - h * 0.12, y - h], [x + h * 0.12, y - h], [x + h * 0.22, y - h * 0.86], [x + h * 0.16, y - h * 0.82], [x + h * 0.16, y]]),
    lumiere: E(x - h * 0.07, y - h * 0.74, h * 0.045, h * 0.035) + E(x + h * 0.07, y - h * 0.74, h * 0.045, h * 0.035) + R(x - h * 0.09, y - h * 0.56, h * 0.18, h * 0.05) + R(x - h * 0.03, y - h * 0.68, h * 0.06, h * 0.08) + R(x - h * 0.1, y - h * 0.36, h * 0.2, h * 0.025) };
}
const torche = (x, y, h) => ({ noir: R(x - 1.2, y - h, 2.4, h) + P([[x - 3, y - h], [x + 3, y - h], [x + 2, y - h - 6], [x - 2, y - h - 6]]), flamme: `M${f(x)} ${f(y - h - 20)}Q${f(x + 6)} ${f(y - h - 10)} ${f(x + 3)} ${f(y - h - 5)}L${f(x - 3)} ${f(y - h - 5)}Q${f(x - 6)} ${f(y - h - 10)} ${f(x)} ${f(y - h - 20)}Z` });
const chaiseBistrot = (x, y, s, sens = 1) => R(x, y - s * 0.5, s * 0.5, s * 0.06) + R(x + (sens > 0 ? 0 : s * 0.44), y - s, s * 0.06, s) + R(x + (sens > 0 ? s * 0.44 : 0), y - s * 0.5, s * 0.06, s * 0.5) + ruban([x + (sens > 0 ? 0 : s * 0.5), y - s], [x + s * 0.25, y - s * 1.12], [x + (sens > 0 ? s * 0.5 : 0), y - s * 0.95], s * 0.05, s * 0.05, 8);
const gueridon = (x, y, s) => E(x, y - s, s * 0.32, s * 0.05) + R(x - s * 0.03, y - s, s * 0.06, s) + R(x - s * 0.18, y - s * 0.04, s * 0.36, s * 0.04);
// Un Conte de Noëlle · crèche lisible pour les enfants, au second degré : l'âne au chapeau de fête, l'étoile filante
function ane(x, y, s, sens = 1) { // tête et cou d'âne qui passe la tête, x, y = base du cou
  const k = (a, b) => [x + sens * a * s, y - b * s];
  return P([k(0, 0), k(0.05, 0.55), k(-0.05, 0.75), k(-0.42, 0.62), k(-0.5, 0.5), k(-0.42, 0.42), k(-0.08, 0.48), k(0.22, 0)]) + P([k(0.0, 0.72), k(-0.05, 1.12), k(0.06, 0.78)]) + P([k(0.06, 0.74), k(0.16, 1.1), k(0.14, 0.72)]);
}
const chapeauFete = (x, y, s) => P([[x - s * 0.22, y], [x, y - s * 0.6], [x + s * 0.22, y]]);
// Norma · cimetière gothique, baroque : mausolée à coupole, ange, grille à volutes, arbre en spirales, corbeaux
function ange(cx, y, h) { // debout sur un socle, ailes ouvertes
  return P([[cx - h * 0.14, y], [cx - h * 0.07, y - h * 0.62], [cx + h * 0.07, y - h * 0.62], [cx + h * 0.14, y]]) + C(cx, y - h * 0.72, h * 0.09)
    + `M${f(cx - h * 0.05)} ${f(y - h * 0.58)}Q${f(cx - h * 0.45)} ${f(y - h * 1.05)} ${f(cx - h * 0.6)} ${f(y - h * 0.95)}Q${f(cx - h * 0.42)} ${f(y - h * 0.7)} ${f(cx - h * 0.5)} ${f(y - h * 0.45)}Q${f(cx - h * 0.25)} ${f(y - h * 0.5)} ${f(cx - h * 0.05)} ${f(y - h * 0.38)}Z`
    + `M${f(cx + h * 0.05)} ${f(y - h * 0.58)}Q${f(cx + h * 0.45)} ${f(y - h * 1.05)} ${f(cx + h * 0.6)} ${f(y - h * 0.95)}Q${f(cx + h * 0.42)} ${f(y - h * 0.7)} ${f(cx + h * 0.5)} ${f(y - h * 0.45)}Q${f(cx + h * 0.25)} ${f(y - h * 0.5)} ${f(cx + h * 0.05)} ${f(y - h * 0.38)}Z`;
}
function grille(x0, x1, y, h, pas = 9) {
  let d = R(x0, y - h * 0.86, x1 - x0, 2.4) + R(x0, y - h * 0.2, x1 - x0, 2.4);
  for (let x = x0; x <= x1; x += pas) d += R(x - 1, y - h, 2, h) + P([[x - 3, y - h], [x, y - h - 7], [x + 3, y - h]]);
  return d;
}
const corbeau = (x, y, s, sens = 1) => P([[x, y], [x + sens * s * 0.3, y - s * 0.35], [x + sens * s * 0.55, y - s * 0.4], [x + sens * s * 0.7, y - s * 0.32], [x + sens * s * 0.52, y - s * 0.25], [x + sens * s * 0.48, y + s * 0.05], [x + sens * s * 0.2, y + s * 0.15], [x - sens * s * 0.25, y + s * 0.12]]);
// Viva Barbessia · palace à étages en pièce montée, tordu, drapeau, funiculaire
function funiculaire(x0, y0, x1, y1, t) { // rails en réserve sur la falaise, cabine en lumière à la position t
  const dx = x1 - x0, dy = y1 - y0, L = Math.hypot(dx, dy), u = [dx / L, dy / L], nn = [-u[1], u[0]];
  const rail = o => P([[x0 + nn[0] * o, y0 + nn[1] * o], [x1 + nn[0] * o, y1 + nn[1] * o], [x1 + nn[0] * (o + 2), y1 + nn[1] * (o + 2)], [x0 + nn[0] * (o + 2), y0 + nn[1] * (o + 2)]]);
  const cx = x0 + dx * t, cy = y0 + dy * t, w = 42, h = 30;
  const cabine = P([[cx, cy], [cx + u[0] * w, cy + u[1] * w], [cx + u[0] * w, cy + u[1] * w - h], [cx + u[0] * w * 0.15, cy - h - 8], [cx, cy - h]]);
  return { rails: rail(-4) + rail(3), cabine, vitres: R(cx + u[0] * 8, cy + u[1] * 8 - h + 6, 8, 10) + R(cx + u[0] * 24, cy + u[1] * 24 - h + 8, 8, 10) };
}
// Eros en Russie · le croissant de lune et le violon tsigane posé dedans
const croissant = (cx, cy, r, k) => `M${f(cx)} ${f(cy - r)}A${f(r)} ${f(r)} 0 0 1 ${f(cx)} ${f(cy + r)}A${f(r * k)} ${f(r)} 0 0 0 ${f(cx)} ${f(cy - r)}Z`;
function violon(cx, cy, l, a) {
  const s = l / 100, k = (x, y) => [x * s, y * s];
  const corps = [];
  for (let i = 0; i <= 36; i++) { const t = i / 36 * 2 * Math.PI, y = Math.sin(t) * 30, w = (y < 0 ? 15 : 19) - 5 * Math.exp(-((y - 2) ** 2) / 30); corps.push([Math.cos(t) * w, y]); }
  const tr = pts => tourner(pts.map(([x, y]) => [cx + x * s, cy + y * s]), cx, cy, a);
  return { noir: P(tr(corps)) + P(tr([[-2.5, -30], [2.5, -30], [2.5, -62], [-2.5, -62]])) + P(tr([[-4, -62], [4, -62], [5, -70], [0, -75], [-4, -70]])) + P(tr([[-6, -66], [6, -66], [6, -64], [-6, -64]])) + P(tr([[-8, 26], [8, 26], [6, 30], [-6, 30]])),
    reserve: P(tr([[-8, 2], [-7, -6], [-6, -6], [-7, 2]])) + P(tr([[7, 2], [6, -6], [7, -6], [8, 2]])) + P(tr([[-0.6, -30], [0.6, -30], [0.6, 24], [-0.6, 24]])) };
}
const archet = (x0, y0, x1, y1) => ruban([x0, y0], [(x0 + x1) / 2 + 4, (y0 + y1) / 2 - 4], [x1, y1], 2.2, 1.2, 10);
// La Prophétie del Coco · cocotier des Caraïbes : tronc annelé et courbé, palmes à folioles, une noix de coco qui luit (la prophétie)
function cocotier(base, ctrl, cime, h, palmes) {
  const tronc = ruban(base, ctrl, cime, h * 0.075, h * 0.04, 22);
  let anneaux = ""; for (let i = 1; i < 14; i++) { const t = i / 14, u = 1 - t, x = u * u * base[0] + 2 * u * t * ctrl[0] + t * t * cime[0], y = u * u * base[1] + 2 * u * t * ctrl[1] + t * t * cime[1], w = h * (0.075 - 0.035 * t); anneaux += R(x - w * 0.42, y - 0.7, w * 0.84, 1.4); }
  let feuilles = "";
  for (const [dx, dy, courbe] of palmes) {
    const fin = [cime[0] + dx, cime[1] + dy], mil = [cime[0] + dx * 0.5, cime[1] + dy * 0.5 - courbe];
    feuilles += ruban(cime, mil, fin, h * 0.03, 1, 12);
    for (let i = 2; i <= 11; i++) { // folioles qui pendent
      const t = i / 12, u = 1 - t, x = u * u * cime[0] + 2 * u * t * mil[0] + t * t * fin[0], y = u * u * cime[1] + 2 * u * t * mil[1] + t * t * fin[1];
      const lg = h * 0.11 * Math.sin(Math.PI * t) + 3, sx = Math.sign(dx) || 1;
      feuilles += P([[x - sx * 1.5, y - 1], [x + sx * lg * 0.35, y + lg], [x + sx * 3, y + 1]]) + P([[x + sx * 1.5, y - 1], [x - sx * lg * 0.15, y + lg * 0.9], [x - sx * 1, y + 1]]);
    }
  }
  return { tronc, anneaux, feuilles };
}
// Burning Bar · usine de briques du Nord : toit en sheds, grande cheminée baguée, fenêtres d'atelier, la flamme au sommet
function usine(x0, x1, y, h, chem) { // chem = [x, sommet, largeur]
  const w = x1 - x0, n = 4, pas = w / n;
  let sheds = ""; for (let i = 0; i < n; i++) sheds += P([[x0 + i * pas, y - h], [x0 + i * pas, y - h - pas * 0.55], [x0 + (i + 1) * pas, y - h]]);
  const [cx, top, cw] = chem;
  const cheminee = P([[cx - cw * 0.7, y - h], [cx - cw * 0.5, top], [cx + cw * 0.5, top], [cx + cw * 0.7, y - h]]) + R(cx - cw * 0.62, top - 6, cw * 1.24, 6);
  let briques = ""; for (let yy = top + 14; yy < y - h - 6; yy += 26) briques += R(cx - cw * 0.5, yy, cw, 1.6);
  let ateliers = ""; for (let i = 0; i < n; i++) ateliers += arche(x0 + i * pas + pas * 0.22, y - h * 0.82, pas * 0.56, h * 0.55);
  let meneaux = ""; for (let i = 0; i < n; i++) { const xa = x0 + i * pas + pas * 0.22, wa = pas * 0.56; meneaux += R(xa + wa / 2 - 0.8, y - h * 0.82, 1.6, h * 0.55) + R(xa, y - h * 0.5, wa, 1.6); }
  let briquesMur = ""; for (let yy = y - h + 6; yy < y - 4; yy += 9) for (let xx = x0 + ((yy / 9) % 2) * 6; xx < x1 - 8; xx += 22) briquesMur += R(xx, yy, 12, 1.2);
  return { masse: R(x0, y - h, w, h) + sheds + cheminee, ateliers, meneaux, briques, briquesMur, flamme: `M${f(cx)} ${f(top - 34)}Q${f(cx + cw * 0.9)} ${f(top - 16)} ${f(cx + cw * 0.4)} ${f(top - 6)}L${f(cx - cw * 0.4)} ${f(top - 6)}Q${f(cx - cw * 0.9)} ${f(top - 18)} ${f(cx - cw * 0.1)} ${f(top - 26)}Q${f(cx - cw * 0.05)} ${f(top - 16)} ${f(cx)} ${f(top - 34)}Z` };
}


/* ───────── v5 · nouveaux motifs ───────── */
const hasard = graine => { let s = graine; return () => (s = (s * 16807) % 2147483647) / 2147483647; };
const quad = (cx, cy, w, h, a = 0, sk = 0) => P(tourner([[cx - w / 2 + sk, cy - h / 2], [cx + w / 2 + sk, cy - h / 2], [cx + w / 2 - sk, cy + h / 2], [cx - w / 2 - sk, cy + h / 2]], cx, cy, a));
const coeur = (cx, cy, s) => `M${f(cx)} ${f(cy + s * 0.6)}C${f(cx - s * 1.2)} ${f(cy - s * 0.1)} ${f(cx - s * 0.5)} ${f(cy - s * 0.95)} ${f(cx)} ${f(cy - s * 0.3)}C${f(cx + s * 0.5)} ${f(cy - s * 0.95)} ${f(cx + s * 1.2)} ${f(cy - s * 0.1)} ${f(cx)} ${f(cy + s * 0.6)}Z`;

/* ───────── v5.1 · personnages aux fenêtres ─────────
   Chaque figure tient dans une fenêtre (x, y, w, h), posée sur l'appui. Ombre noire sur la vitre éclairée.
   noir = la silhouette, lum = les découpes lumineuses (yeux, monocle, perles). */
const buste = (cx, b, w, h) => P([[cx - w * 0.36, b], [cx - w * 0.3, b - h * 0.24], [cx - w * 0.12, b - h * 0.34], [cx + w * 0.12, b - h * 0.34], [cx + w * 0.3, b - h * 0.24], [cx + w * 0.36, b]]);
const FIG = {
  // Viva Barbessia · une galerie de personnages bizarres
  hautDeForme: (x, y, w, h) => { const cx = x + w * 0.5, b = y + h; return { noir: buste(cx, b, w, h) + C(cx, b - h * 0.46, w * 0.15) + R(cx - w * 0.15, b - h * 0.86, w * 0.3, h * 0.28) + R(cx - w * 0.24, b - h * 0.6, w * 0.48, h * 0.04), lum: "" }; },
  couronne: (x, y, w, h) => { const cx = x + w * 0.5, b = y + h; return { noir: buste(cx, b, w, h) + C(cx, b - h * 0.47, w * 0.16) + P([[cx - w * 0.18, b - h * 0.6], [cx - w * 0.2, b - h * 0.78], [cx - w * 0.08, b - h * 0.68], [cx, b - h * 0.84], [cx + w * 0.08, b - h * 0.68], [cx + w * 0.2, b - h * 0.78], [cx + w * 0.18, b - h * 0.6]]), lum: C(cx, b - h * 0.71, w * 0.03) }; },
  chouette: (x, y, w, h) => { const cx = x + w * 0.5, b = y + h * 0.96; return { noir: E(cx, b - h * 0.3, w * 0.3, h * 0.3) + P([[cx - w * 0.28, b - h * 0.48], [cx - w * 0.3, b - h * 0.72], [cx - w * 0.1, b - h * 0.56], [cx + w * 0.1, b - h * 0.56], [cx + w * 0.3, b - h * 0.72], [cx + w * 0.28, b - h * 0.48]]) + R(x + w * 0.08, b, w * 0.84, h * 0.04), lum: C(cx - w * 0.12, b - h * 0.44, w * 0.08) + C(cx + w * 0.12, b - h * 0.44, w * 0.08) }; },
  moustache: (x, y, w, h) => { const cx = x + w * 0.5, b = y + h; return { noir: buste(cx, b, w, h) + C(cx, b - h * 0.48, w * 0.17) + spirale(cx - w * 0.2, b - h * 0.42, w * 0.12, 1, 0, 2, 0.6, -1, 12) + spirale(cx + w * 0.2, b - h * 0.42, w * 0.12, 1, Math.PI, 2, 0.6, 1, 12) + R(cx - w * 0.2, b - h * 0.68, w * 0.4, h * 0.05), lum: anneau(cx + w * 0.06, b - h * 0.52, w * 0.06, w * 0.035) }; },
  longCou: (x, y, w, h) => { const cx = x + w * 0.5, b = y + h; return { noir: buste(cx, b, w * 0.9, h * 0.8) + R(cx - w * 0.05, b - h * 0.7, w * 0.1, h * 0.44) + E(cx, b - h * 0.76, w * 0.1, h * 0.08) + C(cx, b - h * 0.9, w * 0.09), lum: R(cx - w * 0.06, b - h * 0.42, w * 0.12, h * 0.015) + R(cx - w * 0.06, b - h * 0.48, w * 0.12, h * 0.015) + R(cx - w * 0.06, b - h * 0.54, w * 0.12, h * 0.015) }; },
  cage: (x, y, w, h) => { const cx = x + w * 0.5, b = y + h * 0.94; let d = R(cx - w * 0.3, b, w * 0.6, h * 0.04) + R(cx - 0.6, b - h * 0.9, 1.2, h * 0.16); for (let k = -2; k <= 2; k++) d += R(cx + k * w * 0.13 - 0.5, b - h * 0.62 + Math.abs(k) * h * 0.05, 1, h * 0.62 - Math.abs(k) * h * 0.05); d += anneau(cx, b - h * 0.62, w * 0.3, w * 0.27).replace(/Z/g, "Z"); return { noir: d + E(cx, b - h * 0.24, w * 0.1, h * 0.07) + C(cx + w * 0.08, b - h * 0.32, w * 0.05), lum: "" }; },
  main: (x, y, w, h) => { const cx = x + w * 0.5, b = y + h; let d = E(cx, b - h * 0.32, w * 0.2, h * 0.16) + R(cx - w * 0.12, b - h * 0.2, w * 0.24, h * 0.2); [-0.15, -0.05, 0.05, 0.15].forEach((o, i) => d += ruban([cx + o * w, b - h * 0.42], [cx + o * w * 1.4, b - h * 0.55], [cx + o * w * 2, b - h * (0.66 + (i % 2) * 0.06)], w * 0.07, w * 0.05, 6)); d += ruban([cx + w * 0.18, b - h * 0.3], [cx + w * 0.3, b - h * 0.36], [cx + w * 0.36, b - h * 0.46], w * 0.07, w * 0.05, 6); return { noir: d, lum: "" }; },
  chat: (x, y, w, h) => { const cx = x + w * 0.46, b = y + h * 0.98; return { noir: E(cx, b - h * 0.18, w * 0.24, h * 0.18) + C(cx, b - h * 0.46, w * 0.15) + P([[cx - w * 0.14, b - h * 0.52], [cx - w * 0.12, b - h * 0.68], [cx - w * 0.03, b - h * 0.58]]) + P([[cx + w * 0.14, b - h * 0.52], [cx + w * 0.12, b - h * 0.68], [cx + w * 0.03, b - h * 0.58]]) + ruban([cx + w * 0.2, b - h * 0.06], [cx + w * 0.44, b - h * 0.1], [cx + w * 0.38, b - h * 0.4], w * 0.06, w * 0.03, 8), lum: E(cx - w * 0.06, b - h * 0.47, w * 0.03, h * 0.02) + E(cx + w * 0.06, b - h * 0.47, w * 0.03, h * 0.02) }; },
  fantome: (x, y, w, h) => { const cx = x + w * 0.5, b = y + h; let bord = ""; for (let k = 0; k < 4; k++) bord += `Q${f(cx - w * 0.3 + (k + 0.5) * w * 0.15)} ${f(b - h * (k % 2 ? 0.04 : 0.12))} ${f(cx - w * 0.3 + (k + 1) * w * 0.15)} ${f(b - h * 0.08)}`; return { noir: `M${f(cx - w * 0.3)} ${f(b - h * 0.08)}V${f(b - h * 0.6)}Q${f(cx)} ${f(b - h * 1.0)} ${f(cx + w * 0.3)} ${f(b - h * 0.6)}V${f(b - h * 0.08)}` + bord.replace(/^Q/, "Q") + "Z", lum: E(cx - w * 0.1, b - h * 0.6, w * 0.05, h * 0.06) + E(cx + w * 0.1, b - h * 0.6, w * 0.05, h * 0.06) + E(cx, b - h * 0.44, w * 0.06, h * 0.05) }; },
  jumeaux: (x, y, w, h) => { const b = y + h; return { noir: buste(x + w * 0.3, b, w * 0.55, h * 0.9) + C(x + w * 0.3, b - h * 0.42, w * 0.11) + buste(x + w * 0.7, b, w * 0.55, h * 0.9) + C(x + w * 0.7, b - h * 0.42, w * 0.11) + R(x + w * 0.2, b - h * 0.56, w * 0.2, h * 0.04) + R(x + w * 0.6, b - h * 0.56, w * 0.2, h * 0.04), lum: "" }; },
  plume: (x, y, w, h) => { const cx = x + w * 0.46, b = y + h; return { noir: buste(cx, b, w, h) + C(cx, b - h * 0.46, w * 0.15) + P([[cx - w * 0.28, b - h * 0.56], [cx, b - h * 0.72], [cx + w * 0.28, b - h * 0.56], [cx, b - h * 0.6]]) + ruban([cx + w * 0.14, b - h * 0.64], [cx + w * 0.4, b - h * 0.86], [cx + w * 0.2, b - h * 0.98], w * 0.1, w * 0.02, 10), lum: "" }; },
  // Close · le Phénix à la Mucha : profils à auréole, chevelures en volutes, plumes, coupe, fume-cigarette
  muchaProfil: (x, y, w, h, sens = 1) => { const cx = x + w * 0.5, b = y + h, s = sens; return { noir: anneau(cx, b - h * 0.6, w * 0.34, w * 0.3) + buste(cx, b, w * 0.9, h * 0.8) + E(cx, b - h * 0.6, w * 0.14, h * 0.13) + P([[cx + s * w * 0.12, b - h * 0.62], [cx + s * w * 0.2, b - h * 0.58], [cx + s * w * 0.13, b - h * 0.54]]) + ruban([cx - s * w * 0.1, b - h * 0.68], [cx - s * w * 0.42, b - h * 0.5], [cx - s * w * 0.28, b - h * 0.12], w * 0.14, w * 0.04, 12) + ruban([cx - s * w * 0.06, b - h * 0.62], [cx - s * w * 0.34, b - h * 0.32], [cx - s * w * 0.1, b - h * 0.04], w * 0.1, w * 0.03, 12) + C(cx - s * w * 0.04, b - h * 0.74, w * 0.05) + C(cx + s * w * 0.04, b - h * 0.76, w * 0.04), lum: "" }; },
  muchaCoupe: (x, y, w, h) => { const cx = x + w * 0.42, b = y + h; return { noir: anneau(cx, b - h * 0.52, w * 0.3, w * 0.27) + buste(cx, b, w, h) + C(cx, b - h * 0.5, w * 0.14) + ruban([cx - w * 0.06, b - h * 0.6], [cx - w * 0.4, b - h * 0.4], [cx - w * 0.3, b - h * 0.1], w * 0.12, w * 0.03, 10) + ruban([cx + w * 0.22, b - h * 0.26], [cx + w * 0.34, b - h * 0.5], [cx + w * 0.36, b - h * 0.7], w * 0.07, w * 0.05, 8) + P([[cx + w * 0.26, b - h * 0.86], [cx + w * 0.48, b - h * 0.86], [cx + w * 0.38, b - h * 0.76]]) + R(cx + w * 0.37, b - h * 0.77, 1, h * 0.06), lum: "" }; },
  fumeCigarette: (x, y, w, h) => { const cx = x + w * 0.4, b = y + h; return { noir: buste(cx, b, w, h) + E(cx, b - h * 0.5, w * 0.16, h * 0.13) + P([[cx - w * 0.2, b - h * 0.46], [cx - w * 0.18, b - h * 0.62], [cx + w * 0.16, b - h * 0.64], [cx + w * 0.2, b - h * 0.48], [cx + w * 0.1, b - h * 0.56], [cx - w * 0.08, b - h * 0.56]]) + R(cx + w * 0.1, b - h * 0.47, w * 0.42, 1.2) + spirale(cx + w * 0.54, b - h * 0.62, w * 0.1, 1.2, 0, 1.2, 0.5, 1, 12), lum: "" }; },
  muchaPlumes: (x, y, w, h) => { const cx = x + w * 0.5, b = y + h; let d = buste(cx, b, w, h) + C(cx, b - h * 0.46, w * 0.15) + R(cx - w * 0.17, b - h * 0.56, w * 0.34, h * 0.03); [-1, 0, 1].forEach(k => d += ruban([cx + k * w * 0.06, b - h * 0.56], [cx + k * w * 0.2, b - h * 0.76], [cx + k * w * 0.3, b - h * 0.96], w * 0.08, w * 0.02, 10)); return { noir: d + anneau(cx, b - h * 0.46, w * 0.28, w * 0.25), lum: C(cx, b - h * 0.56, w * 0.035) }; },
  couple: (x, y, w, h) => { const b = y + h; return { noir: buste(x + w * 0.32, b, w * 0.6, h) + E(x + w * 0.36, b - h * 0.46, w * 0.13, h * 0.11) + R(x + w * 0.2, b - h * 0.62, w * 0.3, h * 0.12) + R(x + w * 0.14, b - h * 0.54, w * 0.42, h * 0.03) + buste(x + w * 0.68, b, w * 0.6, h * 0.9) + E(x + w * 0.62, b - h * 0.44, w * 0.12, h * 0.1) + ruban([x + w * 0.66, b - h * 0.5], [x + w * 0.9, b - h * 0.36], [x + w * 0.8, b - h * 0.12], w * 0.1, w * 0.03, 10), lum: "" }; }
};

// Viva Barbessia · palace biscornu : façade qui penche, toit ondulé à bulbes, fenêtres de travers
function palaceBiscornu(x0, x1, yb, haut) {
  const r = hasard(11), w = x1 - x0, glisse = 16;
  const toit = []; for (let i = 0; i <= 8; i++) toit.push([x0 + glisse * 0.8 + (w + glisse * 0.2) * i / 8, haut + (i % 2 ? -12 : 6) + r() * 8]);
  const masse = P([[x0, yb], [x0 + glisse * 0.5, haut + 70], [x0 + glisse * 0.8, haut + 20], ...toit, [x1 + glisse, haut + 26], [x1 + glisse * 0.5, haut + 80], [x1 + 2, yb]])
    + C(x0 + glisse + w * 0.18, haut - 6, 12) + P([[x0 + glisse + w * 0.18 - 3, haut - 14], [x0 + glisse + w * 0.18, haut - 34], [x0 + glisse + w * 0.18 + 3, haut - 14]])  // bulbe
    + C(x0 + glisse + w * 0.78, haut - 2, 10) + P([[x0 + glisse + w * 0.78 - 3, haut - 8], [x0 + glisse + w * 0.78 + 1, haut - 28], [x0 + glisse + w * 0.78 + 3, haut - 8]]);
  let lum = "", noir = "", k = 0;
  const galerie = ["hautDeForme", null, "chouette", "couronne", "main", "moustache", null, "chat", "longCou", "fantome", "cage", null, "jumeaux", "plume", null];
  for (let y = haut + 56; y < yb - 120; y += 58) {
    const t = (y - haut) / (yb - haut), dx = glisse * (1 - t);
    for (let i = 0; i < 3; i++) {
      const cx = x0 + 34 + i * (w - 68) / 2 + dx + (r() - 0.5) * 8, fw = 22 + r() * 8, fh = 34 + r() * 10, a = (r() - 0.5) * 0.16;
      lum += quad(cx, y + fh / 2, fw, fh, a, (r() - 0.5) * 4);
      const qui = galerie[k++ % galerie.length];
      if (qui) { const fz = FIG[qui](cx - fw * 0.42, y + 2, fw * 0.84, fh - 2); noir += fz.noir; if (fz.lum) lum += fz.lum; }
      else noir += quad(cx, y + fh / 2, 2, fh, a) + quad(cx, y + fh * 0.45, fw, 2, a);   // fenêtre vide, croisillons
    }
  }
  return { masse, lum, noir };
}
// Close · maison close : rideaux drapés retenus, une dame à l'éventail, volets à cœurs, lanterne
function fenetreClose(x, y, w, h, type) {
  if (type === "coeur") return { lum: coeur(x + w / 2, y + h * 0.42, w * 0.22) + R(x + 3, y + h * 0.72, w - 6, 1.6) + R(x + 3, y + h * 0.82, w - 6, 1.6), noir: "" };
  const lum = R(x, y, w, h);
  let noir = R(x - 2, y, w + 4, 3) + fenetres(x, y + 3, Math.round(w / 6), 1, 6, 4, 0, 0, (xx, yy, ww, hh) => `M${f(xx)} ${f(yy)}a${f(ww / 2)} ${f(hh)} 0 0 0 ${f(ww)} 0Z`); // lambrequin festonné
  // rideaux retenus par une embrasse : deux pans étroits, cintrés (seulement aux fenêtres sans personnage)
  if (type === "rideau" || type === "dame") noir += `M${f(x)} ${f(y + 3)}L${f(x + w * 0.24)} ${f(y + 3)}Q${f(x + w * 0.16)} ${f(y + h * 0.42)} ${f(x + w * 0.1)} ${f(y + h * 0.55)}Q${f(x + w * 0.16)} ${f(y + h * 0.8)} ${f(x + w * 0.12)} ${f(y + h)}L${f(x)} ${f(y + h)}Z`
        + `M${f(x + w)} ${f(y + 3)}L${f(x + w * 0.76)} ${f(y + 3)}Q${f(x + w * 0.84)} ${f(y + h * 0.42)} ${f(x + w * 0.9)} ${f(y + h * 0.55)}Q${f(x + w * 0.84)} ${f(y + h * 0.8)} ${f(x + w * 0.88)} ${f(y + h)}L${f(x + w)} ${f(y + h)}Z`
        + C(x + w * 0.11, y + h * 0.55, 1.8) + C(x + w * 0.89, y + h * 0.55, 1.8);
  if (type === "dame") { // buste, chignon, éventail ouvert
    const cx = x + w * 0.46, by = y + h;
    noir += C(cx, by - h * 0.56, w * 0.11) + C(cx - w * 0.06, by - h * 0.7, w * 0.08) + P([[cx - w * 0.22, by], [cx - w * 0.16, by - h * 0.3], [cx - w * 0.05, by - h * 0.42], [cx + w * 0.05, by - h * 0.42], [cx + w * 0.16, by - h * 0.3], [cx + w * 0.22, by]]);
    let ev = ""; for (let k = 0; k <= 6; k++) { const a = -Math.PI * 0.95 + k * Math.PI * 0.7 / 6; ev += ruban([cx + w * 0.16, by - h * 0.36], [cx + w * 0.16 + Math.cos(a) * w * 0.15, by - h * 0.36 + Math.sin(a) * w * 0.15], [cx + w * 0.16 + Math.cos(a) * w * 0.3, by - h * 0.36 + Math.sin(a) * w * 0.3], 1.4, 2.2, 4); }
    noir += ev;
  } else if (FIG[type]) { const fz = FIG[type](x + w * 0.16, y + 4, w * 0.68, h - 4, type === "muchaProfil2" ? -1 : 1); noir += fz.noir; }
  else if (type === "muchaProfil2") { const fz = FIG.muchaProfil(x + w * 0.16, y + 4, w * 0.68, h - 4, -1); noir += fz.noir; }
  return { lum, noir };
}
function lanterne(x, y, s, sens = 1) { // potence au mur (x, y = point d'accroche), lanterne pendue
  const lx = x + sens * s * 1.3;
  return { noir: ruban([x, y], [x + sens * s * 0.7, y - s * 0.35], [lx, y], s * 0.12, s * 0.08, 8) + R(lx - 0.8, y, 1.6, s * 0.3) + P([[lx - s * 0.32, y + s * 0.42], [lx, y + s * 0.28], [lx + s * 0.32, y + s * 0.42]]) + P([[lx - s * 0.24, y + s * 1.12], [lx + s * 0.24, y + s * 1.12], [lx, y + s * 1.32]]),
    lum: P([[lx - s * 0.3, y + s * 0.44], [lx + s * 0.3, y + s * 0.44], [lx + s * 0.24, y + s * 1.1], [lx - s * 0.24, y + s * 1.1]]), coeur: coeur(lx, y + s * 0.76, s * 0.16) };
}
// Parfum de Famille · le flacon à poire dans la serre, la vitrine de flacons
function flacon(cx, base, h) {
  const w = h * 0.3;
  return { noir: P([[cx - w, base], [cx - w, base - h * 0.42], [cx - w * 0.62, base - h * 0.6], [cx + w * 0.62, base - h * 0.6], [cx + w, base - h * 0.42], [cx + w, base]])
      + R(cx - h * 0.06, base - h * 0.72, h * 0.12, h * 0.13) + R(cx - h * 0.1, base - h * 0.76, h * 0.2, h * 0.05)
      + ruban([cx + h * 0.06, base - h * 0.74], [cx + h * 0.3, base - h * 0.95], [cx + h * 0.48, base - h * 0.66], h * 0.03, h * 0.03, 10)
      + E(cx + h * 0.55, base - h * 0.55, h * 0.1, h * 0.14) + R(cx + h * 0.54, base - h * 0.41, 1.2, h * 0.12) + P([[cx + h * 0.5, base - h * 0.29], [cx + h * 0.6, base - h * 0.29], [cx + h * 0.58, base - h * 0.2], [cx + h * 0.52, base - h * 0.2]]),
    lum: P([[cx - w * 0.7, base - h * 0.08], [cx - w * 0.7, base - h * 0.4], [cx - w * 0.45, base - h * 0.52], [cx - w * 0.38, base - h * 0.52], [cx - w * 0.6, base - h * 0.38], [cx - w * 0.6, base - h * 0.08]]) + E(cx + w * 0.15, base - h * 0.24, w * 0.42, h * 0.07) };
}
function bouteilles(x0, base, n, s, graine) { // une étagère de flacons de formes variées
  const r = hasard(graine); let d = "", x = x0;
  for (let i = 0; i < n; i++) {
    const t = i % 4, k = s * (0.75 + r() * 0.4);
    if (t === 0) d += C(x + k * 0.3, base - k * 0.3, k * 0.3) + R(x + k * 0.25, base - k * 0.78, k * 0.1, k * 0.22) + C(x + k * 0.3, base - k * 0.82, k * 0.08);
    if (t === 1) d += R(x, base - k, k * 0.36, k) + C(x + k * 0.18, base - k - k * 0.1, k * 0.12);
    if (t === 2) d += P([[x, base], [x + k * 0.1, base - k * 0.6], [x + k * 0.22, base - k * 0.7], [x + k * 0.34, base - k * 0.6], [x + k * 0.44, base]]) + R(x + k * 0.17, base - k * 0.92, k * 0.1, k * 0.24);
    if (t === 3) d += quad(x + k * 0.25, base - k * 0.3, k * 0.42, k * 0.42, 0.785) + R(x + k * 0.2, base - k * 0.82, k * 0.1, k * 0.2);
    x += k * 0.62;
  }
  return d;
}
// Burning Bar · usine du Nord, fenêtres d'atelier basses en rangées
function usineNord(x0, x1, y, h, chem) {
  const w = x1 - x0, n = 4, pas = w / n;
  let sheds = ""; for (let i = 0; i < n; i++) sheds += P([[x0 + i * pas, y - h], [x0 + i * pas, y - h - pas * 0.55], [x0 + (i + 1) * pas, y - h]]);
  const [cx, top, cw] = chem;
  const cheminee = P([[cx - cw * 0.7, y - h], [cx - cw * 0.5, top], [cx + cw * 0.5, top], [cx + cw * 0.7, y - h]]) + R(cx - cw * 0.62, top - 6, cw * 1.24, 6);
  let bagues = ""; for (let yy = top + 14; yy < y - h - 6; yy += 26) bagues += R(cx - cw * 0.5, yy, cw, 1.6);
  let ateliers = "", meneaux = "";
  for (let yy = y - h + 26; yy < y - 70; yy += 52) for (let i = 0; i < n; i++) {
    const xa = x0 + i * pas + pas * 0.18, wa = pas * 0.64, ha = 24;
    ateliers += `M${f(xa)} ${f(yy + ha)}V${f(yy + 5)}Q${f(xa + wa / 2)} ${f(yy - 3)} ${f(xa + wa)} ${f(yy + 5)}V${f(yy + ha)}Z`;
    meneaux += R(xa + wa / 3, yy, 1.4, ha) + R(xa + wa * 2 / 3, yy, 1.4, ha) + R(xa, yy + ha * 0.55, wa, 1.4);
  }
  let briques = ""; for (let yy = y - h + 8; yy < y - 4; yy += 9) for (let xx = x0 + ((yy / 9) % 2) * 6 + 2; xx < x1 - 10; xx += 22) briques += R(xx, yy, 12, 1.1);
  const porte = arche(x0 + w * 0.36, y - 52, w * 0.28, 52);
  return { masse: R(x0, y - h, w, h) + sheds + cheminee, ateliers, meneaux, bagues, briques, porte,
    flamme: `M${f(cx)} ${f(top - 34)}Q${f(cx + cw * 0.9)} ${f(top - 16)} ${f(cx + cw * 0.4)} ${f(top - 6)}L${f(cx - cw * 0.4)} ${f(top - 6)}Q${f(cx - cw * 0.9)} ${f(top - 18)} ${f(cx - cw * 0.1)} ${f(top - 26)}Q${f(cx - cw * 0.05)} ${f(top - 16)} ${f(cx)} ${f(top - 34)}Z` };
}
// Better Together · le bistrot parisien : store, zinc, brise-bise, carotte de tabac, terrasse cannée
const chaiseCannee = (x, y, s, sens = 1) => { // x, y = pied avant, profil
  const k = v => x + sens * v * s;
  return ruban([k(0.42), y], [k(0.5), y - s * 0.7], [k(0.38), y - s * 1.12], s * 0.07, s * 0.06, 10) + R(Math.min(k(0), k(0.46)), y - s * 0.5, s * 0.46, s * 0.07) + R(Math.min(k(0.02), k(0.08)), y - s * 0.5, s * 0.06, s * 0.5) + ruban([k(0.22), y - s * 0.46], [k(0.3), y - s * 0.2], [k(0.24), y], s * 0.05, s * 0.05, 6);
};
const gueridon2 = (x, y, s) => E(x, y - s * 0.78, s * 0.36, s * 0.07) + R(x - s * 0.03, y - s * 0.78, s * 0.06, s * 0.78) + P([[x - s * 0.2, y], [x, y - s * 0.12], [x + s * 0.2, y]]);
const carotte = (x, y, s) => ({ cadre: P([[x, y - s], [x + s * 0.34, y], [x, y + s], [x - s * 0.34, y]]), bande: R(x - s * 0.34, y - s * 0.08, s * 0.68, s * 0.16) });
// Un Conte de Noëlle · la crèche : étable de paille, la Vierge à genoux, Joseph au bâton, le bœuf, l'âne au chapeau de fête
const vierge = (x, b, h) => P([[x - h * 0.3, b], [x - h * 0.26, b - h * 0.42], [x - h * 0.14, b - h * 0.72], [x - h * 0.02, b - h * 0.88], [x + h * 0.12, b - h * 0.84], [x + h * 0.16, b - h * 0.62], [x + h * 0.26, b - h * 0.5], [x + h * 0.24, b - h * 0.42], [x + h * 0.12, b - h * 0.45], [x + h * 0.2, b]]);
const joseph = (x, b, h) => P([[x - h * 0.2, b], [x - h * 0.12, b - h * 0.72], [x + h * 0.12, b - h * 0.72], [x + h * 0.2, b]]) + C(x, b - h * 0.8, h * 0.1) + P([[x - h * 0.12, b - h * 0.78], [x, b - h * 0.96], [x + h * 0.12, b - h * 0.78]]) + R(x + h * 0.24, b - h * 1.02, h * 0.04, h * 1.02) + ruban([x + h * 0.26, b - h * 1.0], [x + h * 0.36, b - h * 1.12], [x + h * 0.3, b - h * 1.18], 2, 2, 6);
const boeuf = (x, b, s) => E(x, b - s * 0.4, s * 0.3, s * 0.24) + E(x + s * 0.18, b - s * 0.28, s * 0.18, s * 0.14) + ruban([x - s * 0.18, b - s * 0.56], [x - s * 0.34, b - s * 0.8], [x - s * 0.14, b - s * 0.86], 3, 1.2, 6) + ruban([x + s * 0.14, b - s * 0.58], [x + s * 0.3, b - s * 0.82], [x + s * 0.1, b - s * 0.9], 3, 1.2, 6);
// Scatolina · reflet de lune sur l'eau
function refletLune(cx, y0, y1, graine) { const r = hasard(graine); let d = ""; for (let y = y0; y < y1; y += 7) { const w = (6 + r() * 26) * (0.5 + (y - y0) / (y1 - y0)); d += R(cx - w / 2 + (r() - 0.5) * 8, y, w, 1.8); } return d; }
// Norma · grille à volutes
function grilleBurton(x0, x1, y, h, pas = 12) {
  let d = R(x0, y - h * 0.82, x1 - x0, 2.2) + R(x0, y - h * 0.22, x1 - x0, 2.2);
  for (let x = x0; x <= x1; x += pas) d += R(x - 1, y - h, 2, h) + spirale(x + 3.5, y - h - 3.5, 4.5, 0.9, Math.PI, 2, 0.6, 1, 16);
  return d;
}

/* ───────── LA RUE · Paris, 1918 · seule variante à partir de la v5 ───────── */
const bas = x => { const pts = [[0, 600], [400, 640], [800, 670], [1240, 720], [1600, 740]]; for (let i = 0; i < pts.length - 1; i++) { const [a, b] = [pts[i], pts[i + 1]]; if (x <= b[0]) return a[1] + (b[1] - a[1]) * (x - a[0]) / (b[0] - a[0]); } return 740; };
function immeuble(x0, x1, haut, niveaux, opts = {}) {
  const yb = Math.max(bas(x0), bas(x1)), w = x1 - x0, formes = [];
  formes.push(N(P([[x0, yb], [x0, haut + 34], [x0 + 10, haut], [x1 - 10, haut], [x1, haut + 34], [x1, yb]])));
  const nc = Math.max(2, Math.round(w / 46)), fw = Math.min(22, (w - 20) / nc - 10), pas = (w - 20) / nc;
  let lum = "", vol = "";
  for (let j = 0; j < niveaux; j++) for (let i = 0; i < nc; i++) {
    const x = x0 + 10 + i * pas + (pas - fw) / 2, y = haut + 54 + j * 58;
    if (y + 40 > (opts.basFenetres || yb - 80)) continue;
    if ((i + j * 3 + (opts.graine || 0)) % 4 === 0) vol += volets(x, y, fw, 36); else lum += R(x, y, fw, 36);
  }
  if (!opts.eteint) formes.push(L(lum)); if (vol && !opts.eteint) formes.push(L(vol));
  formes.push(N(R(x0 + 6, haut + 46 + 58, w - 12, 3) + R(x0 + 4, haut - 14, 12, 16) + R(x1 - 18, haut - 18, 12, 20)));
  return formes;
}

const muchaRue = aureoleMucha(490, 140, 24);
const erosRue = violon(1330, 150, 58, -0.5);
const cocoRue = cocotier([1240, 732], [1218, 620], [1268, 488], 250, [[-104, 14, 36], [-74, 48, 12], [-30, 66, 0], [34, 60, 8], [84, 40, 16], [108, 6, 30], [46, -36, 26], [-42, -36, 22]]);
const fabrique = usineNord(762, 878, 668, 300, [846, 196, 18]);
const palace = palaceBiscornu(180, 356, 640, 250);
const parfum = flacon(690, 330, 64);
const lant = lanterne(362, 500, 20, -1);
const tabac = carotte(1040, 574, 15);

// fenêtres du Phénix : 5 colonnes, 6 étages, un motif de maison close par fenêtre
const closeF = { lum: "", noir: "" };
{
  // vingt fenêtres, aucune figure deux fois de suite : profils à auréole, plumes, coupe, fume-cigarette, couple, éventail, volets à cœur
  const types = ["muchaProfil", "coeur", "muchaPlumes", "rideau",
                 "couple", "muchaProfil2", "coeur", "fumeCigarette",
                 "rideau", "muchaCoupe", "dame", "coeur",
                 "muchaPlumes", "coeur", "muchaProfil", "couple",
                 "coeur", "fumeCigarette", "rideau", "muchaProfil2"];
  let k = 0;
  for (let j = 0; j < 5; j++) for (let i = 0; i < 4; i++) {
    const x = 380 + i * 58, y = 218 + j * 60, t = types[k++];
    const fz = fenetreClose(x, y, 34, 46, t); closeF.lum += fz.lum; closeF.noir += fz.noir;
  }
}

const rue = {
  decor: [
    { d: R(-400, -400, 2400, 1700), fill: "jaune", plan: 0 },
    { d: P([[-400, 560], [0, 600], [400, 640], [800, 670], [1240, 720], [1600, 740], [2000, 760], [2000, 1300], [-400, 1300]]), fill: "noir", plan: 1 }, // la rue, sans caniveau : la bande noire reçoit les titres au survol
    { d: ondes(1300, 756, 1600, 900, 12, 23, [[1320, 756, 1384, 900], [1386, 768, 1524, 864]]), fill: "lumiere", plan: 3 },
    { d: refletLune(1352, 760, 896, 5), fill: "blanc", plan: 3, anim: "scintille" },
    { d: R(296, 560, 5, 82) + R(816, 590, 5, 82), fill: "noir", plan: 3 },
    { d: C(298.5, 556, 9) + C(818.5, 586, 9), fill: "lumiere", plan: 3 }
  ],
  lieux: {
    cimetiere: [
      N(grilleBurton(0, 186, 606, 58, 12)),
      N(P([[44, 604], [48, 520], [40, 512], [144, 506], [140, 516], [146, 604]]) + P([[52, 512], [56, 474], [132, 468], [134, 508]])          // mausolée qui penche
        + "M58 474C54 418 118 400 134 470Z" + R(96, 412, 4, 16)),                                                                      // coupole de travers
      N(croix(98, 412, 66, 7, 0.14)),                                                                                                   // la croix sur le toit
      N(corbeau(110, 366, 15, 1)),
      N(spirale(36, 494, 16, 1.4, 0, 4, 0.8, -1) + spirale(152, 488, 16, 1.4, Math.PI, 4, 0.8, 1)),                                     // volutes baroques
      { ...L(ogive(76, 532, 34, 72)), anim: "scintille" }, N(R(92, 534, 2, 70)),
      N(ruban([170, 606], [150, 480], [182, 360], 14, 4) + ruban([166, 500], [120, 470], [126, 420], 5, 2) + ruban([176, 430], [210, 400], [196, 360], 4, 1.6)
        + spirale(176, 350, 14, 1.6, Math.PI / 2, 2.4, 0.6, -1) + spirale(132, 412, 11, 1.5, Math.PI / 2, 2.2, 0.6, 1) + spirale(198, 352, 9, 1.4, -Math.PI / 2, 1.8, 0.6, 1)), // arbre en spirales
      N(corbeau(118, 418, 13, 1) + corbeau(186, 344, 12, -1)),
      N(croix(18, 606, 48, 6, -0.22) + stele(150, 606, 16, 30, 0.24) + stele(4, 606, 12, 22, 0.2) + croix(170, 606, 30, 4, 0.3))
    ],
    tour: [
      N(palace.masse), L(palace.lum), N(palace.noir),
      N(P([[296, 270], [300, 168], [352, 160], [362, 270]]) + R(290, 158, 76, 8)),                                       // étage de pièce montée, de guingois
      N(P([[310, 162], [320, 104], [356, 96], [360, 162]]) + R(304, 94, 60, 7)),
      N("M322 95C318 64 344 50 360 92Z" + P([[340, 66], [354, 8], [356, 66]])),                                         // bulbe tordu, flèche
      N(R(353, -14, 2.4, 26) + P([[355, -12], [392, -2], [374, 4], [392, 12], [355, 12]])),
      L(quad(318, 200, 10, 16, 0.12) + quad(334, 198, 10, 18, -0.08) + quad(348, 202, 9, 15, 0.16) + quad(333, 128, 8, 13, -0.14) + quad(346, 126, 7, 12, 0.1)),
      L(P([[214, 556], [318, 552], [326, 570], [208, 574]])), N(fenetres(212, 572, 11, 1, 5, 5, 4.5, 0, (x, y, w, h) => `M${f(x)} ${f(y)}a${f(w / 2)} ${f(w / 2)} 0 0 0 ${f(w)} 0Z`)), // marquise festonnée
      L(quad(268, 604, 40, 50, 0.04)), N(R(267, 580, 2, 50)), N(R(306, 592, 10, 40) + C(311, 585, 6) + R(304, 576, 14, 4)) // porte de travers, le groom
    ],
    maison: [
      ...immeuble(360, 620, 170, 7, { eteint: true }),
      L(closeF.lum), N(closeF.noir),
      N(P([[430, 172], [490, 120], [550, 172]])), N(muchaRue.noir), L(muchaRue.lumiere),
      L(R(372, 532, 236, 58)), N(R(376, 536, 228, 50)), L(phenix(490, 562, 18) + R(400, 558, 60, 2) + R(520, 558, 60, 2)),
      L(arche(470, 596, 40, 46)), N(R(489, 598, 2, 44)),
      L(lampadaireGuimard(458, 640, 50, -1) + lampadaireGuimard(522, 640, 50, 1)),
      N(lant.noir), { ...L(lant.lum), anim: "scintille" }, N(lant.coeur)                                                 // la lanterne au cœur, sur rue
    ],
    serre: [
      ...immeuble(620, 760, 330, 4, { graine: 3 }),
      N("M632 332V286A58 48 0 0 1 748 286V332Z"), L("M640 330V288A50 40 0 0 1 740 288Z" + R(640, 288, 100, 42)),
      N(R(640, 300, 100, 2) + R(689, 248, 2, 40)),
      N(parfum.noir), L(parfum.lum),                                                                                    // le flacon à poire, en ombre dans la verrière
      N(chateauDeau(722, 246, 20)),
      L(R(634, 566, 112, 70)), N(R(634, 600, 112, 3) + R(634, 632, 112, 4) + bouteilles(640, 600, 8, 24, 3) + bouteilles(642, 632, 8, 22, 9)) // la vitrine du parfumeur
    ],
    usine: [
      N(fabrique.masse), L(fabrique.ateliers), N(fabrique.meneaux), L(fabrique.bagues), L(fabrique.briques), L(fabrique.porte),
      { ...L(fabrique.flamme), anim: "flamme" }
    ],
    bar: [
      ...immeuble(880, 1060, 300, 4, { graine: 4, basFenetres: 540 }),
      { d: Array.from({ length: 13 }, (_, i) => P([[884 + i * 14, 578], [898 + i * 14, 578], [900 + i * 14, 604], [886 + i * 14, 604]]) + `M${886 + i * 14} 604a7 7 0 0 0 14 0Z`).filter((_, i) => i % 2 === 0).join(""), fill: "blanc" }, // store rayé
      L(R(892, 618, 156, 70)),
      N(R(892, 618, 156, 3) + R(942, 618, 3, 70) + R(996, 618, 3, 70) + R(892, 660, 156, 2)),                           // menuiserie de la devanture
      N(R(900, 630, 36, 2) + bouteilles(902, 630, 5, 12, 4) + R(950, 630, 40, 2) + bouteilles(952, 630, 6, 12, 8)),     // étagère à bouteilles derrière le zinc
      N(C(1022, 636, 6) + C(1022, 627, 5) + R(1017, 618, 10, 6) + P([[1012, 660], [1016, 642], [1028, 642], [1032, 660]])), // le garçon au chapeau
      N(fenetres(894, 662, 15, 1, 8, 26, 2, 0, (x, y, w, h) => R(x, y + 5, w, h - 5) + `M${f(x)} ${f(y + 5)}a${f(w / 2)} ${f(w / 2)} 0 0 1 ${f(w)} 0Z`)), // brise-bise festonné
      L(C(918, 612, 4) + C(970, 612, 4) + C(1022, 612, 4)),                                                              // globes
      N(R(1040, 546, 20, 2.4) + R(1039.2, 546, 1.6, 14)), L(tabac.cadre), N(tabac.bande),                                  // la carotte du tabac
      L(gueridon2(912, 724, 30) + chaiseCannee(884, 724, 30, 1) + chaiseCannee(940, 724, 30, -1) + gueridon2(1018, 728, 30) + chaiseCannee(990, 728, 30, 1) + chaiseCannee(1046, 728, 30, -1)) // terrasse
    ],
    creche: [
      ...immeuble(1060, 1190, 360, 4, { graine: 5, basFenetres: 520 }),
      L(R(1066, 546, 118, 152)),
      { ...B(etoile(1125, 568, 12, 5, -1.3) + P([[1134, 562], [1176, 548], [1178, 554], [1136, 568]])), anim: "tourne", centre: [1125, 568] },
      N(P([[1070, 620], [1125, 590], [1180, 620], [1176, 628], [1125, 600], [1074, 628]]) + fenetres(1074, 621, 13, 1, 4, 8, 4, 0, (x, y, w, h) => P([[x, y], [x + w, y], [x + w / 2, y + h]]))), // toit de paille
      N(R(1078, 624, 4, 74) + R(1168, 624, 4, 74)),
      N(boeuf(1100, 676, 30)), N(ane(1156, 676, 30, 1)), L(chapeauFete(1166, 650, 14)),                                 // le bœuf, l'âne au chapeau de fête
      N(vierge(1094, 698, 40) + joseph(1158, 698, 46)),
      N(P([[1112, 698], [1116, 684], [1138, 684], [1142, 698]])), B(E(1127, 683, 10, 5))
    ],
    lune: [
      B(croissant(1352, 130, 58, 0.8)), N(erosRue.noir), L(erosRue.reserve), N(archet(1290, 190, 1366, 112)),
      { ...B(etoile(1270, 80, 4, 1.6) + etoile(1440, 210, 3.2, 1.3)), anim: "scintille" }
    ],
    arbre: [
      N(cocoRue.tronc), L(cocoRue.anneaux), N(cocoRue.feuilles),
      N(C(1260, 500, 7) + C(1276, 502, 7)), { ...L(C(1268, 510, 7.5)), anim: "scintille" }
    ],
    scatolina: [
      N(R(1300, 728, 300, 20)), N(R(1306, 706, 4, 24) + R(1340, 706, 4, 24)),
      N(P([[1492, 750], [1506, 736], [1584, 734], [1600, 750]]) + R(1548, 674, 12, 64) + P([[1545, 676], [1554, 650], [1563, 676]]) + cypres(1520, 740, 42)),
      { ...L(barque(1410, 786, 84)), anim: "flotte" },
      { ...O(R(1430, 768, 14, 13) + R(1446, 768, 14, 13) + R(1438, 756, 14, 12)), anim: "flotte" },
      { ...B(R(1436.5, 768, 1.4, 13) + R(1452.5, 768, 1.4, 13) + R(1444.5, 756, 1.4, 12)), anim: "flotte" },
      { ...L(R(1480, 744, 2, 34)), anim: "flotte" }, { ...B(C(1481, 740, 4)), anim: "flotte" },
      { ...L(barque(1410, 786, 84)), transform: "matrix(1 0 0 -1 0 1612)", opacite: 0.22, anim: "flotte" },            // reflet de la barque, retourné sous la ligne d'eau
      { ...O(R(1430, 768, 14, 13) + R(1446, 768, 14, 13) + R(1438, 756, 14, 12)), transform: "matrix(1 0 0 -1 0 1612)", opacite: 0.18, anim: "flotte" },
      { ...L(R(1392, 806, 18, 1.6) + R(1500, 806, 22, 1.6) + R(1404, 812, 10, 1.4) + R(1490, 812, 12, 1.4)), anim: "flotte" } // ligne d'eau de part et d'autre de la coque
    ]
  }
};

/* ───────── LE PANNEAU D'AFFICHAGE · l'accueil ─────────
   Une réclame sur les toits, portée par un échafaudage, éclairée par trois lampes. Le film de Big Drama y passe au ralenti.
   ecran = rectangle où se pose la vidéo (16/9). */
const PX0 = 908, PY0 = 112, PW = 272, PH = 153;
function panneau() {
  const x1 = PX0 + PW, y1 = PY0 + PH;
  let pieds = "", lampes = "", cones = "";
  [[934, 300], [1006, 300], [1102, 360], [1158, 360]].forEach(([x, yb]) => pieds += R(x - 2, y1 + 8, 4, yb - y1 - 8));
  pieds += ruban([934, y1 + 10], [970, y1 + 20], [1006, 298], 2, 2, 6) + ruban([1006, y1 + 10], [970, y1 + 20], [934, 298], 2, 2, 6)
         + ruban([1102, y1 + 10], [1130, y1 + 40], [1158, 358], 2, 2, 6) + ruban([1158, y1 + 10], [1130, y1 + 40], [1102, 358], 2, 2, 6)
         + R(PX0 + 6, y1 + 8, PW - 12, 4);
  [PX0 + PW * 0.18, PX0 + PW * 0.5, PX0 + PW * 0.82].forEach(x => {
    lampes += ruban([x, PY0 - 10], [x + 2, PY0 - 34], [x + 20, PY0 - 34], 2.4, 2, 8) + P([[x + 12, PY0 - 34], [x + 28, PY0 - 34], [x + 24, PY0 - 26], [x + 16, PY0 - 26]]);
    cones += P([[x + 16, PY0 - 26], [x + 24, PY0 - 26], [x + 46, PY0 + 6], [x - 6, PY0 + 6]]);
  });
  return [
    N(R(PX0 - 10, PY0 - 10, PW + 20, PH + 20) + R(PX0 - 16, PY0 - 16, PW + 32, 8) + pieds + lampes),
    { ...L(cones), opacite: 0.35 },
    L(C(PX0 + PW * 0.18 + 20, PY0 - 25, 3) + C(PX0 + PW * 0.5 + 20, PY0 - 25, 3) + C(PX0 + PW * 0.82 + 20, PY0 - 25, 3))
  ];
}
export const PANNEAU = { ecran: [PX0, PY0, PX0 + PW, PY0 + PH], formes: panneau() };

export const SILHOUETTES = { rue };

/* ───────── COUPES : le blueprint au clic ───────── */
const etages = (x0, y0, x1, y1, decoupe) => {
  const out = []; let y = y0;
  for (const [hr, cols] of decoupe) { const h = (y1 - y0) * hr; let x = x0; for (const c of cols) { const w = (x1 - x0) * c; out.push([f(x), f(y), f(x + w), f(y + h)]); x += w; } y += h; }
  return out;
};
const meuble = {
  lit: (b) => { const [x0, y0, x1, y1] = b, w = x1 - x0, h = y1 - y0; return R(x0 + w * 0.15, y1 - h * 0.35, w * 0.5, h * 0.2) + R(x0 + w * 0.15, y1 - h * 0.5, w * 0.06, h * 0.35); },
  portes: (b, n = 3) => { const [x0, y0, x1, y1] = b, w = x1 - x0, h = y1 - y0; let d = ""; for (let i = 0; i < n; i++) d += arche(x0 + w * (0.1 + i * 0.8 / n), y0 + h * 0.25, w * 0.5 / n, h * 0.7); return d; },
  comptoir: (b) => { const [x0, y0, x1, y1] = b, w = x1 - x0, h = y1 - y0; return R(x0 + w * 0.1, y1 - h * 0.4, w * 0.6, h * 0.4) + R(x0 + w * 0.1, y0 + h * 0.2, w * 0.6, 2); },
  table: (b) => { const [x0, y0, x1, y1] = b, w = x1 - x0, h = y1 - y0; return R(x0 + w * 0.25, y1 - h * 0.4, w * 0.5, 2) + R(x0 + w * 0.3, y1 - h * 0.4, 2, h * 0.4) + R(x0 + w * 0.7, y1 - h * 0.4, 2, h * 0.4); },
  escalier: (b) => { const [x0, y0, x1, y1] = b, w = x1 - x0, h = y1 - y0; let d = ""; for (let i = 0; i < 6; i++) d += R(x0 + w * (0.15 + i * 0.12), y1 - h * (0.15 + i * 0.13), w * 0.12, 2); return d; },
  machine: (b) => { const [x0, y0, x1, y1] = b, w = x1 - x0, h = y1 - y0; return C(x0 + w * 0.35, y1 - h * 0.35, Math.min(w, h) * 0.2) + R(x0 + w * 0.55, y1 - h * 0.6, w * 0.3, h * 0.6); },
  plantes: (b) => { const [x0, y0, x1, y1] = b, w = x1 - x0, h = y1 - y0; let d = ""; for (let i = 0; i < 4; i++) d += R(x0 + w * (0.12 + i * 0.2), y1 - h * 0.25, w * 0.1, h * 0.25) + C(x0 + w * (0.17 + i * 0.2), y1 - h * 0.35, w * 0.06); return d; }
};
const pieces = (contour, decoupe, mobiliers, ids) => etages(...contour, decoupe).map((boite, i) => ({ id: ids[i], boite, mobilier: mobiliers[i] ? meuble[mobiliers[i]](boite) : "" }));

export const COUPES = {
  rue: {
    maison:    { contour: [360, 100, 620, 646], pieces: pieces([362, 200, 618, 646], [[0.3, [0.5, 0.5]], [0.35, [0.5, 0.5]], [0.35, [0.6, 0.4]]], ["portes", "lit", "table", "portes", "comptoir", "escalier"], ["couloir", "chambre", "salon", "vestiaire", "bar", "entree"]) },
    tour:      { contour: [180, -14, 392, 640], pieces: pieces([186, 250, 350, 640], [[0.25, [1]], [0.25, [1]], [0.25, [1]], [0.25, [1]]], ["lit", "table", "comptoir", "escalier"], ["suite", "salle", "hall", "loge"]) },
    serre:     { contour: [620, 220, 760, 672], pieces: pieces([622, 254, 758, 672], [[0.2, [1]], [0.55, [1]], [0.25, [1]]], ["plantes", "table", "plantes"], ["verriere", "bureau", "rempotage"]) },
    lune:      { contour: [1270, 60, 1420, 210], pieces: [] },
    cimetiere: { contour: [0, 340, 210, 606], pieces: pieces([42, 470, 146, 604], [[0.3, [1]], [0.7, [0.5, 0.5]]], ["", "table", "lit"], ["coupole", "chapelle", "caveau"]) },
    creche:    { contour: [1060, 360, 1190, 714], pieces: pieces([1062, 400, 1188, 698], [[0.48, [1]], [0.52, [0.5, 0.5]]], ["table", "lit", "comptoir"], ["atelier", "etable", "coulisse"]) },
    usine:     { contour: [760, 150, 880, 672], pieces: pieces([762, 360, 878, 668], [[0.6, [1]], [0.4, [1]]], ["machine", "comptoir"], ["brasserie", "bar"]) },
    bar:       { contour: [876, 300, 1080, 730], pieces: pieces([882, 300, 1058, 700], [[0.6, [1]], [0.4, [0.5, 0.5]]], ["escalier", "comptoir", "table"], ["etages", "comptoir", "terrasse"]) },
    arbre:     { contour: [1130, 440, 1390, 740], pieces: [] },
    scatolina: { contour: [1300, 640, 1600, 860], pieces: pieces([1492, 640, 1600, 750], [[1, [0.5, 0.5]]], ["plantes", "table"], ["jardin", "atelier"]) }
  }
};

export const SIGNATURES = {
  maison: "Maison close 1918 : rideaux drapés retenus, dame à l'éventail, volets à cœurs, lanterne au cœur sur rue, auréole de Mucha, enseigne au phénix, lampadaires art nouveau",
  tour: "Palace biscornu qui penche : toit ondulé à bulbes, fenêtres de travers, pièce montée de guingois, marquise festonnée, groom",
  serre: "Verrière avec un flacon à poire en ombre, château d'eau new-yorkais, vitrine de parfumeur avec ses flacons",
  lune: "Croissant très fin, violon tsigane et son archet",
  cimetiere: "Mausolée qui penche, coupole de travers, croix sur le toit et son corbeau, arbre en spirales, grille à volutes",
  creche: "Vraie crèche : étable de paille, la Vierge à genoux, Joseph au bâton, le bœuf, l'âne au chapeau de fête, l'étoile filante, l'Enfant qui rayonne",
  usine: "Usine de briques du Nord : sheds, rangées de fenêtres d'atelier basses, cheminée baguée, flamme",
  bar: "Bistrot parisien : store rayé, devanture, zinc et bouteilles, garçon, brise-bise, globes, carotte du tabac, terrasse cannée",
  arbre: "Cocotier des Caraïbes, tronc annelé courbé, une noix de coco qui luit",
  scatolina: "Barque qui flotte avec son reflet, trois boîtes orange, lanterne, île au campanile, reflet de la lune sur l'eau"
};
