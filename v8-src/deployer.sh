#!/bin/bash
# Big Drama · mise en ligne du dossier exporté (exporter.py) par SFTP, FTPS ou FTP, avec lftp.
#
#   cd bigdrama-maquette/v8-src
#   bash deployer.sh test          connexion et liste du dossier distant, rien n'est modifié
#   bash deployer.sh sauvegarde    copie tout le serveur actuel dans ../../sauvegarde-serveur-AAAA-MM-JJ-HHMM
#   bash deployer.sh essai         montre ce qui serait envoyé, sans rien envoyer
#   bash deployer.sh envoi         envoie le site (ajoute et remplace, ne supprime rien sur le serveur)
#   bash deployer.sh envoi-propre  envoie le site ET supprime du serveur tout ce qui n'en fait pas partie
#                                  (ancien WordPress, fichiers PHP). Demande une sauvegarde et une confirmation.
#
# Réglages : ftp.conf (copié depuis ftp.conf.exemple au premier lancement). Le mot de passe n'est jamais écrit
# dans un fichier : il est demandé à chaque lancement.
set -euo pipefail
ICI="$(cd "$(dirname "$0")" && pwd)"
CONF="$ICI/ftp.conf"
if [ ! -f "$CONF" ]; then
  cp "$ICI/ftp.conf.exemple" "$CONF"
  echo "Réglages créés : $CONF"
  echo "Remplis HOTE, UTILISATEUR, DOSSIER et PROTOCOLE, puis relance : bash deployer.sh test"
  exit 1
fi
# shellcheck disable=SC1090
source "$CONF"
: "${HOTE:?HOTE manquant dans ftp.conf}" "${UTILISATEUR:?UTILISATEUR manquant}" "${DOSSIER:?DOSSIER manquant}" "${PROTOCOLE:=sftp}"
SITE="${SITE:-$ICI/../../bigdrama-en-ligne}"
MODE="${1:-test}"

command -v lftp >/dev/null || { echo "lftp manque. Installe-le : brew install lftp"; exit 1; }
case "$PROTOCOLE" in
  sftp|ftps) ;;
  ftp) echo "ATTENTION : FTP simple envoie le mot de passe en clair. Préfère sftp ou ftps si l'hébergeur le permet."; read -r -p "Continuer en FTP simple ? (oui/non) " R; [ "$R" = "oui" ] || exit 1 ;;
  *) echo "PROTOCOLE doit valoir sftp, ftps ou ftp"; exit 1 ;;
esac
if [[ "$MODE" == envoi* || "$MODE" == essai ]]; then
  [ -f "$SITE/index.html" ] || { echo "Dossier du site introuvable : $SITE. Lance d'abord : python3 exporter.py"; exit 1; }
  if grep -q "noindex,nofollow" "$SITE/index.html"; then echo "Note : cette version interdit l'indexation (--noindex)."; fi
fi

read -r -s -p "Mot de passe pour $UTILISATEUR@$HOTE : " LFTP_PASSWORD; echo
export LFTP_PASSWORD

REGLAGES="set net:max-retries 2; set net:timeout 25; set net:reconnect-interval-base 5; set xfer:clobber on; set sftp:auto-confirm yes"
[ "$PROTOCOLE" = ftps ] && REGLAGES="$REGLAGES; set ftp:ssl-force true; set ftp:ssl-protect-data true; set ssl:verify-certificate yes"
[ "$PROTOCOLE" = ftp ] && REGLAGES="$REGLAGES; set ftp:ssl-allow false"
OUVRIR="open --env-password -u $UTILISATEUR $PROTOCOLE://$HOTE"
EXCLUS="--exclude-glob .DS_Store --exclude-glob ._* --exclude-glob .smbdelete*"

lancer() { lftp -c "$REGLAGES; $OUVRIR; $1"; }

case "$MODE" in
  test)
    lancer "cd '$DOSSIER' && cls -la"
    echo "Connexion réussie. Dossier distant : $DOSSIER" ;;
  sauvegarde)
    CIBLE="$ICI/../../sauvegarde-serveur-$(date +%Y-%m-%d-%H%M)"
    mkdir -p "$CIBLE"
    lancer "mirror --parallel=4 --verbose=1 '$DOSSIER' '$CIBLE'"
    echo "Copie du serveur : $CIBLE"
    echo "Elle peut contenir l'ancien site piraté : ne l'ouvre pas, ne la remets jamais en ligne." ;;
  essai)
    lancer "mirror --reverse --dry-run --only-newer $EXCLUS '$SITE' '$DOSSIER'" ;;
  envoi)
    lancer "mirror --reverse --only-newer --parallel=4 --verbose=1 $EXCLUS '$SITE' '$DOSSIER'"
    echo "Site envoyé. Vérifie l'adresse dans un navigateur privé." ;;
  envoi-propre)
    ls -d "$ICI"/../../sauvegarde-serveur-* >/dev/null 2>&1 || { echo "Fais d'abord : bash deployer.sh sauvegarde"; exit 1; }
    echo "Fichiers du serveur qui seraient SUPPRIMÉS (absents du nouveau site) :"
    lancer "mirror --reverse --dry-run --delete $EXCLUS '$SITE' '$DOSSIER'" | grep -iE "^(rm|Removing)" || echo "(aucun)"
    read -r -p "Tape SUPPRIMER pour envoyer le site et supprimer ces fichiers du serveur : " R
    [ "$R" = "SUPPRIMER" ] || { echo "Annulé, rien n'a changé."; exit 1; }
    lancer "mirror --reverse --delete --parallel=4 --verbose=1 $EXCLUS '$SITE' '$DOSSIER'"
    echo "Site envoyé, anciens fichiers retirés du serveur." ;;
  *) echo "Mode inconnu : $MODE (test, sauvegarde, essai, envoi, envoi-propre)"; exit 1 ;;
esac
unset LFTP_PASSWORD
