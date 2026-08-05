from pathlib import Path
import re

ROOT = Path('.')
MAIN_PATH = ROOT / 'src/main.js'
INDEX_PATH = ROOT / 'index.html'
MENU_PATH = ROOT / 'src/components/CustomMenu.vue'
THEME_PATH = ROOT / 'src/composables/useTheme.js'
CSS_PATH = ROOT / 'src/assets/css/fm-global.css'


def replace_once(text: str, old: str, new: str, label: str) -> str:
    if old not in text:
        raise SystemExit(f'No se encontró el bloque requerido: {label}')
    return text.replace(old, new, 1)


# ---------------------------------------------------------------------------
# Composable global: preferencia persistente, sistema como valor inicial y
# sincronización del atributo/clase sobre <html>.
# ---------------------------------------------------------------------------
THEME_PATH.parent.mkdir(parents=True, exist_ok=True)
THEME_PATH.write_text(
    """import { computed, ref } from 'vue'\n\n"
    "const STORAGE_KEY = 'fm-theme'\n"
    "const DARK_CLASS = 'fm-dark'\n"
    "const currentTheme = ref('light')\n"
    "let initialized = false\n\n"
    "const isBrowser = () => typeof window !== 'undefined' && typeof document !== 'undefined'\n\n"
    "const getStoredTheme = () => {\n"
    "  if (!isBrowser()) return null\n"
    "  try {\n"
    "    const value = window.localStorage.getItem(STORAGE_KEY)\n"
    "    return value === 'dark' || value === 'light' ? value : null\n"
    "  } catch {\n"
    "    return null\n"
    "  }\n"
    "}\n\n"
    "const getSystemTheme = () => {\n"
    "  if (!isBrowser() || !window.matchMedia) return 'light'\n"
    "  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'\n"
    "}\n\n"
    "const updateThemeColor = (theme) => {\n"
    "  if (!isBrowser()) return\n"
    "  const meta = document.querySelector('meta[name=\\\"theme-color\\\"]')\n"
    "  meta?.setAttribute('content', theme === 'dark' ? '#0b1419' : '#f4f7f8')\n"
    "}\n\n"
    "const applyTheme = (theme, persist = false) => {\n"
    "  const normalized = theme === 'dark' ? 'dark' : 'light'\n"
    "  currentTheme.value = normalized\n"
    "  if (!isBrowser()) return\n\n"
    "  document.documentElement.classList.toggle(DARK_CLASS, normalized === 'dark')\n"
    "  document.documentElement.dataset.theme = normalized\n"
    "  document.documentElement.style.colorScheme = normalized\n"
    "  updateThemeColor(normalized)\n\n"
    "  if (persist) {\n"
    "    try {\n"
    "      window.localStorage.setItem(STORAGE_KEY, normalized)\n"
    "    } catch {\n"
    "      // El tema continúa funcionando aunque el almacenamiento esté bloqueado.\n"
    "    }\n"
    "  }\n"
    "}\n\n"
    "export const initializeTheme = () => {\n"
    "  if (!isBrowser()) return 'light'\n"
    "  if (initialized) return currentTheme.value\n"
    "  initialized = true\n\n"
    "  const initialTheme = getStoredTheme() ?? getSystemTheme()\n"
    "  applyTheme(initialTheme)\n\n"
    "  const mediaQuery = window.matchMedia?.('(prefers-color-scheme: dark)')\n"
    "  mediaQuery?.addEventListener?.('change', (event) => {\n"
    "    if (!getStoredTheme()) applyTheme(event.matches ? 'dark' : 'light')\n"
    "  })\n\n"
    "  window.addEventListener('storage', (event) => {\n"
    "    if (event.key !== STORAGE_KEY) return\n"
    "    if (event.newValue === 'dark' || event.newValue === 'light') {\n"
    "      applyTheme(event.newValue)\n"
    "    }\n"
    "  })\n\n"
    "  return initialTheme\n"
    "}\n\n"
    "export const useTheme = () => {\n"
    "  if (!initialized) initializeTheme()\n\n"
    "  const isDark = computed(() => currentTheme.value === 'dark')\n"
    "  const setTheme = (theme) => applyTheme(theme, true)\n"
    "  const toggleTheme = () => setTheme(isDark.value ? 'light' : 'dark')\n\n"
    "  return {\n"
    "    theme: computed(() => currentTheme.value),\n"
    "    isDark,\n"
    "    setTheme,\n"
    "    toggleTheme\n"
    "  }\n"
    "}\n",
    encoding='utf-8'
)


# ---------------------------------------------------------------------------
# Inicialización PrimeVue y tema antes del montaje.
# ---------------------------------------------------------------------------
main = MAIN_PATH.read_text(encoding='utf-8')
if "import { initializeTheme } from './composables/useTheme.js'" not in main:
    main = replace_once(
        main,
        "import { installReportSasAutoHeight } from './plugins/reportSasAutoHeight.js'\n",
        "import { installReportSasAutoHeight } from './plugins/reportSasAutoHeight.js'\n"
        "import { initializeTheme } from './composables/useTheme.js'\n",
        'import de initializeTheme'
    )

if 'initializeTheme()\n\nconst pinia' not in main:
    main = replace_once(
        main,
        'const pinia = createPinia()\n',
        'initializeTheme()\n\nconst pinia = createPinia()\n',
        'inicialización temprana del tema'
    )

main = main.replace("darkModeSelector: false", "darkModeSelector: '.fm-dark'", 1)
MAIN_PATH.write_text(main, encoding='utf-8')


# ---------------------------------------------------------------------------
# Script mínimo en index.html para evitar un destello claro antes de Vue.
# ---------------------------------------------------------------------------
index = INDEX_PATH.read_text(encoding='utf-8')
if '<meta name="theme-color"' not in index:
    index = replace_once(
        index,
        '    <meta name="viewport" content="width=device-width, initial-scale=1.0">\n',
        '    <meta name="viewport" content="width=device-width, initial-scale=1.0">\n'
        '    <meta name="theme-color" content="#f4f7f8">\n',
        'meta theme-color'
    )

if 'data-fm-theme-bootstrap' not in index:
    bootstrap = """    <script data-fm-theme-bootstrap>
      (() => {
        try {
          const stored = localStorage.getItem('fm-theme')
          const dark = stored === 'dark' || (
            stored !== 'light' && window.matchMedia('(prefers-color-scheme: dark)').matches
          )
          const theme = dark ? 'dark' : 'light'
          document.documentElement.classList.toggle('fm-dark', dark)
          document.documentElement.dataset.theme = theme
          document.documentElement.style.colorScheme = theme
          document.querySelector('meta[name="theme-color"]')
            ?.setAttribute('content', dark ? '#0b1419' : '#f4f7f8')
        } catch {
          document.documentElement.dataset.theme = 'light'
        }
      })()
    </script>
"""
    index = replace_once(index, '    <title>Field Manager</title>\n', '    <title>Field Manager</title>\n' + bootstrap, 'bootstrap del tema')

INDEX_PATH.write_text(index, encoding='utf-8')


# ---------------------------------------------------------------------------
# Selector visual en el menú. No se agregan estilos locales al componente.
# ---------------------------------------------------------------------------
menu = MENU_PATH.read_text(encoding='utf-8')
if 'class="fm-theme-toggle"' not in menu:
    menu = replace_once(
        menu,
        '      <template #end>\n        <div ref="userSectionRef" class="user-section">',
        '''      <template #end>
        <div class="menu-end-actions">
          <Button
            class="fm-theme-toggle"
            text
            type="button"
            :title="themeToggleLabel"
            :aria-label="themeToggleLabel"
            :aria-pressed="isDark"
            @click.stop="toggleTheme"
          >
            <i
              class="pi fm-theme-toggle__icon"
              :class="isDark ? 'pi-sun' : 'pi-moon'"
              aria-hidden="true"
            ></i>
            <span class="fm-theme-toggle__label">
              {{ isDark ? 'Claro' : 'Oscuro' }}
            </span>
          </Button>

          <div ref="userSectionRef" class="user-section">''',
        'botón selector de tema'
    )

    menu = replace_once(
        menu,
        '''        </div>
      </template>
    </Menubar>''',
        '''          </div>
        </div>
      </template>
    </Menubar>''',
        'cierre del contenedor del menú'
    )

if "import { useTheme } from '@/composables/useTheme.js'" not in menu:
    menu = replace_once(
        menu,
        "import { useAuthStore } from '@/store/auth'\n",
        "import { useAuthStore } from '@/store/auth'\n"
        "import { useTheme } from '@/composables/useTheme.js'\n",
        'import de useTheme'
    )

if 'const { isDark, toggleTheme } = useTheme()' not in menu:
    menu = replace_once(
        menu,
        'const items = ref(getRutas(rutas))\n\nconst userLabel',
        "const items = ref(getRutas(rutas))\n"
        "const { isDark, toggleTheme } = useTheme()\n\n"
        "const themeToggleLabel = computed(() =>\n"
        "  isDark.value ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'\n"
        ")\n\n"
        "const userLabel",
        'estado del selector de tema'
    )

MENU_PATH.write_text(menu, encoding='utf-8')


# ---------------------------------------------------------------------------
# Paleta y overrides globales. Se mantiene todo dentro de fm-global.css.
# ---------------------------------------------------------------------------
css = CSS_PATH.read_text(encoding='utf-8')
start = '/* ===== INICIO: modo-oscuro.css ===== */'
end = '/* ===== FIN: modo-oscuro.css ===== */'
css = re.sub(re.escape(start) + r'.*?' + re.escape(end), '', css, flags=re.S).rstrip()

dark_section = r'''
/* ===== INICIO: modo-oscuro.css ===== */
/*
 * CLASIFICACIÓN: [GLOBAL / TEMA]
 * RESPONSABILIDAD:
 *   - variables semánticas para claro y oscuro;
 *   - selector de tema del menú principal;
 *   - compatibilidad visual con componentes PrimeVue y componentes FM;
 *   - adaptación de paneles, formularios, grillas, diálogos y overlays.
 * ACTIVACIÓN: clase .fm-dark sobre document.documentElement.
 * PERSISTENCIA: localStorage, clave fm-theme.
 */

:root {
  --fm-surface-page: #f4f7f8;
  --fm-surface-1: #ffffff;
  --fm-surface-2: #f8f9fa;
  --fm-surface-3: #f3f7f9;
  --fm-surface-input: #ffffff;
  --fm-heading: #101820;
  --fm-row-hover: #f1fbfc;
  --fm-row-selected: #9debf3;
  --fm-row-selected-text: #112f39;
  --fm-disabled-bg: #eef1f3;
  --fm-disabled-text: #7b8991;
  --fm-warning: #c58b13;
  --fm-success: #168a66;
  --fm-info: #287caf;
  --fm-overlay: rgba(234, 252, 255, .78);
  --fm-menu-surface: #ffffff;
  --fm-menu-text: #334853;
}

html.fm-dark {
  color-scheme: dark;
  --fm-bg: #0b1419;
  --fm-white: #121d23;
  --fm-text: #e8f1f4;
  --fm-text-muted: #a5b7bf;
  --fm-border: #2f444d;
  --fm-border-strong: #3c5964;
  --fm-header-bg: #17252c;
  --fm-grid-empty: #102c33;
  --fm-cyan: #21c4d6;
  --fm-cyan-strong: #0fa9bb;
  --fm-cyan-dark: #72e1ec;
  --fm-cyan-soft: #12343b;
  --fm-danger: #ff6b75;
  --fm-shadow-button: 0 5px 14px rgba(0, 0, 0, .34);
  --fm-shadow-popup: 0 20px 55px rgba(0, 0, 0, .58);

  --fm-surface-page: #0b1419;
  --fm-surface-1: #121d23;
  --fm-surface-2: #18262d;
  --fm-surface-3: #17252c;
  --fm-surface-input: #101a20;
  --fm-heading: #f0f7f9;
  --fm-row-hover: #16323a;
  --fm-row-selected: #14505a;
  --fm-row-selected-text: #f1feff;
  --fm-disabled-bg: #223139;
  --fm-disabled-text: #758991;
  --fm-warning: #f4c95d;
  --fm-success: #49d6a2;
  --fm-info: #69bdf7;
  --fm-overlay: rgba(5, 15, 19, .76);
  --fm-menu-surface: #121d23;
  --fm-menu-text: #e8f1f4;

  /* Tokens PrimeVue v4 para mantener la misma paleta en overlays teletransportados. */
  --p-surface-0: #ffffff;
  --p-surface-50: #f4f7f8;
  --p-surface-100: #e8f1f4;
  --p-surface-200: #cbd9de;
  --p-surface-300: #a5b7bf;
  --p-surface-400: #758991;
  --p-surface-500: #536871;
  --p-surface-600: #3c5964;
  --p-surface-700: #2f444d;
  --p-surface-800: #18262d;
  --p-surface-900: #121d23;
  --p-surface-950: #0b1419;
  --p-content-background: #121d23;
  --p-content-hover-background: #16323a;
  --p-content-border-color: #2f444d;
  --p-content-color: #e8f1f4;
  --p-content-hover-color: #f1feff;
  --p-form-field-background: #101a20;
  --p-form-field-disabled-background: #223139;
  --p-form-field-filled-background: #101a20;
  --p-form-field-filled-hover-background: #15232a;
  --p-form-field-border-color: #3c5964;
  --p-form-field-hover-border-color: #21c4d6;
  --p-form-field-focus-border-color: #21c4d6;
  --p-form-field-color: #e8f1f4;
  --p-form-field-placeholder-color: #82969f;
  --p-overlay-select-background: #121d23;
  --p-overlay-select-border-color: #2f444d;
  --p-overlay-popover-background: #121d23;
  --p-overlay-popover-border-color: #2f444d;
  --p-dialog-background: #121d23;
  --p-dialog-color: #e8f1f4;
}

html.fm-dark,
html.fm-dark body,
html.fm-dark #app {
  background: var(--fm-bg) !important;
  color: var(--fm-text) !important;
}

html.fm-dark body,
html.fm-dark .main-layout,
html.fm-dark .fm-screen,
html.fm-dark .fm-module-page,
html.fm-dark .fm-responsive-page {
  color: var(--fm-text) !important;
}

html.fm-dark .main-layout {
  background:
    radial-gradient(circle at 18% 26%, rgba(33, 196, 214, .10), transparent 28%),
    linear-gradient(180deg, #0d181e 0%, #0b1419 100%) !important;
}

html.fm-dark .spacer {
  background: #0f1a20 !important;
}

html.fm-dark .fm-card,
html.fm-dark .fm-panel,
html.fm-dark .fm-ui-section,
html.fm-dark .fm-accordion .p-accordionpanel,
html.fm-dark .fm-pt-accordion-panel,
html.fm-dark .fm-card__body,
html.fm-dark .fm-panel-content,
html.fm-dark .fm-ui-section-body,
html.fm-dark .fm-accordion .p-accordioncontent-content,
html.fm-dark .fm-pt-accordion-content,
html.fm-dark .jobtype-panel,
html.fm-dark .jobtype-panel__body,
html.fm-dark .jobtype-search-body,
html.fm-dark .jobtype-results-body {
  border-color: var(--fm-border) !important;
  background: var(--fm-surface-1) !important;
  color: var(--fm-text) !important;
}

html.fm-dark .fm-card__header,
html.fm-dark .fm-panel-header,
html.fm-dark .fm-ui-section-header,
html.fm-dark .fm-accordion .p-accordionheader,
html.fm-dark .fm-pt-accordion-header,
html.fm-dark .fm-grid-title,
html.fm-dark .fm-ui-grid-title,
html.fm-dark .jobtype-panel__header {
  border-color: var(--fm-border) !important;
  background: var(--fm-surface-3) !important;
  color: var(--fm-heading) !important;
}

html.fm-dark .fm-field label,
html.fm-dark .fm-field__label,
html.fm-dark label,
html.fm-dark legend,
html.fm-dark .p-dialog-title,
html.fm-dark .jobtype-alta-header__title {
  color: var(--fm-heading) !important;
}

html.fm-dark .p-inputtext,
html.fm-dark .p-select,
html.fm-dark .p-multiselect,
html.fm-dark .p-autocomplete-input,
html.fm-dark .p-datepicker-input,
html.fm-dark textarea,
html.fm-dark .fm-input,
html.fm-dark .fm-select,
html.fm-dark .fm-column-filter,
html.fm-dark .fm-date-button,
html.fm-dark .jobtype-alta-control {
  border-color: var(--fm-border-strong) !important;
  background: var(--fm-surface-input) !important;
  color: var(--fm-text) !important;
  caret-color: var(--fm-cyan) !important;
}

html.fm-dark .p-inputtext::placeholder,
html.fm-dark textarea::placeholder,
html.fm-dark input::placeholder {
  color: #82969f !important;
  opacity: 1 !important;
}

html.fm-dark .p-inputtext:focus,
html.fm-dark .p-select.p-focus,
html.fm-dark .p-multiselect.p-focus,
html.fm-dark .p-autocomplete-input:focus,
html.fm-dark textarea:focus,
html.fm-dark .fm-input:focus,
html.fm-dark .fm-select:focus {
  border-color: var(--fm-cyan) !important;
  box-shadow: 0 0 0 2px rgba(33, 196, 214, .18) !important;
}

html.fm-dark .p-disabled,
html.fm-dark .p-inputtext:disabled,
html.fm-dark .p-select.p-disabled,
html.fm-dark .p-multiselect.p-disabled,
html.fm-dark .fm-field--disabled,
html.fm-dark input:disabled,
html.fm-dark textarea:disabled {
  border-color: #31464f !important;
  background: var(--fm-disabled-bg) !important;
  color: var(--fm-disabled-text) !important;
  -webkit-text-fill-color: var(--fm-disabled-text) !important;
  opacity: 1 !important;
}

html.fm-dark .p-select-overlay,
html.fm-dark .p-multiselect-overlay,
html.fm-dark .p-autocomplete-overlay,
html.fm-dark .p-menu-overlay,
html.fm-dark .p-popover,
html.fm-dark .p-datepicker-panel,
html.fm-dark .fm-calendar,
html.fm-dark .p-tieredmenu,
html.fm-dark .p-contextmenu {
  border-color: var(--fm-border) !important;
  background: var(--fm-surface-1) !important;
  color: var(--fm-text) !important;
  box-shadow: var(--fm-shadow-popup) !important;
}

html.fm-dark .p-select-option,
html.fm-dark .p-multiselect-option,
html.fm-dark .p-autocomplete-option,
html.fm-dark .p-menuitem-content,
html.fm-dark .p-datepicker-day {
  color: var(--fm-text) !important;
}

html.fm-dark .p-select-option:hover,
html.fm-dark .p-multiselect-option:hover,
html.fm-dark .p-autocomplete-option:hover,
html.fm-dark .p-menuitem-content:hover,
html.fm-dark .p-datepicker-day:not(.p-disabled):hover {
  background: var(--fm-row-hover) !important;
  color: var(--fm-row-selected-text) !important;
}

html.fm-dark .p-select-option.p-selected,
html.fm-dark .p-multiselect-option.p-selected,
html.fm-dark .p-autocomplete-option.p-selected,
html.fm-dark .p-datepicker-day-selected,
html.fm-dark .p-datepicker-day.p-highlight {
  background: var(--fm-row-selected) !important;
  color: var(--fm-row-selected-text) !important;
}

html.fm-dark .fm-grid-shell,
html.fm-dark .fm-ui-grid-shell,
html.fm-dark .fm-pass-grid,
html.fm-dark .fm-pt-datatable,
html.fm-dark .fm-pass-grid .p-datatable-table-container,
html.fm-dark .fm-pass-grid .p-datatable-wrapper,
html.fm-dark .fm-pt-datatable-wrapper,
html.fm-dark .p-datatable,
html.fm-dark .p-datatable-table-container,
html.fm-dark .p-datatable-wrapper {
  border-color: var(--fm-border) !important;
  background: var(--fm-surface-1) !important;
  color: var(--fm-text) !important;
}

html.fm-dark .fm-pass-grid .p-datatable-thead > tr > th,
html.fm-dark .fm-pt-datatable .p-datatable-thead > tr > th,
html.fm-dark .p-datatable .p-datatable-thead > tr > th {
  border-color: var(--fm-border-strong) !important;
  background: var(--fm-surface-3) !important;
  color: #d9e8ed !important;
}

html.fm-dark .fm-pass-grid .p-datatable-thead > tr.p-datatable-filter-row > th,
html.fm-dark .fm-pass-grid .p-datatable-thead > tr.p-filter-row > th,
html.fm-dark .p-datatable .p-datatable-thead > tr.p-datatable-filter-row > th {
  background: var(--fm-surface-1) !important;
}

html.fm-dark .fm-pass-grid .p-datatable-tbody > tr > td,
html.fm-dark .fm-pt-datatable .p-datatable-tbody > tr > td,
html.fm-dark .p-datatable .p-datatable-tbody > tr > td {
  border-color: var(--fm-border) !important;
  background: var(--fm-surface-1) !important;
  color: var(--fm-text) !important;
}

html.fm-dark .fm-pass-grid .p-datatable-tbody > tr:hover > td,
html.fm-dark .p-datatable .p-datatable-tbody > tr:hover > td {
  background: var(--fm-row-hover) !important;
  color: var(--fm-row-selected-text) !important;
}

html.fm-dark .fm-pass-grid .p-datatable-tbody > tr.p-highlight > td,
html.fm-dark .p-datatable .p-datatable-tbody > tr.p-highlight > td,
html.fm-dark .p-datatable .p-datatable-tbody > tr.p-datatable-row-selected > td,
html.fm-dark .p-datatable .p-datatable-tbody > tr[data-p-selected='true'] > td,
html.fm-dark .fm-selected-row > td {
  background: var(--fm-row-selected) !important;
  color: var(--fm-row-selected-text) !important;
  font-weight: 700 !important;
}

html.fm-dark .fm-pass-grid .p-datatable-tbody > tr.p-highlight > td *,
html.fm-dark .p-datatable .p-datatable-tbody > tr.p-highlight > td *,
html.fm-dark .p-datatable .p-datatable-tbody > tr.p-datatable-row-selected > td * {
  color: var(--fm-row-selected-text) !important;
}

html.fm-dark .fm-disabled-row > td,
html.fm-dark .jobtype-row-inactive > td,
html.fm-dark .cmo-row-inactive > td {
  border-color: #30434b !important;
  background: var(--fm-disabled-bg) !important;
  color: var(--fm-disabled-text) !important;
}

html.fm-dark .fm-grid-empty,
html.fm-dark .jobtype-alta-empty {
  background: var(--fm-grid-empty) !important;
  color: #9ec3cc !important;
}

html.fm-dark .fm-pass-grid .p-paginator,
html.fm-dark .fm-pt-paginator,
html.fm-dark .p-paginator {
  border-color: var(--fm-border) !important;
  background: var(--fm-surface-1) !important;
  color: var(--fm-text) !important;
}

html.fm-dark .p-paginator button,
html.fm-dark .p-paginator .p-paginator-page {
  color: var(--fm-text-muted) !important;
}

html.fm-dark .p-paginator .p-paginator-page.p-paginator-page-selected {
  background: var(--fm-cyan-soft) !important;
  color: var(--fm-cyan-dark) !important;
}

html.fm-dark .fm-dialog,
html.fm-dark .fm-alert-dialog,
html.fm-dark .fm-pt-dialog,
html.fm-dark .p-dialog,
html.fm-dark .jobtype-alta-dialog,
html.fm-dark .jobtype-contrato-edit-dialog {
  border-color: var(--fm-border) !important;
  background: var(--fm-surface-1) !important;
  color: var(--fm-text) !important;
  box-shadow: var(--fm-shadow-popup) !important;
}

html.fm-dark .fm-dialog .p-dialog-header,
html.fm-dark .fm-alert-dialog .p-dialog-header,
html.fm-dark .p-dialog .p-dialog-header,
html.fm-dark .jobtype-alta-header {
  border-color: var(--fm-border) !important;
  background: var(--fm-surface-2) !important;
  color: var(--fm-heading) !important;
}

html.fm-dark .fm-dialog .p-dialog-content,
html.fm-dark .fm-alert-dialog .p-dialog-content,
html.fm-dark .p-dialog .p-dialog-content,
html.fm-dark .jobtype-alta-content {
  background: var(--fm-surface-1) !important;
  color: var(--fm-text) !important;
}

html.fm-dark .fm-dialog .p-dialog-footer,
html.fm-dark .fm-alert-dialog .p-dialog-footer,
html.fm-dark .p-dialog .p-dialog-footer {
  border-color: var(--fm-border) !important;
  background: var(--fm-surface-2) !important;
  color: var(--fm-text) !important;
}

html.fm-dark .p-dialog-close-button,
html.fm-dark .jobtype-alta-header__close,
html.fm-dark .fm-icon-button,
html.fm-dark .fm-icon-btn,
html.fm-dark .fm-grid-action-final,
html.fm-dark .fm-grid-actions-final .p-button {
  color: #b9ccd3 !important;
}

html.fm-dark .p-dialog-close-button:hover,
html.fm-dark .jobtype-alta-header__close:hover,
html.fm-dark .fm-icon-button:hover,
html.fm-dark .fm-icon-btn:hover {
  background: var(--fm-cyan-soft) !important;
  color: var(--fm-cyan-dark) !important;
}

html.fm-dark .fm-action-button--primary,
html.fm-dark .fm-btn--primary,
html.fm-dark .fm-ui-button--primary,
html.fm-dark .p-button:not(.p-button-outlined):not(.p-button-text):not(:disabled) {
  border-color: var(--fm-cyan) !important;
  background: var(--fm-cyan) !important;
  color: #07171c !important;
}

html.fm-dark .fm-action-button--outline,
html.fm-dark .fm-btn--outline,
html.fm-dark .fm-ui-button--outline,
html.fm-dark .p-button.p-button-outlined {
  border-color: var(--fm-cyan) !important;
  background: transparent !important;
  color: var(--fm-cyan-dark) !important;
}

html.fm-dark .fm-action-button:disabled,
html.fm-dark .fm-btn:disabled,
html.fm-dark .fm-ui-button:disabled,
html.fm-dark .p-button:disabled {
  border-color: #31464f !important;
  background: var(--fm-disabled-bg) !important;
  color: var(--fm-disabled-text) !important;
  box-shadow: none !important;
}

html.fm-dark .p-checkbox .p-checkbox-box {
  border-color: var(--fm-border-strong) !important;
  background: var(--fm-surface-input) !important;
}

html.fm-dark .p-checkbox.p-highlight .p-checkbox-box,
html.fm-dark .p-checkbox-checked .p-checkbox-box {
  border-color: var(--fm-cyan) !important;
  background: var(--fm-cyan) !important;
}

html.fm-dark .p-checkbox.p-highlight .p-checkbox-icon,
html.fm-dark .p-checkbox-checked .p-checkbox-icon {
  color: #07171c !important;
}

html.fm-dark .fm-typing-loader {
  background: var(--fm-overlay) !important;
}

html.fm-dark .fm-typing-loader__box {
  border-color: var(--fm-border) !important;
  background: rgba(18, 29, 35, .97) !important;
  color: var(--fm-text) !important;
  box-shadow: var(--fm-shadow-popup) !important;
}

html.fm-dark .p-toast-message,
html.fm-dark .p-message,
html.fm-dark .p-confirmdialog {
  border-color: var(--fm-border) !important;
  background: var(--fm-surface-2) !important;
  color: var(--fm-text) !important;
}

/* Menú principal y selector claro/oscuro. */
.menu-end-actions {
  height: 42px;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
  margin-left: auto;
}

.fm-theme-toggle,
.fm-theme-toggle.p-button {
  min-width: 94px !important;
  height: 34px !important;
  min-height: 34px !important;
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
  gap: 7px !important;
  padding: 0 10px !important;
  border: 1px solid rgba(255, 255, 255, .30) !important;
  border-radius: 9px !important;
  background: rgba(0, 111, 127, .20) !important;
  color: #ffffff !important;
  box-shadow: none !important;
}

.fm-theme-toggle:hover,
.fm-theme-toggle.p-button:hover {
  border-color: rgba(255, 255, 255, .48) !important;
  background: rgba(0, 105, 120, .34) !important;
  color: #ffffff !important;
  box-shadow: none !important;
  transform: none !important;
}

.fm-theme-toggle__icon {
  color: #ffffff !important;
  font-size: 13px;
}

.fm-theme-toggle__label {
  color: #ffffff !important;
  font-size: 11px;
  font-weight: 700;
}

html.fm-dark .main-menu,
html.fm-dark .main-menu.p-menubar,
html.fm-dark .p-menubar {
  background: #006f7d !important;
}

html.fm-dark .p-menubar-root-list > .p-menubar-item > .p-menubar-item-content:hover,
html.fm-dark .p-menubar-root-list > .p-menubar-item.p-focus > .p-menubar-item-content,
html.fm-dark .p-menubar-root-list > .p-menubar-item.p-menubar-item-active > .p-menubar-item-content {
  background: #008fa1 !important;
}

html.fm-dark .p-menubar-submenu,
html.fm-dark .p-submenu-list,
html.fm-dark .dropdown-content,
html.fm-dark .user-info,
html.fm-dark .logout-area {
  border-color: var(--fm-border) !important;
  background: var(--fm-menu-surface) !important;
  color: var(--fm-menu-text) !important;
}

html.fm-dark .p-menubar-submenu .p-menubar-item-content,
html.fm-dark .p-submenu-list .p-menubar-item-content,
html.fm-dark .p-submenu-list .p-menuitem-content {
  border-color: var(--fm-border) !important;
  background: var(--fm-menu-surface) !important;
}

html.fm-dark .fm-menu-link--submenu,
html.fm-dark .fm-menu-link--submenu .fm-menu-label,
html.fm-dark .info-copy span {
  color: var(--fm-menu-text) !important;
}

html.fm-dark .fm-menu-link--submenu .fm-menu-chevron,
html.fm-dark .info-copy small {
  color: var(--fm-text-muted) !important;
}

html.fm-dark .p-menubar-submenu .p-menubar-item-content:hover,
html.fm-dark .p-submenu-list .p-menubar-item-content:hover,
html.fm-dark .p-submenu-list .p-menuitem-content:hover {
  background: var(--fm-row-hover) !important;
}

html.fm-dark .p-menubar-submenu .p-menubar-item-content:hover .fm-menu-label,
html.fm-dark .p-submenu-list .p-menubar-item-content:hover .fm-menu-label,
html.fm-dark .p-menubar-submenu .p-menubar-item-content:hover .fm-menu-chevron {
  color: var(--fm-cyan-dark) !important;
}

html.fm-dark .info-item {
  border-color: var(--fm-border) !important;
  background: var(--fm-surface-2) !important;
  color: var(--fm-text) !important;
}

html.fm-dark .info-icon {
  background: var(--fm-cyan-soft) !important;
  color: var(--fm-cyan-dark) !important;
}

html.fm-dark .logout-btn,
html.fm-dark .logout-btn.p-button {
  border-color: var(--fm-cyan) !important;
  background: transparent !important;
  color: var(--fm-cyan-dark) !important;
}

html.fm-dark .logout-btn:hover,
html.fm-dark .logout-btn.p-button:hover {
  background: var(--fm-cyan-soft) !important;
  color: var(--fm-cyan-dark) !important;
}

html.fm-dark ::selection {
  background: #16707c;
  color: #ffffff;
}

html.fm-dark * {
  scrollbar-color: #3c5964 #101a20;
}

@media (max-width: 1100px) {
  .fm-theme-toggle,
  .fm-theme-toggle.p-button {
    width: 42px !important;
    min-width: 42px !important;
    padding: 0 !important;
  }

  .fm-theme-toggle__label {
    display: none;
  }
}

@media (prefers-reduced-motion: no-preference) {
  body,
  .main-layout,
  .fm-card,
  .fm-panel,
  .fm-dialog,
  .p-dialog,
  .p-datatable,
  .p-inputtext,
  .p-select,
  .p-multiselect {
    transition: background-color .18s ease, color .18s ease, border-color .18s ease;
  }
}
/* ===== FIN: modo-oscuro.css ===== */
'''.strip()

CSS_PATH.write_text(css + '\n\n' + dark_section + '\n', encoding='utf-8')
