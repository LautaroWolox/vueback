# Componentes compartidos de Field Manager

Esta carpeta define la base visual utilizada por las pantallas migradas. Los cambios estructurales deben conservar las clases y el diseño aprobado en cada módulo.

## Botones

`FmButton` es el único componente base para botones de acción estándar.

Variantes disponibles:

- `primary`: acción principal.
- `outline`: acción secundaria.
- `ghost`: acción sin fondo, utilizada internamente por iconos de grilla.

Propiedades adicionales:

- `icon-only`
- `size="small | normal | large"`
- `loading`
- `loading-label`
- `title`
- `aria-label`

`FmActionButton` se conserva solamente como adaptador de compatibilidad. No debe utilizarse en código nuevo.

Los botones de navegación interna, cierre de ventana o acciones de fila pueden seguir siendo controles especializados cuando cambiar su DOM alteraría un diseño ya aprobado.

## Acciones de grilla

`FmGridActions` agrupa Descargar, Eliminar, Editar, Reprocesar y Agregar. Internamente utiliza `FmButton` y conserva las clases históricas:

- `fm-grid-actions-final`
- `fm-grid-action-final`

## Paginador

`FmGridPaginator` es el único paginador para grillas Vue migradas.

Su contador predeterminado es:

```text
Mostrando X de Y
```

Por defecto selecciona el máximo de `rowsOptions`. Una pantalla puede desactivar esa conducta con `:auto-max-rows="false"` cuando inicializa el valor directamente en su estado.

Registro OTs Fallidas utiliza el mismo componente con una capa de compatibilidad visual en `fm-otf-paginator-compat.css`.

## Ventanas flotantes

`FmDialog` es el contenedor base de los popups migrados. No agrega estilos visuales obligatorios: conserva las clases indicadas por cada pantalla.

Especializaciones disponibles:

- `FmAlertDialog`
- `FmConfirmDialog`
- `FmGridDialog`

Ejemplo:

```vue
<FmDialog
  v-model:visible="visible"
  base-class="fm-dialog"
  dialog-class="mi-modulo-detalle-dialog"
>
  ...
</FmDialog>
```

## Scoped y popups teletransportados

PrimeVue renderiza los diálogos en `body`. Por eso sus estilos específicos deben utilizar una clase exclusiva y `:global`:

```css
:global(.mi-modulo-detalle-dialog) {
  ...
}

:global(.mi-modulo-detalle-dialog .p-dialog-content) {
  ...
}
```

Nunca debe utilizarse un selector global genérico como:

```css
:global(.p-dialog) {
  ...
}
```

porque modificaría todas las ventanas del aplicativo.

## Importaciones nuevas

El punto de entrada recomendado es:

```js
import {
  FmButton,
  FmGridPaginator,
  FmDialog
} from '@/components/shared'
```

Los imports antiguos continúan funcionando durante la transición para evitar regresiones.
