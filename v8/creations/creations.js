// Big Drama V8 · pages création : visionneuse photo, marque « à vérifier » avec ?verif
(() => {
  if (new URLSearchParams(location.search).has('verif')) document.documentElement.classList.add('cr-verif');
  const v = document.querySelector('.cr-visionneuse'); if (!v) return;
  const img = v.querySelector('img'), boutons = [...document.querySelectorAll('.cr-galerie button')];
  let k = 0, declencheur = null;
  const montrer = i => { k = (i + boutons.length) % boutons.length; img.src = boutons[k].dataset.grand; };
  const fermer = () => { v.hidden = true; document.body.classList.remove('cr-fige'); declencheur?.focus(); };
  boutons.forEach((b, i) => b.addEventListener('click', () => { declencheur = b; montrer(i); v.hidden = false; document.body.classList.add('cr-fige'); v.querySelector('.cr-fermer').focus(); }));
  v.addEventListener('click', e => { if (e.target === v || e.target.classList.contains('cr-fermer')) fermer(); else if (e.target === img) montrer(k + 1); });
  addEventListener('keydown', e => { if (v.hidden) return; if (e.key === 'Escape') fermer(); if (e.key === 'ArrowRight') montrer(k + 1); if (e.key === 'ArrowLeft') montrer(k - 1); });
})();

// V8.23 · films de tête (Norma, Close, La Veillée) : muets, en boucle. À l'arrêt si l'on demande moins d'animations.
(() => {
  const v = document.querySelector('.cr-tete-film'); if (!v) return;
  v.muted = true;
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) { v.removeAttribute('autoplay'); v.pause(); return; }
  const p = v.play(); if (p) p.catch(() => {});
})();

// V8.30 · module de vente Billetweb (page Billetterie). Pas de script Billetweb sur le site : on écoute seulement les
// messages envoyés par le cadre billetweb.fr (hauteur, défilement, plein écran sur téléphone), même protocole que leur export.js.
(() => {
  const ORIGINE = 'https://www.billetweb.fr';
  addEventListener('message', (e) => {
    if (e.origin !== ORIGINE || typeof e.data !== 'string') return;
    const m = e.data.split('_');
    if (m[0].startsWith('event')) {
      const f = document.getElementById(m[0]);
      const h = parseFloat(m[1]);
      if (f && f.tagName === 'IFRAME' && h > 0 && h < 20000) f.style.height = Math.round(h) + 'px';
      return;
    }
    const f = document.getElementById(m[2] || '');
    if (!f || f.tagName !== 'IFRAME' || !f.classList.contains('cr-bw')) return;
    if (m[0] === 'scroll') {
      if (m[1] === 'widget') f.scrollIntoView();
      else if (!isNaN(parseFloat(m[1]))) scrollTo(0, f.getBoundingClientRect().top + scrollY + parseFloat(m[1]) - innerHeight / 2);
    } else if (m[0] === 'fullscreen') {
      f.classList.toggle('cr-plein', m[1] === 'on');
    }
  });
})();
