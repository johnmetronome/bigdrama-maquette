# Mission pour Mistral · audit sécurité et optimisation de www.big-drama.fr

Tu es auditeur sécurité web senior, spécialiste de l'hébergement mutualisé, des en-têtes HTTP, du DNS et de la conformité française (CNIL, LCEN). Ton angle principal : **sécurité, hygiène de l'hébergement, DNS et mail, conformité**. Vérifie aussi la performance, plus brièvement.

Points à creuser en priorité :
- Hébergement partagé (S1) : risques concrets d'une instance Gandi Simple Hosting partagée entre un site statique sain et d'anciens WordPress compromis. Procédure de nettoyage sûre et dans l'ordre : copie de côté, suppression des sites et de la base de données, rotation des accès, vérification d'intégrité du site restant (comparer le serveur au dossier exporté, par exemple avec `mirror --dry-run` de lftp).
- Redirection HTTP vers HTTPS (S2) derrière Varnish : règle `.htaccess` sûre (en-tête `X-Forwarded-Proto` ou équivalent chez Gandi) ou réglage du panneau, sans boucle de redirection.
- En-têtes : évalue la CSP (meta et en-tête), HSTS (durée, `includeSubDomains`, `preload` : avantages et risques ici), `Permissions-Policy`, `Cross-Origin-*`. Passe le site dans Mozilla Observatory et securityheaders.com et donne les notes.
- TLS : résultat SSL Labs pour www.big-drama.fr et big-drama.fr.
- DNS et mail (S3, S5) : enregistrements SPF, DMARC, CAA exacts à créer dans Gandi LiveDNS pour big-drama.fr, avec la boîte mail Gandi. DNSSEC : intérêt et procédure chez Gandi. Résultat internet.nl si possible.
- `.htaccess` : relis-le ligne par ligne. Erreurs, directives sans effet derrière Varnish, oublis (`AddDefaultCharset`, protection des fichiers cachés, `Header unset Server` ou `X-Powered-By`).
- Conformité : le site ne pose aucun cookie et ne charge rien de tiers. Que doit contenir au minimum la politique de confidentialité ? Que doivent contenir les mentions légales (LCEN, art. 6) d'une structure de spectacle hébergée chez Gandi ? Signale, ne tranche pas : un juriste validera.
- Chaîne de publication : risques d'un dépôt GitHub public contenant les sources et des notes (S7), et de `deployer.sh` (mot de passe saisi à chaque envoi, `ftp.conf` hors dépôt).

## Le site

- Adresse : https://www.big-drama.fr (big-drama.fr sans www redirige en 301 vers www).
- Compagnie de théâtre immersif Big Drama, Paris. Site vitrine : accueil (film, rue illustrée en SVG animé, bandeaux des créations), 11 pages création, À propos, pages légales. Une seule action commerciale : un lien vers la billetterie Billetweb (https://www.billetweb.fr/shop.php?event=la-veillee2), sans script ni cadre Billetweb.
- Site **100 % statique** : HTML, CSS, JavaScript, images WebP, films MP4. Aucun PHP, aucune base de données, aucun cookie, aucun formulaire, aucune requête vers un autre domaine.
- Hébergement : Gandi Simple Hosting (instance « Big Drama », datacenter sd5), Apache derrière Varnish 6.3. Dossier du site : `/lamp0/web/vhosts/www.big-drama.fr/htdocs`. Envoi par SFTP avec lftp (`deployer.sh`).
- Production du site : sources Python et JavaScript (`v8-src/`), régénération (`rebuild.py`), export autonome (`exporter.py`, qui écrit aussi le `.htaccess`). Sources publiques : https://github.com/johnmetronome/bigdrama-maquette (dossier `v8-src/` ; fichiers utiles : `exporter.py`, `creations.py`, `index.template.html`, `_app.js`, `_style.css`, `_creations.css`, `deployer.sh`).
- La même instance Gandi héberge aussi d'anciens sites WordPress sur l'ancien domaine (`dev.bigdrama.fr`, `www.bigdrama.fr`, `bigdrama.fr`). Leur retrait est en cours.

### CSP en balise meta, sur toutes les pages

```
default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; media-src 'self' blob:; font-src 'self'; connect-src 'self'; object-src 'none'; base-uri 'self'; form-action 'self'
```

### `.htaccess` actuellement en ligne

```apache
# Big Drama · site statique (exporter.py). Sans effet sur un hébergeur qui n'est pas Apache.
Options -Indexes
DirectoryIndex index.html
ErrorDocument 404 /404.html
AddType video/mp4 .mp4
AddType font/woff2 .woff2
AddType image/webp .webp

<IfModule mod_headers.c>
  # le site ne peut pas être affiché dans le cadre d'un autre site ; HTTPS imposé au navigateur pendant 6 mois
  Header always set Content-Security-Policy "frame-ancestors 'self'; object-src 'none'; base-uri 'self'; form-action 'self'"
  Header always set Strict-Transport-Security "max-age=15552000"
  Header always set Cross-Origin-Opener-Policy "same-origin"
  Header always set X-Content-Type-Options "nosniff"
  Header always set X-Frame-Options "SAMEORIGIN"
  Header always set Referrer-Policy "strict-origin-when-cross-origin"
  Header always set Permissions-Policy "camera=(), microphone=(), geolocation=(), payment=()"
</IfModule>

# Le site n'utilise aucun script côté serveur : tout fichier de ce type est refusé (protection si un ancien fichier traîne).
<FilesMatch "\.(php[0-9]?|phtml|phar|pl|py|cgi|sh|asp|aspx|jsp)$">
  <IfModule mod_authz_core.c>
    Require all denied
  </IfModule>
</FilesMatch>

<IfModule mod_deflate.c>
  AddOutputFilterByType DEFLATE text/html text/css text/javascript application/javascript application/json image/svg+xml text/plain application/xml
</IfModule>

<IfModule mod_expires.c>
  ExpiresActive On
  ExpiresByType text/html "access plus 0 seconds"
  ExpiresByType text/css "access plus 7 days"
  ExpiresByType text/javascript "access plus 7 days"
  ExpiresByType application/javascript "access plus 7 days"
  ExpiresByType image/webp "access plus 7 days"
  ExpiresByType image/jpeg "access plus 7 days"
  ExpiresByType image/png "access plus 7 days"
  ExpiresByType image/svg+xml "access plus 7 days"
  ExpiresByType video/mp4 "access plus 7 days"
  ExpiresByType audio/mpeg "access plus 7 days"
  ExpiresByType font/woff2 "access plus 365 days"
</IfModule>
```

## Audit déjà fait (02.11.2026, par Claude)

Ne le recopie pas. Vérifie-le, contredis-le si les faits te donnent tort, et complète-le.

## 1. Résumé

| Domaine | État |
|---|---|
| Performance pages création, À propos | Lighthouse mobile 100. LCP 1,4 à 1,5 s. 350 Ko à 1,1 Mo |
| Performance accueil | Mobile 86, ordinateur 99. Blocage du fil principal 540 ms sur mobile. 2 192 éléments HTML |
| Accessibilité, SEO, bonnes pratiques | 100 partout, sauf bonnes pratiques accueil mobile 96 (textes trop petits) |
| HTTPS | TLS 1.3, certificats Gandi valides jusqu'au 18.05.2027 (www et sans www). HTTP sur www pas encore redirigé |
| En-têtes de sécurité | CSP, HSTS, nosniff, X-Frame-Options, Referrer-Policy, Permissions-Policy, COOP présents |
| Surface d'attaque du site | Statique : aucun PHP exécutable, aucun cookie, aucune requête tierce, aucun formulaire |
| Hébergement partagé | **Critique** : deux anciens sites WordPress compromis ou obsolètes sur la même instance |
| DNS et mail | SPF neutre, pas de DMARC, pas de CAA, DNSSEC inactif |

## 2. Mesures Lighthouse (12, mobile simulé sauf mention)

| Page | Perf | Access. | Bonnes pratiques | SEO | LCP | TBT | Poids |
|---|---|---|---|---|---|---|---|
| Accueil, mobile | 86 | 100 | 96 | 100 | 1,8 s | 540 ms | 2,0 Mo |
| Accueil, ordinateur | 99 | 100 | 100 | 100 | 0,6 s | 50 ms | 4,7 Mo |
| La Veillée | 100 | 100 | 100 | 100 | 1,5 s | 20 ms | 0,35 Mo |
| Norma | 100 | 100 | 100 | 100 | 1,4 s | 50 ms | 1,1 Mo |
| À propos | 100 | 100 | 100 | 100 | 1,5 s | 30 ms | 0,5 Mo |

Les films ne sont comptés qu'en partie par Lighthouse (lecture progressive).

## 3. Optimisation

| # | Priorité | Constat | Correction proposée |
|---|---|---|---|
| O1 | Haute | Accueil mobile : 540 ms de blocage, 2 192 éléments. La rue SVG est construite en JavaScript au chargement et le HTML des bandeaux existe deux fois (`.version-desktop` et `.version-mobile`) | Un seul jeu de bandeaux. Construire la rue après le premier affichage (`requestIdleCallback`) et seulement si elle est visible |
| O2 | Moyenne | Cache : CSS et JS 7 jours alors que leurs adresses sont versionnées (`?v=`). Images et films 7 jours. Lighthouse signale 25 à 29 ressources | CSS, JS, polices : 1 an + `immutable`. Images et films : 30 jours, et changer le nom du fichier quand il change |
| O3 | Moyenne | Film d'accueil : 93 s, 5,4 Mo sur téléphone (540p), 21 Mo sur grand écran (1080p), lancé automatiquement | Boucle courte de 15 à 20 s pour l'accueil (≈ 2 Mo), film complet seulement dans la visionneuse |
| O4 | Basse | 40 Ko de CSS inutilisé (anciens thèmes v2 regroupés dans `site.css`) | Purger les règles des thèmes v2 non utilisées |
| O5 | Basse | Images sans `width`/`height` sur l'accueil (pas de décalage mesuré, CLS 0 à 0,004) | Ajouter les dimensions dans le gabarit |
| O6 | Basse | Accueil mobile : 28 % de texte jugé lisible (libellés en 8 à 10 px hérités du site v2) | Minimum 11 px sur téléphone |
| O7 | Basse | `Content-Type: text/html` sans `charset` dans l'en-tête (présent dans la page) | `AddDefaultCharset UTF-8` dans `.htaccess` |

Déjà en place : compression gzip des textes, Varnish devant Apache, WebP en deux tailles, chargement différé de 36 images sur 41, films de tête légers (`tete-*-720.mp4`), version 540p sur téléphone, envoi par plages (Safari).

## 4. Sécurité

| # | Gravité | Constat | Preuve | Correction |
|---|---|---|---|---|
| S1 | **Critique** | `dev.bigdrama.fr` renvoie ses visiteurs vers un site inconnu. `www.bigdrama.fr` est un WordPress en PHP 8.0.30 (plus maintenu), en erreur 503. Les deux sont sur la même instance Gandi que www.big-drama.fr, avec le même utilisateur système : un site compromis peut écrire dans le dossier du nouveau | `HTTP/2 302 location: https://ederikadar.lol/` · `x-powered-by: PHP/8.0.30` | Copie de côté, puis suppression des sites `dev.bigdrama.fr`, `www.bigdrama.fr`, `bigdrama.fr` dans Gandi. Base de données WordPress à supprimer. Nouveau mot de passe sFTP et Gandi, double authentification. Renvoyer le site avec `bash deployer.sh envoi-propre` pour rétablir des fichiers sains |
| S2 | Haute | `http://www.big-drama.fr` répond en 200 sans rediriger vers HTTPS (HSTS ne protège qu'après une première visite en HTTPS) | `HTTP/1.1 200 OK` en http | Réglage « HTTPS seul » du site dans Gandi, ou règle `.htaccess` sur `X-Forwarded-Proto` (à tester derrière Varnish) |
| S3 | Moyenne | Mail du domaine : SPF `?all` (neutre), pas de DMARC : n'importe qui peut envoyer au nom de @big-drama.fr | `v=spf1 include:_mailcust.gandi.net ?all`, `_dmarc` absent | SPF `~all`, DMARC `v=DMARC1; p=none; rua=mailto:…` puis `quarantine` |
| S4 | Moyenne | Contact du site sur l'ancien domaine (contact@bigdrama.fr), domaine dont le titulaire légal est un ancien associé | Pages Contact, FAQ, pied de page | Adresse @big-drama.fr, à changer dans `CONTACT` (`creations.py`) et `index.template.html` |
| S5 | Basse | Pas d'enregistrement CAA, DNSSEC inactif | DNS public | CAA limité à l'autorité de Gandi, DNSSEC à activer dans Gandi |
| S6 | Basse | CSP : `style-src 'unsafe-inline'` (styles en attribut `style=` dans les gabarits) | Balise meta CSP | Passer les variables `--fond`, `--masque` en classes pour retirer `unsafe-inline` |
| S7 | Info | Sources, notes de travail et ancien site v2 publics sur GitHub (dépôt et GitHub Pages) | johnmetronome.github.io/bigdrama-maquette | Passer le dépôt en privé une fois le site officiel stable |
| S8 | Info | Pages légales reprises de l'ancien site (éditeur, hébergeur, adresses bigdrama.fr) | `/mentions-legales/` | Version validée d'Ariane, relue par un juriste |

Déjà bon : TLS 1.3, certificats valides, HSTS 6 mois, CSP en balise (tout en `'self'`, `object-src 'none'`) et en en-tête (`frame-ancestors 'self'`), `nosniff`, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy`, `Cross-Origin-Opener-Policy`. PHP et scripts serveur refusés (403), `.htaccess` illisible (403), pas de liste de dossiers (403), `.git`, `.env`, `ftp.conf`, `v8-src` absents (404), méthode TRACE refusée (405). Aucun cookie, aucune requête vers un autre site, billetterie par simple lien vers Billetweb.

## 5. Ordre conseillé

1. S1 (ce soir) puis rotation des accès.
2. S2.
3. O1 et O3 (accueil mobile).
4. S3, S4, O2.
5. Le reste.

## Règles

1. **Audit passif uniquement.** Chargement normal des pages, lecture des en-têtes, outils publics en ligne (PageSpeed Insights, Lighthouse, Mozilla Observatory, securityheaders.com, SSL Labs, internet.nl, Hardenize ou équivalents). Pas de scan de ports, pas de force brute, pas de test de charge, pas de tentative d'exploitation.
2. **Ne visite pas** `dev.bigdrama.fr` ni `ederikadar.lol` : la redirection est probablement malveillante. Tu peux citer l'en-tête déjà relevé.
3. **Pas d'invention.** Chaque constat cite sa preuve : URL, en-tête, ligne de fichier, résultat d'outil avec sa date. Si tu ne peux pas vérifier toi-même, écris « non vérifié » et dis comment le vérifier.
4. **Pas de solution qui ajoute un script, un service ou un cookie tiers** (pas de Google Analytics, pas de CDN tiers, pas de widget). Si une mesure d'audience te semble utile, propose seulement des options sans cookie et auto-hébergées, en le signalant comme option.
5. **Corrections exactes.** Pour chaque correction : le fichier à modifier (`exporter.py` pour le `.htaccess`, `creations.py` pour les pages création, `index.template.html` pour l'accueil, réglage Gandi pour l'hébergement) et le texte exact à ajouter ou remplacer. Indique le risque de la correction (par exemple une boucle de redirection derrière Varnish).
6. Réponds en français. Phrases courtes.

## Rendu attendu

1. **Tableau des constats** : identifiant, gravité (Critique, Haute, Moyenne, Basse, Info), constat, preuve, impact, correction exacte, risque de la correction. Reprends les identifiants O1… et S1… quand tu traites un point existant, numérote les nouveaux à partir de O8 et S9.
2. **Désaccords** avec l'audit existant, avec la preuve.
3. **Les 5 actions prioritaires**, dans l'ordre, avec le temps estimé.
4. **Questions ouvertes** : ce que tu n'as pas pu vérifier et pourquoi.
