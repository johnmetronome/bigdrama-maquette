r=open('_rue.js').read()
tete=open('silhouettes.js').read().split('/* ───────── outils de dessin')[0]
open('silhouettes.js','w').write(tete+open('_outils.js').read()+r)
