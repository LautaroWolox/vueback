# Parametrizaciones Jobtype

Las pantallas **Jobtype-Contrato** y **CMO-Actividad** son módulos independientes. Comparten componentes visuales, pero no comparten formularios, columnas ni estado de negocio.

## Pantallas

- `jobtypeContrato/JobtypeContrato.vue`: orquesta la parametrización Jobtype-Contrato.
- `jobtypeCMO/JobtypeCMO.vue`: orquesta la parametrización CMO-Actividad.

Cada pantalla define explícitamente:

- las columnas de su grilla;
- la fila seleccionada;
- la apertura de sus modales;
- las operaciones que llama en su store.

## Componentes compartidos

- `shared/ParametrizacionGrid.vue`: DataTable reutilizable con filtros, selección, paginador y `FmGridActions`.
- `shared/ConfirmarAccionDialog.vue`: confirmación reutilizable basada en `FmButton`.
- `shared/exportRowsToExcel.js`: exportación Excel `.xlsx` común mediante ExcelJS.

Estos componentes no conocen Jobtype, Contrato, CMO ni Actividad. Reciben datos y emiten eventos.

## Estado Pinia

- `src/store/jobtypeContrato.js`: registros y acciones de Jobtype-Contrato.
- `src/store/cmoActividad.js`: registros y acciones de CMO-Actividad.

No se deben combinar ambos modelos en un único store ni crear alias de campos para que una fila de CMO parezca una fila de Contrato.

## Modales

Cada parametrización conserva sus propios modales de alta y edición:

- `AltaJobtypeContratoDialog.vue`
- `EditarJobtypeContratoDialog.vue`
- `AltaCmoActividadDialog.vue`
- `EditarCmoActividadDialog.vue`

Los formularios temporales permanecen dentro de los modales. Al confirmar, el modal emite un payload y la pantalla llama al store correspondiente.

## Reglas para nuevos cambios

1. No modificar elementos con `document.querySelector`, `MutationObserver` o clics sintéticos.
2. No ocultar ni renombrar columnas mediante `nth-child` o pseudoelementos CSS.
3. No agregar condiciones de CMO dentro de componentes de Contrato, ni al revés.
4. Reutilizar `ParametrizacionGrid`, `FmGridActions`, `FmGridPaginator` y `FmButton`.
5. Las diferencias de negocio deben quedar visibles en los archivos de cada módulo.
6. Las exportaciones de estas parametrizaciones deben generarse en formato Excel `.xlsx`.
