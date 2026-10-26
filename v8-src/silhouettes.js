// Big Drama · silhouettes.js · v5 · 20.10.2026 · auteur : Claude (chef de projet)
// À partir de la v5, une seule variante : LA RUE (Paris, 1918). Le manoir est abandonné.
// Dessin de référence de chaque lieu dans le cadre 1600 × 900 (y vers le bas).
//
// Format : SILHOUETTES.rue = { decor: [Forme], lieux: { [id]: [Forme] } }
//   Forme : { d: "<path SVG>", fill: "noir" | "jaune" | "lumiere" | "blanc" | "orange", plan?: n, anim?: "flotte" | "tourne" (centre) | "scintille" | "flamme" }
// COUPES.rue[id] = { contour, pieces: [{ id, boite, mobilier }] } : le blueprint au clic.
// Règle de lecture : sur le ciel, silhouette noire. Dans la masse noire, découpe jaune en réserve.

export const COULEURS = {
  rose: "#D6AEB6", menthe: "#B4C8BE", lavande: "#BDB6D1", papier: "#DDD0AD", mer: "#09131B",
  jaune: "#F2D10F", lumiere: "#FFE34D", noir: "#0A0A0A", blanc: "#F5F3EE",
  orange: "#F37021",   // les boîtes de Scatolina, seule exception
  plan: "#1F4E8C", trait: "#EAF2FF",
  neonBleu: "#9EE6FF", neonOr: "#FFD27A"   // néons : la croix de Norma, l enseigne de Close
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
  longCou: (x, y, w, h) => { const cx = x + w * 0.5, b = y + h; return { noir: ('M'+(cx-w*.33)+' '+b+'Q'+(cx-w*.1)+' '+(b-h*.34)+' '+(cx-w*.15)+' '+(b-h*.48)+'Q'+cx+' '+(b-h*.55)+' '+(cx+w*.15)+' '+(b-h*.45)+'Q'+(cx+w*.08)+' '+(b-h*.26)+' '+(cx+w*.4)+' '+b+'Z') + R(cx - w * 0.05, b - h * 0.7, w * 0.1, h * 0.44) + E(cx, b - h * 0.76, w * 0.1, h * 0.08) + C(cx, b - h * 0.9, w * 0.09), lum: R(cx - w * 0.06, b - h * 0.42, w * 0.12, h * 0.015) + R(cx - w * 0.06, b - h * 0.48, w * 0.12, h * 0.015) + R(cx - w * 0.06, b - h * 0.54, w * 0.12, h * 0.015) }; },
  cage: (x, y, w, h) => { const cx = x + w * 0.5, b = y + h * 0.94; let d = R(cx - w * 0.3, b, w * 0.6, h * 0.04) + R(cx - 0.6, b - h * 0.9, 1.2, h * 0.16); for (let k = -2; k <= 2; k++) d += R(cx + k * w * 0.13 - 0.5, b - h * 0.62 + Math.abs(k) * h * 0.05, 1, h * 0.62 - Math.abs(k) * h * 0.05); d += anneau(cx, b - h * 0.62, w * 0.3, w * 0.27).replace(/Z/g, "Z"); return { noir: d + E(cx, b - h * 0.24, w * 0.1, h * 0.07) + C(cx + w * 0.08, b - h * 0.32, w * 0.05), lum: "" }; },
  main: (x, y, w, h) => { const cx = x + w * 0.5, b = y + h; let d = E(cx, b - h * 0.32, w * 0.2, h * 0.16) + R(cx - w * 0.12, b - h * 0.2, w * 0.24, h * 0.2); [-0.15, -0.05, 0.05, 0.15].forEach((o, i) => d += ruban([cx + o * w, b - h * 0.42], [cx + o * w * 1.4, b - h * 0.55], [cx + o * w * 2, b - h * (0.66 + (i % 2) * 0.06)], w * 0.07, w * 0.05, 6)); d += ruban([cx + w * 0.18, b - h * 0.3], [cx + w * 0.3, b - h * 0.36], [cx + w * 0.36, b - h * 0.46], w * 0.07, w * 0.05, 6); return { noir: d, lum: "" }; },
  chat: (x, y, w, h) => { const cx = x + w * 0.46, b = y + h * 0.98; return { noir: E(cx, b - h * 0.18, w * 0.24, h * 0.18) + C(cx, b - h * 0.46, w * 0.15) + P([[cx - w * 0.14, b - h * 0.52], [cx - w * 0.12, b - h * 0.68], [cx - w * 0.03, b - h * 0.58]]) + P([[cx + w * 0.14, b - h * 0.52], [cx + w * 0.12, b - h * 0.68], [cx + w * 0.03, b - h * 0.58]]) + ruban([cx + w * 0.2, b - h * 0.06], [cx + w * 0.44, b - h * 0.1], [cx + w * 0.38, b - h * 0.4], w * 0.06, w * 0.03, 8), lum: E(cx - w * 0.06, b - h * 0.47, w * 0.03, h * 0.02) + E(cx + w * 0.06, b - h * 0.47, w * 0.03, h * 0.02) }; },
  fantome: (x, y, w, h) => { const cx = x + w * 0.5, b = y + h; let bord = ""; for (let k = 0; k < 4; k++) bord += `Q${f(cx - w * 0.3 + (k + 0.5) * w * 0.15)} ${f(b - h * (k % 2 ? 0.04 : 0.12))} ${f(cx - w * 0.3 + (k + 1) * w * 0.15)} ${f(b - h * 0.08)}`; return { noir: `M${f(cx - w * 0.3)} ${f(b - h * 0.08)}V${f(b - h * 0.6)}Q${f(cx)} ${f(b - h * 1.0)} ${f(cx + w * 0.3)} ${f(b - h * 0.6)}V${f(b - h * 0.08)}` + bord.replace(/^Q/, "Q") + "Z", lum: E(cx - w * 0.1, b - h * 0.6, w * 0.05, h * 0.06) + E(cx + w * 0.1, b - h * 0.6, w * 0.05, h * 0.06) + E(cx, b - h * 0.44, w * 0.06, h * 0.05) }; },
  jumeaux: (x, y, w, h) => { const b = y + h; return { noir: buste(x + w * 0.3, b, w * 0.55, h * 0.9) + C(x + w * 0.3, b - h * 0.42, w * 0.11) + buste(x + w * 0.7, b, w * 0.55, h * 0.9) + C(x + w * 0.7, b - h * 0.42, w * 0.11) + R(x + w * 0.2, b - h * 0.56, w * 0.2, h * 0.04) + R(x + w * 0.6, b - h * 0.56, w * 0.2, h * 0.04), lum: "" }; },
  plume: (x, y, w, h) => { const cx = x + w * 0.46, b = y + h; return { noir: buste(cx, b, w, h) + C(cx, b - h * 0.46, w * 0.15) + P([[cx - w * 0.28, b - h * 0.56], [cx, b - h * 0.72], [cx + w * 0.28, b - h * 0.56], [cx, b - h * 0.6]]) + ruban([cx + w * 0.14, b - h * 0.64], [cx + w * 0.4, b - h * 0.86], [cx + w * 0.2, b - h * 0.98], w * 0.1, w * 0.02, 10), lum: "" }; },
  // Close · le Phénix à la Mucha : profils à auréole, chevelures en volutes, plumes, coupe, fume-cigarette
  muchaProfil: (x, y, w, h, sens = 1) => { const cx = x + w * 0.5, b = y + h, s = sens; return { noir: anneau(cx, b - h * 0.6, w * 0.34, w * 0.3) + ('M'+(cx-w*.33)+' '+b+'Q'+(cx-w*.1)+' '+(b-h*.34)+' '+(cx-w*.15)+' '+(b-h*.48)+'Q'+cx+' '+(b-h*.55)+' '+(cx+w*.15)+' '+(b-h*.45)+'Q'+(cx+w*.08)+' '+(b-h*.26)+' '+(cx+w*.4)+' '+b+'Z') + E(cx, b - h * 0.6, w * 0.14, h * 0.13) + P([[cx + s * w * 0.12, b - h * 0.62], [cx + s * w * 0.2, b - h * 0.58], [cx + s * w * 0.13, b - h * 0.54]]) + ruban([cx - s * w * 0.1, b - h * 0.68], [cx - s * w * 0.42, b - h * 0.5], [cx - s * w * 0.28, b - h * 0.12], w * 0.14, w * 0.04, 12) + ruban([cx - s * w * 0.06, b - h * 0.62], [cx - s * w * 0.34, b - h * 0.32], [cx - s * w * 0.1, b - h * 0.04], w * 0.1, w * 0.03, 12) + C(cx - s * w * 0.04, b - h * 0.74, w * 0.05) + C(cx + s * w * 0.04, b - h * 0.76, w * 0.04), lum: "" }; },
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
  let lum = "", noir = "", k = 0; const figures = [];
  const galerie = ["hautDeForme", null, "chouette", "couronne", "main", "moustache", null, "chat", "longCou", null, null, null, "jumeaux", "plume", null];
  for (let y = haut + 56; y < yb - 120; y += 58) {
    const t = (y - haut) / (yb - haut), dx = glisse * (1 - t);
    for (let i = 0; i < 3; i++) {
      const cx = x0 + 34 + i * (w - 68) / 2 + dx + (r() - 0.5) * 8, fw = 22 + r() * 8, fh = 34 + r() * 10, a = (r() - 0.5) * 0.16;
      lum += quad(cx, y + fh / 2, fw, fh, a, (r() - 0.5) * 4);
      const qui = galerie[k++ % galerie.length];
      if (qui) { const fz = FIG[qui](cx - fw * 0.42, y + 2, fw * 0.84, fh - 2); figures.push(fz); }
      else noir += quad(cx, y + fh / 2, 2, fh, a) + quad(cx, y + fh * 0.45, fw, 2, a);   // fenêtre vide, croisillons
    }
  }
  return { masse, lum, noir, figures };
}
// les petits personnages dansent doucement quand on survole leur maison
const danseurs = (figs, base = 0) => figs.flatMap((fz, i) => [{ d: fz.noir, fill: "noir", anim: "danse", delai: base + i }, ...(fz.lum ? [{ d: fz.lum, fill: "lumiere", anim: "danse", delai: base + i }] : [])]);
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
    const cx = x + w * 0.46, by = y + h; let dame = "";
    dame += C(cx, by - h * 0.56, w * 0.11) + C(cx - w * 0.06, by - h * 0.7, w * 0.08) + P([[cx - w * 0.22, by], [cx - w * 0.16, by - h * 0.3], [cx - w * 0.05, by - h * 0.42], [cx + w * 0.05, by - h * 0.42], [cx + w * 0.16, by - h * 0.3], [cx + w * 0.22, by]]);
    let ev = ""; for (let k = 0; k <= 6; k++) { const a = -Math.PI * 0.95 + k * Math.PI * 0.7 / 6; ev += ruban([cx + w * 0.16, by - h * 0.36], [cx + w * 0.16 + Math.cos(a) * w * 0.15, by - h * 0.36 + Math.sin(a) * w * 0.15], [cx + w * 0.16 + Math.cos(a) * w * 0.3, by - h * 0.36 + Math.sin(a) * w * 0.3], 1.4, 2.2, 4); }
    dame += ev; return { lum, noir, fig: { noir: dame, lum: "" } };
  } else if (FIG[type]) { return { lum, noir, fig: FIG[type](x + w * 0.16, y + 4, w * 0.68, h - 4, 1) }; }
  else if (type === "muchaProfil2") { return { lum, noir, fig: FIG.muchaProfil(x + w * 0.16, y + 4, w * 0.68, h - 4, -1) }; }
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
const closeF = { lum: "", noir: "", figures: [] };
{
  // vingt fenêtres, aucune figure deux fois de suite : profils à auréole, plumes, coupe, fume-cigarette, couple, éventail, volets à cœur
  const types = ["muchaProfil", "coeur", "muchaPlumes", "rideau",
                 "couple", "muchaProfil2", "coeur", "fumeCigarette",
                 "rideau", "muchaCoupe", "dame", "coeur",
                 "muchaPlumes", "coeur", "muchaProfil", "couple",
                 "coeur", "fumeCigarette", "rideau", "muchaProfil2"];
  let k = 0;
  for (let j = 0; j < 5; j++) for (let i = 0; i < 4; i++) {
    const x = 380 + i * 58, y = 218 + j * 60, t = types[k] === "coeur" && k !== 1 ? (k++, "rideau") : types[k++];
    const fz = fenetreClose(x, y, 34, 46, t === "muchaPlumes" || t === "couple" ? "muchaProfil2" : t); closeF.lum += fz.lum; closeF.noir += fz.noir; if (fz.fig && (i+j)%4!==0) closeF.figures.push({...fz.fig,position:[x,y],indice:k});
  }
}

// Détails animés en silhouettes, sans médias supplémentaires.
function envolCorbeaux() {
 return [[114,361,0],[122,412,1],[189,339,2]].map(([x,y,i])=>({classe:'bd-oiseau bd-oiseau-'+i,groupe:[{groupe:[
 N(E(x,y,4.5,2)+P([[x-3,y],[x-10,y+4],[x-4,y+3]])+P([[x+4,y-1],[x+8,y],[x+4,y+1]])),
 {groupe:[N('M'+x+' '+y+'q-6 -12 -19 -10q5 2 7 8l9 5Z')],anim:'aile-gauche',centre:[x,y]},
 {groupe:[N('M'+x+' '+y+'q8 -11 19 -6l-7 2 -8 6Z')],anim:'aile-droite',centre:[x,y]}
 ],anim:'vol-corps',centre:[x,y]}]}));
}
function serveurAncien(x,y) {
  return [N(C(x,y-31,4)+R(x-5,y-37,10,2)+R(x-3,y-42,6,6)+P([[x-5,y-25],[x+4,y-25],[x+7,y-9],[x-7,y-9]])+R(x+3,y-26,12,2)+R(x+13,y-30,2,5)),
    B(P([[x-2,y-24],[x+2,y-24],[x+3,y-12],[x-3,y-12]])),
    N(R(x+9,y-31,19,2)+R(x+17,y-35,1,4)+E(x+17,y-36,3,1.5)),
    {groupe:[N(P([[x-4,y-10],[x,y-9],[x-3,y],[x-8,y]]))],anim:'pas-gauche',centre:[x,y-10]},
    {groupe:[N(P([[x,y-9],[x+4,y-10],[x+8,y],[x+3,y]]))],anim:'pas-droite',centre:[x,y-10]}];
}
function facadeCommune() {
 return [
  L(R(882,339,176,3)+R(882,419,176,3)+R(882,542,176,4)+R(884,695,172,4)),
  N(R(876,330,188,8)+R(874,421,192,6)),
  ...[884,938,994,1050].map(x=>L(R(x,341,2,194))),
  ...[354,458].flatMap(y=>[895,950,1005].flatMap(x=>[N(R(x-3,y-3,43,55)),L(arche(x,y,37,44)),N(R(x+17,y+3,2,41)),L(R(x-3,y+49,43,3))])),
  L(R(882,531,176,3)+R(883,539,174,2)),
  N(R(883,532,174,2)+Array.from({length:16},(_,i)=>R(886+i*11,528,1.5,11)).join('')),
  L(R(882,690,176,12)),N(R(890,693,160,2)),
  ...[885,1049].map(x=>L(R(x,577,5,114))),
 ];
}
function ciergesNorma(){
 const hasard=n=>{const v=Math.sin(n*127.1+311.7)*43758.5453;return v-Math.floor(v);};
 return Array.from({length:145},(_,i)=>{const x=-10+hasard(i+1)*210,y=614+hasard(i+241)*78,r=.45+hasard(i+491)*.75;return {classe:'bd-cierge',groupe:[{d:E(x,y,r*3,r*2),fill:'lumiere',opacite:.07},{d:'M'+x+' '+(y-2.5)+'Q'+(x-1.9)+' '+(y+.4)+' '+x+' '+(y+1.2)+'Q'+(x+1.4)+' '+y+' '+x+' '+(y-2.5)+'Z',fill:'lumiere',anim:'bougie',delai:i},{d:R(x-.65,y+1,1.3,3.5+(i%3)),fill:'papier',opacite:.95},N(R(x-.2,y,.4,1.4))]};});
}
function militaireClose(){return {classe:'bd-visite-militaire',groupe:[{groupe:[
 N(C(478,610,3.6)+R(472,605,12,2)+R(474,601,8,5)+P([[473,615],[482,615],[485,632],[471,632]])+R(473,631,3,14)+R(480,631,3,14)),
 {groupe:[N('M482 618L490 622L493 615')],anim:'frappe-porte',centre:[482,618]},
 L(R(474,618,7,1)+C(478,622,.6))
 ],anim:'visite-militaire'}]};}
function guetteurParfum(){return {transform:'translate(5 16)',clip:R(714,368,22,36),groupe:[{groupe:[N(E(724,384,4,5)+'M720 389Q712 393 714 405H731V390Z'+R(718,379,12,2)),{d:C(720,384,.6),fill:'lumiere'}],anim:'guetteur-parfum'}]};}
function enfantsNorma(){return [0,1].map(i=>({classe:'bd-enfant-voleur bd-enfant-'+i,groupe:[{groupe:[
 {d:C(91+i*7,569,3.2)+P([[86+i*7,575],[94+i*7,574],[98+i*7,586],[85+i*7,587]]),fill:'plan'},
 N(P([[87+i*7,567],[97+i*7,567],[94+i*7,563],[88+i*7,564]])),
 {groupe:[N(R(86+i*7,586,3,12))],anim:'pas-gauche',centre:[90+i*7,587]},
 {groupe:[N(R(94+i*7,586,3,12))],anim:'pas-droite',centre:[92+i*7,587]},
 {d:E(82+i*7,582,5,6),fill:'papier'},N(R(86+i*7,577,6,2))
 ],anim:'fuite-enfant',centre:[93,600]}]}));}
function policiersNorma(){return [0,1].map(i=>({classe:'bd-policier bd-policier-'+i,groupe:[{groupe:[
 {d:C(99,570,3.5)+P([[94,576],[103,576],[107,589],[93,589]]),fill:'plan'},
 N(R(92,566,14,2)+R(95,562,8,5)),
 {d:C(97,561,1),fill:'rouge',classe:'bd-gyro-rouge'},
 {d:C(100,561,1),fill:'neonBleu',classe:'bd-gyro-bleu'},
 {groupe:[N(R(95,588,3,12))],anim:'pas-gauche',centre:[97,588]},
 {groupe:[N(R(102,588,3,12))],anim:'pas-droite',centre:[103,588]}
 ],anim:'poursuite-policier'}]}));}
function salonsPastels(){return [[208,307,'rose'],[264,365,'menthe'],[312,423,'lavande']].flatMap(([x,y,c],i)=>[
 {d:R(x,y,25,35),fill:c},N(C(x+12,y+10,3.5)+R(x+7,y+16,10,18)+R(x+5,y+3,14,2)),
 {d:R(x+11,y+17,2,14),fill:'papier'},N(R(x+7,y+34,3,2)+R(x+15,y+34,3,2)),
 {d:C(x+8,y+11,.5)+C(x+15,y+11,.5),fill:'papier'}]);}
function rideauxClose(){return [[496,278],[380,338],[554,398]].map(([x,y])=>({d:'M'+x+' '+y+'h12q-8 20 -3 46h-9Z M'+(x+34)+' '+y+'h-11q7 20 3 46h8Z',fill:'papier',opacite:.8,anim:'rideau',centre:[x+17,y]}));}
function closeFigures(){return closeF.figures.map((f,i)=>{const [x,y]=f.position;return {clip:R(x,y,34,46),groupe:[{groupe:[{d:f.noir,fill:'noir'},...(f.lum?[{d:f.lum,fill:'papier'}]:[]),...(i%3===0?[{d:Array.from({length:5},(_,k)=>C(x+10+k%2*6,y+23+k*4,.9)).join(''),fill:'papier'}]:[])],anim:i%2?'retrait-silhouette':'danse',centre:[x+17,y+46]}]};});}
function tapisPaon(){return [
 {d:P([[466,641],[513,641],[529,659],[453,659]]),fill:'plan'},
 ...[-2,-1,0,1,2].flatMap(i=>[{d:E(490+i*5,650-Math.abs(i)*1.5,3.7,7),fill:i%2?'rose':'lumiere',opacite:.8},{d:E(490+i*5,649,1.5,3),fill:'plan'}]),
 L(C(490,647,2)+R(489,648,2,7)),N(R(457,658,68,1))];}
function indicesPolar(){return [
 N(R(635,457,108,38)),{d:P([[640,460],[661,460],[661,488],[640,488]]),fill:'papier'},
 N(R(644,464,13,1)+R(644,468,10,1)+R(644,472,12,1)),
 {d:E(712,473,14,14),fill:'rose',opacite:.9},N(E(712,473,10,10)+P([[721,483],[727,495],[731,494],[724,481]])),
 L(C(712,473,6)),N(R(707,472,10,1)+R(711,468,1,10)),
 {texte:'?',x:679,y:487,taille:28,fill:'lumiere',police:'machine'},
 {d:'M636 563L690 591L738 567',fill:'none',stroke:'orange',epaisseur:1},
 N(P([[670,632],[674,610],[685,604],[697,610],[702,632]])+E(686,603,6,8)+P([[672,597],[700,597],[695,593],[692,584],[679,585],[676,593]])),
 {d:R(682,610,5,13),fill:'papier'}];}
function flammesAteliers(){return [[766,440],[826,440],[856,440],[856,498],[856,390]].map(([x,y],i)=>{return {classe:'bd-flamme-atelier',groupe:[{d:'M'+x+' '+(y+45)+'Q'+(x-8)+' '+(y+22)+' '+(x+2)+' '+y+'Q'+(x+1)+' '+(y+22)+' '+(x+10)+' '+(y+13)+'Q'+(x+25)+' '+(y+38)+' '+(x+17)+' '+(y+45)+'Z',fill:'orange',anim:'brasier',centre:[x+8,y+45]},{d:'M'+(x+4)+' '+(y+45)+'Q'+(x+1)+' '+(y+33)+' '+(x+10)+' '+(y+23)+'Q'+(x+20)+' '+(y+39)+' '+(x+12)+' '+(y+45)+'Z',fill:'lumiere',anim:'brasier',centre:[x+8,y+45]}]};});}
function sorcieresMarionnettes(){return [1094,1160].flatMap((x,i)=>[
 {d:'M'+x+' 622V659 M'+(x-9)+' 632L'+(x-7)+' 674 M'+(x+9)+' 632L'+(x+7)+' 674',fill:'none',stroke:'noir',epaisseur:.5},
 {groupe:[N(P([[x-12,693],[x-8,671],[x-3,663],[x+5,665],[x+13,693]])+C(x,657,4)+P([[x-10,652],[x+10,652],[x+3,640],[x-1,632],[x-4,645]])+P([[x+3,657],[x+9,660],[x+3,661]])),
 {groupe:[N(R(x-10,670,2,12)+R(x+9,670,2,12))],anim:'marionnette',centre:[x,665]},
 {d:C(x,675,1.4)+C(x,683,1.4),fill:i?'rose':'papier'}],anim:'marionnette',centre:[x,653]}
 ]);}

/* ───────── v8 · Claude · 26.10.2026 ─────────
   Close : fenêtres plus grandes, maison close (corsets, bas, boa, miroir, cancan), une mariée, le capitaine qui frappe à la porte.
   Chaque fenêtre de Close porte un numéro (bd-fen-k) : son personnage s'anime et sa chanson joue quand on la survole.
   Parfum de Famille : le guetteur armé, un meurtre en ombres chinoises. Viva Barbessia : pierre-feuille-ciseaux.
   Better Together : des passants derrière les fenêtres. Burning Bar : terrasse, fumée en volutes, braises. */

// une femme en buste, taille de guêpe, la main sur la hanche (cx = centre, b = appui de fenêtre, u = hauteur)
const femme = (cx, b, u, s = 1, akimbo = true) => {
  const corps = P([[cx - .17 * u, b], [cx - .15 * u, b - .2 * u], [cx - .065 * u, b - .4 * u], [cx - .115 * u, b - .55 * u], [cx - .135 * u, b - .65 * u], [cx - .05 * u, b - .7 * u], [cx - .028 * u, b - .76 * u], [cx + .028 * u, b - .76 * u], [cx + .05 * u, b - .7 * u], [cx + .135 * u, b - .65 * u], [cx + .115 * u, b - .55 * u], [cx + .065 * u, b - .4 * u], [cx + .15 * u, b - .2 * u], [cx + .17 * u, b]]);
  const tete = E(cx + s * .012 * u, b - .83 * u, .062 * u, .075 * u) + C(cx - s * .05 * u, b - .89 * u, .045 * u);
  const bras = akimbo ? ruban([cx + s * .125 * u, b - .655 * u], [cx + s * .3 * u, b - .53 * u], [cx + s * .07 * u, b - .43 * u], .045 * u, .028 * u, 10)
                      + ruban([cx - s * .125 * u, b - .655 * u], [cx - s * .2 * u, b - .5 * u], [cx - s * .19 * u, b - .3 * u], .04 * u, .026 * u, 10) : "";
  return corps + tete + bras;
};
const laceCorset = (cx, b, u) => { let d = ""; for (let k = 0; k < 4; k++) d += R(cx - .03 * u, b - .58 * u + k * .05 * u, .06 * u, .008 * u + .4); return d; };
const plumeTete = (cx, b, u, s = 1) => ruban([cx - s * .03 * u, b - .93 * u], [cx + s * .02 * u, b - 1.06 * u], [cx + s * .16 * u, b - 1.08 * u], .035 * u, .006 * u, 10);

const FEM = {
  corset: (x, y, w, h, s = 1) => { const u = h * .92, cx = x + w * .5, b = y + h; return { noir: femme(cx, b, u, s) + plumeTete(cx, b, u, s), lum: laceCorset(cx, b, u) }; },
  boa: (x, y, w, h, s = 1) => { const u = h * .92, cx = x + w * .5, b = y + h; let d = femme(cx, b, u, s, false);
    for (const sg of [-1, 1]) { d += ruban([cx + sg * .02 * u, b - .73 * u], [cx + sg * .26 * u, b - .6 * u], [cx + sg * .24 * u, b - .02 * u], .07 * u, .05 * u, 14);
      for (let k = 0; k < 7; k++) d += C(cx + sg * (.16 + .06 * Math.sin(k)) * u, b - (.64 - k * .09) * u, .035 * u); }
    return { noir: d, lum: "" }; },
  mariee: (x, y, w, h) => { const u = h * .92, cx = x + w * .5, b = y + h;
    const voile = P([[cx - .02 * u, b - .93 * u], [cx + .05 * u, b - .93 * u], [cx + .2 * u, b - .55 * u], [cx + .34 * u, b], [cx - .34 * u, b], [cx - .2 * u, b - .55 * u]]);
    let bouquet = ""; for (let k = 0; k < 7; k++) bouquet += C(cx + Math.cos(k * .9) * .05 * u, b - .44 * u + Math.sin(k * .9) * .04 * u, .03 * u);
    return { voile, noir: femme(cx, b, u, 1, false) + ruban([cx - .12 * u, b - .64 * u], [cx - .1 * u, b - .48 * u], [cx, b - .45 * u], .04 * u, .03 * u, 8) + ruban([cx + .12 * u, b - .64 * u], [cx + .1 * u, b - .48 * u], [cx, b - .45 * u], .04 * u, .03 * u, 8) + bouquet,
      lum: "", ruban: ruban([cx - .01 * u, b - .42 * u], [cx - .05 * u, b - .3 * u], [cx + .02 * u, b - .18 * u], .015 * u, .008 * u, 8) + ruban([cx + .01 * u, b - .42 * u], [cx + .06 * u, b - .32 * u], [cx + .04 * u, b - .2 * u], .015 * u, .008 * u, 8),
      diademe: etoile(cx + .01 * u, b - .93 * u, .035 * u, .015 * u) }; },
  // assise de profil, une jambe levée : elle enfile son bas (la jambe est animée à part)
  bas: (x, y, w, h, s = 1) => { const u = h * .95, cx = x + w * (s > 0 ? .38 : .62), b = y + h;
    const corps = P([[cx - s * .16 * u, b], [cx - s * .12 * u, b - .3 * u], [cx - s * .06 * u, b - .52 * u], [cx - s * .02 * u, b - .66 * u], [cx + s * .06 * u, b - .66 * u], [cx + s * .1 * u, b - .5 * u], [cx + s * .06 * u, b - .34 * u], [cx + s * .14 * u, b - .2 * u], [cx + s * .1 * u, b]])
      + E(cx + s * .03 * u, b - .74 * u, .06 * u, .07 * u) + C(cx - s * .03 * u, b - .8 * u, .04 * u)
      + ruban([cx + s * .05 * u, b - .6 * u], [cx + s * .2 * u, b - .52 * u], [cx + s * .3 * u, b - .6 * u], .035 * u, .022 * u, 10);
    const jambe = ruban([cx + s * .08 * u, b - .22 * u], [cx + s * .26 * u, b - .4 * u], [cx + s * .38 * u, b - .74 * u], .085 * u, .03 * u, 14) + P([[cx + s * .37 * u, b - .74 * u], [cx + s * .43 * u, b - .84 * u], [cx + s * .41 * u, b - .72 * u]]);
    return { noir: corps, jambe, lum: R(cx + s * .2 * u - .04 * u, b - .44 * u, .08 * u, .012 * u + .4), pivot: [cx + s * .08 * u, b - .22 * u] }; },
  // le cancan : jupon festonné, jambe qui lance
  cancan: (x, y, w, h, s = 1) => { const u = h * .95, cx = x + w * .5, b = y + h;
    let jupon = `M${f(cx - .3 * u)} ${f(b - .26 * u)}Q${f(cx)} ${f(b - .56 * u)} ${f(cx + .3 * u)} ${f(b - .26 * u)}`;
    for (let k = 6; k >= 0; k--) jupon += `A${f(.05 * u)} ${f(.05 * u)} 0 0 1 ${f(cx - .3 * u + k * .1 * u - .1 * u)} ${f(b - .26 * u)}`;
    jupon += "Z";
    const haut = P([[cx - .07 * u, b - .4 * u], [cx - .12 * u, b - .62 * u], [cx - .04 * u, b - .7 * u], [cx + .04 * u, b - .7 * u], [cx + .12 * u, b - .62 * u], [cx + .07 * u, b - .4 * u]]) + E(cx, b - .78 * u, .06 * u, .07 * u) + C(cx - .04 * u, b - .84 * u, .04 * u) + plumeTete(cx, b + .02 * u, u, 1)
      + ruban([cx + .1 * u, b - .64 * u], [cx + .26 * u, b - .66 * u], [cx + .34 * u, b - .8 * u], .035 * u, .02 * u, 8) + ruban([cx - .1 * u, b - .64 * u], [cx - .24 * u, b - .52 * u], [cx - .3 * u, b - .32 * u], .035 * u, .02 * u, 8);
    const appui = ruban([cx - .06 * u, b - .3 * u], [cx - .07 * u, b - .14 * u], [cx - .08 * u, b], .06 * u, .03 * u, 8);
    const jambe = ruban([cx + .05 * u, b - .3 * u], [cx + .2 * u, b - .5 * u], [cx + .4 * u * s, b - .9 * u], .06 * u, .025 * u, 12);
    return { noir: jupon + haut + appui, jambe, lum: "", pivot: [cx + .05 * u, b - .3 * u] }; },
  // devant le miroir : profil, bras levé vers le chignon
  miroir: (x, y, w, h, s = 1) => { const u = h * .92, b = y + h, mx = x + w * (s > 0 ? .2 : .8), cx = x + w * (s > 0 ? .64 : .36);
    const cadre = anneau(mx, b - .58 * u, .15 * u, .12 * u) + R(mx - .02 * u, b - .44 * u, .04 * u, .44 * u);
    const corps = femme(cx, b, u, -s, false) + ruban([cx - s * .11 * u, b - .66 * u], [cx - s * .26 * u, b - .8 * u], [cx - s * .08 * u, b - .92 * u], .04 * u, .025 * u, 10);
    return { noir: cadre + corps, lum: "", glace: E(mx, b - .58 * u, .12 * u, .12 * u) }; },
  // le client en haut-de-forme qui écarte le rideau
  client: (x, y, w, h) => { const u = h * .92, cx = x + w * .6, b = y + h;
    return { noir: P([[cx - .2 * u, b], [cx - .17 * u, b - .5 * u], [cx - .06 * u, b - .62 * u], [cx + .08 * u, b - .62 * u], [cx + .18 * u, b - .48 * u], [cx + .2 * u, b]]) + C(cx, b - .72 * u, .08 * u) + R(cx - .07 * u, b - 1.02 * u, .14 * u, .22 * u) + R(cx - .12 * u, b - .81 * u, .24 * u, .03 * u)
      + ruban([cx - .1 * u, b - .66 * u], [cx - .02 * u, b - .63 * u], [cx + .1 * u, b - .66 * u], .025 * u, .025 * u, 6)
      + R(cx + .24 * u, b - .6 * u, .025 * u, .6 * u) + C(cx + .25 * u, b - .62 * u, .03 * u), lum: R(cx - .06 * u, b - .84 * u, .12 * u, .015 * u + .3) }; }
};

// les vingt fenêtres de Close (repère du dessin, avant la mise à l'échelle)
export const FENETRES_CLOSE = [];
function closeFenetresV8() {
  // v8.1 : moins de monde aux fenêtres, sept personnages, les autres fenêtres restent éclairées derrière leurs rideaux
  const types = ["corset", "vide", "vide", "mariee",
                 "bas", "vide", "rose", "vide",
                 "vide", "cancan", "vide", "vide",
                 "vide", "client", "vide", "vide",
                 "miroir", "vide", "vide", "vide"];
  const formes = []; let k = 0;
  for (let j = 0; j < 5; j++) for (let i = 0; i < 4; i++) {
    const x = 374 + i * 59, y = 210 + j * 62, w = 42, h = 54, t = types[k];
    FENETRES_CLOSE.push([x, y, w, h]);
    const rose = t === "rose", fond = rose ? "rose" : "lumiere";
    formes.push({ d: R(x, y, w, h), fill: fond, classe: "bd-vitre" });
    const fig = []; let anim = "danse";
    if (t === "vide" || t === "rose") {
      anim = null;
    } else if (t === "mariee") {
      const m = FEM.mariee(x, y, w, h);
      fig.push({ d: m.voile, fill: "blanc", opacite: .9 }, { d: m.noir, fill: "noir" }, { d: m.ruban, fill: "blanc" }, { d: m.diademe, fill: "blanc" }); anim = "mariee";
    } else if (t === "bas" || t === "bas2" || t === "cancan") {
      const s = t === "bas2" ? -1 : 1, m = FEM[t === "cancan" ? "cancan" : "bas"](x, y, w, h, s);
      fig.push({ d: m.noir, fill: "noir" }, { groupe: [{ d: m.jambe, fill: "noir" }], anim: t === "cancan" ? "cancan" : "jambe", centre: m.pivot });
      if (m.lum) fig.push({ d: m.lum, fill: "lumiere" });
      anim = "souffle";
    } else if (t === "miroir" || t === "miroir2") {
      const m = FEM.miroir(x, y, w, h, t === "miroir2" ? -1 : 1);
      fig.push({ d: m.glace, fill: "blanc", opacite: .35 }, { d: m.noir, fill: "noir" }); anim = "souffle";
    } else if (t === "eventail") {
      const m = fenetreClose(x, y, w, h, "dame"); fig.push({ d: m.fig.noir, fill: "noir" });
    } else if (t === "couple") {
      const m = FIG.couple(x + 2, y + 4, w - 4, h - 4); fig.push({ d: m.noir, fill: "noir" });
    } else {
      const nom = t.replace(/\d$/, ""), s = t.endsWith("2") ? -1 : 1, m = FEM[nom](x, y, w, h, s);
      fig.push({ d: m.noir, fill: "noir" }); if (m.lum) fig.push({ d: m.lum, fill: "lumiere" });
    }
    if (fig.length) formes.push({ classe: "bd-fen bd-fen-" + k, clip: R(x, y, w, h), groupe: [anim ? { groupe: fig, anim } : { groupe: fig }] });
    // lambrequin festonné et rideaux drapés retenus
    let noir = R(x - 2, y, w + 4, 3) + fenetres(x, y + 3, 7, 1, 6, 4, 0, 0, (xx, yy, ww, hh) => `M${f(xx)} ${f(yy)}a${f(ww / 2)} ${f(hh)} 0 0 0 ${f(ww)} 0Z`);
    noir += `M${f(x)} ${f(y + 3)}L${f(x + w * .2)} ${f(y + 3)}Q${f(x + w * .13)} ${f(y + h * .42)} ${f(x + w * .07)} ${f(y + h * .55)}Q${f(x + w * .12)} ${f(y + h * .8)} ${f(x + w * .09)} ${f(y + h)}L${f(x)} ${f(y + h)}Z`
         + `M${f(x + w)} ${f(y + 3)}L${f(x + w * .8)} ${f(y + 3)}Q${f(x + w * .87)} ${f(y + h * .42)} ${f(x + w * .93)} ${f(y + h * .55)}Q${f(x + w * .88)} ${f(y + h * .8)} ${f(x + w * .91)} ${f(y + h)}L${f(x + w)} ${f(y + h)}Z`;
    formes.push(N(noir));
    k++;
  }
  return formes;
}
// le capitaine en capote, képi, sabre au côté, qui frappe à la porte du Phénix
function capitaineClose() {
  const x = 508, b = 641, u = 46;
  const corps = P([[x - .2 * u, b - .08 * u], [x - .16 * u, b - .62 * u], [x - .06 * u, b - .72 * u], [x + .08 * u, b - .72 * u], [x + .16 * u, b - .6 * u], [x + .2 * u, b - .08 * u]])
    + R(x - .13 * u, b - .1 * u, .09 * u, .1 * u) + R(x + .03 * u, b - .1 * u, .09 * u, .1 * u)
    + E(x - .01 * u, b - .8 * u, .07 * u, .08 * u)
    + P([[x - .08 * u, b - .86 * u], [x - .06 * u, b - 1.0 * u], [x + .07 * u, b - 1.0 * u], [x + .08 * u, b - .86 * u]]) + R(x - .15 * u, b - .87 * u, .16 * u, .025 * u)
    + R(x - .18 * u, b - .7 * u, .1 * u, .03 * u) + R(x + .08 * u, b - .7 * u, .1 * u, .03 * u)
    + ruban([x + .12 * u, b - .38 * u], [x + .2 * u, b - .2 * u], [x + .3 * u, b - .02 * u], .025 * u, .02 * u, 6);
  const bras = ruban([x - .12 * u, b - .66 * u], [x - .26 * u, b - .66 * u], [x - .36 * u, b - .82 * u], .06 * u, .045 * u, 8) + C(x - .37 * u, b - .84 * u, .04 * u);
  const liseré = { d: corps + bras, fill: "none", stroke: "papier", epaisseur: .7, opacite: 0 };
  return { classe: "bd-capitaine", groupe: [
    { d: corps, fill: "noir" }, { d: corps, fill: "none", stroke: "papier", epaisseur: .6, classe: "bd-contre-jour" },
    { groupe: [{ d: bras, fill: "noir" }, { d: bras, fill: "none", stroke: "papier", epaisseur: .6, classe: "bd-contre-jour" }], anim: "toquer", centre: [x - .12 * u, b - .66 * u] },
    { d: R(x - .07 * u, b - .99 * u, .1 * u, .012 * u + .4) + C(x + .1 * u, b - .66 * u, .012 * u + .3) + C(x - .14 * u, b - .66 * u, .012 * u + .3), fill: "lumiere" }
  ] };
}

// Parfum de Famille · le guetteur tient une arme, et un meurtre se joue en ombres chinoises derrière un store
function guetteurArme() {
  return { transform: 'translate(5 16)', clip: R(708, 368, 34, 36), groupe: [{ groupe: [
    N(E(724, 384, 4, 5) + 'M720 389Q712 393 714 405H731V390Z' + R(718, 379, 12, 2)),
    N(revolver(729, 386, 7) + ruban([727, 395], [731, 392], [732, 389], 1.6, 1.4, 4)),
    { d: C(720, 384, .6), fill: 'lumiere' }], anim: 'guetteur-parfum' }] };
}
function meurtreParfum() {
  const x = 679, y = 384, w = 62, h = 36;
  const victime = N(C(x + 40, y + 12, 3.6) + P([[x + 36, y + 16], [x + 44, y + 16], [x + 46, y + 36], [x + 34, y + 36]]) + ruban([x + 37, y + 18], [x + 33, y + 24], [x + 34, y + 29], 1.6, 1.4, 6));
  const tueur = N(C(x + 16, y + 11, 3.8) + R(x + 12, y + 6, 8, 2) + R(x + 13.5, y + 2, 5, 4.5) + P([[x + 11, y + 15], [x + 21, y + 15], [x + 24, y + 36], [x + 9, y + 36]]));
  const bras = N(ruban([x + 19, y + 17], [x + 25, y + 9], [x + 27, y + 4], 2, 1.6, 6) + P([[x + 26, y + 4], [x + 28, y + 4], [x + 28.5, y - 6], [x + 27.2, y - 9], [x + 26, y - 6]]));
  return [
    { d: R(x, y, w, h), fill: 'papier' },
    { classe: 'bd-meurtre', clip: R(x, y, w, h), groupe: [
      { groupe: [victime], anim: 'victime', centre: [x + 40, y + 36] },
      { groupe: [tueur, { groupe: [bras], anim: 'poignard', centre: [x + 19, y + 17] }], anim: 'tueur', centre: [x + 16, y + 36] }
    ] },
    N(R(x - 2, y - 2, w + 4, 3) + R(x - 2, y + h - 1, w + 4, 3) + R(x + w / 2 - 1, y, 2, h) + fenetres(x, y + 1, 10, 1, 6.2, 3, 0, 0, (xx, yy, ww, hh) => `M${f(xx)} ${f(yy)}a${f(ww / 2)} ${f(hh)} 0 0 0 ${f(ww)} 0Z`))
  ];
}

// Viva Barbessia · deux joueurs, pierre-feuille-ciseaux, dans une grande fenêtre du palace
function chifoumi() {
  const x = 254, y = 356, w = 84, h = 46, b = y + h;
  const joueur = (cx, s) => N(P([[cx - 9, b], [cx - 7, b - 18], [cx - 3, b - 21], [cx + 3, b - 21], [cx + 7, b - 18], [cx + 9, b]]) + C(cx, b - 26, 5) + R(cx - 6, b - 36, 12, 5) + R(cx - 8, b - 32, 16, 1.6));
  const main = (cx, s, sorte) => {
    const hx = cx + s * 15, hy = b - 16;
    if (sorte === 'pierre') return C(hx, hy, 3.4);
    if (sorte === 'feuille') return P([[hx - 3.2, hy + 3], [hx - 3.4, hy - 4], [hx + 3.4, hy - 4.6], [hx + 3.2, hy + 3]]) + R(hx - 3.2, hy - 7, 1.2, 4) + R(hx - 1.2, hy - 8, 1.2, 5) + R(hx + .8, hy - 8, 1.2, 5) + R(hx + 2.6, hy - 7, 1.1, 4);
    return C(hx, hy, 3) + P([[hx - 1.6, hy - 2], [hx - 4.2, hy - 10], [hx - 2.6, hy - 10.4], [hx, hy - 2.6]]) + P([[hx + 1.6, hy - 2], [hx + 4.4, hy - 10], [hx + 2.8, hy - 10.6], [hx, hy - 2.6]]);
  };
  const avantBras = (cx, s) => ruban([cx + s * 6, b - 17], [cx + s * 10, b - 17], [cx + s * 13, b - 16], 3, 2.6, 6);
  const camp = (cx, s, lettre) => ({ groupe: [joueur(cx, s), { groupe: [
      N(avantBras(cx, s)),
      ...['pierre', 'feuille', 'ciseaux'].map(sorte => ({ ...N(main(cx, s, sorte)), classe: `bd-cf bd-cf-${lettre}-${sorte}` }))
    ], anim: 'chifoumi', centre: [cx + s * 6, b - 17] }] });
  return [
    L(R(x, y, w, h)),
    { classe: 'bd-chifoumi', clip: R(x, y, w, h), groupe: [camp(x + 22, 1, 'a'), camp(x + w - 22, -1, 'b')] },
    N(R(x - 3, y - 3, w + 6, 4) + R(x - 3, y + h - 1, w + 6, 4) + R(x - 3, y, 3, h) + R(x + w, y, 3, h))
  ];
}

// Better Together · des passants derrière les fenêtres, comme dans un appartement de sitcom
function passantsBar() {
  const fen = [354, 458].flatMap(y => [895, 950, 1005].map(x => arche(x, y, 37, 44))).join('');
  const marcheur = (x, b, objet) => [
    N(C(x, b - 32, 4) + P([[x - 5, b - 27], [x + 5, b - 27], [x + 7, b - 12], [x - 7, b - 12]])),
    { groupe: [N(P([[x - 5, b - 13], [x - 1, b - 13], [x - 3, b], [x - 8, b]]))], anim: 'pas-gauche', centre: [x - 2, b - 13] },
    { groupe: [N(P([[x + 1, b - 13], [x + 5, b - 13], [x + 8, b], [x + 3, b]]))], anim: 'pas-droite', centre: [x + 2, b - 13] },
    ...(objet === 'tasse' ? [N(ruban([x + 4, b - 24], [x + 9, b - 22], [x + 10, b - 27], 2, 1.8, 6) + R(x + 8, b - 32, 5, 5))] : []),
    ...(objet === 'guitare' ? [N(ruban([x - 6, b - 30], [x - 12, b - 18], [x - 10, b - 8], 1.4, 1.4, 6) + E(x - 10, b - 10, 4, 5))] : [])
  ];
  const canape = (x, b) => [...marcheur(x, b), ...marcheur(x + 46, b), N(R(x + 4, b - 22, 38, 7) + R(x + 4, b - 29, 6, 8) + R(x + 36, b - 29, 6, 8) + R(x + 6, b - 15, 3, 4) + R(x + 37, b - 15, 3, 4))];
  const etage = (b, liste, classe) => ({ classe: 'bd-passants ' + classe, groupe: liste });
  return { clip: fen, groupe: [
    etage(402, [{ groupe: marcheur(860, 402, 'tasse'), anim: 'passant' }], 'bd-passants-a'),
    etage(402, [{ groupe: canape(800, 402), anim: 'passant-lent' }], 'bd-passants-b'),
    etage(506, [{ groupe: [...marcheur(860, 506, 'guitare'), ...marcheur(875, 506)], anim: 'passant-retour' }], 'bd-passants-c')
  ] };
}

// Burning Bar · fumée en volutes, braises qui montent, terrasse de brasserie sous une guirlande
function fumeePoetique() {
  const volutes = [0, 1, 2, 3, 4].map(i => ({ classe: 'bd-volute bd-volute-' + i, groupe: [{
    d: ruban([846, 186], [830 - i * 4, 140], [860 + i * 6, 100], 7, 2.5, 18) + ruban([860 + i * 6, 100], [892 + i * 4, 64], [870 + i * 10, 22], 2.5, .6, 18),
    fill: 'blanc', opacite: .22 }] }));
  const braises = [0, 1, 2, 3, 4, 5, 6, 7].map(i => ({ classe: 'bd-braise bd-braise-' + i, groupe: [{ d: C(843 + (i % 4) * 3, 186, .9 + (i % 3) * .35), fill: i % 2 ? 'orange' : 'lumiere' }] }));
  return [...volutes, ...braises];
}
function terrasseBrasserie() {
  const sol = 668, mats = [884, 940];
  let guirlande = '', ampoules = '';
  for (let t = 0; t <= 1.0001; t += 1 / 8) { const x = 878 + t * 62, y = 582 + Math.sin(t * Math.PI) * 14; ampoules += C(x, y + 3, 1.8); }
  guirlande = `M878 582Q909 610 940 582`;
  const table = x => R(x - 13, sol - 15, 26, 2.4) + R(x - 11, sol - 13, 2, 13) + R(x + 9, sol - 13, 2, 13) + R(x - 15, sol - 7, 6, 1.8) + R(x + 9, sol - 7, 6, 1.8);
  const chopes = x => R(x - 7, sol - 21, 4, 6) + R(x + 3, sol - 21, 4, 6);
  return [
    { d: E(910, sol - 4, 44, 9), fill: 'lumiere', opacite: .18 }, { d: E(910, sol - 6, 30, 5), fill: 'lumiere', opacite: .22 },
    N(R(938, 576, 2.4, 92) + R(936, sol - 2, 7, 2)),
    { d: guirlande, fill: 'none', stroke: 'noir', epaisseur: .8 },
    { ...L(ampoules), anim: 'scintille' },
    N(table(898) + table(926)), L(chopes(898) + chopes(926)),
    N(C(888, sol - 26, 3) + P([[884, sol - 22], [892, sol - 22], [894, sol - 8], [882, sol - 8]]) + R(884, sol - 8, 3, 8) + R(890, sol - 8, 3, 8))
  ];
}

const rue = {
  decor: [
    { d: R(-400, -400, 2400, 1700), fill: "jaune", plan: 0 },
    ...Array.from({length: 62}, (_, i) => ({d: C(18 + (i*137.23)%1560, 20 + (i*53.71)%285, i%8===0 ? 1.7 : 0.8), fill: "blanc", plan:0, opacite: .25 + (i%5)*.1})),

    { d: P([[-400, 560], [0, 600], [400, 640], [800, 670], [1240, 720], [1600, 740], [2000, 760], [2000, 1300], [-400, 1300]]), fill: "noir", plan: 1 }, // la rue, sans caniveau : la bande noire reçoit les titres au survol
    {d:P([[1300,746],[2100,790],[2100,1400],[1300,1400]]),fill:'mer',plan:3},
    {d:ondes(1300,756,2100,1250,18,23,[[1400,756,1500,815]]),fill:'lumiere',plan:3,opacite:.65},
    { d: refletLune(1352, 760, 896, 5), fill: "blanc", plan: 3, anim: "scintille" },
    { d: R(296, 560, 5, 82), fill: "noir", plan: 3 },
    { d: C(298.5, 556, 9), fill: "lumiere", plan: 3 }
  ],
  lieux: {
    cimetiere: [
      N(grilleBurton(0, 186, 606, 58, 12)),
      N(P([[44, 604], [48, 520], [40, 512], [144, 506], [140, 516], [146, 604]]) + P([[52, 512], [56, 474], [132, 468], [134, 508]])          // mausolée qui penche
        + "M58 474C54 418 118 400 134 470Z" + R(96, 412, 4, 16)),                                                                      // coupole de travers
      { d: croix(98, 412, 66, 5, 0.14), fill: "noir", stroke: "neonBleu", epaisseur: 1.3, classe:"bd-croix-norma" },                                              // la croix de Norma, néon bleu qui clignote
      { image: 'logos/norma.png', x: 50, y: 474, w: 92, h: 32, neon: 'bleu', anim: 'neon-norma', classe: 'bd-norma-neon' },
      {...N(corbeau(110,366,15,1)),classe:"bd-corbeau-pose"},
      ...envolCorbeaux(),
      N(spirale(36, 494, 16, 1.4, 0, 4, 0.8, -1) + spirale(152, 488, 16, 1.4, Math.PI, 4, 0.8, 1)),                                     // volutes baroques
      { ...L(ogive(76, 532, 34, 72)), anim: "scintille" }, N(R(92, 534, 2, 70)),
      N(P([[173,610],[174,478],[171,412],[175,447],[177,482],[176,610]])),
      {d:'M174 610Q166 540 177 480Q185 429 171 398Q151 363 169 345Q184 328 196 343Q206 358 194 366Q181 373 180 360 M174 484Q154 472 143 442Q130 409 116 416Q102 421 110 434Q119 446 127 435 M177 435Q190 418 194 388Q195 367 204 360Q220 350 224 365Q226 379 214 378',fill:'none',stroke:'noir',epaisseur:1.7},
      ...ciergesNorma(), ...enfantsNorma(), ...policiersNorma(),
      {...N(corbeau(118,418,13,1)+corbeau(186,344,12,-1)),classe:"bd-corbeau-pose"},
      N(croix(18, 606, 48, 6, -0.22) + stele(150, 606, 16, 30, 0.24) + stele(4, 606, 12, 22, 0.2) + croix(170, 606, 30, 4, 0.3) + stele(28, 606, 10, 18, -0.3) + croix(190, 606, 26, 4, -0.18) + stele(160, 606, 9, 16, -0.12) + croix(-8, 606, 36, 5, 0.12)),
      N(R(8, 586, 24, 20) + P([[6, 586], [20, 572], [34, 586]]) + croix(20, 572, 16, 3, 0)), // une petite chapelle
    ],
    tour: [
      N(palace.masse),
      {d:'M211 274l-3 29 4 14-7 32 4 17 M328 310l-4 19 6 12-7 32 M250 478l3 11-5 15 3 23',fill:'lumiere',opacite:.12},
      L(palace.lum), N(palace.noir), ...danseurs(palace.figures, 3), ...chifoumi(),
      {classe:"bd-coureur-vitres",clip:palace.lum,groupe:[{groupe:[N(C(206,323,4)+P([[202,329],[208,328],[214,343],[207,347],[198,337]])+P([[207,344],[213,343],[222,353],[217,356],[206,350]])+P([[204,344],[208,347],[198,360],[194,358]])+P([[202,331],[203,335],[192,341],[190,338]])+P([[208,330],[219,324],[221,327],[212,335]]))],anim:"course"}]},
      N(P([[298,270],[299,222],[359,218],[362,270]])+R(293,221,71,5)),
      L(quad(313,247,10,20,-.08)+quad(333,245,10,20,.04)+quad(351,246,9,19,.12)),
      {transform:'translate(0 -44)',groupe:[
      N(P([[296, 270], [300, 168], [352, 160], [362, 270]]) + R(290, 158, 76, 8)),                                       // étage de pièce montée, de guingois
      N(P([[310, 162], [320, 104], [356, 96], [360, 162]]) + R(304, 94, 60, 7)),
      N("M322 95C318 64 344 50 360 92Z" + P([[340, 66], [354, 8], [356, 66]])),                                         // bulbe tordu, flèche
      N(R(353,-14,2.4,26)), {groupe:[N(P([[355,-12],[392,-2],[374,4],[392,12],[355,12]]))],anim:"drapeau",centre:[355,0]},
      ]},
      L(C(335,86,5)),N(C(335,86,1.2)),
      L(quad(318, 200, 10, 16, 0.12) + quad(334, 198, 10, 18, -0.08) + quad(348, 202, 9, 15, 0.16) + quad(333, 128, 8, 13, -0.14) + quad(346, 126, 7, 12, 0.1)),
      L(P([[200, 552], [332, 546], [342, 572], [192, 578]])), N(fenetres(196, 576, 15, 1, 6, 6, 3.8, 0, (x, y, w, h) => `M${f(x)} ${f(y)}a${f(w / 2)} ${f(w / 2)} 0 0 0 ${f(w)} 0Z`)), // marquise festonnée
      { texte: "VIVA BARBESSIA", x: 267, y: 567, taille: 12.5, fill: "noir", police: "enseigne", rot: -1.8, espacement: 1.6 },          // le nom, en travers du store
      L(quad(268, 604, 40, 50, 0.04)), N(R(267, 580, 2, 50)), N(R(306, 592, 10, 40) + C(311, 585, 6) + R(304, 576, 14, 4)) // porte de travers, le groom
    ],
    maison: [
      ...immeuble(360, 620, 170, 7, { eteint: true }),
      ...closeFenetresV8(),
      N(P([[430, 172], [490, 120], [550, 172]])), { ...N(muchaRue.noir), classe: 'bd-phenix-dessin' }, { ...L(muchaRue.lumiere), classe: 'bd-phenix-dessin' },
      { image: 'logos/paon.png', x: 476, y: 66, w: 28, h: 56, brut: true, classe: 'bd-phenix-image' }, // l'enseigne : le paon seul, sans cadre, posé sur le fronton
      L(R(372, 532, 236, 58)), N(R(376, 536, 228, 50)), { image: "logos/maison.png", x: 410, y: 538, w: 160, h: 46, neon: "or", anim: "neon" }, // l'enseigne Close, néon doré qui clignote
      L(arche(470, 596, 40, 46)), N(R(489, 598, 2, 44)),
      L(lampadaireGuimard(458, 640, 50, -1) + lampadaireGuimard(522, 640, 50, 1)),
      N(lant.noir), { ...L(lant.lum), anim: "scintille" }, N(lant.coeur), capitaineClose()                                                 // la lanterne au cœur, sur rue
    ],
    serre: [
      ...immeuble(620, 760, 330, 4, { graine: 3 }),
      N("M632 332V286A58 48 0 0 1 748 286V332Z"), L("M640 330V288A50 40 0 0 1 740 288Z" + R(640, 288, 100, 42)),
      N(R(640, 300, 100, 2) + R(689, 248, 2, 40)),
      { ...N(parfum.noir), anim: "danse", delai: 1 }, L(parfum.lum),                                                                                    // le flacon à poire, en ombre dans la verrière
      N(R(718, 214, 32, 14) + P([[715, 214], [734, 200], [753, 214]]) + R(722, 228, 2.4, 20) + R(744, 228, 2.4, 36) + R(722, 240, 24, 1.6)), // château d'eau, pieds posés sur la verrière
      L(R(634, 566, 112, 70)), N(R(634, 600, 112, 3) + R(634, 632, 112, 4) + bouteilles(640, 600, 8, 24, 3) + bouteilles(642, 632, 8, 22, 9)), // la vitrine du parfumeur
      L(R(616,518,148,47)),N(R(620,522,140,1)+R(620,561,140,1)),
      guetteurArme(), ...meurtreParfum(),
      L(R(612,518,156,50)),N(R(616,522,148,1)+R(616,564,148,1)),
      {texte:'PARFUM',x:690,y:540,taille:20,gras:600,fill:'noir',police:'enseigne',espacement:1},
      {texte:'DE FAMILLE',x:690,y:559,taille:17,gras:600,fill:'noir',police:'enseigne',espacement:.4},


    ],
    usine: [
      ...fumeePoetique(),
      N(fabrique.masse), L(fabrique.ateliers), N(fabrique.meneaux), L(fabrique.bagues), L(fabrique.briques), L(fabrique.porte),
      N(R(766, 590, 10, 80) + R(864, 590, 10, 80) + "M770 600 Q820 560 870 600 L870 612 Q820 574 770 612 Z"), // portail : deux piliers, arc de fer
      { texte: "BURNING BAR", arc: "M774 604 Q820 566 866 604", taille: 10, fill: "lumiere", police: "enseigne", espacement: 2 },
      { ...L(fabrique.flamme), anim: "flamme",classe:"bd-cheminee-flamme" },
      {classe:'bd-incendie',clip:fabrique.ateliers,groupe:flammesAteliers()},
      {classe:'bd-moine-porte',groupe:[{groupe:[
        N(P([[808,665],[811,643],[817,635],[825,635],[831,644],[835,665]])),
        N('M811 641Q808 624 821 622Q834 625 831 642Z'),
        {d:E(821,632,4,5),fill:'lumiere',opacite:.75},N(R(819,629,5,2)),
        L(R(811,649,19,1.4)),N(R(816,664,5,4)+R(825,664,5,4)),
        {...N(R(811,647,5,10)),anim:'pas-gauche',centre:[818,641]}
      ],anim:'moine'}]},
      ...terrasseBrasserie(),
    ],
    bar: [
      N(R(880,330,180,372)+R(875,323,190,8)),
      ...facadeCommune(),
      { d: Array.from({ length: 13 }, (_, i) => P([[884 + i * 14, 578], [898 + i * 14, 578], [900 + i * 14, 604], [886 + i * 14, 604]]) + `M${886 + i * 14} 604a7 7 0 0 0 14 0Z`).filter((_, i) => i % 2 === 0).join(""), fill: "blanc" }, // store rayé
      L(R(892, 618, 156, 70)),
      N(R(892, 618, 156, 3) + R(942, 618, 3, 70) + R(996, 618, 3, 70) + R(892, 660, 156, 2)),                           // menuiserie de la devanture
      N(R(900, 630, 36, 2) + bouteilles(902, 630, 5, 12, 4) + R(950, 630, 40, 2) + bouteilles(952, 630, 6, 12, 8)),     // étagère à bouteilles derrière le zinc
      passantsBar(), {classe:"bd-serveur-vitres",clip:R(894,620,152,65),groupe:[{groupe:serveurAncien(909,680),anim:"service"}]}, // le garçon au chapeau
      N(fenetres(894, 662, 15, 1, 8, 26, 2, 0, (x, y, w, h) => R(x, y + 5, w, h - 5) + `M${f(x)} ${f(y + 5)}a${f(w / 2)} ${f(w / 2)} 0 0 1 ${f(w)} 0Z`)), // brise-bise festonné
      L(C(918, 612, 4) + C(970, 612, 4) + C(1022, 612, 4)),                                                              // globes
      N(R(1040, 546, 20, 2.4) + R(1039.2, 546, 1.6, 14)), L(tabac.cadre), N(tabac.bande),                                  // la carotte du tabac
      L(gueridon2(912, 724, 30) + chaiseCannee(884, 724, 30, 1) + chaiseCannee(940, 724, 30, -1) + gueridon2(1018, 728, 30) + chaiseCannee(990, 728, 30, 1) + chaiseCannee(1046, 728, 30, -1)), // terrasse
      L(R(878,540,184,35)), N(R(882,544,176,27)),
      {texte:"BETTER TOGETHER",x:970,y:561,taille:13,fill:"lumiere",police:"enseigne",espacement:.8},
      {texte:"RESTAURANT",x:970,y:572,taille:5.5,fill:"lumiere",police:"enseigne",espacement:2},
    ],
    creche: [
      N(P([[1055,583],[1125,541],[1195,583],[1190,594],[1125,554],[1060,594]])),
      L(P([[1064,593],[1125,558],[1186,593],[1184,698],[1066,698]])),
      N(P([[1064,593],[1085,578],[1075,698],[1064,698]])+P([[1186,593],[1167,578],[1177,698],[1186,698]])+R(1060,588,5,113)+R(1186,588,5,113)),
      L(R(1057,698,136,3)),N(R(1058,701,134,5)),
      {texte:'UN CONTE',x:1125,y:602,taille:13,fill:'noir',police:'enseigne',espacement:1},
      {texte:'DE NOËLLE',x:1125,y:617,taille:13,fill:'noir',police:'enseigne',espacement:1},
      ...sorcieresMarionnettes(),
      {classe:'bd-berceau',groupe:[N('M1108 682Q1127 698 1146 682L1140 696H1114Z'+R(1116,694,2,7)+R(1136,694,2,7)),B(E(1127,683,11,4)),N(C(1120,681,2.3)),{d:E(1129,684,6,2),fill:'papier'}]},
      {classe:'bd-chaudron',groupe:[N(E(1127,687,17,11)+R(1111,675,32,4)+R(1114,695,3,6)+R(1137,695,3,6)),{d:E(1127,676,13,3),fill:'menthe'},B(etoile(1127,687,3,1.5,0)+C(1118,686,1)+C(1136,687,1))]},
      {classe:'bd-bulles-sorcieres',groupe:Array.from({length:7},(_,i)=>({groupe:[{d:C(1115+i*4,677-(i%3)*5,1.7+i%3),fill:'none',stroke:'noir',epaisseur:.8}],anim:'bulle-sorciere',centre:[1127,684]}))},
      N(boeuf(1081,695,23)+ane(1172,695,23,1)),
      {...B(etoile(1125,546,8,5,-1.3)),anim:'scintille'},
      N('M1058 587L1047 705H1050L1062 590Z'+'M1190 590L1204 707H1207L1194 587Z')
    ],
    lune: [
      B(croissant(1352, 130, 58, 0.8)), N(erosRue.noir), L(erosRue.reserve), 
      { ...B(etoile(1270, 80, 4, 1.6) + etoile(1440, 210, 3.2, 1.3)), anim: "scintille" }
    ],
    arbre: [
      {groupe:[N(cocoRue.tronc),L(cocoRue.anneaux),{groupe:[N(cocoRue.feuilles)],anim:"palmes",centre:[1268,488]},N(C(1259,499,7.2)+C(1277,501,7.2)+C(1268,511,7.6))],anim:"cocotier",centre:[1240,732]},
      {classe:'bd-coco-signal',groupe:[
        {d:'M1232 724L1210 352A75 75 0 1 1 1360 352L1242 724Z',fill:'lumiere',opacite:.16},
        {d:'M1235 340Q1250 316 1268 337L1278 324L1285 332L1292 324L1302 337Q1320 316 1335 340Q1318 333 1310 353Q1293 344 1285 368Q1277 344 1260 353Q1252 333 1235 340Z',fill:'noir'},
        {texte:'LA PROPHÉTIE',x:1285,y:386,taille:12,fill:'lumiere',police:'enseigne',espacement:.5},{texte:'DEL COCO',x:1285,y:402,taille:12,fill:'lumiere',police:'enseigne',espacement:.5}
      ]},
      N(R(1228,721,17,11)+P([[1225,722],[1235,708],[1246,718],[1241,727]])),L(E(1236,714,6,2)),

    ],
    scatolina: [
      {classe:"bd-venise",groupe:[
        N(R(1300,730,300,18)),
        N(R(1307,703,4,30)+R(1340,703,4,30)+C(1309,701,3)+C(1342,701,3)),
        {classe:'bd-phare-rayon',groupe:[{groupe:[{d:P([[1523,661],[1080,550],[1080,772]]),fill:'url(#bd-phare-fondu)'}],anim:'phare',centre:[1523,661]}]},
        N(P([[1508,734],[1513,668],[1533,668],[1538,734]])+R(1508,668,30,4)+R(1508,650,30,3)+P([[1507,650],[1523,635],[1539,650]])),
        L(R(1515,653,16,14)+R(1519,699,8,18)),N(R(1522,652,2,17)),
        {d:C(1523,660,3),fill:'blanc',classe:'bd-phare-feu'},
        N(R(1404,706,92,28)+R(1413,691,74,17)+"M1425 692Q1427 671 1445 671Q1464 671 1466 692Z"+"M1462 698Q1462 681 1476 681Q1490 681 1490 698Z"+R(1443,661,3,12)+R(1474,673,3,10)),
        L(R(1410,718,80,2)),
        ...Array.from({length:9},(_,i)=>L(arche(1410+i*9,721,5,13))),
        N(R(1545,697,55,37)+P([[1545,697],[1572,682],[1600,697]])),
        ...Array.from({length:5},(_,i)=>L(ogive(1550+i*10,706,6,17))),
        N("M1339 735Q1369 692 1409 735L1409 742Q1369 713 1339 742Z"),
        L("M1344 733Q1371 704 1404 733L1404 735Q1371 709 1344 735Z")
      ]},
      {transform:"translate(1452 786) scale(1.5) translate(-1452 -786)",groupe:[{classe:"bd-bateau-zoom",groupe:[{classe:"bd-bateau",anim:"flotte",groupe:[
        {classe:'bd-fleur-surprise',groupe:[{d:'M1453 777Q1440 756 1457 729',fill:'none',stroke:'orange',epaisseur:2.5,classe:'bd-fleur-tige'},
        {classe:'bd-fleur-feuilles',groupe:[{d:'M1451 758Q1430 746 1434 762Q1445 767 1451 758Z M1453 748Q1475 736 1470 751Q1462 757 1453 748Z',fill:'orange'}]},
        {classe:'bd-fleur-corolle',groupe:[...[0,1,2,3,4,5].map(i=>({d:E(1457+Math.cos(i*Math.PI/3)*7,728+Math.sin(i*Math.PI/3)*6,5,3.5),fill:'orange'})),{d:E(1457,728,5,3),fill:'orange'}]}]},
        L(barque(1410,786,84)),
        O(R(1430,768,14,13)+R(1446,768,14,13)+R(1438,756,14,12)),
        B(R(1436.5,768,1.4,13)+R(1452.5,768,1.4,13)+R(1444.5,756,1.4,12)),
        L(R(1480,744,2,34)),B(C(1481,740,4)),
        L(R(1407,774,91,14)),{texte:"SCATOLINA",x:1452,y:784,taille:9,fill:"noir",police:"enseigne",espacement:1}
      ]}]}]},
      { ...L(barque(1389,786,126)),transform:"matrix(1 0 0 -1 0 1612)",opacite:.16,anim:"flotte"},
      {...L(R(1392,806,18,1.6)+R(1500,806,22,1.6)+R(1404,812,10,1.4)+R(1490,812,12,1.4)),anim:"flotte"}

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
export { bas as solRue };

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
