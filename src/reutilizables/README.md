# Reutilizables de Field Manager

Esta es la entrada canónica para construir pantallas Vue nuevas.

No contiene copias de componentes: los archivos `index.js` reexportan una única implementación. Durante la transición, la implementación física permanece en `src/components/shared` para no romper imports de las pantallas ya migradas.

## Carpetas

```text
reutilizables/
├── botones-reutilizables/
├── filtros-reutilizables/
├── grillas-reutilizables/
├── popups-reutilizables/
├── acordeones-y-paneles-reutilizables/
├── carga-y-feedback-reutilizables/
├── layout-reutilizable/
├── configuracion-reutilizable/
└── estilos-reutilizables/
```

## Importación recomendada

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

También se puede importar por categoría:

```js
import { FmButton } from '@/reutilizables/botones-reutilizables'
import { FmGridPaginator } from '@/reutilizables/grillas-reutilizables'
import { FmDialog } from '@/reutilizables/popups-reutilizables'
```

## Regla de no duplicación

- `FmButton` es el único botón estándar.
- `FmActionButton` fue eliminado.
- `FmGridActions` agrupa acciones de grilla, pero internamente utiliza `FmButton`.
- `FmGridPaginator` es el único paginador de las grillas Vue.
- `FmDialog` es el único contenedor base de ventanas flotantes.
- Los botones nativos o PrimeVue directos solo se conservan para controles especializados cuyo DOM forma parte del diseño aprobado: encabezados de acordeón, cierres personalizados, menú, login y acciones específicas de celdas.
- No se debe crear otro componente general de botón, paginador o popup.

## Estado de transición

`src/components/shared` se conserva como ubicación física temporal para evitar romper las pantallas existentes. No es otra biblioteca: contiene la única implementación que `src/reutilizables` reexporta.

El código nuevo debe importar exclusivamente desde `@/reutilizables`.

Después de validar localmente todas las pantallas y acordarlo con el equipo, se podrán mover físicamente las implementaciones y retirar la ubicación anterior en una segunda etapa controlada.
