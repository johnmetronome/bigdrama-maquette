import { SILHOUETTES, COULEURS, POLICES, solRue, FENETRES_CLOSE } from './silhouettes.js';
import { LIEUX, LOREM_LONG } from './lieux.js';

const A = '../';                                   // les médias de la maquette sont à la racine du dépôt
const NS = 'http://www.w3.org/2000/svg', $ = s => document.querySelector(s);
const reduit = matchMedia('(prefers-reduced-motion: reduce)').matches;
const el = (n, a = {}, p) => { const e = document.createElementNS(NS, n); for (const k in a) e.setAttribute(k, a[k]); if (p) p.appendChild(e); return e; };
const parId = Object.fromEntries(LIEUX.map(l => [l.id, l]));
const S = SILHOUETTES.rue;
const ACCROCHES = {
 maison:'Un cabaret anti-militariste et féministe en 1917', serre:'Enquête en ligne',
 scatolina:'Conte onirique à Venise', bar:'Comédie musicale',
 creche:'Fable contemporaine', cimetiere:'Comédie musicale immersive',
 lune:'Première création immersive pour The Family', tour:'Création privée pour My Little Paris',
 arbre:'Création immersive pour Bacardi', usine:'Création privée avec Grimbergen'
};
const ANCRES = {cimetiere:[98,606],tour:[278,640],maison:[490,640],serre:[690,670],usine:[820,668],bar:[970,700],creche:[1125,698],arbre:[1240,732]};
const EDIT_KEY = 'bigdrama-v8-reglages-1';
let reglages = {};
try { reglages = JSON.parse(localStorage.getItem(EDIT_KEY) || '{}'); } catch {}
const poses = {}, zones = {}, bases = {}, posesDevant = {};
let edition = new URLSearchParams(location.search).has('edit'), selection = 'maison';
for (const l of LIEUX) bases[l.id] = {...l.placement};
const config = id => ({...bases[id], y:10, titre:parId[id].creation, phrase:ACCROCHES[id], ...reglages[id]});
const proprietaire = id => id;
function placer(id) {
 const l = parId[id], c = config(id), pose = poses[id]; if (!pose) return;
 const ancre = ANCRES[id];
 if(id==='cimetiere'){const elev=pose.parentElement.parentElement;elev.style.transformBox='view-box';elev.style.transformOrigin=`${c.x}px ${solRue(c.x)+c.y}px`;}
 if (ancre) pose.setAttribute('transform',`translate(${c.x} ${solRue(c.x)+c.y}) scale(${c.s}) translate(${-ancre[0]} ${-ancre[1]})`);
 else { const b = zones[id]; pose.setAttribute('transform',`translate(${c.x || 0} ${c.y-10}) translate(${b.x+b.width/2} ${b.y+b.height}) scale(${c.s}) translate(${-b.x-b.width/2} ${-b.y-b.height})`); }
 copierDevant(id);
}
function copierDevant(id) { const p = poses[id], d = posesDevant[id]; if (p && d) d.setAttribute('transform', p.getAttribute('transform') || ''); }
function rafraichirPlacement(id) {
 const owner = proprietaire(id); placer(owner);
 const pose = poses[owner], g=pose.closest('.bd-lieu');
 const b=owner==='scatolina'?{x:1359,y:709,width:195,height:123}:pose.getBBox(), m=pose.transform.baseVal.consolidate()?.matrix;
 if(m){ const p1=new DOMPoint(b.x,b.y).matrixTransform(m), p2=new DOMPoint(b.x+b.width,b.y+b.height).matrixTransform(m); const z=g.querySelector(':scope > .bd-zone'); z.setAttribute('x',p1.x-4); z.setAttribute('y',p1.y-4); z.setAttribute('width',p2.x-p1.x+8); z.setAttribute('height',p2.y-p1.y+8); boites[owner]=[p1.x,p1.y,p2.x,p2.y]; const cons=constructions.find(c=>c.id===owner); if(cons){cons.boite={x:p1.x,y:p1.y,width:p2.x-p1.x,height:p2.y-p1.y};cons.gradient.setAttribute('y1',p2.y+1.5);cons.gradient.setAttribute('y2',p2.y-.5);const masque=scene.querySelector('#revelation-'+owner);masque.setAttribute('x',p1.x-300);masque.setAttribute('y',p1.y-500);masque.setAttribute('width',p2.x-p1.x+600);masque.setAttribute('height',p2.y-p1.y+1000);const rect=masque.querySelector('rect');for(const k of ['x','y','width','height'])rect.setAttribute(k,masque.getAttribute(k));} }
 construire(); placerPops();
}

const scene = $('#bd-scene'), svg = $('#bd-svg'), logo = $('#bd-logo'), rue = $('#rue'), hero = $('#entry-film');
let boites = {}, vb = [0, 0, 1600, 900], vivante = false;

/* ── la vue suit le format de l'écran ── */
const aspect = () => { const r = scene.getBoundingClientRect(); return r.width / r.height; };
const promenadeMobile=()=>false; // v8 : plus de promenade au défilement, on glisse la rue du doigt
const portrait=()=>aspect()<1;
let chapitreMobile=null,hauteurMobile=1080,decalageMobile=0;
const ETAPES_MOBILE=[['cimetiere',122],['tour',374],['maison',627],['serre',846],['usine',973],['bar',1106],['creche',1250],['arbre',1380],['scatolina',1452]];
function cadrer(x) { if (!scene.getBoundingClientRect().width) return; const a = aspect(); if(portrait()){const h=950,w=h*a;const x0=Math.max(-110,Math.min(1760-w,x??-60));vb=[x0,-90,w,h];svg.setAttribute('viewBox',vb.join(' '));placerPops();return;} if(promenadeMobile()&&!edition){const h=hauteurMobile,w=h*a;vb=[x??-80,900-h+decalageMobile,w,h];svg.setAttribute('viewBox',vb.join(' '));return;} if (a >= 1.3) { const h = Math.max(980,1780/a), w = h*a; vb = [(1600-w)/2,Math.min(900-h,-105),w,h]; svg.setAttribute('viewBox',vb.join(' ')); placerPops(); return; } const w = Math.min(1600, 900 * a), h = w / a; vb = [Math.min(1600 - w, Math.max(0, x ?? (a < 1 ? 627 - w / 2 : (1600 - w) / 2))), 900 - h, w, h]; svg.setAttribute('viewBox', vb.join(' ')); }
const versEcran = (x, y) => { const r = scene.getBoundingClientRect(); return [(x - vb[0]) / vb[2] * r.width, (y - vb[1]) / vb[3] * r.height]; };

/* ── dessin ── */
let filEros=null, marcheEros=null;
const calques = {}, constructions = [], details = [];
let sol, ciel, numeroForme = 0;
function forme(fm, parent) {
  if (fm.groupe) {
    const g = el('g', {class: fm.classe || ''}, parent); if(fm.transform)g.setAttribute('transform',fm.transform);
    if (fm.clip) { const id = 'clip-' + (++numeroForme); const cp = el('clipPath', {id, clipPathUnits:'userSpaceOnUse'}, defs); el('path', {d:fm.clip}, cp); g.setAttribute('clip-path', `url(#${id})`); }
    const contenu = fm.anim ? el('g', {class:'a-' + fm.anim}, g) : g;
    if (fm.centre) contenu.style.transformOrigin = `${fm.centre[0]}px ${fm.centre[1]}px`;
    fm.groupe.forEach(f => forme(f, contenu)); return g;
  }
  if (fm.texte) {
    const t = el('text', { fill: COULEURS[fm.fill], 'font-family': POLICES[fm.police || 'enseigne'], 'font-size': fm.taille, 'font-weight': fm.gras || 400, 'letter-spacing': fm.espacement || 0, 'text-anchor': 'middle' }, parent);
    if (fm.arc) { const id = 'arc-' + Math.random().toString(36).slice(2, 8); el('path', { id, d: fm.arc, fill: 'none' }, defs); const tp = el('textPath', { href: '#' + id, startOffset: '50%' }, t); tp.textContent = fm.texte; }
    else { t.setAttribute('x', fm.x); t.setAttribute('y', fm.y); if (fm.rot) t.setAttribute('transform', `rotate(${fm.rot} ${fm.x} ${fm.y})`); t.textContent = fm.texte; }
    return t;
  }
  if (fm.image) {
    // v8.10 · sur téléphone la rue est masquée : ses images ne se chargent que si elle apparaît
    const im = el('image', { x: fm.x, y: fm.y, width: fm.w, height: fm.h, preserveAspectRatio: 'xMidYMid meet', filter: fm.brut ? 'none' : `url(#neon-${fm.neon || 'or'})` }, parent);
    if (sansRue()) im.dataset.href = A + fm.image; else im.setAttribute('href', A + fm.image);
    if (fm.classe) im.setAttribute('class', fm.classe);
    if (fm.anim && !reduit) im.classList.add('a-' + fm.anim);
    return im;
  }
  if (fm.transform) parent = el('g', { transform: fm.transform }, parent);
  const p = el('path', { d: fm.d, fill: fm.fill?.startsWith('url(') ? fm.fill : fm.fill === 'none' ? 'none' : COULEURS[fm.fill] }, parent);
  if (fm.classe) p.classList.add(...fm.classe.split(/\s+/));
  if (fm.stroke) { p.setAttribute('stroke', COULEURS[fm.stroke]); p.setAttribute('stroke-width', fm.epaisseur || 1); p.setAttribute('stroke-linejoin', 'round'); }
  if (fm.opacite != null) p.setAttribute('fill-opacity', fm.opacite);
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
  neon('neon-bleu', COULEURS.neonBleu, 1.6); neon('neon-or', COULEURS.neonOr, 1.2); neon('neon-jaune', COULEURS.lumiere, 1.5);
  const phareFondu=el('linearGradient',{id:'bd-phare-fondu',gradientUnits:'userSpaceOnUse',x1:1523,y1:661,x2:1080,y2:661},defs);
 [['0%','.22'],['45%','.13'],['80%','.04'],['100%','0']].forEach(([offset,opacity])=>el('stop',{offset,'stop-color':COULEURS.lumiere,'stop-opacity':opacity},phareFondu));
  const nuit = el('linearGradient', {id:'bd-nuit', x1:'0%', y1:'0%', x2:'0%', y2:'100%'}, defs); [['0%','#101e2b'],['60%','#203a47'],['100%','#53615e']].forEach(([offset,color]) => el('stop',{offset,'stop-color':color},nuit));
  [0, 1, 2, 3].forEach(n => calques[n] = el('g', { 'data-plan': n }, svg));
  // le ciel, le sol, les pavés
  for (const fm of S.decor) {
    const enveloppe = fm.fill === 'jaune' || (fm.fill === 'noir' && (fm.plan ?? 0) === 1) ? calques[fm.plan ?? 0] : el('g', {}, calques[fm.plan ?? 0]);
    const p = forme(fm, enveloppe);
    if (fm.fill === 'jaune') { ciel = p; p.setAttribute('fill','url(#bd-nuit)'); } else if (fm.fill === 'noir' && (fm.plan ?? 0) === 1) { sol = p; p.setAttribute('fill', '#000'); } else details.push(enveloppe);
  }
  // les lieux, posés à leur place, du plus grand au plus petit pour que les petits restent survolables
  const tmp = el('g', {}, svg);
  const ordre = [...LIEUX].sort((a, b) => (a.placement.x ?? 2000) - (b.placement.x ?? 2000));
  ordre.forEach((l, rangLieu) => {
    const g = el('g', { class: 'bd-lieu', 'data-id': l.id, tabindex: 0, role: 'button', 'aria-label': l.creation }, calques[l.scene.plan]);
    const elev = el('g', { class: 'bd-elev' }, g), cons = el('g', { class: 'bd-construction' }, elev), pose = el('g', {}, cons);
    const gDevant = el('g', { class: 'bd-devant', 'data-id': l.id }, calques[l.scene.plan]), poseDevant = el('g', {}, gDevant); posesDevant[l.id] = poseDevant;
    S.lieux[l.id].forEach(fm => forme(fm, fm.devant ? poseDevant : pose));
    poses[l.id]=pose; zones[l.id]=pose.getBBox(); placer(l.id); copierDevant(l.id);
    const b = g.getBBox();
    if(l.id==='arbre'){const c=config(l.id);b.x=c.x-48*c.s;b.y=solRue(c.x)+c.y-280*c.s;b.width=130*c.s;b.height=290*c.s;}
    const masqueId = 'revelation-' + l.id, gradientId = 'degrade-' + l.id;
    const grad = el('linearGradient', {id:gradientId,gradientUnits:'userSpaceOnUse',x1:0,x2:0,y1:b.y,y2:b.y+50},defs);
    grad.setAttribute('y1', b.y + b.height + 1.5); grad.setAttribute('y2', b.y + b.height - .5);
    el('stop',{offset:'0%','stop-color':'black'},grad); el('stop',{offset:'100%','stop-color':'white'},grad);
    const masque = el('clipPath',{id:masqueId,clipPathUnits:'userSpaceOnUse'},defs);
    el('rect',{x:b.x-400,y:b.y-1200,width:b.width+800,height:b.height+1201.5},masque);
    if(l.id==='cimetiere')g.setAttribute('aria-label','Norma, mausolée et cierges');
    let hit=b;
    if(l.id==='scatolina'){
      const m=pose.transform.baseVal.consolidate()?.matrix||new DOMMatrix();
      const a=new DOMPoint(1359,709).matrixTransform(m),z=new DOMPoint(1554,832).matrixTransform(m);
      hit={x:a.x,y:a.y,width:z.x-a.x,height:z.y-a.y};
    }
    boites[l.id] = [hit.x, hit.y, hit.x + hit.width, hit.y + hit.height];
    g.insertBefore(el('rect', { class: 'bd-zone', x: hit.x - 4, y: hit.y - 4, width: hit.width + 8, height: hit.height + 8 }), g.firstChild);
    constructions.push({id:l.id,g:cons,elev, gradient:grad, boite:b, rang:rangLieu, lune:l.id === 'lune'});
    if (l.id === 'maison') FENETRES_CLOSE.forEach(([x,y,w,h],k) => { const z = el('rect',{class:'bd-fen-zone',x,y,width:w,height:h,'data-k':k},pose); z.addEventListener('pointerenter',e=>{ if(e.pointerType!=='touch') chanter(k); }); z.addEventListener('pointerleave',e=>{ if(e.pointerType!=='touch') chanter(null); }); });
    g.addEventListener('pointerenter', e => { if (!promenadeMobile()&&e.pointerType !== 'touch') survoler(l.id); });
    g.addEventListener('pointerleave', e => { if (!promenadeMobile()&&e.pointerType !== 'touch') survoler(null); });
    g.addEventListener('focus', () => survoler(l.id)); g.addEventListener('blur', () => survoler(null));
    g.addEventListener('click', e => { if (edition) { choisir(l.id); return; } if (!vivante || glisse.bouge) return; if (e.pointerType === 'touch' && arme !== l.id) { arme = l.id; survoler(l.id); return; } allerVersBanniere(l.id); });
    g.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); if(edition) choisir(l.id); else allerVersBanniere(l.id); } });
  });
  tmp.remove();
  // v8.7 · livre animé : chaque maison devient un feuillet (un SVG à elle), posé sur la scène en 3D et plié sur sa charnière au sol
  const livre = $('#bd-livre') || scene;
  for (const g of [...scene.querySelectorAll('svg#bd-svg .bd-lieu, svg#bd-svg .bd-devant')]) {
    const devant = g.classList.contains('bd-devant'); if (devant && !g.querySelector('*:not(g)')) { g.remove(); continue; }
    const id = g.dataset.id, div = document.createElement('div'), feuille = el('svg', { class: 'bd-pop-svg', preserveAspectRatio: 'none' });
    const c = constructions.find(c => c.id === id), rang = c?.rang ?? 0;
    div.className = 'bd-pop' + (devant ? ' bd-pop-devant' : ''); div.dataset.id = id; div.style.setProperty('--rang', rang);
    if (devant) feuille.setAttribute('aria-hidden', 'true');
    div.append(feuille); feuille.append(g); livre.append(div);
    pops[id + (devant ? '~devant' : '')] = { div, feuille, g, b: null, devant };
  }
}
const pops = {};
function placerPops() {
  const marge = 40;
  for (const id in pops) {
    const p = pops[id]; let b = null;
    try { const m = p.g.getBBox(); if (m.width) b = { x: m.x, y: m.y, width: m.width, height: m.height }; } catch {}
    b = b || p.b; if (!b) continue; p.b = b;
    p.div.style.setProperty('--entree', (b.x + b.width / 2 < 760 ? -1 : 1) * 115 + 'vw');
    const x = b.x - marge, y = b.y - marge, w = b.width + 2 * marge, h = b.height + 2 * marge;
    p.feuille.setAttribute('viewBox', `${x} ${y} ${w} ${h}`);
    Object.assign(p.div.style, { left: (x - vb[0]) / vb[2] * 100 + '%', top: (y - vb[1]) / vb[3] * 100 + '%', width: w / vb[2] * 100 + '%', height: h / vb[3] * 100 + '%', transformOrigin: `50% ${((h - marge) / h * 100).toFixed(2)}%` });
  }
}
let arme = null;

/* ── la construction au défilement : pavé par pavé, puis les maisons, puis le ciel ── */
const borne = v => Math.max(0, Math.min(1, v)), doux = k => 0.5 - Math.cos(Math.PI * borne(k)) / 2;
// v8 : deux étapes nettes. Le film, puis un seul geste fait monter la rue. Les maisons sortent de terre une à une, en deux secondes.
let debutConstruction = null, construite = false;
const rebond = k => { const c = 1.15; return 1 + (c + 1) * Math.pow(k - 1, 3) + c * Math.pow(k - 1, 2); }; // v8.6 : le pli du papier qui se redresse et se pose
// v8.8 · trois façons d'apparaître, au choix dans l'adresse : ?apparition=pop (défaut), ?apparition=livre, ?apparition=coulisses
const APPARITION = (new URLSearchParams(location.search).get('apparition') || 'pop').replace(/[^a-z]/g, '');
// v8.9 · encre, lanterne, rideau, ville. ?apparition=pop garde le livre animé de la V8.7.
// v8.12 · plume (défaut) : les immeubles sont là, noirs. Un dessin au trait crème monte du sol sur chacun, puis s'efface, et les fenêtres s'allument au fur et à mesure
const MODES = ['plume', 'encre', 'lanterne', 'rideau', 'ville', 'pop'];
scene.dataset.apparition = MODES.includes(APPARITION) ? APPARITION : 'plume';
if (!new URLSearchParams(location.search).get('apparition')) scene.dataset.apparition = 'plume';
const DUREE_DEPLI = { plume: 6000, encre: 7200, lanterne: 4600, rideau: 5000, ville: 5400, pop: 4400 }[scene.dataset.apparition];
const PLUME = { montee: 2400, ecart: 110 };   // plume (ms) : durée de la montée du trait sur un immeuble, écart entre deux immeubles
// préparation : chaque trait connaît sa longueur (encre), chaque fenêtre reçoit son instant d'allumage (ville, rideau)
const ALLUMES = ['#FFE34D', '#D6AEB6', '#F5F3EE', '#DDD0AD', '#F37021'];
function preparerApparition() {
  const mode = scene.dataset.apparition, des = s => { let x = Math.sin(s * 91.7) * 43758.5; return x - Math.floor(x); };
  let n = 0;
  scene.classList.add('bd-sans-transition');
  for (const id in pops) {
    const p = pops[id], rang = +p.div.style.getPropertyValue('--rang') || 0;
    if (mode === 'encre') p.g.querySelectorAll('path:not(.bd-zone):not(.bd-fleur-tige)').forEach(e => {
      e.setAttribute('pathLength', '1'); e.classList.add('bd-encre');
      e.style.setProperty('--fo', e.getAttribute('fill-opacity') || 1);
      if (e.getAttribute('stroke')) { e.classList.add('bd-trait-propre'); e.style.setProperty('--so', e.getAttribute('stroke-opacity') || 1); }
    });
    if (mode === 'ville' || mode === 'rideau') p.g.querySelectorAll('path, image, text').forEach(e => {
      const f = (e.getAttribute('fill') || '').toUpperCase();
      if (e.tagName !== 'path' || ALLUMES.includes(f)) { e.classList.add('bd-lumiere-fen'); e.style.setProperty('--dl', mode === 'ville' ? (des(++n) * 2600).toFixed(0) + 'ms' : (rang * 230 + des(++n) * 500 + 1700).toFixed(0) + 'ms'); }
    });
  }
  // plume : chaque lumière s'allume quand le trait qui monte du sol l'atteint
  if (mode === 'plume') {
    const mesures = [];
    for (const id in pops) {
      const p = pops[id], pr = p.div.getBoundingClientRect(), rang = +p.div.style.getPropertyValue('--rang') || 0;
      p.g.querySelectorAll('path, image, text').forEach(e => {
        const c = (e.getAttribute('fill') || '').toUpperCase();
        if (e.tagName === 'path' && !ALLUMES.includes(c)) return;
        const r = e.getBoundingClientRect();
        const h = pr.height ? Math.max(0, Math.min(1, (pr.bottom - r.top - r.height / 2) / pr.height)) : .5;
        mesures.push([e, rang * PLUME.ecart + h * PLUME.montee + 120]);
      });
    }
    for (const [e, t] of mesures) {
      e.classList.add('bd-lumiere-fen'); e.style.setProperty('--dl', (t + des(++n) * 260).toFixed(0) + 'ms');
      if (e.tagName === 'path') e.style.setProperty('--fo', e.getAttribute('fill-opacity') || 1);
    }
    // le calque du dessin : une copie au trait de chaque feuillet, révélée du sol vers le haut
    for (const id in pops) {
      const p = pops[id]; if (p.trait) continue;
      const t = p.feuille.cloneNode(true); t.setAttribute('class', 'bd-trait-calque'); t.setAttribute('aria-hidden', 'true');
      t.querySelectorAll('[id]').forEach(e => e.removeAttribute('id'));
      t.querySelectorAll('image, .bd-zone').forEach(e => e.remove());
      t.querySelectorAll('[class]').forEach(e => e.setAttribute('class', '')); t.querySelectorAll('[filter]').forEach(e => e.removeAttribute('filter'));
      t.querySelectorAll('path, rect, circle, ellipse, polygon, polyline, line, text').forEach(e => {
        e.removeAttribute('style'); e.setAttribute('fill', 'none'); e.setAttribute('stroke', '#efe1b4'); e.setAttribute('stroke-width', '1'); e.setAttribute('vector-effect', 'non-scaling-stroke'); e.removeAttribute('filter');
      });
      p.div.append(t); p.trait = t;
    }
  }
  void scene.offsetWidth; scene.classList.remove('bd-sans-transition');
}
function rejouerApparition() {
  scene.classList.add('bd-sans-transition');
  scene.classList.remove('deplie', 'construite', 'vivante'); construite = false; debutConstruction = null; vivante = false;
  void scene.offsetWidth; scene.classList.remove('bd-sans-transition');
  requestAnimationFrame(() => requestAnimationFrame(() => lancerConstruction()));
}
function lancerConstruction() { if (debutConstruction !== null) return; debutConstruction = performance.now(); scene.classList.add('deplie'); document.documentElement.classList.add('bd-construit-en-cours'); const tic = () => { construire(); if (!construite) requestAnimationFrame(tic); }; requestAnimationFrame(tic); }
function construire() {
  const T = edition || reduit ? Infinity : debutConstruction === null ? -1 : performance.now() - debutConstruction;
  if (T >= DUREE_DEPLI && !construite) { construite = true; scene.classList.add('deplie', 'construite'); }
  ciel.style.opacity = 1; details.forEach(d => d.style.opacity = 1); $('#bd-voile').style.opacity = 0;
  if (construite) document.documentElement.classList.remove('bd-construit-en-cours');
  const etaitVivante = vivante; vivante = edition || construite || T > 1800; scene.classList.toggle('vivante', vivante);
  $('#bd-indice').style.opacity = vivante && !survole ? 0.8 : 0;
  if (!vivante && etaitVivante) survoler(null);
}
let heroLance = true, attenteCadre = 0;
const entreeBas = document.querySelector('.entry-bottom'), masthead = document.querySelector('#masthead');
addEventListener('scroll', () => { if (!attenteCadre) attenteCadre = requestAnimationFrame(() => { attenteCadre = 0; suivreDefilement(); }); }, { passive: true });
function suivreDefilement() {
  const r = (sansRue() ? $('#content') : rue).getBoundingClientRect();
  if (!sansRue() && r.top < innerHeight * .2 && !glisseEnCours) lancerConstruction();
  const kd = 1 - doux(scrollY / (innerHeight * .25)); if (entreeBas) { entreeBas.style.opacity = kd; entreeBas.style.visibility = kd < 0.02 ? 'hidden' : ''; }
  if (hero) { const couvert = r.top <= 1; if (couvert && !hero.paused) hero.pause(); else if (!couvert && hero.paused && heroLance && deverrouille) hero.play().catch(() => {}); }
}

/* ── survol : la musique, le logo, les personnages qui dansent ── */
let survole = null;
const ratios = {}; LIEUX.forEach(l => { const im = new Image(); im.onload = () => ratios[l.id] = im.naturalWidth / im.naturalHeight; im.src = A + l.logo; });
function survoler(id) {
  if (id && !vivante) return;
  survole = id; son(id);
  scene.querySelectorAll('.bd-lieu,.bd-pop').forEach(g => g.classList.toggle('actif', g.dataset.id === proprietaire(id)));
  if (!id) { logo.classList.remove('vu'); $('#bd-indice').style.opacity = vivante ? 0.8 : 0; return; }
  $('#bd-indice').style.opacity = 0;
  const c = config(id);
  logo.replaceChildren();
  const titre=document.createElement('span');titre.className='bd-hover-logo';titre.setAttribute('role','img');titre.setAttribute('aria-label',c.titre);
  const ratio=ratios[id]||2, largeur=Math.min(260,Math.sqrt(9000*ratio),70*ratio);
  titre.style.width=largeur+'px';titre.style.height=(largeur/ratio)+'px';titre.style.setProperty('--masque',`url('${A+parId[id].logo}')`);
  const phrase=document.createElement('span');phrase.className='bd-hover-phrase';phrase.textContent=c.phrase;
  logo.append(titre,phrase);
  logo.classList.remove('vu'); void logo.offsetWidth; logo.classList.add('vu');
}

/* ── glisser à l'horizontale sur téléphone ── */
const glisse = { x0: null, vb0: 0, bouge: false };
scene.addEventListener('pointerdown', e => { if (promenadeMobile() || e.pointerType !== 'touch' || aspect() >= 1) return; glisse.x0 = e.clientX; glisse.vb0 = vb[0]; glisse.bouge = false; });
addEventListener('pointermove', e => { if (glisse.x0 == null) return; const dx = e.clientX - glisse.x0; if (Math.abs(dx) > 8) glisse.bouge = true; cadrer(glisse.vb0 - dx / scene.getBoundingClientRect().width * vb[2]); });
addEventListener('pointerup', () => { glisse.x0 = null; setTimeout(() => glisse.bouge = false, 0); });

/* ── musique : chaque création a la sienne, elle entre en 4 s et s'éteint en 4 s ── */
let sonActif = true, deverrouille = false, voulu = null; const pistes = {};
const FONDU = 4000, VOLUME = 0.15; // v8.1 : les musiques restent très discrètes, 15 % au maximum
const NB_CHANSONS_CLOSE = 8; // sons/close/chanson-01.mp3 … 08 : une chanson du spectacle par fenêtre (les 20 fenêtres se partagent les 8)
const srcPiste = id => { const m = /^close-(\d+)$/.exec(id); if (m) return `sons/close/chanson-${String(+m[1] % NB_CHANSONS_CLOSE + 1).padStart(2, '0')}.mp3`; return parId[id]?.son; };
let ctxAudio = null;
function audioCtx() { try { if (!ctxAudio) { const C = window.AudioContext || window.webkitAudioContext; if (C) ctxAudio = new C(); } if (ctxAudio && ctxAudio.state === 'suspended') ctxAudio.resume(); } catch { ctxAudio = null; } return ctxAudio; }
const niveau = (p, v) => { p.niveau = v; if (p.g) p.g.gain.value = v; else p.a.volume = v; };
function piste(id) {
  const src = srcPiste(id); if (!src) return null;
  if (!pistes[id]) { const a = new Audio(A + src); a.loop = true; a.volume = 0; a.preload = 'none'; /* chargée au premier survol seulement */ const p = { a, de: 0, vers: 0, t0: 0, niveau: 0 };
    const c = deverrouille && audioCtx(); if (c) { try { const s = c.createMediaElementSource(a), g = c.createGain(); g.gain.value = 0; s.connect(g); g.connect(c.destination); p.g = g; a.volume = 1; } catch {} } a.addEventListener('error', () => { p.mort = true; if (voulu === id) son(id); }); pistes[id] = p; }
  return pistes[id].mort ? null : pistes[id];
}
function viser(p, cible) {
  if (!p || p.vers === cible) return;
  p.de = p.niveau; p.vers = cible; p.t0 = performance.now();
  if (cible > 0) p.a.play().catch(() => {});
  const pas = t => { if (p.vers !== cible) return; const k = Math.min(1, (t - p.t0) / FONDU); niveau(p, Math.max(0, Math.min(1, p.de + (cible - p.de) * doux(k)))); if (k < 1) requestAnimationFrame(pas); else if (!cible) p.a.pause(); };
  requestAnimationFrame(pas);
}
function son(id) {
  voulu = id || null; if (!deverrouille) return;
  let cle = voulu; if (cle && cle.startsWith('close-') && !piste(cle)) cle = 'maison';
  for (const [k, p] of Object.entries(pistes)) if (k !== cle) viser(p, 0);
  if (cle && sonActif) viser(piste(cle), VOLUME);
}
$('#bd-son').addEventListener('click', () => { sonActif = !sonActif; $('#bd-son').setAttribute('aria-pressed', sonActif); if (!sonActif) Object.values(pistes).forEach(p => viser(p, 0)); else son(voulu); });

/* ── le seuil : la clé, « Cliquer pour entrer » ── */
function entrer() {
  deverrouille = true; audioCtx(); $('#bd-seuil').classList.add('ouvert');
  if (hero) { hero.muted = true; heroLance = true; hero.play().catch(() => {}); } // v8.2 : le film d'accueil reste muet
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
  const tete = l.video169 ? `<video autoplay muted loop playsinline><source media="(max-width:900px)" src="${A}v8/assets/opt/videos/${l.video169.split('/').pop().replace('.mp4', '-540.mp4')}" type="video/mp4"><source src="${A + l.video169}" type="video/mp4"></video>` : `<div class="p-diapo">${l.photos.map((p, k) => `<img src="${A + p}" alt="" ${k ? 'loading="lazy"' : 'class="actif"'}>`).join('')}</div>`;
  projet.dataset.humeur = l.support;
  projet.innerHTML = `<button class="retour" type="button">← Home</button>
    <header class="p-tete">${tete}<h1 class="p-logo"><span class="bd-encre" style="--masque:url('${A + l.logo}');--ratio:${ratios[id] || 2}"></span><span class="cinema-sr">${l.creation}</span></h1></header>
    <div class="p-corps">
      <p class="p-cap">${l.annee} · ${l.cadre}</p>
      <p class="p-resume">${l.resume}</p>
      <div class="p-deux">
        <dl class="p-infos">${l.infos.map(([k, v]) => `<div><dt>${k}</dt><dd>${v}</dd></div>`).join('')}</dl>
      </div>
      <div class="p-galerie">${l.photos.map(p => `<button type="button" aria-label="Agrandir la photo"><img src="${A + p}" alt="" loading="lazy"></button>`).join('')}</div>
      
      ${l.legende ? `<p class="p-legende">${l.legende}</p>` : ''}
      <nav class="p-suite"><button type="button" data-id="${prec.id}"><span>Précédent</span>${prec.creation}</button><button type="button" data-id="${suiv.id}" style="text-align:right"><span>Suivant</span>${suiv.creation}</button></nav>
    </div>`;
  if (!projet.classList.contains('ouvert')) declencheur = document.activeElement;
  projet.setAttribute('aria-label', l.creation);
  projet.scrollTop = 0; projet.classList.add('ouvert'); document.documentElement.style.overflow = 'hidden';
  $('#page')?.setAttribute('inert', ''); setTimeout(() => projet.querySelector('.retour')?.focus({ preventScroll: true }), 60);
  projet.querySelector('.retour').onclick = () => { history.replaceState(null,'','#rue'); fermerProjet(); };
  projet.querySelectorAll('.p-suite button').forEach(b => b.onclick = () => { history.replaceState(null, '', '#projet-' + b.dataset.id); ouvrirProjet(b.dataset.id, true); });
  projet.querySelectorAll('.p-galerie button').forEach(b => b.onclick = () => lumiere(b.querySelector('img').src));
  const film = projet.querySelector('.p-film video');
  if (film) { film.addEventListener('play', () => son(null)); film.addEventListener('pause', () => son(id)); }
  clearInterval(diapo); diapo = setInterval(() => { const ims = [...projet.querySelectorAll('.p-diapo img')]; if (ims.length < 2) return; const k = ims.findIndex(x => x.classList.contains('actif')); ims.forEach(x => x.classList.remove('actif')); ims[(k + 1) % ims.length].classList.add('actif'); }, 5500);
  son(id);
}
let declencheur = null;
function fermerProjet() {
  projet.classList.remove('ouvert'); document.documentElement.style.overflow = ''; clearInterval(diapo);
  $('#page')?.removeAttribute('inert'); if (declencheur && document.contains(declencheur)) declencheur.focus({ preventScroll: true }); declencheur = null;
  projet.querySelectorAll('video').forEach(v => v.pause()); son(null);
}
function lumiere(src) { const d = $('#bd-lumiere'); d.innerHTML = `<img src="${src}" alt="">`; d.classList.add('vu'); }
$('#bd-lumiere').onclick = () => $('#bd-lumiere').classList.remove('vu');
addEventListener('keydown', e => { if (e.key === 'Escape') { if ($('#bd-lumiere').classList.contains('vu')) $('#bd-lumiere').classList.remove('vu'); else if (projet.classList.contains('ouvert')) history.back(); } });
function selonHash() { const m = location.hash.match(/^#projet-(\w+)/); if (m && parId[m[1]]) ouvrirProjet(m[1], true); else if (projet.classList.contains('ouvert')) fermerProjet(); }
addEventListener('popstate', selonHash);
// les liens du site classique vers les anciennes pages ouvrent la page de la création
document.querySelectorAll('a[data-projet]').forEach(a => a.addEventListener('click', e => { e.preventDefault(); ouvrirProjet(a.dataset.projet); }));

document.querySelector('#site-navigation').prepend($('#bd-son'));
/* ── démarrage ── */
dessiner(); dessinerFil(); cadrer(); construire(); suivreDefilement(); selonHash();
preparerApparition();
{ const q = new URLSearchParams(location.search);
  if (q.has('rue')) { if (hero) { hero.pause(); hero.querySelectorAll('source').forEach(x => x.removeAttribute('src')); hero.removeAttribute('src'); hero.load(); } scrollTo({ top: rue.offsetTop, behavior: 'instant' }); setTimeout(lancerConstruction, 600); }
  if (q.has('boucle')) setInterval(rejouerApparition, DUREE_DEPLI + 3500); }
if ('IntersectionObserver' in window) new IntersectionObserver(es => { if (es.some(e => e.isIntersecting && e.intersectionRatio > .5)) lancerConstruction(); }, { threshold: [.5, .8] }).observe(rue);
const secours = setInterval(() => { if (construite) { clearInterval(secours); return; } if (debutConstruction !== null && performance.now() - debutConstruction > DUREE_DEPLI + 1500) { debutConstruction = -1e9; construire(); } }, 1000); if (location.hash === '#rue' || scrollY >= rue.offsetTop - 4) lancerConstruction();
addEventListener('resize', () => { cadrer(); construire(); suivreDefilement(); if (!sansRue()) chargerImagesRue(); });
// v8.10 · économies : images de la rue au premier affichage, animations de la rue en pause quand elle est hors de l'écran
function chargerImagesRue() { scene.querySelectorAll('image[data-href]').forEach(i => { i.setAttribute('href', i.dataset.href); i.removeAttribute('data-href'); }); }
if ('IntersectionObserver' in window) new IntersectionObserver(es => document.documentElement.classList.toggle('bd-rue-cachee', !es[es.length - 1].isIntersecting), { rootMargin: '80px' }).observe(rue);
document.querySelectorAll('[data-veillee]').forEach(b => b.onclick = () => { location.href=new URL('../v7/la-veillee/',location.href).href; });
$('#bd-veillee button').onclick = () => $('#bd-veillee').close();
initialiserEditeur();
if (/[?&](edit|debug)\b/.test(location.search)) window.__bd = { ouvrirProjet, survoler, boites, entrer, construire, glisserVers, lancerConstruction, allerVersBanniere, chanter }; // outils de test seulement

function choisir(id) {
 selection=id; $('#bd-edit-select').value=id;
 const c=config(id), pose=config(proprietaire(id));
 for(const [nom,valeur] of Object.entries({x:pose.x||0,y:pose.y,s:pose.s,titre:c.titre,phrase:c.phrase})) $('#bd-edit-'+nom).value=valeur;
 $('#bd-edit-lien').textContent='';
 scene.classList.add('en-edition');
 scene.querySelectorAll('.bd-lieu').forEach(g=>g.classList.toggle('selectionne',g.dataset.id===proprietaire(id)));
 survoler(id);
}
function initialiserEditeur() {
 const panneau=document.createElement('aside'); panneau.id='bd-editeur'; panneau.setAttribute('aria-label','Édition de la maquette');
 panneau.innerHTML=`<div class="bd-edit-head"><strong>Atelier de la rue</strong><button type="button" id="bd-edit-fermer" aria-label="Fermer le mode édition">×</button></div>
 <p>Réglages locaux. Le site partagé reste inchangé.</p>
 <label>Création<select id="bd-edit-select">${LIEUX.map(l=>`<option value="${l.id}">${l.creation}</option>`).join('')}</select></label>
 <small id="bd-edit-lien"></small>
 <div class="bd-edit-grille"><label>Position horizontale<input id="bd-edit-x" type="number" min="-150" max="1800" step="2"></label><label>Ancrage au sol<input id="bd-edit-y" type="number" min="-80" max="100" step="2"></label></div>
 <label>Taille<input id="bd-edit-s" type="range" min="0.5" max="1.8" step="0.01"></label>
 <label>Nom associé au logo<input id="bd-edit-titre" type="text" maxlength="65"></label>
 <label>Sous-titre du monde<input id="bd-edit-phrase" type="text" maxlength="100"></label>
 <div class="bd-edit-actions"><button type="button" id="bd-edit-save">Enregistrer ici</button><button type="button" id="bd-edit-export">Exporter</button><button type="button" id="bd-edit-import">Importer</button><button type="button" id="bd-edit-reset">Réinitialiser cette création</button></div>
 <label id="bd-edit-json-label" hidden>Réglages à copier<textarea id="bd-edit-json" rows="5" readonly></textarea></label>
 <input type="file" id="bd-edit-fichier" accept="application/json,.json" hidden>
 <p id="bd-edit-status" role="status">Clique sur un décor pour le sélectionner.</p>`;
 document.body.append(panneau);
 const ouvrir=document.createElement('button'); ouvrir.id='bd-edit-ouvrir';ouvrir.type='button';ouvrir.textContent='Modifier';ouvrir.setAttribute('aria-label','Modifier la maquette');document.body.append(ouvrir);
 const afficher=actif=>{edition=actif;document.body.classList.toggle('bd-edition',actif);scene.classList.toggle('en-edition',actif);if(actif){construire();choisir(selection);const cible=rue.offsetTop+(rue.offsetHeight-innerHeight)*.78;window.scrollTo({top:cible,behavior:'auto'});}else{scene.querySelectorAll('.selectionne').forEach(g=>g.classList.remove('selectionne'));survoler(null);construire();}};
 ouvrir.onclick=()=>afficher(true); $('#bd-edit-fermer').onclick=()=>afficher(false);
 $('#bd-edit-select').onchange=e=>choisir(e.target.value);
 const statut=message=>$('#bd-edit-status').textContent=message;
 const phraseValide=id=>{const n=config(id).phrase.trim().split(/\s+/).filter(Boolean).length;return n>=1&&n<=12;};
 for(const nom of ['x','y','s','titre','phrase']) $('#bd-edit-'+nom).addEventListener('input',e=>{
  const id=['x','y','s'].includes(nom)?proprietaire(selection):selection;
  let valeur=e.target.value;
  if(['x','y','s'].includes(nom)){valeur=Number(valeur);const bornes={x:[-150,1800],y:[-80,100],s:[.5,1.8]}[nom];if(!Number.isFinite(valeur)||valeur<bornes[0]||valeur>bornes[1])return;}
  reglages[id]={...reglages[id],[nom]:valeur};
  if(['x','y','s'].includes(nom))rafraichirPlacement(id);
  survoler(selection);statut(phraseValide(selection)?'Modification visible. Pense à enregistrer.':'La phrase doit contenir 1 à 12 mots.');
 });
 $('#bd-edit-save').onclick=()=>{if(!LIEUX.every(l=>phraseValide(l.id))){statut('Corrige les phrases : 1 à 12 mots chacune.');return;}try{localStorage.setItem(EDIT_KEY,JSON.stringify(reglages));statut('Enregistré dans ce navigateur.');}catch{statut('Stockage indisponible. Exporte tes réglages.');}};
 $('#bd-edit-reset').onclick=()=>{delete reglages[selection];rafraichirPlacement(selection);choisir(selection);statut('Réglages de départ rétablis. Enregistre pour les conserver.');};
 $('#bd-edit-export').onclick=()=>{if(!LIEUX.every(l=>phraseValide(l.id))){statut('Corrige les phrases avant l’export.');return;}const texte=JSON.stringify({version:1,lieux:reglages},null,2); $('#bd-edit-json').value=texte; $('#bd-edit-json-label').hidden=false; const blob=new Blob([texte],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='bigdrama-v7-reglages.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);statut('Fichier demandé. Si le téléchargement est bloqué, copie les réglages affichés ci-dessous.');};
 $('#bd-edit-import').onclick=()=>$('#bd-edit-fichier').click();
 $('#bd-edit-fichier').onchange=async e=>{const fichier=e.target.files[0];if(!fichier)return;try{
  if(fichier.size>100000)throw Error();const brut=JSON.parse(await fichier.text());if(brut.version!==1||!brut.lieux||typeof brut.lieux!=='object')throw Error();
  const propre={};for(const [id,c] of Object.entries(brut.lieux)){if(!parId[id]||!c||typeof c!=='object')throw Error();const o={};for(const [k,v] of Object.entries(c)){if(['x','y','s'].includes(k)){const [min,max]={x:[-150,1800],y:[-80,100],s:[.5,1.8]}[k];if(typeof v!=='number'||!Number.isFinite(v)||v<min||v>max)throw Error();o[k]=v;}else if(k==='titre'||k==='phrase'){if(typeof v!=='string'||v.length>(k==='titre'?65:100))throw Error();if(k==='phrase'){const n=v.trim().split(/\s+/).filter(Boolean).length;if(n<4||n>7)throw Error();}o[k]=v;}else throw Error();}propre[id]=o;}
  reglages=propre;LIEUX.filter(l=>l.id!=='creche').forEach(l=>rafraichirPlacement(l.id));choisir(selection);statut('Réglages importés. Enregistre pour les conserver.');
 }catch{statut('Fichier de réglages invalide. Aucun changement importé.');}e.target.value='';};
 afficher(edition);
}

// Les liens d’entrée et de contact restent dans la page et respectent la réduction des animations.
function defilerVers(top,hash) {
 history.replaceState(null,'',hash);
 window.scrollTo({top,behavior:reduit?'auto':'smooth'});
}
document.querySelectorAll('.entry-enter').forEach(lien=>lien.addEventListener('click',e=>{
 e.preventDefault();if(!deverrouille)entrer();history.replaceState(null,'',sansRue()?'#histoire':'#rue');glisserVers(etape2());
}));
document.querySelectorAll('#site-navigation a[href="#contact"]').forEach(lien=>lien.addEventListener('click',e=>{
 e.preventDefault();defilerVers($('#contact').getBoundingClientRect().top+scrollY-32,'#contact');
}));

function dessinerFil() {
 const groupe=el('g',{'class':'bd-eros-fil','pointer-events':'none','aria-hidden':'true'},calques[2]);
 details.push(groupe);
 filEros=el('path',{fill:'none',stroke:'#e0d6b6','stroke-opacity':.55,'stroke-width':.9},groupe);
 const artiste=el('g',{'class':'bd-funambule'},groupe);
 const equilibre=el('g',{'class':'bd-equilibre'},artiste);
 el('path',{d:'M-4 -35L4 -35L6 -20L-5 -20Z',fill:'#101315',stroke:'#d0c6a3','stroke-width':.8},equilibre);
 const bras=el('g',{'class':'bd-bras-equilibre'},equilibre);
 el('path',{d:'M-3 -31L-17 -28M3 -31L18 -35',fill:'none',stroke:'#d0c6a3','stroke-width':1.8},bras);
 for(const [classe,d] of [['bd-jambe-gauche','M-2 -20L-6 -10L-3 0'],['bd-jambe-droite','M2 -20L7 -10L3 0']])el('path',{'class':classe,d,fill:'none',stroke:'#b9af94','stroke-width':1.8},artiste);
 el('circle',{cx:0,cy:-42,r:4.5,fill:'#d9cdb2'},artiste);
 el('path',{d:'M-6 -46h12l-2 -6h-8Z',fill:'#111519'},artiste);
 el('path',{d:'M-34 -25Q0 -39 37 -38M-34 -23L37 -36',fill:'none',stroke:'#d3b765','stroke-width':1},bras);
 if(!reduit) marcheEros=el('animateMotion',{dur:'90s',repeatCount:'indefinite',rotate:'0',calcMode:'spline',keyPoints:'0;1;0',keyTimes:'0;.5;1',keySplines:'.4 0 .6 1;.4 0 .6 1'},artiste);
 else artiste.setAttribute('transform','translate(1210 305)');
 mettreAJourFil();
}
function mettreAJourFil(){
 if(!filEros||!poses.bar||!poses.lune)return;
 const matrice=id=>poses[id].transform.baseVal.consolidate()?.matrix;
 const toit=new DOMPoint(970,323).matrixTransform(matrice('bar')||new DOMMatrix());
 const lune=new DOMPoint(1330,146).matrixTransform(matrice('lune')||new DOMMatrix());
 const d=`M${toit.x} ${toit.y} Q${(toit.x+lune.x)/2} ${toit.y-12} ${lune.x} ${lune.y}`;
 filEros.setAttribute('d',d); if(marcheEros)marcheEros.setAttribute('path',d);
}
// v8 · passage forcé : depuis le film, un geste vers le bas fait monter la rue en entier. Depuis le haut de la rue, un geste vers le haut rend le film.
let glisseEnCours = false, verrou = 0;
function glisserVers(cible) {
  const depart = scrollY, dist = cible - depart, duree = reduit ? 0 : 1600, t0 = performance.now();
  if (cible > depart && !sansRue()) setTimeout(lancerConstruction, reduit ? 0 : duree * .42);
  document.documentElement.classList.add('bd-glisse'); setTimeout(() => document.documentElement.classList.remove('bd-glisse'), duree + 60);
  glisseEnCours = true; verrou = performance.now() + duree + 450;
  if (!duree) { scrollTo({ top: cible, behavior: 'instant' }); glisseEnCours = false; return; }
  const pas = t => { const k = Math.min(1, (t - t0) / duree), e = .5 - Math.cos(Math.PI * k) / 2; scrollTo({ top: depart + dist * e, behavior: 'instant' }); if (k < 1) requestAnimationFrame(pas); else glisseEnCours = false; };
  requestAnimationFrame(pas);
}
function sansRue() { return getComputedStyle(rue).display === 'none'; }
function etape2() { return sansRue() ? $('#content').getBoundingClientRect().top + scrollY : rue.offsetTop; }
const dansLeSas = () => !reduit && !edition && !projet.classList.contains('ouvert') && !document.querySelector('dialog[open]');
function decider(sens, e) {
  if (!dansLeSas()) return false;
  const haut = etape2(), y = scrollY;
  if (glisseEnCours || performance.now() < verrou) { if (y < haut + 4) { e?.preventDefault(); return true; } return false; }
  if (sens > 0 && y < haut - 4) { e?.preventDefault(); glisserVers(haut); return true; }
  if (sens < 0 && y > 4 && y <= haut + 4) { e?.preventDefault(); glisserVers(0); return true; }
  return false;
}
addEventListener('wheel', e => { if (e.ctrlKey || Math.abs(e.deltaY) < 2) return; // ctrl + molette = zoom du navigateur, on n'y touche pas
  decider(Math.sign(e.deltaY), e); }, { passive: false });
let toucheY = null, toucheX = 0;
addEventListener('touchstart', e => { toucheY = e.touches[0]?.clientY ?? null; toucheX = e.touches[0]?.clientX ?? 0; }, { passive: true });
addEventListener('touchmove', e => {
  if (toucheY == null || !dansLeSas()) return;
  const dy = toucheY - (e.touches[0]?.clientY ?? toucheY), dx = toucheX - (e.touches[0]?.clientX ?? toucheX), y = scrollY, haut = etape2();
  if (Math.abs(dx) > Math.abs(dy) * 1.2) return; // geste horizontal : c'est la rue qui glisse
  if ((y < haut - 4) || (dy < 0 && y <= haut + 4 && y > 4) || glisseEnCours) e.preventDefault();
  if (Math.abs(dy) > 28 && !glisseEnCours) { if (decider(Math.sign(dy), null)) toucheY = null; }
}, { passive: false });
addEventListener('touchend', () => { toucheY = null; }, { passive: true });
addEventListener('keydown', e => { const k = e.key; const sens = ['ArrowDown', 'PageDown', ' '].includes(k) ? 1 : ['ArrowUp', 'PageUp'].includes(k) ? -1 : 0; if (sens && !e.target.closest?.('input,textarea,select')) decider(sens, e); });

// v8 · le clic sur une maison descend jusqu'à la bannière de la création
function allerVersBanniere(id) {
  const cible = [...document.querySelectorAll(`.bd-strip[data-projet="${id}"]`)].find(a => a.offsetParent !== null);
  if (!cible) { ouvrirProjet(id); return; }
  history.replaceState(null, '', '#' + (cible.id || 'histoire'));
  scrollTo({ top: cible.getBoundingClientRect().top + scrollY - Math.max(40, (innerHeight - cible.offsetHeight) / 2), behavior: reduit ? 'auto' : 'smooth' });
  cible.classList.remove('bd-strip-vu'); void cible.offsetWidth; cible.classList.add('bd-strip-vu');
}
// v8 · chaque fenêtre de Close chante sa chanson et anime son personnage
let fenetreChante = null;
function chanter(k) {
  if (!vivante) return;
  scene.querySelectorAll('.bd-fen.chante').forEach(g => g.classList.remove('chante'));
  fenetreChante = k;
  if (k == null) { if (survole === 'maison') son('maison'); return; }
  scene.querySelector('.bd-fen-' + k)?.classList.add('chante');
  son('close-' + k);
}
// v8 · le Phénix d'Ariane remplacera le dessin dès que logos/phenix.png existe
scene.querySelectorAll('.bd-phenix-dessin').forEach(e => e.style.display = 'none');   // v8.10 · le paon est fourni : plus de test réseau
