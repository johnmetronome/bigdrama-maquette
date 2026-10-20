import { SILHOUETTES, COULEURS, POLICES, solRue } from './silhouettes.js';
import { LIEUX, LOREM_LONG } from './lieux.js';

const A = '../';                                   // les médias de la maquette sont à la racine du dépôt
const NS = 'http://www.w3.org/2000/svg', $ = s => document.querySelector(s);
const reduit = matchMedia('(prefers-reduced-motion: reduce)').matches;
const el = (n, a = {}, p) => { const e = document.createElementNS(NS, n); for (const k in a) e.setAttribute(k, a[k]); if (p) p.appendChild(e); return e; };
const parId = Object.fromEntries(LIEUX.map(l => [l.id, l]));
const S = SILHOUETTES.rue;
const scene = $('#bd-scene'), svg = $('#bd-svg'), logo = $('#bd-logo'), rue = $('#rue'), hero = $('#entry-film');
let boites = {}, vb = [0, 0, 1600, 900], vivante = false;

/* ── la vue suit le format de l'écran ── */
const aspect = () => { const r = scene.getBoundingClientRect(); return r.width / r.height; };
function cadrer(x) { const a = aspect(), w = Math.min(1600, 900 * a), h = w / a; vb = [Math.min(1600 - w, Math.max(0, x ?? (a < 1 ? 627 - w / 2 : (1600 - w) / 2))), 900 - h, w, h]; svg.setAttribute('viewBox', vb.join(' ')); }
const versEcran = (x, y) => { const r = scene.getBoundingClientRect(); return [(x - vb[0]) / vb[2] * r.width, (y - vb[1]) / vb[3] * r.height]; };

/* ── dessin ── */
const calques = {}, constructions = [], details = [];
let pavés, sol, ciel;
function forme(fm, parent) {
  if (fm.texte) {
    const t = el('text', { fill: COULEURS[fm.fill], 'font-family': POLICES[fm.police || 'enseigne'], 'font-size': fm.taille, 'letter-spacing': fm.espacement || 0, 'text-anchor': 'middle' }, parent);
    if (fm.arc) { const id = 'arc-' + Math.random().toString(36).slice(2, 8); el('path', { id, d: fm.arc, fill: 'none' }, defs); const tp = el('textPath', { href: '#' + id, startOffset: '50%' }, t); tp.textContent = fm.texte; }
    else { t.setAttribute('x', fm.x); t.setAttribute('y', fm.y); if (fm.rot) t.setAttribute('transform', `rotate(${fm.rot} ${fm.x} ${fm.y})`); t.textContent = fm.texte; }
    return t;
  }
  if (fm.image) {
    const im = el('image', { href: A + fm.image, x: fm.x, y: fm.y, width: fm.w, height: fm.h, preserveAspectRatio: 'xMidYMid meet', filter: `url(#neon-${fm.neon || 'or'})` }, parent);
    if (fm.anim && !reduit) im.classList.add('a-' + fm.anim);
    return im;
  }
  if (fm.transform) parent = el('g', { transform: fm.transform }, parent);
  const p = el('path', { d: fm.d, fill: COULEURS[fm.fill] }, parent);
  if (fm.opacite) p.setAttribute('fill-opacity', fm.opacite);
  if (fm.neon) p.setAttribute('filter', `url(#neon-${fm.neon})`);
  if (fm.anim) { p.classList.add('a-' + fm.anim); if (fm.centre) p.style.transformOrigin = `${fm.centre[0]}px ${fm.centre[1]}px`; if (fm.delai != null) p.style.setProperty('--delai', fm.delai); }
  return p;
}
let defs;
function neon(id, couleur, force) {
  const f = el('filter', { id, x: '-50%', y: '-50%', width: '200%', height: '200%' }, defs);
  el('feFlood', { 'flood-color': couleur, result: 'c' }, f); el('feComposite', { in: 'c', in2: 'SourceAlpha', operator: 'in', result: 'teinte' }, f);
  el('feGaussianBlur', { in: 'teinte', stdDeviation: force, result: 'halo' }, f); el('feGaussianBlur', { in: 'teinte', stdDeviation: force * 3, result: 'halo2' }, f);
  const m = el('feMerge', {}, f); ['halo2', 'halo', 'teinte'].forEach(i => el('feMergeNode', { in: i }, m));
  el('feMergeNode', { in: 'teinte' }, m);
}
function dessiner() {
  svg.innerHTML = ''; defs = el('defs', {}, svg);
  neon('neon-bleu', COULEURS.neonBleu, 1.6); neon('neon-or', COULEURS.neonOr, 1.2);
  [0, 1, 2, 3].forEach(n => calques[n] = el('g', { 'data-plan': n }, svg));
  // le ciel, le sol, les pavés
  for (const fm of S.decor) {
    const enveloppe = fm.fill === 'jaune' || (fm.fill === 'noir' && (fm.plan ?? 0) === 1) ? calques[fm.plan ?? 0] : el('g', {}, calques[fm.plan ?? 0]);
    const p = forme(fm, enveloppe);
    if (fm.fill === 'jaune') ciel = p; else if (fm.fill === 'noir' && (fm.plan ?? 0) === 1) sol = p; else details.push(enveloppe);
  }
  const cp = el('clipPath', { id: 'clip-sol' }, defs); el('path', { d: sol.getAttribute('d') }, cp);
  pavés = el('g', { 'clip-path': 'url(#clip-sol)' }, calques[1]); calques[1].insertBefore(pavés, sol);
  // les pavés, posés un par un : rangée après rangée depuis le premier plan, de gauche à droite dans chaque rangée
  let y = 556, rang = 0;
  while (y < 905) {
    const k = 1 + (y - 556) / 260, h = 9 * k, w = 24 * k, g = el('g', { class: 'rang' }, pavés);
    const tas = Array.from({ length: 10 }, () => '');
    for (let x = -60 + (rang % 2) * w / 2, i = 0; x < 1660; x += w, i++) tas[Math.min(9, Math.floor((x + 60) / 172))] += `M${(x + 1.2).toFixed(1)} ${(y + 1).toFixed(1)}h${(w - 2.4).toFixed(1)}v${(h - 2).toFixed(1)}h${(-(w - 2.4)).toFixed(1)}Z`;
    tas.forEach((d, j) => { if (d) { const t = el('path', { d, fill: '#16130e', stroke: COULEURS.lumiere, 'stroke-opacity': 0.32, 'stroke-width': 0.7 }, g); t.dataset.j = j; } });
    g.dataset.rang = rang++; y += h;
  }
  // les lieux, posés à leur place, du plus grand au plus petit pour que les petits restent survolables
  const tmp = el('g', {}, svg);
  const ordre = [...LIEUX].sort((a, b) => (a.placement.x ?? 2000) - (b.placement.x ?? 2000));
  ordre.forEach((l, rangLieu) => {
    const g = el('g', { class: 'bd-lieu', 'data-id': l.id, tabindex: 0, role: 'button', 'aria-label': l.creation }, calques[l.scene.plan]);
    const elev = el('g', { class: 'bd-elev' }, g), cons = el('g', { class: 'bd-construction' }, elev), pose = el('g', {}, cons);
    S.lieux[l.id].forEach(fm => forme(fm, pose));
    const b0 = pose.getBBox(), { x, s } = l.placement;
    if (x != null) {
      const ox = b0.x + b0.width / 2, oy = b0.y + b0.height, ecart = oy - solRue(ox), ny = solRue(x) + ecart * s;
      pose.setAttribute('transform', `translate(${x} ${ny}) scale(${s}) translate(${-ox} ${-oy})`);
    }
    const b = g.getBBox(); boites[l.id] = [b.x, b.y, b.x + b.width, b.y + b.height];
    g.insertBefore(el('rect', { class: 'bd-zone', x: b.x - 4, y: b.y - 4, width: b.width + 8, height: b.height + 8 }), g.firstChild);
    constructions.push({ g: cons, lum: [...pose.querySelectorAll(`path[fill="${COULEURS.lumiere}"],path[fill="${COULEURS.blanc}"],path[fill="${COULEURS.orange}"],image,text`)], debut: 0.22 + rangLieu * 0.052 });
    g.addEventListener('pointerenter', e => { if (e.pointerType !== 'touch') survoler(l.id); });
    g.addEventListener('pointerleave', e => { if (e.pointerType !== 'touch') survoler(null); });
    g.addEventListener('focus', () => survoler(l.id)); g.addEventListener('blur', () => survoler(null));
    g.addEventListener('click', e => { if (!vivante || glisse.bouge) return; if (e.pointerType === 'touch' && arme !== l.id) { arme = l.id; survoler(l.id); return; } ouvrirProjet(l.id); });
    g.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); ouvrirProjet(l.id); } });
  });
  tmp.remove();
}
let arme = null;

/* ── la construction au défilement : pavé par pavé, puis les maisons, puis le ciel ── */
const borne = v => Math.max(0, Math.min(1, v)), doux = k => 0.5 - Math.cos(Math.PI * borne(k)) / 2;
function construire() {
  const r = rue.getBoundingClientRect(), course = rue.offsetHeight - innerHeight;
  const p = reduit ? 1 : borne(-r.top / course);
  const rangs = pavés.children, n = rangs.length;
  for (let i = 0; i < n; i++) { const t0 = 0.02 + (n - 1 - i) / n * 0.2; for (const t of rangs[i].children) { const k = doux((p - t0 - t.dataset.j * 0.0045) / 0.035); t.style.opacity = k; t.style.transform = `translateY(${((1 - k) * 10).toFixed(2)}px)`; } }
  sol.style.opacity = doux((p - 0.27) / 0.1);
  pavés.style.display = p > 0.42 ? 'none' : '';
  for (const c of constructions) {
    const k = doux((p - c.debut) / 0.13);
    c.g.style.transform = `scaleY(${Math.max(0.001, k)})`; c.g.style.opacity = Math.min(1, k * 3);
    const lum = doux((p - c.debut - 0.1) / 0.06); c.lum.forEach(x => x.style.opacity = lum);
  }
  const kc = doux((p - 0.72) / 0.12);
  ciel.style.opacity = kc; details.forEach(d => d.style.opacity = doux((p - 0.8) / 0.08));
  $('#bd-voile').style.opacity = 1 - kc;
  const kd = 1 - doux(p / 0.08); if (entreeBas) { entreeBas.style.opacity = kd; entreeBas.style.visibility = kd < 0.02 ? 'hidden' : ''; }
  // parallaxe : au fil de la descente, le fond glisse moins vite que la rue
  const t = (p - 0.86) * 60;
  calques[0].style.transform = `translateY(${t * 0.8}px)`; calques[3].style.transform = `translateY(${-t * 0.5}px)`;
  const etaitVivante = vivante; vivante = p >= 0.86; scene.classList.toggle('vivante', vivante);
  $('#bd-indice').style.opacity = vivante && !survole ? 0.8 : 0;
  if (!vivante && etaitVivante) survoler(null);
  if (hero) { if (kc > 0.98 && !hero.paused) hero.pause(); else if (kc < 0.95 && hero.paused && heroLance) hero.play().catch(() => {}); }
}
let heroLance = true, attenteCadre = 0;
const entreeBas = document.querySelector('.entry-bottom'), masthead = document.querySelector('#masthead');
addEventListener('scroll', () => { if (!attenteCadre) attenteCadre = requestAnimationFrame(() => { attenteCadre = 0; construire(); }); }, { passive: true });

/* ── survol : la musique, le logo, les personnages qui dansent ── */
let survole = null;
const ratios = {}; LIEUX.forEach(l => { const im = new Image(); im.onload = () => ratios[l.id] = im.naturalWidth / im.naturalHeight; im.src = A + l.logo; });
function survoler(id) {
  if (id && !vivante) return;
  survole = id; son(id);
  svg.querySelectorAll('.bd-lieu').forEach(g => g.classList.toggle('actif', g.dataset.id === id));
  if (!id) { logo.classList.remove('vu'); $('#bd-indice').style.opacity = vivante ? 0.8 : 0; return; }
  $('#bd-indice').style.opacity = 0;
  const l = parId[id], r = scene.getBoundingClientRect(), hp = r.height * 0.07 * (l.id === 'lune' ? 0.75 : 1);
  logo.innerHTML = `<span class="bd-encre" style="width:${Math.min(hp * (ratios[id] || 2), r.width * 0.6)}px;height:${hp}px;--masque:url('${A + l.logo}')"></span>`;
  logo.classList.remove('vu'); void logo.offsetWidth; logo.classList.add('vu');
}

/* ── glisser à l'horizontale sur téléphone ── */
const glisse = { x0: null, vb0: 0, bouge: false };
scene.addEventListener('pointerdown', e => { if (e.pointerType !== 'touch' || aspect() >= 1) return; glisse.x0 = e.clientX; glisse.vb0 = vb[0]; glisse.bouge = false; });
addEventListener('pointermove', e => { if (glisse.x0 == null) return; const dx = e.clientX - glisse.x0; if (Math.abs(dx) > 8) glisse.bouge = true; cadrer(glisse.vb0 - dx / scene.getBoundingClientRect().width * vb[2]); });
addEventListener('pointerup', () => { glisse.x0 = null; setTimeout(() => glisse.bouge = false, 0); });

/* ── musique : chaque création a la sienne, elle entre en 4 s et s'éteint en 4 s ── */
let sonActif = true, deverrouille = false, voulu = null; const pistes = {};
const FONDU = 4000, VOLUME = 0.7;
function piste(id) {
  const l = parId[id]; if (!l || !l.son) return null;
  if (!pistes[id]) { const a = new Audio(A + l.son); a.loop = true; a.volume = 0; a.preload = 'auto'; const p = { a, de: 0, vers: 0, t0: 0 }; a.addEventListener('error', () => p.mort = true); pistes[id] = p; }
  return pistes[id].mort ? null : pistes[id];
}
function viser(p, cible) {
  if (!p || p.vers === cible) return;
  p.de = p.a.volume; p.vers = cible; p.t0 = performance.now();
  if (cible > 0) p.a.play().catch(() => {});
  const pas = t => { if (p.vers !== cible) return; const k = Math.min(1, (t - p.t0) / FONDU); p.a.volume = Math.max(0, Math.min(1, p.de + (cible - p.de) * doux(k))); if (k < 1) requestAnimationFrame(pas); else if (!cible) p.a.pause(); };
  requestAnimationFrame(pas);
}
function son(id) {
  voulu = id || null; if (!deverrouille) return;
  for (const [k, p] of Object.entries(pistes)) if (k !== voulu) viser(p, 0);
  if (voulu && sonActif) viser(piste(voulu), VOLUME);
}
$('#bd-son').addEventListener('click', () => { sonActif = !sonActif; $('#bd-son').setAttribute('aria-pressed', sonActif); if (!sonActif) Object.values(pistes).forEach(p => viser(p, 0)); else son(voulu); });

/* ── le seuil : la clé, « Cliquer pour entrer » ── */
function entrer() {
  deverrouille = true; $('#bd-seuil').classList.add('ouvert');
  LIEUX.forEach(l => piste(l.id));
  if (hero) { heroLance = true; hero.play().catch(() => {}); }
  son(voulu);
}
$('#bd-entrer').addEventListener('click', entrer);
if (new URLSearchParams(location.search).has('direct')) { $('#bd-seuil').classList.add('ouvert'); heroLance = true; addEventListener('pointerdown', () => { if (!deverrouille) entrer(); }, { once: true }); }

/* ── la page de chaque création ── */
const projet = $('#bd-projet');
let diapo = null;
function ouvrirProjet(id, depuisHash = false) {
  const l = parId[id]; if (!l) return;
  if (!depuisHash) history.pushState(null, '', '#projet-' + id);
  survoler(null);
  const i = LIEUX.findIndex(x => x.id === id), prec = LIEUX[(i + LIEUX.length - 1) % LIEUX.length], suiv = LIEUX[(i + 1) % LIEUX.length];
  const tete = l.video169 ? `<video autoplay muted loop playsinline src="${A + l.video169}"></video>` : `<div class="p-diapo">${l.photos.map((p, k) => `<img src="${A + p}" alt="" ${k ? 'loading="lazy"' : 'class="actif"'}>`).join('')}</div>`;
  projet.dataset.humeur = l.support;
  projet.innerHTML = `<button class="retour" type="button">← La rue</button>
    <header class="p-tete">${tete}<h1 class="p-logo"><span class="bd-encre" style="--masque:url('${A + l.logo}');--ratio:${ratios[id] || 2}"></span><span class="cinema-sr">${l.creation}</span></h1></header>
    <div class="p-corps">
      <p class="p-cap">${l.annee} · ${l.cadre}</p>
      <p class="p-resume">${l.resume}</p>
      <span class="p-orn" aria-hidden="true"></span>
      <div class="p-deux">
        <div class="p-recit"><p>${LOREM_LONG}</p><p>${LOREM_LONG}</p></div>
        <dl class="p-infos">${l.infos.map(([k, v]) => `<div><dt>${k}</dt><dd>${v}</dd></div>`).join('')}</dl>
      </div>
      <span class="p-orn" aria-hidden="true"></span>
      <div class="p-galerie">${l.photos.map(p => `<button type="button" aria-label="Agrandir la photo"><img src="${A + p}" alt="" loading="lazy"></button>`).join('')}</div>
      ${l.video169 ? `<div class="p-film"><video controls playsinline preload="metadata" src="${A + l.video169}"></video></div>` : ''}
      ${l.legende ? `<p class="p-legende">${l.legende}</p>` : ''}
      <nav class="p-suite"><button type="button" data-id="${prec.id}"><span>Précédent</span>${prec.creation}</button><button type="button" data-id="${suiv.id}" style="text-align:right"><span>Suivant</span>${suiv.creation}</button></nav>
    </div>`;
  projet.scrollTop = 0; projet.classList.add('ouvert'); document.documentElement.style.overflow = 'hidden';
  projet.querySelector('.retour').onclick = () => history.back();
  projet.querySelectorAll('.p-suite button').forEach(b => b.onclick = () => { history.replaceState(null, '', '#projet-' + b.dataset.id); ouvrirProjet(b.dataset.id, true); });
  projet.querySelectorAll('.p-galerie button').forEach(b => b.onclick = () => lumiere(b.querySelector('img').src));
  const film = projet.querySelector('.p-film video');
  if (film) { film.addEventListener('play', () => son(null)); film.addEventListener('pause', () => son(id)); }
  clearInterval(diapo); diapo = setInterval(() => { const ims = [...projet.querySelectorAll('.p-diapo img')]; if (ims.length < 2) return; const k = ims.findIndex(x => x.classList.contains('actif')); ims.forEach(x => x.classList.remove('actif')); ims[(k + 1) % ims.length].classList.add('actif'); }, 5500);
  son(id);
}
function fermerProjet() {
  projet.classList.remove('ouvert'); document.documentElement.style.overflow = ''; clearInterval(diapo);
  projet.querySelectorAll('video').forEach(v => v.pause()); son(null);
}
function lumiere(src) { const d = $('#bd-lumiere'); d.innerHTML = `<img src="${src}" alt="">`; d.classList.add('vu'); }
$('#bd-lumiere').onclick = () => $('#bd-lumiere').classList.remove('vu');
addEventListener('keydown', e => { if (e.key === 'Escape') { if ($('#bd-lumiere').classList.contains('vu')) $('#bd-lumiere').classList.remove('vu'); else if (projet.classList.contains('ouvert')) history.back(); } });
function selonHash() { const m = location.hash.match(/^#projet-(\w+)/); if (m && parId[m[1]]) ouvrirProjet(m[1], true); else if (projet.classList.contains('ouvert')) fermerProjet(); }
addEventListener('popstate', selonHash);
// les liens du site classique vers les anciennes pages ouvrent la page de la création
document.querySelectorAll('a[data-projet]').forEach(a => a.addEventListener('click', e => { e.preventDefault(); ouvrirProjet(a.dataset.projet); }));

/* ── démarrage ── */
dessiner(); cadrer(); construire(); selonHash();
addEventListener('resize', () => { cadrer(); construire(); });
window.__bd = { ouvrirProjet, survoler, boites, entrer, construire };
