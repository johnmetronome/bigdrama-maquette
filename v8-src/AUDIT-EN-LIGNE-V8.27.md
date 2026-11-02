# Big Drama · audit du site en ligne · www.big-drama.fr · 02.11.2026 (V8.27)

Audit passif : pages chargées normalement, en-têtes HTTP, certificat, DNS public, Lighthouse 12. Aucun test d'intrusion, aucun scan.
Mesures faites depuis un serveur distant, à travers un proxy : les temps sont indicatifs, les écarts entre pages sont fiables.

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
