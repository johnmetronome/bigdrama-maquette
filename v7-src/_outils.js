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

