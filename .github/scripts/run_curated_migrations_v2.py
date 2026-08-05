from pathlib import Path
import runpy

script_path = Path('.github/scripts/prepare_curated_migrations.py')
text = script_path.read_text(encoding='utf-8')
old = r'\n      \},",'
new = r'\n      \},?",'

if old not in text:
    raise SystemExit('No se encontró el patrón de cierre de rutas hijas.')

script_path.write_text(text.replace(old, new, 1), encoding='utf-8')
runpy.run_path(str(script_path), run_name='__main__')
