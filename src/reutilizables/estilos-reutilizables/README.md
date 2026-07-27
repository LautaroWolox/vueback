# Estilos reutilizables

Esta carpeta documenta el destino de los estilos compartidos. No contiene copias de CSS.

## Ubicación actual

Los estilos globales existentes continúan en:

```text
src/assets/css/
```

Archivos principales:

```text
fm-global.css
fm-grid-resize.css
fm-otf-paginator-compat.css
fm-responsive.css
fm-menu-responsive.css
fm-menu-tuning.css
fm-report-sas-auto-height.css
fm-select.css
jobtype-contrato.css
```

Se conservan allí durante la revisión para no modificar el orden de carga ni la especificidad aprobada.

## Distribución final

Después de validar localmente:

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

## Qué queda dentro de cada componente

Con `<style scoped>`:

- `FmButton`;
- `FmGridPaginator`;
- `FmGridActions`;
- `FmTypingLoader`;
- wrappers de filtros;
- wrappers de popup.

## Qué queda dentro de cada módulo

Cada pantalla tendrá su propio directorio `styles/` y utilizará selectores que comiencen por la clase raíz del módulo.

Correcto:

```css
.registro-ots-page :deep(.p-datatable-thead > tr > th) {
  /* solo esta pantalla */
}
```

Incorrecto dentro de un módulo:

```css
.p-datatable-thead > tr > th {
  /* afectaría todas las pantallas */
}
```

## Popups teletransportados

Los estilos específicos de un popup deben comenzar por su clase exclusiva:

```css
:global(.registro-ot-excluir-dialog) {
  /* solo ese popup */
}
```

No usar selectores globales genéricos sobre `.p-dialog` desde un módulo.
