# Prompts d'audit · maquette Big Drama V8

26.10.2026 · trois prompts, un par auditeur. Chacun est autonome : copier le bloc entier.

---

## 1. Google (Gemini, avec accès web)

```
Tu es auditeur web senior (performance, accessibilité, compatibilité, sécurité côté navigateur, conformité France/UE).

CONTEXTE
- Site : maquette du nouveau site de Big Drama, compagnie de théâtre immersif à Paris.
- URL à auditer : https://johnmetronome.github.io/bigdrama-maquette/v8/
- Dépôt public : https://github.com/johnmetronome/bigdrama-maquette (dossiers v8/ et v8-src/ ; v8 s'appuie sur ../v2/ pour les feuilles de style, médias et pages légales, et sur ../logos, ../photos, ../videos, ../sons).
- Hébergement : GitHub Pages (pas de serveur, pas d'en-têtes HTTP configurables).
- Parcours : écran « Cliquer pour entrer » → film plein écran → un geste de défilement fait monter une rue illustrée en SVG (desktop seulement, masquée sous 900 px) → bannières des créations → contact. Clic sur une maison = défilement vers la bannière. Clic sur une bannière = page projet en surimpression (#projet-<id>). Musique au survol, plafonnée à 15 %, via Web Audio.
- Paramètres utiles : ?direct (saute l'écran d'entrée), ?edit (outil de réglage local).

MISSION
Fais un audit complet du site en ligne, sans rien modifier :
1. Performance : Lighthouse/PageSpeed mobile et desktop, Core Web Vitals (LCP, CLS, INP), poids des pages, vidéos (film d'accueil ~38 Mo en 1080p, 14 Mo en 720p), images non optimisées, polices, chargement paresseux, cache.
2. Responsive et compatibilité : iPhone Safari (portrait et paysage), Android Chrome, iPad, desktop Chrome/Safari/Firefox, écran 2560 px. Défilement forcé film → rue (molette, trackpad, tactile, clavier), lecture vidéo muette en autoplay, son après interaction.
3. Accessibilité : niveau RGAA 4.1 / WCAG 2.2 AA. Navigation clavier, focus visible, contrastes, textes alternatifs, rôles ARIA, prefers-reduced-motion, contenus animés.
4. Sécurité côté navigateur : en-têtes disponibles sur GitHub Pages, absence de CSP, ressources tierces (Google Fonts), contenu mixte, liens externes (rel noopener), données stockées en localStorage, surface d'injection côté client.
5. Conformité France/UE : RGPD (Google Fonts chargées depuis les serveurs de Google, absence de bandeau cookies, mentions légales, politique de confidentialité), droits sur les médias publiés dans un dépôt public.
6. SEO de préparation à la mise en production (la maquette est volontairement en noindex) : balises, structure des titres, données structurées utiles pour une compagnie de théâtre, partage social.

FORMAT DE RÉPONSE
- Un tableau trié par gravité : Critique / Majeur / Mineur / Suggestion.
- Colonnes : n°, constat, preuve (URL, outil, mesure, capture décrite), impact, correction recommandée, effort (S/M/L).
- Sépare clairement ce que tu as mesuré de ce que tu supposes. N'invente aucun chiffre ni aucune source : si tu ne peux pas mesurer, écris « non mesuré ».
- Termine par les 10 actions prioritaires, dans l'ordre.
```

---

## 2. Codex (accès au dépôt)

```
Tu es lead développeur front-end et relecteur sécurité. Tu as accès au dépôt johnmetronome/bigdrama-maquette.

PÉRIMÈTRE
- À auditer : v8/ (servi en ligne) et v8-src/ (sources : _app.js, _rue.js, _outils.js, _style.css, index.template.html, lieux.js, rebuild.py, build.py).
- Contexte d'exécution : GitHub Pages, aucun serveur. v8 charge ../v2/*.css, ../v2/script.js, ../v2/media.js et des médias à la racine.
- Lecture seule. Ne modifie pas v2/, v5, v6, v7 ni la racine. Ne pousse rien. Aucune action sans validation d'Alex.

À VÉRIFIER
1. Sécurité :
   - Tous les usages de innerHTML et de chaînes HTML construites (ouvrirProjet, survoler, éditeur) : source des données, risque d'injection si lieux.js ou le hash d'URL changent.
   - Import/export JSON du mode ?edit (taille, schéma, valeurs) et localStorage.
   - Navigation par hash (#projet-<id>), history.pushState/replaceState.
   - Liens externes, target, rel.
   - Ressources tierces (Google Fonts) et possibilité de les héberger localement.
   - Présence éventuelle de fichiers sensibles ou superflus dans le dépôt public (scripts, sauvegardes, médias lourds, fichiers .DS_Store, etc.).
2. Robustesse JS :
   - Fuites d'écouteurs, setInterval jamais nettoyés, requestAnimationFrame en boucle.
   - Gestion des erreurs audio et vidéo. Web Audio sur iOS (déverrouillage, createMediaElementSource appelé une seule fois par élément).
   - Défilement forcé (wheel/touch/keydown en passive:false) : effets de bord avec le trackpad, l'inertie, le zoom, les lecteurs d'écran.
   - Comportement quand la rue est masquée (< 900 px).
3. CSS :
   - Empilement de surcharges (style.css d'environ 700 lignes avec de nombreux !important, hérité de v6 → v7 → v8).
   - Propose une feuille consolidée, sans régression visuelle.
   - Variables, media queries cohérentes, unités svh/dvh, safe-area iOS.
4. Performance :
   - Taille du SVG généré (nombre de nœuds), filtres SVG, animations CSS simultanées.
   - Coût des animations pendant le défilement, chargement des 10 pistes audio dès l'entrée, vidéos.
5. Accessibilité :
   - Rôles et labels des maisons (g role=button), focus clavier, Échap, ordre de tabulation, prefers-reduced-motion respecté partout.
6. Maintenabilité :
   - Code mort hérité (COUPES, PANNEAU, SIGNATURES, promenadeMobile, éditeur).
   - Build reproductible (rebuild.py).
   - Tests automatiques à ajouter (Playwright : desktop 1440, iPhone 390×844, iPad).

FORMAT DE RÉPONSE
- Tableau par gravité (Critique / Majeur / Mineur / Suggestion) : fichier:ligne, constat, preuve (extrait de code), correctif proposé (diff), effort.
- Puis un plan de correction en lots indépendants, chacun testable seul, avec les commandes pour vérifier.
- Ne présente comme certain que ce que tu as vérifié dans le code. Marque « à vérifier » le reste.
```

---

## 3. Mistral (second avis indépendant)

```
Tu es auditeur indépendant (sécurité, vie privée, qualité éditoriale, accessibilité). Ton rôle est de donner un second avis, sans te fier aux autres audits.

OBJET
Maquette publique du futur site de Big Drama (théâtre immersif, Paris) :
- En ligne : https://johnmetronome.github.io/bigdrama-maquette/v8/
- Code : https://github.com/johnmetronome/bigdrama-maquette (v8/, v8-src/, v2/ pour les pages héritées).
Site statique sur GitHub Pages. Le dépôt est public.

QUESTIONS
1. Sécurité et vie privée :
   - Qu'expose le dépôt public ? Médias de clients (Hermès, Apple, Pernod Ricard, Bacardí, Grimbergen, My Little Paris, The Family), musiques, photos d'artistes, adresses, contenus non publiés.
   - Quels risques juridiques et d'image cela crée-t-il avant la mise en production ?
   - Que recommandes-tu : dépôt privé, Pages privées, dossier de médias hors dépôt, filigrane ?
2. RGPD et droit français :
   - Polices Google chargées à distance, stockage local, absence de bandeau.
   - Mentions légales, CGV et politique de confidentialité présentes dans v2/ : sont-elles à jour et cohérentes ?
   - Ce qui manque pour une mise en ligne conforme.
3. Code côté client :
   - Repère les points d'injection (innerHTML, hash d'URL, import JSON du mode ?edit) et dis s'ils sont exploitables dans un site statique.
   - Donne le correctif minimal pour chacun.
4. Accessibilité (RGAA 4.1) : les 10 non-conformités les plus probables, avec la page et l'élément concernés.
5. Éditorial :
   - Cohérence des noms et des sous-titres : « Création privée pour… », « Création immersive pour… », années, lieux.
   - Fautes, typographie française (espaces insécables, guillemets, majuscules).
   - Textes en lorem ipsum restant à écrire.
6. Expérience : le parcours film → rue → créations est-il clair en moins de 10 secondes pour un nouveau visiteur, sur téléphone et sur ordinateur ? Ce qui bloque, ce qui manque.

RÈGLES
- Réponds en français.
- Cite tes preuves (URL, fichier:ligne, élément HTML). N'invente ni loi, ni décision, ni chiffre : si tu n'es pas sûr d'une règle juridique, dis-le et indique quoi vérifier, auprès de qui.
- Format : tableau par gravité (Critique / Majeur / Mineur / Suggestion), puis 10 actions prioritaires.
```
