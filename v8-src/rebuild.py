from pathlib import Path
import runpy, shutil, os
here = Path(__file__).resolve().parent
os.chdir(here)
runpy.run_path(str(here / 'build.py'))
out = here.parent / 'v8'
out.mkdir(exist_ok=True)
for source, target in [('apparitions.html','apparitions.html'),('_app.js','app.js'),('_style.css','style.css'),('silhouettes.js','silhouettes.js'),('lieux.js','lieux.js'),('index.template.html','index.html')]:
    shutil.copy2(here/source, out/target)
print(out)
