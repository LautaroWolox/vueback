# Guía de estilos y mejoras visuales de Field Manager

Este documento resume la reorganización visual realizada en el frontend y funciona como mapa de mantenimiento para `src/assets/css/fm-global.css`.

El objetivo es que cualquier integrante del equipo pueda identificar rápidamente:

- qué estilos son globales;
- qué reglas pertenecen a una pantalla concreta;
- dónde están los botones, grillas, iconos, inputs, diálogos y menús;
- qué bloques no deben modificarse para resolver un problema aislado;
- qué mejoras visuales se incorporaron en las pantallas migradas y legacy.

> **Importante:** los números de línea corresponden a la versión actual de `fm-global.css`. Si se agregan comentarios o reglas antes de una sección, los números pueden desplazarse. Siempre debe usarse también el marcador `INICIO:` de cada bloque para localizarlo.

---

## 1. Estructura actual de estilos

Los estilos que antes estaban distribuidos en varias hojas fueron consolidados en:

```text
src/assets/css/fm-global.css
```

La hoja del tema base continúa separada:

```text
src/assets/css/theme.css
```

`main.js` carga únicamente:

```js
import 'primeicons/primeicons.css'
import 'primeflex/primeflex.css'
import './assets/css/fm-global.css'
```

No deben volver a crearse hojas paralelas para corregir una pantalla puntual. Cuando un cambio corresponde a un módulo concreto, debe agregarse bajo la clase raíz de ese módulo dentro de su sección documentada.

Clases raíz principales:

```css
.report-sas-page
.busqueda-ots-page
.ot-fallidas-ct
.jobtype-screen
```

---

## 2. Clasificación de los estilos

Dentro de `fm-global.css` cada sección está marcada con una clasificación.

### Global crítico

```text
[GLOBAL CRÍTICO - NO TOCAR POR UNA SOLA PANTALLA]
```

Afecta a toda la aplicación. Incluye estructura base, responsive general, menú, layout y componentes compartidos.

No debe modificarse para corregir solamente Reporte SAS, Búsqueda de OTs, Registro OTs Fallidas, Jobtype o CMO.

### Global compartido

```text
[GLOBAL COMPARTIDO - MODIFICAR CON PRUEBA REGRESIVA]
```

Se utiliza en varios módulos. Un cambio debe verificarse en todas las pantallas consumidoras.

### Módulo o pantalla

```text
[MÓDULO / PANTALLA]
```

Está limitado a una pantalla o familia de pantallas. Es el lugar correcto para realizar ajustes específicos.

### Iframe legacy

```text
[IFRAME LEGACY]
```

Se aplica dentro de las páginas antiguas cargadas mediante `IframeView.vue` o `DetalleView.vue`.

### Archivado e inactivo

```text
[ARCHIVADO - INACTIVO]
```

Se conserva como referencia histórica dentro de `@media not all`. No participa de la interfaz actual y no debe reactivarse.

---

## 3. Mapa rápido de estilos globales

Archivo:

```text
src/assets/css/fm-global.css
```

### Variables, tipografía y estructura base

| Elemento | Líneas aproximadas | Selectores principales |
|---|---:|---|
| Guía general de mantenimiento | 1–48 | comentarios iniciales |
| Variables de color, radios, sombras y fuente | 69–91 | `:root` |
| Normalización general | 93–119 | `*`, `html`, `body`, `#app` |
| Contenedores de pantalla | 121–132 | `.fm-screen`, `.fm-module-page`, `.fm-responsive-page` |
| Tarjetas y paneles | 134–170 | `.fm-card`, `.fm-panel`, `.fm-ui-section` |
| Acordeones compartidos | 172–203 | `.fm-accordion`, `.fm-pt-accordion` |

Estas reglas son globales. No deben tocarse para corregir una sola pantalla.

### Filtros, campos, inputs y selects base

| Elemento | Líneas aproximadas | Selectores principales |
|---|---:|---|
| Contenedor de filtros | 205–216 | `.fm-filters`, `.fm-filter-grid` |
| Distribución de campos | 218–227 | `.fm-field`, `.fm-field--span-*` |
| Etiquetas | 229–236 | `.fm-field label`, `.fm-field__label` |
| Inputs, Select, MultiSelect y DatePicker | 238–270 | `.fm-field .p-inputtext`, `.fm-select`, `.fm-pt-select` |
| Focus de campos | 272–279 | `:focus`, `.p-focus` |
| Estados disabled | 281–289 | `.p-disabled`, `:disabled` |
| Acciones de filtros | 291–299 | `.fm-actions`, `.fm-filter-actions` |

Los estilos completos de paneles desplegables de Select y MultiSelect también se encuentran en la sección `fm-select.css`, líneas **2893–2980**.

### Botones globales

| Elemento | Líneas aproximadas | Selectores principales |
|---|---:|---|
| Botones de acción generales | 301–319 | `.fm-action-button`, `.fm-btn`, `.fm-ui-button` |
| Iconos dentro de botones | 321–337 | `.fm-action-button .pi`, `.fm-ui-button__icon` |
| Botón primario | 339–354 | `--primary` |
| Botón secundario/outline | 356–371 | `--outline` |
| Botones deshabilitados | 373–382 | `:disabled` |
| Botones exclusivos de icono | 384–405 | `.fm-icon-button`, `.fm-icon-btn` |
| Acciones de icono dentro de grillas | 596–635 | `.fm-grid-actions-final`, `.fm-grid-action-final` |
| Botón de cierre de diálogos | 698–714 | `.p-dialog-close-button` |

#### Regla de mantenimiento de botones

Un botón específico de una pantalla no debe corregirse modificando `.fm-action-button` global. Debe agregarse una variante o un selector bajo la clase raíz del módulo.

Ejemplo:

```css
.report-sas-page .report-sas-export-button {
  /* ajuste exclusivo de Reporte SAS */
}
```

### Iconos

Los iconos no están concentrados en un solo bloque porque dependen de su contexto.

| Contexto | Líneas aproximadas | Selectores principales |
|---|---:|---|
| Iconos de botones generales | 321–337 | `.pi`, `.fm-ui-button__icon` |
| Botones de icono independientes | 384–405 | `.fm-icon-button`, `.fm-icon-btn` |
| Iconos de acciones en grillas | 596–635 | `.fm-grid-actions-final .pi` |
| Iconos del menú principal y submenús | 767–796 | `.p-menubar-item-icon`, `.p-menubar-submenu-icon` |
| Iconos y flechas de Select | 2893–2980 | sección `fm-select.css` |

### Grillas y tablas globales

| Elemento | Líneas aproximadas | Selectores principales |
|---|---:|---|
| Contenedor de grilla | 407–414 | `.fm-grid-shell`, `.fm-ui-grid-shell` |
| Título de la grilla | 416–430 | `.fm-grid-title`, `.fm-ui-grid-title` |
| DataTable base | 432–458 | `.fm-pass-grid`, `.fm-pt-datatable` |
| Encabezados y celdas | 460–495 | `.p-datatable-thead`, `.p-datatable-tbody` |
| Hover y selección de filas | 497–515 | `.p-highlight`, `.fm-selected-row` |
| Filtros por columna | 517–540 | `.fm-filter-cell`, `.fm-column-filter` |
| Texto con ellipsis | 542–547 | `.fm-cell-text` |
| Estado vacío base | 549–557 | `.fm-grid-empty` |
| Paginador | 559–594 | `.p-paginator`, `.fm-pt-paginator` |
| Acciones finales de grilla | 596–635 | `.fm-grid-actions-final` |
| Checkbox | 637–650 | `.p-checkbox` |

Bloques adicionales de grillas:

| Bloque | Líneas | Responsabilidad |
|---|---:|---|
| `fm-grid-resize.css` | 956–1117 | resize de columnas, filtros visibles y estados de filas |
| `parametrizaciones-grid-selection.css` | 3651–3733 | selección exclusiva de Jobtype–Contrato y CMO–Actividad |
| `fm-grid-empty-state.css` | 3735–3800 | estado vacío compartido de todas las tablas |

#### Regla de mantenimiento de grillas

No trasladar reglas de una tabla concreta a `.fm-pass-grid`, porque afectarían todas las grillas migradas.

Para cambios particulares utilizar el identificador o clase del módulo, por ejemplo:

```css
#tabla-jobtype-contrato { }
#tabla-cmo-actividad { }
.report-sas-grid { }
.otf-grid-shell { }
```

### Diálogos y alertas

| Elemento | Líneas aproximadas | Selectores principales |
|---|---:|---|
| Contenedor del diálogo | 652–661 | `.fm-dialog`, `.fm-alert-dialog`, `.fm-pt-dialog` |
| Cabecera | 663–677 | `.p-dialog-header`, `.p-dialog-title` |
| Contenido | 679–685 | `.p-dialog-content` |
| Pie y acciones | 687–696 | `.p-dialog-footer` |
| Botón cerrar | 698–714 | `.p-dialog-close-button` |
| Alerta visual | 716–742 | `.fm-alert-body`, `.fm-alert-triangle` |

Los diálogos específicos de Jobtype se encuentran dentro de `jobtype-contrato.css`, líneas **2982–3552**.

### Menú principal y submenús

| Elemento | Líneas aproximadas | Bloque |
|---|---:|---|
| Menú base | 744–803 | sección base de `fm-global.css` |
| Menú responsive | 2262–2414 | `fm-menu-responsive.css` |
| Apariencia, perfil y cierre de sesión | 2416–2799 | `fm-menu-tuning.css` |
| Separación entre menú y contenido | 4306–4347 | `fm-menu-spacing.css` |
| Submenús blancos y compactos | 4349–4467 | `fm-menu-submenu-compact.css` |

Estos bloques son globales críticos. Cualquier modificación debe probarse en todas las rutas y resoluciones.

### Calendario y fechas

| Elemento | Líneas aproximadas | Selectores principales |
|---|---:|---|
| Botón de fecha | 804–816 | `.fm-date-button` |
| Panel del calendario | 818–826 | `.fm-calendar`, `.p-datepicker-panel` |
| Cabecera | 828–833 | `.p-datepicker-header` |
| Días y selección | 835–846 | `.p-datepicker-day` |

### Loader compartido

| Elemento | Líneas aproximadas | Selectores principales |
|---|---:|---|
| Contenedor y variantes | 848–869 | `.fm-typing-loader` |
| Caja central | 871–882 | `.fm-typing-loader__box` |
| Imagen y textos | 884–899 | `__image`, `__title`, `__message` |
| Animación de puntos | 901–910 | `fm-loader-dots` |

### Responsive global

| Bloque | Líneas | Alcance |
|---|---:|---|
| Breakpoints base del archivo global | 913–952 | 1200, 900 y 620 px |
| `fm-responsive.css` | 1119–1918 | sistema responsive general |
| `fm-legacy-responsive.css` | 1920–2260 | páginas antiguas dentro de iframes |
| `fm-desktop-notebook-responsive.css` | 3802–4144 | resoluciones de escritorio y notebook |
| `fm-desktop-notebook-modules.css` | 4146–4304 | ajustes de módulos migrados concretos |

---

## 4. Mejoras visuales incorporadas

### Login

Se rediseñó `src/views/Login2faView.vue` con:

- título central `Field Manager`;
- composición visual turquesa;
- botón principal `CONECTAR`;
- loader durante la autenticación;
- eliminación de textos secundarios innecesarios;
- copyright ubicado en la esquina inferior derecha;
- adaptación a distintas resoluciones.

Los estilos del login están acotados dentro del propio componente y no deben trasladarse al bloque global.

### Menú

Se mejoraron:

- altura y espaciado del menú principal;
- legibilidad de las opciones;
- perfil de usuario con icono y datos;
- botón de cierre de sesión;
- estados hover y activos;
- paneles desplegables blancos;
- submenús más compactos;
- divisores finos entre opciones;
- línea turquesa de selección;
- adaptación a notebook, tablet y móvil.

### Grillas

Se unificaron:

- encabezados;
- altura de filas;
- bordes;
- filtros por columna;
- selección y hover;
- estado vacío;
- paginadores;
- acciones mediante iconos;
- resize de columnas;
- scroll horizontal controlado.

### Reporte SAS

Se ajustaron:

- crecimiento automático de la grilla;
- uso completo del espacio vertical disponible;
- scroll interno sin duplicación;
- integración visual con el paginador;
- exportación a Excel respetando filtros y columnas visibles.

Sección específica: líneas **2801–2850**.

### Jobtype–Contrato y CMO–Actividad

Se unificaron:

- paneles de filtros y resultados;
- línea lateral turquesa;
- distribución de campos;
- botones y acciones;
- grillas y selección de filas;
- diálogos de alta, modificación y confirmación;
- validaciones de campos obligatorios;
- adaptación a notebook y 1024 px.

Secciones específicas:

```text
jobtype-contrato.css                    2982–3552
parametrizaciones-panel-accent.css      3554–3601
jobtype-required-validation.css         3603–3649
parametrizaciones-grid-selection.css    3651–3733
```

### Pantallas legacy dentro de iframe

Los estilos responsive históricos se conservaron dentro de `fm-global.css` y ahora son extraídos por:

```text
src/plugins/responsiveIframes.js
```

Ese plugin inyecta únicamente la sección `fm-legacy-responsive.css` dentro del documento del iframe.

La sección se encuentra entre las líneas **1920–2260**.

No debe utilizarse para corregir componentes Vue migrados.

---

## 5. Pantallas migradas y legacy

### Migradas a Vue

Entre las pantallas y módulos que utilizan los estilos actuales se encuentran:

- Reporte SAS;
- Registro de OTs Fallidas para reproceso;
- Emulación;
- Jobtype–Contrato;
- CMO–Actividad;
- componentes compartidos de grillas, filtros, diálogos y botones.

### Búsqueda de OTs

La migración Vue permanece en:

```text
src/modules/buscadorOts/
```

Sin embargo, la opción `BUOT` continúa usando temporalmente la pantalla legacy mediante `IframeView.vue`, porque la versión migrada todavía no está conectada al backend.

No debe cambiarse la ruta a `BuscadorOts.vue` hasta completar esa integración.

---

## 6. Bloques que no deben reactivarse

Los siguientes bloques están archivados dentro de `@media not all`:

| Bloque | Líneas | Motivo |
|---|---:|---|
| `fm-report-sas-fullscreen.css` | 2852–2891 | implementación histórica reemplazada |
| `nuestros.css` | 4469–4574 | reglas globales antiguas que entrarían en conflicto |

No debe quitarse el `@media not all`.

---

## 7. Reglas para agregar nuevos estilos

1. Identificar primero si el cambio es global o específico de una pantalla.
2. No modificar un bloque global crítico para resolver un caso aislado.
3. Utilizar siempre la clase raíz del módulo.
4. Evitar selectores genéricos como `.p-button`, `.p-dialog` o `.p-datatable` fuera del bloque global correspondiente.
5. No crear una nueva hoja CSS para una pantalla que ya tiene sección dentro de `fm-global.css`.
6. Mantener los bloques de menú compactos al final de los estilos de navegación.
7. Probar los cambios en 1920×1080, 1366×768, 1280×720 y 1024×768.
8. Ejecutar antes de subir:

```bash
npm run build
git diff --check
```

---

## 8. Búsqueda rápida dentro de `fm-global.css`

Para encontrar una sección sin depender del número de línea, buscar alguno de estos marcadores:

```text
INICIO: fm-global.css
INICIO: fm-grid-resize.css
INICIO: fm-responsive.css
INICIO: fm-legacy-responsive.css
INICIO: fm-menu-responsive.css
INICIO: fm-menu-tuning.css
INICIO: fm-report-sas-auto-height.css
INICIO: fm-select.css
INICIO: jobtype-contrato.css
INICIO: parametrizaciones-panel-accent.css
INICIO: jobtype-required-validation.css
INICIO: parametrizaciones-grid-selection.css
INICIO: fm-grid-empty-state.css
INICIO: fm-desktop-notebook-responsive.css
INICIO: fm-desktop-notebook-modules.css
INICIO: fm-menu-spacing.css
INICIO: fm-menu-submenu-compact.css
```

---

## 9. Resumen operativo

```text
Estilos globales principales      fm-global.css: 50–954
Botones globales                  fm-global.css: 301–405
Grillas globales                  fm-global.css: 407–650
Diálogos globales                 fm-global.css: 652–714
Menú base                         fm-global.css: 744–803
Calendario                        fm-global.css: 804–846
Loader                            fm-global.css: 848–910
Responsive general                fm-global.css: 1119–1918
Responsive de iframes             fm-global.css: 1920–2260
Menú completo                     fm-global.css: 2262–2799 y 4306–4467
Reporte SAS                       fm-global.css: 2801–2850
Select y MultiSelect              fm-global.css: 2893–2980
Jobtype / CMO                     fm-global.css: 2982–3733
Estado vacío de grillas           fm-global.css: 3735–3800
Responsive desktop/notebook       fm-global.css: 3802–4304
```

Ante cualquier duda, primero debe revisarse la clasificación incluida al comienzo de cada sección antes de modificar una regla.
