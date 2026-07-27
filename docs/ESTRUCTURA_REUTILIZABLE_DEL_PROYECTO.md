# Estructura reutilizable oficial de Field Manager

Esta es la arquitectura oficial propuesta para continuar las migraciones Vue sin modificar el diseño ni la lógica que ya fueron aprobados.

## Decisión principal

La entrada canónica para todo código nuevo es:

```text
src/reutilizables/
```

No deben crearse componentes generales duplicados fuera de esa estructura.

## Estado actual de transición

Actualmente existen dos conceptos, pero una sola implementación:

```text
src/reutilizables/
└── índices canónicos organizados por propósito

src/components/shared/
└── implementación física temporal utilizada por las pantallas existentes
```

`src/reutilizables` no copia componentes. Solo reexporta la implementación existente para ofrecer nombres y rutas claras.

Esta transición permite:

- conservar todos los imports actuales;
- revisar la propuesta con el equipo;
- comparar visualmente contra `main`;
- volver atrás sin conflictos;
- mover físicamente los componentes en una segunda etapa.

## Estructura canónica disponible ahora

```text
src/
├── reutilizables/
│   ├── README.md
│   ├── index.js
│   │
│   ├── botones-reutilizables/
│   │   └── index.js
│   │
│   ├── filtros-reutilizables/
│   │   └── index.js
│   │
│   ├── grillas-reutilizables/
│   │   └── index.js
│   │
│   ├── popups-reutilizables/
│   │   └── index.js
│   │
│   ├── acordeones-y-paneles-reutilizables/
│   │   └── index.js
│   │
│   ├── carga-y-feedback-reutilizables/
│   │   └── index.js
│   │
│   ├── layout-reutilizable/
│   │   └── index.js
│   │
│   └── configuracion-reutilizable/
│       └── index.js
│
├── components/
│   └── shared/
│       └── implementaciones físicas temporales
│
├── modules/
│   └── pantallas migradas agrupadas por funcionalidad
│
├── plugins/
│   └── compatibilidad global y pantallas legacy
│
├── assets/
│   ├── css/
│   └── images/
│
├── router/
├── store/
├── views/
├── App.vue
└── main.js
```

## Estructura física final

Después de las pruebas locales y la aprobación del equipo, la segunda etapa podrá mover las implementaciones reales:

```text
src/
├── app/
│   ├── App.vue
│   ├── arranque/
│   │   ├── primevue.js
│   │   ├── pinia.js
│   │   ├── componentes-reutilizables.js
│   │   └── plugins.js
│   ├── layout/
│   │   ├── MainLayout.vue
│   │   ├── AppMenu.vue
│   │   ├── UserMenu.vue
│   │   └── HomeLogo.vue
│   └── router/
│       ├── index.js
│       ├── guards.js
│       ├── rutas-migradas.js
│       └── rutas-legacy.js
│
├── reutilizables/
│   ├── index.js
│   │
│   ├── botones-reutilizables/
│   │   └── FmButton.vue
│   │
│   ├── filtros-reutilizables/
│   │   ├── FmField.vue
│   │   ├── FmFilterGrid.vue
│   │   ├── FmInputText.vue
│   │   ├── FmTextarea.vue
│   │   ├── FmSelect.vue
│   │   ├── FmCompactSelect.vue
│   │   ├── FmMultiSelect.vue
│   │   ├── FmDatePicker.vue
│   │   └── FmCheckbox.vue
│   │
│   ├── grillas-reutilizables/
│   │   ├── FmDataGrid.vue
│   │   ├── FmGridShell.vue
│   │   ├── FmGridActions.vue
│   │   ├── FmGridPaginator.vue
│   │   ├── FmColumnFilter.vue
│   │   ├── FmGridEmpty.vue
│   │   └── FmGridToolbar.vue
│   │
│   ├── acordeones-y-paneles-reutilizables/
│   │   ├── FmPanel.vue
│   │   ├── FmAccordion.vue
│   │   ├── FmAccordionSection.vue
│   │   ├── FmFilterPanel.vue
│   │   └── FmResultsPanel.vue
│   │
│   ├── popups-reutilizables/
│   │   ├── FmDialog.vue
│   │   ├── FmAlertDialog.vue
│   │   ├── FmConfirmDialog.vue
│   │   ├── FmGridDialog.vue
│   │   └── FmTabbedGridDialog.vue
│   │
│   ├── carga-y-feedback-reutilizables/
│   │   ├── FmTypingLoader.vue
│   │   ├── FmInlineLoader.vue
│   │   └── FmMessage.vue
│   │
│   ├── layout-reutilizable/
│   │   └── FmResponsivePage.vue
│   │
│   └── configuracion-reutilizable/
│       └── primePassThrough.js
│
├── modules/
│   ├── registro-ots-fallidas/
│   │   ├── pages/
│   │   │   └── RegistroOtsFallidasPage.vue
│   │   ├── components/
│   │   │   ├── filters/
│   │   │   ├── grid/
│   │   │   └── dialogs/
│   │   ├── services/
│   │   ├── store/
│   │   ├── models/
│   │   └── styles/
│   │
│   ├── reporte-sas/
│   │   ├── pages/
│   │   ├── components/
│   │   ├── services/
│   │   ├── models/
│   │   └── styles/
│   │
│   ├── emulacion/
│   │   ├── pages/
│   │   ├── components/
│   │   ├── services/
│   │   ├── store/
│   │   └── styles/
│   │
│   ├── buscador-ots/
│   │   ├── pages/
│   │   ├── components/
│   │   ├── services/
│   │   ├── store/
│   │   ├── models/
│   │   └── styles/
│   │
│   └── parametrizaciones/
│       ├── shared/
│       ├── jobtype-contrato/
│       └── cmo-actividad/
│
├── shared/
│   ├── api/
│   ├── composables/
│   ├── constants/
│   ├── formatters/
│   ├── validators/
│   └── utils/
│
├── legacy/
│   ├── components/
│   ├── composables/
│   └── styles/
│
├── stores/
│   └── auth.store.ts
│
└── estilos-globales/
    ├── tokens.css
    ├── base.css
    ├── typography.css
    ├── primevue.css
    ├── layout.css
    ├── responsive.css
    └── legacy.css
```

# Botones

## Única implementación estándar

El único botón estándar es:

```text
FmButton.vue
```

`FmActionButton.vue` fue eliminado.

`FmButton` soporta:

- acción principal `primary`;
- acción secundaria `outline`;
- acción transparente `ghost`;
- modo `iconOnly`;
- tamaños `small`, `normal` y `large`;
- loading;
- disabled;
- icono;
- title;
- aria-label.

## Acciones de grilla

`FmGridActions` no es otro botón. Es un agrupador que compone instancias de `FmButton` para:

- Descargar;
- Eliminar;
- Editar;
- Reprocesar;
- Agregar.

## PrimeVue Button

PrimeVue `Button` continúa registrado porque es el motor interno de `FmButton` y porque existen controles especializados en:

- menú de usuario;
- cierre de sesión;
- login;
- botones de encabezado;
- acciones específicas de una celda.

Esos controles no son otra implementación general de botón. Tienen una composición específica que no debe mezclarse con los botones estándar de formularios y popups.

## Regla para pantallas nuevas

```vue
<FmButton label="BUSCAR" @click="buscar" />
<FmButton label="LIMPIAR" variant="outline" @click="limpiar" />
```

No se debe importar `primevue/button` dentro de un módulo nuevo salvo una excepción documentada y aprobada.

# Filtros reutilizables

La carpeta oficial es:

```text
src/reutilizables/filtros-reutilizables/
```

Actualmente expone `FmCompactSelect`.

Los siguientes wrappers se crearán en la segunda etapa y deberán mantener exactamente los estilos aprobados:

- `FmField`;
- `FmFilterGrid`;
- `FmInputText`;
- `FmTextarea`;
- `FmSelect`;
- `FmMultiSelect`;
- `FmDatePicker`;
- `FmCheckbox`.

Un módulo nuevo solo deberá declarar:

- modelos;
- opciones;
- validaciones;
- reglas disabled;
- eventos Buscar y Limpiar.

# Acordeones y cajones

La carpeta oficial es:

```text
src/reutilizables/acordeones-y-paneles-reutilizables/
```

Actualmente expone `FmPanel`.

La composición futura será:

```text
FmAccordion
├── FmFilterPanel
└── FmResultsPanel
```

`FmFilterPanel` contendrá mediante slots:

- campos;
- botón Buscar;
- botón Limpiar;
- loader;
- estado abierto/cerrado.

`FmResultsPanel` contendrá:

- título;
- grilla;
- acciones;
- estado abierto/cerrado.

Durante la transición se mantienen los comportamientos globales de acordeón porque también atienden pantallas antiguas e iframes.

# Grillas

La carpeta oficial es:

```text
src/reutilizables/grillas-reutilizables/
```

Componentes existentes:

- `FmGridShell`;
- `FmGridActions`;
- `FmGridPaginator`.

El componente futuro `FmDataGrid` compondrá:

```text
PrimeVue DataTable
├── FmGridShell
├── FmGridToolbar
├── FmColumnFilter
├── FmGridEmpty
├── FmGridPaginator
└── FmGridActions
```

Debe conservar slots de PrimeVue para:

- iconos por fila;
- notas;
- botones de inclusión;
- chips;
- celdas expandibles;
- contenido particular de cada pantalla.

# Paginador

El único paginador Vue es:

```text
FmGridPaginator.vue
```

Incluye:

- primera página;
- anterior;
- página manual;
- siguiente;
- última;
- selector de filas;
- acciones;
- contador `Mostrando X de Y`.

Registro OTs Fallidas utiliza el mismo componente con una capa CSS de compatibilidad visual.

# Popups y ventanas flotantes

La carpeta oficial es:

```text
src/reutilizables/popups-reutilizables/
```

Base única:

```text
FmDialog.vue
```

Especializaciones:

- `FmAlertDialog`;
- `FmConfirmDialog`;
- `FmGridDialog`;
- `FmTabbedGridDialog` en la segunda etapa.

Cada popup teletransportado a `body` debe tener una clase exclusiva:

```vue
<FmDialog dialog-class="registro-ot-excluir-dialog" />
```

Sus estilos utilizan:

```css
:global(.registro-ot-excluir-dialog) {
  /* solo ese popup */
}
```

Nunca debe utilizarse desde un módulo:

```css
:global(.p-dialog) {
  /* afectaría todo el aplicativo */
}
```

# Loaders y feedback

La carpeta oficial es:

```text
src/reutilizables/carga-y-feedback-reutilizables/
```

Actualmente incluye:

- `FmTypingLoader`.

El loader utiliza SVG embebido, por lo que no depende de una imagen externa.

# Estilos

## Globales verdaderos

La estructura final será:

```text
src/estilos-globales/
├── tokens.css
├── base.css
├── typography.css
├── primevue.css
├── layout.css
├── responsive.css
└── legacy.css
```

### `tokens.css`

- colores;
- bordes;
- radios;
- sombras;
- tipografía;
- alturas estándar.

### `base.css`

- `box-sizing`;
- body;
- reset mínimo;
- elementos HTML.

### `primevue.css`

- PassThrough;
- integración común de DataTable;
- Accordion;
- Select;
- Dialog;
- Checkbox;
- DatePicker.

### `layout.css`

- layout principal;
- espacio debajo del menú;
- contenedores generales.

### `responsive.css`

- breakpoints realmente compartidos.

### `legacy.css`

- iframes;
- pantallas no migradas;
- compatibilidad temporal.

## Estilos de componente

Permanecen `scoped` dentro del componente:

- botón;
- paginador;
- acciones de grilla;
- loaders;
- wrappers de formulario;
- wrappers de popup.

## Estilos de módulo

Cada módulo tendrá su carpeta `styles/`.

Ejemplo:

```vue
<style scoped src="../styles/registro-ots-fallidas-page.css"></style>
```

Selector correcto:

```css
.registro-ots-page :deep(.p-datatable-thead > tr > th) {
  /* solo Registro OTs */
}
```

Selector incorrecto dentro de un módulo:

```css
.p-datatable-thead > tr > th {
  /* afectaría todas las grillas */
}
```

# Imágenes

La imagen confirmada en uso es:

```text
src/assets/images/FM_login.png
```

La utiliza `Login2faView.vue`.

La auditoría completa se ejecuta con:

```powershell
npm run audit:images
```

La auditoría nunca elimina archivos.

# Servicios y stores

La estructura objetivo es:

```text
Page o componente
        ↓
Store Pinia o composable
        ↓
service .api.js
        ↓
httpClient compartido
```

Una página nueva no debería construir directamente una URL de backend.

# Importación recomendada

```js
import {
  FmButton,
  FmCompactSelect,
  FmGridShell,
  FmGridActions,
  FmGridPaginator,
  FmDialog,
  FmAlertDialog,
  FmConfirmDialog,
  FmGridDialog,
  FmPanel,
  FmTypingLoader,
  FmResponsivePage
} from '@/reutilizables'
```

# Auditorías

```powershell
npm run audit:images
npm run audit:reusables
npm run audit:ui
npm run type-check
npm run build
```

# Orden seguro de la segunda etapa

1. Aprobar esta estructura con el equipo.
2. Probar `CajonesDeFiltros` localmente.
3. Comparar cada pantalla contra `main`.
4. Mover físicamente una categoría por vez.
5. Actualizar imports de una pantalla por vez.
6. Ejecutar auditorías, type-check y build.
7. Eliminar fachadas anteriores únicamente cuando no queden imports.
8. Mantener la rama de respaldo hasta después de validar en ambientes.

No debe moverse todo físicamente en un único commit antes de la revisión local.
