#!/usr/bin/env bash
# Big Drama · sécurité de l'instance Gandi après le piratage du 15.11.2026. Auteur : Claude.
# Même réglages et même mot de passe sFTP que deployer.sh (ftp.conf).
#
#   bash securite-gandi.sh inventaire          liste légère de l'instance (sites, racines, tâches planifiées). Ne modifie rien.
#   bash securite-gandi.sh voir <site>         montre le dossier du site et sa racine web. Ne modifie rien.
#   bash securite-gandi.sh isoler <site>       met l'ancien site hors ligne sans rien effacer :
#                                              htdocs est renommé htdocs-pirate-<date> (plus servi par le web),
#                                              un htdocs neuf redirige tout vers https://www.big-drama.fr/
#   bash securite-gandi.sh retablir <site> <dossier>   annule un isolement (remet le dossier renommé en htdocs)
#
# Le site big-drama.fr est protégé : le script refuse d'y toucher.
set -euo pipefail
ICI="$(cd "$(dirname "$0")" && pwd)"
# shellcheck disable=SC1090
source "$ICI/ftp.conf"
: "${HOTE:?}" "${UTILISATEUR:?}" "${PROTOCOLE:=sftp}"
command -v lftp >/dev/null || { echo "lftp manque : brew install lftp"; exit 1; }
VH=/lamp0/web/vhosts
MODE="${1:-inventaire}"; SITE_CIBLE="${2:-}"
DATE="$(date +%Y-%m-%d-%H%M)"

if [ "$MODE" = voir ]; then
  [ -n "$SITE_CIBLE" ] || { echo "Indique le site."; exit 1; }
  case "$SITE_CIBLE" in */*|.*) echo "Nom de site invalide."; exit 1 ;; esac
fi
if [ "$MODE" = isoler ] || [ "$MODE" = retablir ]; then
  [ -n "$SITE_CIBLE" ] || { echo "Indique le site, par exemple : bash securite-gandi.sh $MODE www.bigdrama.fr"; exit 1; }
  case "$SITE_CIBLE" in *big-drama.fr) echo "Refusé : $SITE_CIBLE est le nouveau site."; exit 1 ;; esac
  case "$SITE_CIBLE" in */*|.*) echo "Nom de site invalide."; exit 1 ;; esac
fi

read -r -s -p "Mot de passe pour $UTILISATEUR@$HOTE : " LFTP_PASSWORD; echo
export LFTP_PASSWORD
REGLAGES="set net:max-retries 4; set net:timeout 90; set net:reconnect-interval-base 5; set cmd:fail-exit yes; set sftp:auto-confirm yes"
lancer() { lftp -c "$REGLAGES; open --env-password -u $UTILISATEUR $PROTOCOLE://$HOTE; $1"; }

case "$MODE" in
  inventaire)
    SORTIE="$ICI/../../gandi-inventaire-$DATE.txt"
    {
      echo "### sites"; lancer "cls -l $VH"
      echo "### contenu de chaque site"; lancer "cls -l $VH/*/"
      echo "### racine de chaque site (fichiers cachés compris)"; lancer "cls -la $VH/*/htdocs/"
      echo "### tâches planifiées"; lancer "cls -la /lamp0/etc/cron/"; lancer "cat /lamp0/etc/cron/anacrontab"
    } > "$SORTIE" 2>&1 || true
    echo "$(wc -l < "$SORTIE") lignes · $SORTIE" ;;
  isoler)
    echo "Le site $SITE_CIBLE va être mis hors ligne : $VH/$SITE_CIBLE/htdocs devient htdocs-pirate-$DATE."
    echo "Rien n'est effacé. Annulable avec : bash securite-gandi.sh retablir $SITE_CIBLE htdocs-pirate-$DATE"
    read -r -p "Tape ISOLER pour continuer : " R; [ "$R" = ISOLER ] || { echo "Annulé."; exit 1; }
    T="$(mktemp -d)"
    printf '%s\n' "# Ancien site retiré le $DATE après piratage. Tout part vers le nouveau site." \
      "RedirectMatch 301 ^ https://www.big-drama.fr/" > "$T/.htaccess"
    printf '%s\n' '<!doctype html><meta charset="utf-8"><meta http-equiv="refresh" content="0;url=https://www.big-drama.fr/"><a href="https://www.big-drama.fr/">Big Drama</a>' > "$T/index.html"
    lancer "mv $VH/$SITE_CIBLE/htdocs $VH/$SITE_CIBLE/htdocs-pirate-$DATE; mkdir $VH/$SITE_CIBLE/htdocs; put -O $VH/$SITE_CIBLE/htdocs $T/.htaccess $T/index.html; chmod -R 755 $VH/$SITE_CIBLE/htdocs; cls -la $VH/$SITE_CIBLE/ $VH/$SITE_CIBLE/htdocs/"
    rm -rf "$T"
    echo "Fait. Vérifie : curl -sI https://$SITE_CIBLE/ | head -3" ;;
  voir)
    # lecture seule : le dossier du site et sa racine web, fichiers cachés compris
    lancer "cls -la $VH/$SITE_CIBLE/ $VH/$SITE_CIBLE/htdocs/" ;;
  retablir)
    DOSS="${3:?Indique le dossier à remettre, par exemple htdocs-pirate-2026-11-15-1300}"
    case "$DOSS" in htdocs-pirate-*) ;; *) echo "Dossier invalide."; exit 1 ;; esac
    lancer "mv $VH/$SITE_CIBLE/htdocs $VH/$SITE_CIBLE/htdocs-redirection-$DATE; mv $VH/$SITE_CIBLE/$DOSS $VH/$SITE_CIBLE/htdocs; cls -la $VH/$SITE_CIBLE/" ;;
  *) echo "Mode inconnu : $MODE (inventaire, voir, isoler, retablir)"; exit 1 ;;
esac
unset LFTP_PASSWORD
