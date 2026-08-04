from pathlib import Path
import re

alta = Path('src/modules/parametrizaciones/jobtypeCMO/components/AltaDialogBackend.vue')
modificar = Path('src/modules/parametrizaciones/jobtypeCMO/components/ModificarDialog.vue')
css_path = Path('src/assets/css/fm-global.css')

alta_text = alta.read_text(encoding='utf-8')
alta_text = alta_text.replace(
    'class="jobtype-alta-dialog"',
    'class="jobtype-alta-dialog cmo-alta-dialog"',
    1,
)
alta.write_text(alta_text, encoding='utf-8')

modificar_text = modificar.read_text(encoding='utf-8')
modificar_text = modificar_text.replace(
    'class="jobtype-alta-dialog"',
    'class="jobtype-alta-dialog cmo-modificar-dialog"',
    1,
)
modificar.write_text(modificar_text, encoding='utf-8')

css = css_path.read_text(encoding='utf-8')
start = '/* ===== INICIO: cmo-actividad.css ===== */'
end = '/* ===== FIN: cmo-actividad.css ===== */'
css = re.sub(re.escape(start) + r'.*?' + re.escape(end), '', css, flags=re.S).rstrip()

section = r'''
/* ===== INICIO: cmo-actividad.css ===== */
/*
 * CLASIFICACIÓN: [MÓDULO / PANTALLA]
 * PANTALLA: Parametrizaciones > CMO-Actividad.
 * BASE VISUAL: componentes actuales de main.
 */

body .p-dialog.jobtype-alta-dialog.cmo-alta-dialog {
  width: min(1440px, calc(100vw - 24px)) !important;
  height: min(680px, 56vw, calc(100dvh - 24px)) !important;
  max-width: calc(100vw - 24px) !important;
  max-height: calc(100dvh - 24px) !important;
  margin: 0 !important;
}

html body .p-dialog.cmo-alta-dialog .cmo-alta-form {
  width: min(860px, 100%) !important;
  max-width: 860px !important;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr) 120px !important;
  grid-template-rows: auto !important;
  grid-auto-flow: row !important;
  align-items: end !important;
  gap: 10px 14px !important;
}

html body .p-dialog.cmo-alta-dialog .cmo-alta-form > .jobtype-alta-field,
html body .p-dialog.cmo-alta-dialog .cmo-alta-form > .jobtype-alta-field:nth-child(1),
html body .p-dialog.cmo-alta-dialog .cmo-alta-form > .jobtype-alta-field:nth-child(2) {
  width: 100% !important;
  min-width: 0 !important;
  max-width: none !important;
  grid-column: auto !important;
  grid-row: auto !important;
}

html body .p-dialog.cmo-alta-dialog .cmo-alta-form .p-autocomplete,
html body .p-dialog.cmo-alta-dialog .cmo-alta-form .p-autocomplete-input,
html body .p-dialog.cmo-alta-dialog .cmo-alta-form .jobtype-alta-control {
  width: 100% !important;
  min-width: 0 !important;
  max-width: none !important;
}

html body .p-dialog.cmo-alta-dialog .cmo-alta-form > .jobtype-add-button,
html body .p-dialog.cmo-alta-dialog .cmo-alta-form > .jobtype-add-button.p-button {
  width: 120px !important;
  min-width: 120px !important;
  max-width: 120px !important;
  grid-column: 3 !important;
  grid-row: 1 !important;
  align-self: end !important;
  border-radius: 0 !important;
}

body .p-dialog.cmo-alta-dialog .jobtype-alta-grid-wrap {
  width: 100% !important;
  min-width: 0 !important;
}

body .p-dialog.jobtype-alta-dialog.cmo-modificar-dialog {
  width: min(900px, calc(100vw - 32px)) !important;
  height: auto !important;
  min-height: 0 !important;
  max-width: 900px !important;
  max-height: calc(100dvh - 32px) !important;
  margin: 0 !important;
}

html body .p-dialog.cmo-modificar-dialog .cmo-modificar-form {
  width: 100% !important;
  max-width: 960px !important;
  grid-template-columns: repeat(3, minmax(0, 1fr)) !important;
  grid-template-rows: auto !important;
  grid-auto-flow: row !important;
  align-items: end !important;
  gap: 10px 14px !important;
}

html body .p-dialog.cmo-modificar-dialog .cmo-modificar-form > .jobtype-alta-field,
html body .p-dialog.cmo-modificar-dialog .cmo-modificar-form > .jobtype-alta-field:nth-child(1),
html body .p-dialog.cmo-modificar-dialog .cmo-modificar-form > .jobtype-alta-field:nth-child(2),
html body .p-dialog.cmo-modificar-dialog .cmo-modificar-form > .jobtype-alta-field:nth-child(3) {
  width: 100% !important;
  min-width: 0 !important;
  max-width: none !important;
  grid-column: auto !important;
  grid-row: auto !important;
}

html body .p-dialog.cmo-modificar-dialog .cmo-modificar-form .p-autocomplete,
html body .p-dialog.cmo-modificar-dialog .cmo-modificar-form .p-autocomplete-input,
html body .p-dialog.cmo-modificar-dialog .cmo-modificar-form .jobtype-alta-control {
  width: 100% !important;
  min-width: 0 !important;
  max-width: none !important;
}

.cmo-alta-errors,
.cmo-modificar-error {
  padding: 8px 16px 0;
  margin: 0;
}

.cmo-alta-errors__item,
.cmo-modificar-error__item {
  margin: 2px 0;
  padding: 4px 8px;
  border-left: 3px solid #d32f2f;
  background: #fff5f5;
  color: #d32f2f;
  font-size: 11px;
  line-height: 1.4;
}

.cmo-grid-shell,
#tabla-cmo-actividad,
#tabla-cmo-actividad.p-datatable {
  width: 100% !important;
  height: 100% !important;
  min-width: 0 !important;
  min-height: 0 !important;
  flex: 1 1 auto !important;
  display: flex !important;
  flex-direction: column !important;
  overflow: hidden !important;
}

#tabla-cmo-actividad .p-datatable-table-container,
#tabla-cmo-actividad .p-datatable-wrapper,
#tabla-cmo-actividad [data-pc-section="tablecontainer"] {
  width: 100% !important;
  min-width: 0 !important;
  min-height: 0 !important;
  max-height: none !important;
  flex: 1 1 auto !important;
  overflow: auto !important;
}

#tabla-cmo-actividad .p-datatable-table {
  width: 100% !important;
  min-width: 100% !important;
  table-layout: fixed !important;
}

#tabla-cmo-actividad .p-datatable-tbody > tr.p-highlight > td,
#tabla-cmo-actividad .p-datatable-tbody > tr.p-datatable-row-selected > td,
#tabla-cmo-actividad .p-datatable-tbody > tr[data-p-selected='true'] > td,
#tabla-cmo-actividad .p-datatable-tbody > tr[aria-selected='true'] > td {
  background: #9ee7ee !important;
  border-color: #78c5cf !important;
  color: #143d45 !important;
  font-weight: 700 !important;
}

#tabla-cmo-actividad .p-datatable-tbody > tr.p-highlight > td *,
#tabla-cmo-actividad .p-datatable-tbody > tr.p-datatable-row-selected > td *,
#tabla-cmo-actividad .p-datatable-tbody > tr[data-p-selected='true'] > td *,
#tabla-cmo-actividad .p-datatable-tbody > tr[aria-selected='true'] > td * {
  color: #143d45 !important;
  font-weight: 700 !important;
}

#tabla-cmo-actividad .p-datatable-tbody > tr.cmo-row-inactive > td,
#tabla-cmo-actividad .p-datatable-tbody > tr.cmo-row-inactive:hover > td,
#tabla-cmo-actividad .p-datatable-tbody > tr.cmo-row-inactive.p-highlight > td,
#tabla-cmo-actividad .p-datatable-tbody > tr.cmo-row-inactive.p-datatable-row-selected > td,
#tabla-cmo-actividad .p-datatable-tbody > tr.cmo-row-inactive[data-p-selected='true'] > td,
#tabla-cmo-actividad .p-datatable-tbody > tr.cmo-row-inactive[aria-selected='true'] > td {
  background: #edf0f2 !important;
  border-color: #d5dde1 !important;
  color: #75838b !important;
  font-weight: 400 !important;
  cursor: not-allowed !important;
}

#tabla-cmo-actividad .p-datatable-tbody > tr.cmo-row-inactive > td * {
  color: #75838b !important;
  font-weight: 400 !important;
}

@media (max-width: 768px) {
  html body .p-dialog.cmo-alta-dialog .cmo-alta-form,
  html body .p-dialog.cmo-modificar-dialog .cmo-modificar-form {
    grid-template-columns: 1fr !important;
    width: 100% !important;
    max-width: none !important;
  }

  html body .p-dialog.cmo-alta-dialog .cmo-alta-form > .jobtype-add-button,
  html body .p-dialog.cmo-alta-dialog .cmo-alta-form > .jobtype-add-button.p-button {
    width: 100% !important;
    min-width: 0 !important;
    max-width: 100% !important;
    grid-column: 1 !important;
    grid-row: auto !important;
  }
}
/* ===== FIN: cmo-actividad.css ===== */
'''.strip()

css_path.write_text(css + '\n\n' + section + '\n', encoding='utf-8')
