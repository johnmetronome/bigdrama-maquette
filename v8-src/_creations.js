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
