"use strict";
// Navigation locale entre les deux mises en page historiques.
function scrollToArchive(hash) {
 if (!document.querySelector('.version-mobile') || !['#manifeste', '#histoire'].includes(hash)) return false;
 const mobile = window.matchMedia('(max-width:780px)').matches;
 const target = document.getElementById((mobile ? 'mobile-' : '') + hash.slice(1));
 if (target) target.scrollIntoView();
 return !!target;
}
document.querySelectorAll('nav a').forEach(a => a.addEventListener('click', e => {
 const url = new URL(a.href);
 if (document.querySelector('.version-mobile') && scrollToArchive(url.hash)) {
  e.preventDefault(); history.replaceState(null, '', url.hash);
 }
}));
if (location.hash) requestAnimationFrame(() => scrollToArchive(location.hash));
