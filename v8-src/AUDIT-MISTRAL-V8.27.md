# Audit Mistral · www.big-drama.fr · 02.11.2026 (V8.27)

Audit passif. Mesures faites le 02.11.2026 entre 09:45 et 10:10 UTC : chargement normal des pages, en-têtes HTTP, DNS public (DoH), TLS, SSL Labs, dépôt GitHub. Aucun scan de ports, aucune charge, aucune tentative d'exploitation.
`dev.bigdrama.fr` et `ederikadar.lol` **non visités** (règle 2). Une seule requête DNS pour `dev.bigdrama.fr`, rien d'autre.
Les chiffres Lighthouse de l'audit du 02.11 (Claude) sont repris tels quels : PageSpeed Insights a répondu « quota exceeded » (erreur 429) toute la matinée.

## 1. Tableau des constats · sécurité

| # | Gravité | Constat | Preuve (02.11.2026) | Impact | Correction exacte | Risque de la correction |
|---|---|---|---|---|---|---|
| S1 | **Critique** | Anciens sites toujours en ligne, toujours capables de nuire. `www.bigdrama.fr` : WordPress PHP 8.0.30 en 503, sur l'ancienne plateforme `gpaas7.dc0.gandi.net`. `dev.bigdrama.fr` : sur la même plateforme sd5 que le nouveau site. `bigdrama.fr` (apex) redirige en 301 vers l'ancien www | `HTTP/2 503` + `x-powered-by: PHP/8.0.30` + `x-cp-decision: wordpress` sur www.bigdrama.fr (09:52 UTC) · `dev.bigdrama.fr` → `webacc7.sd5.ghst.net` (155.133.138.10), même plateforme sd5 que www.big-drama.fr (`webacc1.sd5.ghst.net`, 155.133.138.3) · `bigdrama.fr` → 301 vers `https://www.bigdrama.fr/` · la 302 vers `ederikadar.lol` est citée de l'audit du matin, non re-testée (règle 2) | Un site compromis peut écrire dans le dossier du nouveau site s'il est sur la même instance ; l'ancien domaine sert de vitrine cassée aux visiteurs | Procédure P1 ci-dessous, dans l'ordre | Confondre `bigdrama.fr` et `big-drama.fr` (un tiret) lors des suppressions : vérifier chaque nom deux fois. Supprimer un vhost du nouveau site casserait la mise en ligne |
| S2 | Haute | `http://www.big-drama.fr` répond 200 sans redirection vers HTTPS | `HTTP/1.1 200 OK` en http, aucune en-tête `Location` (09:47 UTC). L'apex, lui, redirige déjà en 301 vers https, en HTTP comme en HTTPS | Première visite en http non protégée ; HSTS inefficace avant une visite HTTPS | D'abord le panneau Gandi (réglage « HTTPS seul » du site www). Sinon, dans le `.htaccess` écrit par `exporter.py` : voir bloc `mod_rewrite` en annexe. Tester derrière Varnish | Boucle de redirection si Varnish ne transmet pas `X-Forwarded-Proto` correctement. Tester : `curl -sI http://www.big-drama.fr/` (attendu 301) puis `curl -sI https://www.big-drama.fr/` (attendu 200). Retour arrière : retirer le bloc |
| S3 | Moyenne | Mail du domaine : SPF neutre, pas de DMARC. N'importe qui peut envoyer au nom de @big-drama.fr | TXT : `v=spf1 include:_mailcust.gandi.net ?all` · `_dmarc` inexistant (NXDOMAIN) · MX : `spool.mail.gandi.net` / `fb.mail.gandi.net` (boîte Gandi) | Usurpation du domaine, phishing au nom de la compagnie, dégradation de la délivrabilité | Dans Gandi LiveDNS (zone `big-drama.fr`) : 1. modifier la valeur TXT en `v=spf1 include:_mailcust.gandi.net ~all`. 2. créer `TXT _dmarc` : `v=DMARC1; p=none; rua=mailto:<boîte>@big-drama.fr` (boîte Gandi à préciser). Après 2 à 4 semaines de rapports propres : passer `p=quarantine`, puis `p=reject` | `~all` peut classer en spam un envoi légitime fait depuis un autre serveur (vérifier qu'aucun outil tiers n'envoie au nom du domaine). DMARC `p=none` est sans risque ; ne pas sauter directement à `reject` |
| S4 | Moyenne | Adresse de contact sur l'ancien domaine : `contact@bigdrama.fr`, partout | `mailto:contact@bigdrama.fr` sur l'accueil, dans les mentions légales et 5 fois dans la politique de confidentialité. Aucun lien http vers l'ancien domaine, uniquement des `mailto` | Courrier envoyé à un domaine tenu par un ancien associé. Si le domaine expire et est réenregistré, l'adresse publiée mène à un inconnu | Remplacer dans `creations.py` (constante `CONTACT`), `index.template.html`, `v8-src/_legal/mentions-legales.html`, `confidentialite.html`, `cgv.html` par une adresse @big-drama.fr, puis `rebuild.py` + `exporter.py` + envoi | Aucun, sauf oublier une page : chercher `bigdrama.fr` dans tous les gabarits avant l'envoi |
| S5 | Basse | Pas d'enregistrement CAA, DNSSEC inactif | CAA : aucune réponse · DNSKEY : aucune · pas de DS chez le .fr (vérifié via les NS de l'AFNIC) | N'importe quelle autorité de certification peut émettre pour le domaine ; le DNS peut être falsifié en chemin | CAA dans LiveDNS, valeurs données par la documentation Gandi : `@ IN CAA 0 issue "sectigo.com"` · `@ IN CAA 0 issue "digicert.com"` · `@ IN CAA 0 issuewild "sectigo.com"` · `@ IN CAA 0 issuewild "digicert.com"`. DNSSEC : panneau Gandi → domaine → activer DNSSEC (clés gérées par Gandi, DS publié automatiquement chez l'AFNIC) | CAA : si Gandi change d'autorité de certification, le renouvellement échoue (surveiller l'échéance du 18.05.2027). DNSSEC : si on change de DNS plus tard, désactiver DNSSEC d'abord, sinon site injoignable |
| S6 | Basse | CSP meta : `style-src 'unsafe-inline'` (variables `--fond`, `--masque` en attributs `style=`) | Balise meta identique sur l'accueil et les pages création (vérifié sur `creations/norma/`). Détail relevé : la CSP de `404.html` diffère des autres pages (`img-src 'self' data:`, sans `blob:`) | Aténuation de la CSP : un contenu injecté dans un attribut `style=` n'est pas bloqué | Passer les variables en classes CSS dans les gabarits (`creations.py`, `index.template.html`, `_creations.css`, `_style.css`), retirer `unsafe-inline`. Au passage, aligner la CSP de `404.html` sur les autres pages | Faible : vérifier chaque gabarit, un style oublié en attribut sera refusé et cassera l'affichage |
| S7 | Info | Dépôt GitHub public avec les sources **et les notes de travail** ; GitHub Pages actif | `api.github.com/repos/johnmetronome/bigdrama-maquette` : `private: false` (02.11.2026). Notes visibles : `AUDIT_PROMPTS_V8.md`, `HANDOFF-CODEX-V8.19.md`, `PROMPT_GOOGLE_V8.19.md`, `PROMPT_MISTRAL_V8.19.md`, `LISEZ-MOI-V8.md`. GitHub Pages : HTTP 200. `ftp.conf` absent du dépôt (seul `ftp.conf.exemple`, sans secret, vérifié). `deployer.sh` demande le mot de passe à chaque envoi (ligne 41, `read -s`) | Exposition de la méthode de travail, de l'architecture et des constats d'audit à quiconque | Passer le dépôt en privé une fois le site officiel stable (GitHub Pages disparaîtra : c'est voulu) | Les clones déjà faits et le cache restent ; considérer l'historique déjà public comme connu |
| S8 | Info | Mentions légales héritées de l'ancien site : toutes les références pointent vers `www.bigdrama.fr` ; adresse Gandi et responsable de publication à revoir | Page `/mentions-legales/` : « En vertu de l'article 6 de la loi n° 2004-575… » puis `www.bigdrama.fr` dans tout le texte. Propriétaire : Big Drama, SIRET 84174319800019, 22 rue la Condamine 75017 Paris. Responsable publication : Ariane Raynaud. Hébergeur : Gandi, 15 place de la Nation, 75011 Paris | Mentions légales qui décrivent un autre site et peut-être un autre hébergement ; conformité LCEN à revoir. À valider par un juriste, je ne tranche pas | Contenu minimum attendu (art. 6 LCEN, éditeur personne morale) : dénomination, adresse, courriel, SIRET/RCS, forme juridique, directeur de publication, hébergeur (dénomination, adresse, téléphone de Gandi). Réécrire `v8-src/_legal/mentions-legales.html` avec les informations de big-drama.fr et l'adresse Gandi actuelle | Aucun technique. Risque juridique à ne pas trancher soi-même : validation par un juriste |
| S9 | Moyenne | **Nouveau.** La politique de confidentialité décrit des traitements qui n'existent pas : cookies de navigation, collecte automatique de l'IP, des URL visitées, des temps de réponse. Le site statique ne pose aucun cookie et n'appelle rien | Page `/confidentialite/` : « nous sommes susceptibles de collecter automatiquement… des cookies de navigation… », rédigée pour `bigdrama.fr` | Informations inexactes données aux visiteurs (exigence de transparence RGPD) ; perte de crédibilité d'un argument pourtant fort : ce site est le plus propre possible | Réécrire `v8-src/_legal/confidentialite.html` au minimum : responsable de traitement (Big Drama, SIRET, adresse, contact @big-drama.fr) ; aucun cookie, aucun traceur, aucune mesure d'audience, aucune requête tierce ; seuls journaux du serveur Gandi ; courriels reçus conservés le temps de répondre ; achat de billet chez Billetweb = responsable indépendant (lien vers leur politique) ; droits d'accès, rectification, effacement, réclamation CNIL ; date de mise à jour | Aucun. À faire relire par un juriste, comme le reste des pages légales |
| S10 | Basse | **Nouveau.** La redirection 301 de l'apex vers www ne porte **aucun** en-tête de sécurité (pas de HSTS, pas de CSP, rien) | `curl -sI https://big-drama.fr/` : 301 + aucune en-tête de sécurité (02.11.2026). SSL Labs : big-drama.fr noté **A**, www.big-drama.fr noté **A+** (02.11.2026) | L'apex sert une page de redirection « nue » ; HSTS preload impossible tant que l'apex n'envoie pas HSTS | Si la 301 vient du réglage Gandi (probable : elle est servie avant Apache), voir si le panneau peut ajouter HSTS, sinon accepter et documenter. Le HSTS de `www` (15552000 s) est déjà en place | Toucher la redirection de l'apex peut casser la 301 existante. À ne faire qu'après S2 |
| S11 | Basse | **Nouveau.** HSTS limité à 6 mois, sans `includeSubDomains`, sans `preload` — à l'étudier maintenant que le reste est sain | `strict-transport-security: max-age=15552000` sur toutes les pages www (02.11.2026) | Protection incomplète : pas de protection des futurs sous-domaines, pas d'inscription preload | Étape 1 : `Header always set Strict-Transport-Security "max-age=63072000; includeSubDomains"` dans `exporter.py`. Étape 2 (plus tard, seulement après S2 réglé et HSTS présent sur l'apex — cf. S10) : soumettre à hstspreload.org. Avantages : HTTPS imposé pour tout le domaine, y compris le premier accès ; protection contre la rétrogradation. Risques : tout futur sous-domaine de big-drama.fr devra être en HTTPS dès le premier jour ; le retrait de preload prend des semaines | Difficile à annuler (mois). Ne pas activer preload avant que S2 et S10 soient réglés |
| S12 | Info | **Nouveau.** En-tête `server: Apache` exposé. `X-Powered-By` absent du nouveau site (présent uniquement sur l'ancien WordPress, `PHP/8.0.30`) | `server: Apache` sur toutes les réponses ; aucune en-tête `x-powered-by` sur www.big-drama.fr | Divulgation mineure de technologie | `Header always unset Server` dans `exporter.py` ; souvent sans effet complet (l'en-tête peut venir du cœur ou de Varnish) ; `ServerSignature Off` réduit à « Apache ». Cosmétique | Aucun réel ; ne pas espérer masquer complètement la pile Gandi/Varnish |

### Procédure P1 · nettoyage de l'instance (S1), dans l'ordre

1. **Copie de côté** (15 min). Télécharger par SFTP/lftp le contenu des trois anciens vhosts (`dev.bigdrama.fr`, `www.bigdrama.fr`, `bigdrama.fr`) sur un disque local, même s'ils sont compromis : preuve en cas de besoin.
2. **Suppression dans le panneau Gandi** (15 min). Supprimer les trois sites et le vhost de chaque ancien domaine. Supprimer la base de données WordPress de l'instance. Vérifier qu'aucun cron, clé SSH ou accès résiduel ne traîne dans l'instance.
3. **Rotation des accès** (10 min). Nouveau mot de passe sFTP, nouveau mot de passe du compte Gandi, double authentification, revue des clés API du compte.
4. **Vérification d'intégrité du site restant** (15 min). `bash deployer.sh test` (mode `mirror --reverse --dry-run --only-newer`, déjà présent dans le script) compare l'export au serveur et liste toute différence. Compléter avec un `mirror --dry-run` serveur → local pour détecter des fichiers inconnus.
5. **Rétablissement propre** (10 min). `bash deployer.sh envoi-propre` réécrit des fichiers sains et supprime tout fichier du serveur absent de l'export (confirmation demandée : taper `SUPPRIMER`).
6. **Re-vérifier en ligne** (5 min). Accueil en 200, `.htaccess` en 403, `/test.php` en 403, page inconnue en 404, aucune en-tête `x-powered-by`.

Point d'attention : les enregistrements DNS des anciens domaines resteront résolus tant que les domaines existent. Décider avec un juriste de la stratégie de `bigdrama.fr` (garder, laisser expirer) — sa zone DNS est encore servie par des serveurs Gandi (`ns-93-b`, `ns-159-a`, `ns-30-c`).

## 2. Tableau des constats · optimisation

| # | Priorité | Constat | Preuve (02.11.2026) | Correction | Risque |
|---|---|---|---|---|---|
| O1 | Haute | Accueil mobile : 540 ms de blocage, 2 192 éléments, rue SVG construite en JavaScript au chargement, bandeaux dupliqués | Non re-mesuré (quota PSI dépassé, erreur 429). Structure confirmée : classes `.version-desktop` / `.version-mobile` présentes dans le HTML de l'accueil ; scripts `app.js?v=8.24`, `v2/script.js`, `v2/media.js?v=1` chargés | Un seul jeu de bandeaux ; construire la rue après le premier affichage (`requestIdleCallback`) et seulement si visible. Fichiers : `index.template.html`, `_app.js`, `_rue.js` | Uniquement cosmétique pendant le développement ; rien à casser en production |
| O2 | Moyenne | Cache à 7 jours pour des ressources versionnées | `site.css?v=8.24`, `app.js?v=8.24`, `.webp`, `.mp4` : tous à `cache-control: max-age=604800` (02.11.2026) | Dans le `.htaccess` écrit par `exporter.py` : voir bloc `Cache-Control` en annexe. CSS/JS/woff2 : 1 an + `immutable`. Images et films : 30 jours, en changeant le nom de fichier quand le contenu change | Les fichiers non versionnés (cf. O8) resteraient 1 an dans les caches : traiter O8 d'abord. Une image modifiée sans renommage garde 30 jours d'ancienneté chez les visiteurs |
| O3 | Moyenne | Film d'accueil : 5,4 Mo sur mobile, 21,7 Mo sur grand écran, lecture automatique | `hero-540.mp4` : 5 405 256 octets · `hero-1080.mp4` : 21 659 796 octets (02.11.2026) — chiffres de l'audit confirmés à l'octet près | Boucle de 15 à 20 s pour l'accueil (≈ 2 Mo), film complet dans la visionneuse | Aucun ; garder le film complet dans la visionneuse |
| O4 | Basse | CSS inutilisé (thèmes v2) | Repris de l'audit du 02.11 (non re-mesurable aujourd'hui) | Purger `site.css` | Faible : régressions visuelles possibles, tester chaque page |
| O5 | Basse | Images sans `width`/`height` | Repris de l'audit du 02.11 (CLS 0 à 0,004 mesuré alors) | Ajouter les dimensions dans les gabarits | Aucun |
| O6 | Basse | Libellés en 8 à 10 px sur mobile | Repris de l'audit du 02.11 | Minimum 11 px | Aucun |
| O7 | Basse | `Content-Type: text/html` sans `charset` dans l'en-tête (la page déclare bien `<meta charset="utf-8">`) | En-tête `content-type: text/html` sans charset sur toutes les pages testées (02.11.2026) | `AddDefaultCharset UTF-8` dans le bloc Apache de `exporter.py` | Aucun |
| O8 | Basse | **Nouveau.** L'accueil charge encore des scripts de l'ancienne version : `v2/script.js` (sans paramètre de version) et `v2/media.js?v=1` | Balises `<script src="v2/script.js" defer>` et `<script src="v2/media.js?v=1" defer>` dans le HTML de l'accueil (02.11.2026) | Si les scripts v2 ne servent plus : les retirer de `index.template.html`. Sinon : les versionner comme les autres (`?v=`) | Si un script v2 est encore utile (lecture des films ?), le retirer peut casser la visionneuse : tester la lecture des vidéos après |

## 3. Désaccords et compléments avec l'audit du 02.11 (Claude)

1. **« La même instance Gandi » (S1) : vrai pour `dev.bigdrama.fr`, non démontré pour les deux autres.** Le DNS place `dev.bigdrama.fr` sur `webacc7.sd5.ghst.net` (155.133.138.10), la même plateforme sd5 que le nouveau site (`webacc1.sd5.ghst.net`, 155.133.138.3). Mais `www.bigdrama.fr` pointe vers `gpaas7.dc0.gandi.net` (217.70.180.137) et `bigdrama.fr` vers 217.70.184.55 : l'ancienne plateforme dc0. La « même instance » ne se voit pas dans le DNS public pour ces deux-là ; à confirmer dans le panneau Gandi. La criticité ne change pas : `dev` seul suffit à justifier S1.
2. **S8 sous-évaluée.** La politique de confidentialité n'est pas seulement « reprise de l'ancien site » : elle affirme des traitements (cookies, collecte d'IP et de navigation) qui n'existent pas. Je la classe séparément en S9, Moyenne.
3. **Rien d'autre à contredire.** Re-vérifiés exacts ce jour : S2, S3, S5, S6, S7, O2, O3 (à l'octet près), O7, les certificats (GandiCert, expirent le 18.05.2027, TLS 1.3, HTTP/2), et les protections serveur (404 personnalisée, `.htaccess` 403, `.php` 403, `.git`/`.env`/`ftp.conf`/`v8-src` 404, TRACE 405).
4. **Complément.** La 301 apex → www fonctionne déjà en HTTP comme en HTTPS — le problème de redirection est limité à `http://www.big-drama.fr` (S2).

## 4. Les 5 actions prioritaires

1. **S1 — procédure P1, ce soir.** 1 h 30 à 2 h au total, dont 15 min de vérification finale. C'est la seule action urgente.
2. **S2 — redirection HTTPS.** 15 à 30 min. Panneau Gandi d'abord, sinon `.htaccess` (annexe) avec test immédiat.
3. **S4 + S9 (+ S8) — adresses et pages légales.** 2 à 3 h de rédaction, puis validation par un juriste. Le site est légalement plus sale que technique : autant le documenter proprement.
4. **S3 — SPF `~all` + DMARC `p=none`.** 15 min dans LiveDNS. Puis 2 à 4 semaines d'observation des rapports avant `quarantine`.
5. **S5 + S11 — CAA, DNSSEC, HSTS 2 ans + `includeSubDomains`.** 30 min dans LiveDNS et `exporter.py`. Le preload attendra S2 et S10.

Ensuite : O1 et O3 (accueil mobile), puis O8 + O2 (cache), puis O4 à O7.

## 5. Questions ouvertes

- **Mozilla Observatory : non vérifié.** L'API a répondu 502 (erreur serveur) à trois reprises ce jour. À relancer sur https://developer.mozilla.org/observatory.
- **securityheaders.com : non vérifié.** Le site est devenu une application JavaScript et son API demande une clé. À relancer dans un navigateur sur https://securityheaders.com/?q=www.big-drama.fr. En lisant les en-têtes à la main, la configuration correspond à ce que ces outils notent en général A/A+, mais je ne préjuge pas de la note.
- **internet.nl : non vérifié.** Le test public est piloté par JavaScript, inexploitable en ligne de commande. Lancer https://www.internet.nl/site/www.big-drama.fr/ dans un navigateur.
- **Lighthouse : non re-mesuré.** PageSpeed Insights a répondu « quota exceeded » (429). Les chiffres de performance viennent de l'audit du 02.11. À refaire sur https://pagespeed.web.dev quand le quota se videra.
- **« Même instance » pour `www.bigdrama.fr` et `bigdrama.fr`** : à confirmer dans le panneau Gandi (le DNS les place sur dc0).
- **Adresse exacte de la boîte Gandi** de big-drama.fr : inconnue de l'audit. À mettre dans `rua=` (DMARC) et comme contact public (S4).
- **La 302 de `dev.bigdrama.fr` vers `ederikadar.lol`** : non re-testée ce jour (règle 2). Dernière preuve : l'en-tête relevé ce matin par l'audit Claude. À re-vérifier avec `curl -sI` (sans suivre la redirection) après le nettoyage.
- **Stratégie du domaine `bigdrama.fr`** (titulaire = ancien associé, DNS encore chez Gandi) : garder, laisser expirer, récupérer ? Question juridique, pas technique.
- **Panneau Gandi** : existence d'un réglage « HTTPS seul » par site (S2) et possibilité d'ajouter HSTS sur la redirection apex (S10) — à vérifier dans l'interface.

## Annexe · blocs `.htaccess` exacts (à écrire dans `exporter.py`)

**Redirection HTTP → HTTPS (S2), à tester derrière Varnish :**

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteCond %{HTTP:X-Forwarded-Proto} !https [NC]
  RewriteRule .* https://www.big-drama.fr%{REQUEST_URI} [R=301,L]
</IfModule>
```

**Cache long (O2), après avoir traité O8 :**

```apache
<IfModule mod_headers.c>
  <FilesMatch "\.(css|js|woff2)$">
    Header set Cache-Control "public, max-age=31536000, immutable"
  </FilesMatch>
  <FilesMatch "\.(webp|jpe?g|png|svg|mp4|mp3)$">
    Header set Cache-Control "public, max-age=2592000"
  </FilesMatch>
</IfModule>
```

**HSTS renforcé (S11) :**

```apache
Header always set Strict-Transport-Security "max-age=63072000; includeSubDomains"
```

Sources utilisées : documentation Gandi pour les valeurs CAA (docs.gandi.net, page « Qu'est-ce qu'un enregistrement de type CAA ? »), SSL Labs (analyse du 02.11.2026 : www A+, apex A), API GitHub (état du dépôt au 02.11.2026). Toutes les autres preuves sont des mesures directes (en-têtes HTTP, DNS, TLS) faites ce jour entre 09:45 et 10:10 UTC.