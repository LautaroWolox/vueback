from pathlib import Path
import re

alta_path = Path('src/modules/parametrizaciones/jobtypeCMO/components/AltaDialogBackend.vue')
modificar_path = Path('src/modules/parametrizaciones/jobtypeCMO/components/ModificarDialog.vue')
css_path = Path('src/assets/css/fm-global.css')

# Los componentes sólo conservan clases funcionales. Todas las medidas y el
# acabado visual de los botones se controlan desde fm-global.css.
for path in (alta_path, modificar_path):
    text = path.read_text(encoding='utf-8')
    text = re.sub(
        r'(class="jobtype-(?:add|relate)-button"\n)\s*style="[^"]*"\n',
        r'\1',
        text,
    )
    path.write_text(text, encoding='utf-8')

css = css_path.read_text(encoding='utf-8')
marker = '/* ===== FIN: cmo-actividad.css ===== */'
if marker not in css:
    raise SystemExit('No se encontró la sección CMO en fm-global.css')

button_start = '/* --- Botones CMO iguales a Jobtype-Contrato --- */'
button_end = '/* --- Fin botones CMO --- */'
css = re.sub(
    re.escape(button_start) + r'.*?' + re.escape(button_end),
    '',
    css,
    flags=re.S,
)

button_css = r'''
/* --- Botones CMO iguales a Jobtype-Contrato --- */
html body .p-dialog.cmo-alta-dialog .cmo-alta-form > .jobtype-add-button,
html body .p-dialog.cmo-alta-dialog .cmo-alta-form > .jobtype-add-button.p-button,
html body .p-dialog.cmo-alta-dialog .p-dialog-footer .jobtype-relate-button,
html body .p-dialog.cmo-alta-dialog .p-dialog-footer .jobtype-relate-button.p-button,
html body .p-dialog.cmo-modificar-dialog .p-dialog-footer .jobtype-relate-button,
html body .p-dialog.cmo-modificar-dialog .p-dialog-footer .jobtype-relate-button.p-button {
  width: auto !important;
  min-width: 110px !important;
  max-width: none !important;
  height: 34px !important;
  min-height: 34px !important;
  max-height: 34px !important;
  padding: 0 16px !important;
  border-radius: 8px !important;
  gap: 7px !important;
  font-size: 12px !important;
  font-weight: 600 !important;
  line-height: 1 !important;
  letter-spacing: 0 !important;
  box-shadow: 0 4px 12px rgba(0, 73, 84, 0.13) !important;
  transform: none !important;
}

html body .p-dialog.cmo-alta-dialog .cmo-alta-form > .jobtype-add-button,
html body .p-dialog.cmo-alta-dialog .cmo-alta-form > .jobtype-add-button.p-button {
  grid-column: 3 !important;
  grid-row: 1 !important;
  align-self: end !important;
  justify-self: start !important;
}

html body .p-dialog.cmo-alta-dialog .jobtype-add-button:disabled,
html body .p-dialog.cmo-alta-dialog .jobtype-add-button.p-disabled,
html body .p-dialog.cmo-alta-dialog .jobtype-relate-button:disabled,
html body .p-dialog.cmo-alta-dialog .jobtype-relate-button.p-disabled,
html body .p-dialog.cmo-modificar-dialog .jobtype-relate-button:disabled,
html body .p-dialog.cmo-modificar-dialog .jobtype-relate-button.p-disabled {
  border-color: #c9d2d7 !important;
  background: #dbe1e4 !important;
  color: #7c8a92 !important;
  opacity: 1 !important;
  box-shadow: 0 4px 12px rgba(0, 73, 84, 0.13) !important;
  cursor: not-allowed !important;
}

@media (max-width: 768px) {
  html body .p-dialog.cmo-alta-dialog .cmo-alta-form > .jobtype-add-button,
  html body .p-dialog.cmo-alta-dialog .cmo-alta-form > .jobtype-add-button.p-button {
    width: 100% !important;
    min-width: 0 !important;
    max-width: 100% !important;
    grid-column: 1 !important;
    grid-row: auto !important;
  }
}
/* --- Fin botones CMO --- */
'''.strip()

css = css.replace(marker, button_css + '\n' + marker, 1)
css_path.write_text(css, encoding='utf-8')
