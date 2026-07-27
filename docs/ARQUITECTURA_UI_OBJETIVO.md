# Arquitectura UI objetivo de Field Manager

Este documento define cómo ordenar las pantallas Vue migradas sin modificar el diseño visual ni la lógica de negocio existente.

La migración debe ser incremental. Los componentes actuales continúan funcionando mientras se crean adaptadores y se mueve una pantalla por vez.

## Principios

1. Un solo componente base para botones estándar: `FmButton`.
2. Un solo paginador para grillas Vue: `FmGridPaginator`.
3. Un solo contenedor base para ventanas flotantes: `FmDialog`.
4. PrimeVue continúa siendo el motor interno de botones, acordeones, grillas, selects y dialogs.
5. Los estilos globales contienen únicamente tokens y reglas realmente transversales.
6. Cada componente reutilizable conserva su estilo encapsulado.
7. Cada pantalla tiene un CSS scoped propio.
8. Los dialogs teletransportados al `body` usan una clase global exclusiva por popup.
9. Las pantallas legacy permanecen separadas de las migradas.
10. No se cambia un contrato backend durante una limpieza visual o estructural.

## Estructura objetivo

```text
src/
├── app/
│   ├── App.vue
│   ├── bootstrap/
│   │   ├── primevue.js
│   │   ├── pinia.js
│   │   ├── shared-components.js
│   │   └── plugins.js
│   ├── layout/
│   │   ├── MainLayout.vue
│   │   ├── AppMenu.vue
│   │   ├── UserMenu.vue
│   │   └── HomeLogo.vue
│   └── router/
│       ├── index.js
│       ├── guards.js
│       ├── migrated.routes.js
│       └── legacy.routes.js
│
├── ui/
│   ├── index.js
│   ├── buttons/
│   │   ├── FmButton.vue
│   │   └── FmGridActions.vue
│   ├── accordions/
│   │   ├── FmAccordion.vue
│   │   ├── FmAccordionSection.vue
│   │   ├── FmFilterPanel.vue
│   │   └── FmResultsPanel.vue
│   ├── forms/
│   │   ├── FmField.vue
│   │   ├── FmInputText.vue
│   │   ├── FmTextarea.vue
│   │   ├── FmSelect.vue
│   │   ├── FmCompactSelect.vue
│   │   ├── FmMultiSelect.vue
│   │   ├── FmDatePicker.vue
│   │   ├── FmCheckbox.vue
│   │   └── FmFilterGrid.vue
│   ├── grids/
│   │   ├── FmDataGrid.vue
│   │   ├── FmGridShell.vue
│   │   ├── FmGridPaginator.vue
│   │   ├── FmColumnFilter.vue
│   │   ├── FmGridEmpty.vue
│   │   └── FmGridToolbar.vue
│   ├── dialogs/
│   │   ├── FmDialog.vue
│   │   ├── FmAlertDialog.vue
│   │   ├── FmConfirmDialog.vue
│   │   ├── FmGridDialog.vue
│   │   └── FmTabbedGridDialog.vue
│   ├── feedback/
│   │   ├── FmTypingLoader.vue
│   │   ├── FmInlineLoader.vue
│   │   └── FmMessage.vue
│   └── icons/
│       ├── FilterFailedIcon.vue
│       ├── CleanIcon.vue
│       └── index.js
│
├── modules/
│   ├── registro-ots-fallidas/
│   │   ├── pages/
│   │   │   └── RegistroOtsFallidasPage.vue
│   │   ├── components/
│   │   │   ├── filters/
│   │   │   │   ├── RegistroOtsFallidasFilters.vue
│   │   │   │   └── fields/
│   │   │   ├── grid/
│   │   │   │   ├── RegistroOtsFallidasGrid.vue
│   │   │   │   └── columns.js
│   │   │   └── dialogs/
│   │   │       ├── ExcluirOtDialog.vue
│   │   │       ├── IncluirOtDialog.vue
│   │   │       ├── NotaOtDialog.vue
│   │   │       └── ReprocesoOtDialog.vue
│   │   ├── services/
│   │   │   └── registroOtsFallidas.api.js
│   │   ├── store/
│   │   │   └── registroOtsFallidas.store.ts
│   │   ├── models/
│   │   │   ├── types.ts
│   │   │   └── defaults.ts
│   │   └── styles/
│   │       ├── registro-ots-fallidas-page.css
│   │       ├── registro-ots-fallidas-grid.css
│   │       └── registro-ots-fallidas-dialogs.css
│   │
│   ├── reporte-sas/
│   │   ├── pages/
│   │   │   └── ReporteSasPage.vue
│   │   ├── components/
│   │   │   └── ReporteSasGrid.vue
│   │   ├── services/
│   │   │   └── reporteSas.api.js
│   │   ├── models/
│   │   │   ├── columns.js
│   │   │   └── types.ts
│   │   └── styles/
│   │       └── reporte-sas-page.css
│   │
│   ├── emulacion/
│   │   ├── pages/
│   │   │   └── EmulacionPage.vue
│   │   ├── components/
│   │   │   ├── EmulacionFilters.vue
│   │   │   ├── fields/
│   │   │   └── ConfirmarEmulacionDialog.vue
│   │   ├── services/
│   │   │   └── emulacion.api.js
│   │   ├── store/
│   │   │   └── emulacion.store.js
│   │   └── styles/
│   │       └── emulacion-page.css
│   │
│   ├── buscador-ots/
│   │   ├── pages/
│   │   │   └── BuscadorOtsPage.vue
│   │   ├── components/
│   │   │   ├── BuscadorOtsFilters.vue
│   │   │   ├── BuscadorOtsGrid.vue
│   │   │   ├── BuscadorOtsGridActions.vue
│   │   │   └── dialogs/
│   │   │       └── OtsExternasDialog.vue
│   │   ├── services/
│   │   │   └── buscadorOts.api.js
│   │   ├── store/
│   │   │   └── buscadorOts.store.js
│   │   ├── models/
│   │   │   ├── columns.js
│   │   │   └── defaults.js
│   │   └── styles/
│   │       └── buscador-ots-page.css
│   │
│   └── parametrizaciones/
│       ├── shared/
│       │   ├── components/
│       │   ├── dialogs/
│       │   └── styles/
│       ├── jobtype-contrato/
│       └── cmo-actividad/
│
├── shared/
│   ├── api/
│   │   ├── httpClient.js
│   │   └── apiError.js
│   ├── composables/
│   ├── constants/
│   ├── formatters/
│   ├── validators/
│   └── utils/
│
├── legacy/
│   ├── components/
│   │   └── LegacyIframe.vue
│   ├── composables/
│   └── styles/
│
├── stores/
│   └── auth.store.ts
│
└── styles/
    ├── tokens.css
    ├── base.css
    ├── typography.css
    ├── primevue.css
    ├── layout.css
    ├── responsive.css
    └── legacy.css
```

## Botones

### Base

`FmButton` es el único botón de acción estándar.

Debe soportar:

- `primary`;
- `outline`;
- `ghost`;
- `iconOnly`;
- `small`, `normal`, `large`;
- loading;
- disabled;
- iconos;
- title y aria-label.

### Acciones de grilla

`FmGridActions` no es un segundo botón: es un agrupador que utiliza `FmButton`.

### Controles especializados

Pueden seguir siendo botones nativos mientras el cambio de DOM altere un diseño aprobado:

- encabezados de acordeón;
- botón X de cierre personalizado;
- acciones internas de fila;
- controles altamente específicos de una pantalla.

Deben migrarse solo cuando `FmButton` pueda reproducir exactamente su DOM y estilo.

### Compatibilidad

`FmActionButton` permanece como alias temporal. No debe usarse en código nuevo.

## Acordeones

### Estado actual

Las pantallas utilizan:

- PrimeVue Accordion;
- clases `fm-accordion`;
- comportamiento global que detecta Buscar y cambia de filtros a resultados;
- paneles personalizados en Parametrizaciones.

### Objetivo

`FmFilterPanel` y `FmResultsPanel` deben controlar el estado mediante props y emits, no buscando elementos y ejecutando `click()` sobre el DOM.

Ejemplo:

```vue
<FmFilterPanel
  v-model:expanded="filtersExpanded"
  title="FILTROS DE BÚSQUEDA"
  :loading="loading"
  @search="buscar"
  @clear="limpiar"
>
  <FmFilterGrid>
    ...campos...
  </FmFilterGrid>
</FmFilterPanel>

<FmResultsPanel
  v-model:expanded="resultsExpanded"
  title="RESULTADOS"
>
  <MiModuloGrid />
</FmResultsPanel>
```

Durante la transición deben conservarse los comportamientos globales para pantallas antiguas e iframes.

## Grillas

### Componentes existentes que se conservan

- `FmGridShell`: título, loader y contenedor.
- `FmGridPaginator`: único paginador Vue.
- `FmGridActions`: acciones comunes.

### Componente futuro

`FmDataGrid` compondrá internamente:

```text
PrimeVue DataTable
├── FmGridShell
├── FmGridToolbar
├── FmColumnFilter
├── FmGridEmpty
├── FmGridPaginator
└── FmGridActions
```

No debe ocultar la capacidad de usar slots de PrimeVue para columnas especiales.

## Dialogs y popups

### Base

`FmDialog` reenvía el contrato de PrimeVue sin imponer un diseño obligatorio.

### Especializaciones

- `FmAlertDialog`: alerta simple.
- `FmConfirmDialog`: Aceptar/Cancelar.
- `FmGridDialog`: una grilla dentro de un popup.
- `FmTabbedGridDialog`: pestañas con una o más grillas.

### Scoped y Teleport

Los dialogs se renderizan en `body`. Cada popup debe tener una clase única:

```vue
<FmDialog dialog-class="registro-ot-excluir-dialog" />
```

El CSS específico utiliza:

```css
:global(.registro-ot-excluir-dialog) {
  ...
}

:global(.registro-ot-excluir-dialog .p-dialog-content) {
  ...
}
```

Nunca debe utilizarse un selector genérico como `:global(.p-dialog)` dentro de un módulo.

## Formularios y cajones de filtros

Los cajones futuros deben reutilizar:

- `FmField`;
- `FmFilterGrid`;
- `FmInputText`;
- `FmSelect`;
- `FmCompactSelect`;
- `FmMultiSelect`;
- `FmDatePicker`;
- `FmTextarea`;
- `FmCheckbox`;
- `FmButton`.

El componente del módulo solo define:

- modelos;
- opciones;
- validaciones;
- reglas de habilitación;
- eventos Buscar/Limpiar.

## Estilos

### Globales reales

`styles/tokens.css`

- colores;
- bordes;
- radios;
- sombras;
- tipografía base;
- alturas estándar.

`styles/base.css`

- box-sizing;
- body;
- reset mínimo;
- elementos HTML.

`styles/primevue.css`

- integración base de PrimeVue;
- clases PassThrough;
- estilos comunes de DataTable, Accordion, Select y Dialog.

`styles/layout.css`

- layout principal;
- tamaños debajo del menú;
- contenedores generales.

`styles/responsive.css`

- breakpoints compartidos.

`styles/legacy.css`

- adaptaciones para iframes y pantallas no migradas.

### Estilos de componente

Permanecen dentro del componente con `scoped`:

- botones;
- paginador;
- acciones de grilla;
- loaders;
- componentes de formulario;
- wrappers de dialog.

### Estilos de módulo

Cada pantalla importa un CSS scoped propio:

```vue
<style scoped src="../styles/mi-modulo-page.css"></style>
```

Los estilos de un popup teletransportado pueden estar en el mismo archivo, pero siempre empiezan con su clase exclusiva.

### Regla de aislamiento

Correcto:

```css
.registro-ots-page :deep(.p-datatable-thead > tr > th) {
  ...
}
```

Incorrecto dentro de un módulo:

```css
.p-datatable-thead > tr > th {
  ...
}
```

## Servicios y stores

Las páginas no deben construir endpoints directamente.

Objetivo:

```text
Page / component
       ↓
Pinia store o composable de caso de uso
       ↓
service .api.js
       ↓
httpClient compartido
```

Esto permite probar la UI sin inventar respuestas y reemplazar gradualmente `useFetch` directo.

## Orden de migración seguro

1. Mantener `components/shared` como fachada compatible.
2. Crear `ui/` y reexportar componentes sin cambiar imports antiguos.
3. Separar tokens y base de `fm-global.css` sin alterar valores.
4. Mover una sola pantalla a la estructura modular objetivo.
5. Comparar visual y funcionalmente contra `main`.
6. Migrar sus dialogs, paginador y botones.
7. Repetir módulo por módulo.
8. Reemplazar comportamientos DOM globales por estado Vue solo cuando todas las pantallas afectadas estén migradas.
9. Eliminar aliases y plugins de compatibilidad únicamente después de pruebas locales y de ambientes.

## Componentes actuales que forman la base

```text
FmButton
FmPanel
FmGridShell
FmGridActions
FmGridPaginator
FmDialog
FmAlertDialog
FmConfirmDialog
FmGridDialog
FmTypingLoader
FmResponsivePage
FmCompactSelect
primePassThrough
```

Los nuevos componentes deben construirse sobre esta base, no duplicar su CSS o su comportamiento.
