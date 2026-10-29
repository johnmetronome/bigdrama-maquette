#!/bin/zsh -f
set -eu
cd -- "${0:A:h}/.."
exec /usr/bin/python3 - <<'PY'
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
import subprocess, threading

class Apercu(SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Cache-Control', 'no-store')
        super().end_headers()

serveur = ThreadingHTTPServer(('127.0.0.1', 0), Apercu)
adresse = f'http://127.0.0.1:{serveur.server_port}/v8/?direct&v=8.19'
print('\nBig Drama · V8.19 · aperçu local\n' + adresse, flush=True)
print('Garder cette fenêtre ouverte. Ctrl+C pour arrêter.\n', flush=True)
threading.Timer(0.4, lambda: subprocess.Popen(['/usr/bin/open', adresse])).start()
try:
    serveur.serve_forever()
except KeyboardInterrupt:
    pass
finally:
    serveur.server_close()
PY
