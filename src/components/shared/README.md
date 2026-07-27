# Implementaciones compartidas de Field Manager

Esta carpeta contiene temporalmente las implementaciones físicas que ya utilizan las pantallas migradas.

La entrada canónica para código nuevo es:

```js
import {
  FmButton,
  FmGridPaginator,
  FmDialog
} from '@/reutilizables'
```

La carpeta `src/reutilizables` organiza estas implementaciones por propósito sin copiarlas.

## Botón único

`FmButton.vue` es la única implementación general de botón del aplicativo.

Variantes:

- `primary`: acción principal;
- `outline`: acción secundaria;
- `ghost`: acciones sin fondo, principalmente iconos;
- `icon-only`: botón de icono;
- tamaños `small`, `normal` y `large`.

`FmActionButton.vue` fue eliminado. No debe volver a crearse otro componente general de botón.

`FmGridActions` no es un segundo botón: agrupa acciones de una grilla y utiliza `FmButton` internamente.

Los controles especializados pueden conservar un botón nativo o PrimeVue directo cuando su DOM sea parte esencial de un diseño ya aprobado, por ejemplo:

- encabezados de acordeón;
- cierre personalizado de un popup;
- acciones específicas dentro de una celda;
- controles del menú y del login con composición propia.

## Paginador único

`FmGridPaginator.vue` es el único paginador de las grillas Vue migradas.

El contador predeterminado es:

```text
Mostrando X de Y
```

Por defecto selecciona el máximo de `rowsOptions`. Una pantalla puede indicar `:auto-max-rows="false"` cuando su estado ya se inicializa con el valor real.

Registro OTs Fallidas utiliza este mismo componente y conserva sus medidas mediante `src/assets/css/fm-otf-paginator-compat.css`.

## Ventanas flotantes

`FmDialog.vue` es el único contenedor base para popups migrados.

Especializaciones disponibles:

- `FmAlertDialog`;
- `FmConfirmDialog`;
- `FmGridDialog`.

Cada popup teletransportado a `body` debe tener una clase exclusiva:

```vue
<FmDialog dialog-class="mi-modulo-detalle-dialog" />
```

Y sus estilos deben empezar por esa clase:

```css
:global(.mi-modulo-detalle-dialog) {
  /* Solo este popup */
}
```

Nunca debe agregarse desde un módulo un selector global genérico como `:global(.p-dialog)`.

## Transición segura

La implementación física permanece aquí para no romper imports anteriores. No hay dos implementaciones: `src/reutilizables` solo reexporta estos componentes.

Después de validar en local y acordarlo con el equipo, las implementaciones podrán moverse físicamente a las carpetas de reutilizables en una segunda etapa, actualizando todos los imports en un único cambio controlado.
