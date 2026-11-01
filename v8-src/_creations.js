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

// V8.22 · billetterie Billetweb : le cadre ne se charge qu'au clic. Aucun script tiers sur la page.
(() => {
  const zone = document.querySelector('[data-billetweb]'); if (!zone) return;
  zone.querySelector('.cr-billetweb-ouvrir').addEventListener('click', () => {
    const f = document.createElement('iframe');
    f.src = zone.dataset.billetweb; f.title = 'Billetterie La Veillée (Billetweb)'; f.allow = 'payment';
    f.className = 'cr-billetweb-cadre';
    zone.replaceChildren(f); zone.classList.add('ouverte'); f.focus();
  });
})();
