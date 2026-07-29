# Parametrizaciones Jobtype

Las pantallas **Jobtype-Contrato** y **CMO-Actividad** son módulos independientes. Comparten componentes visuales, pero no comparten formularios, columnas ni estado de negocio.

## Estructura

```text
parametrizaciones/
├── jobtypeContrato/
│   ├── JobtypeContrato.vue
│   ├── AltaJobtypeContratoDialog.vue
│   ├── EditarJobtypeContratoDialog.vue
│   └── jobtypeContrato.store.js
├── jobtypeCMO/
│   └── JobtypeCMO.vue
├── cmoActividad/
│   ├── AltaCmoActividadDialog.vue
│   ├── EditarCmoActividadDialog.vue
│   └── cmoActividad.store.js
└── shared/
    ├── ParametrizacionGrid.vue
    ├── ParametrizacionGridActions.vue
    ├── ParametrizacionButton.vue
    ├── ParametrizacionCloseButton.vue
    ├── ConfirmarAccionDialog.vue
    └── exportRowsToExcel.js
```

## Pantallas

- `jobtypeContrato/JobtypeContrato.vue`: orquesta la parametrización Jobtype-Contrato.
- `jobtypeCMO/JobtypeCMO.vue`: orquesta la parametrización CMO-Actividad.

Cada pantalla define explícitamente:

- las columnas de su grilla;
- la fila seleccionada;
- la apertura de sus modales;
- las operaciones que llama en su store local.

## Componentes compartidos

- `shared/ParametrizacionGrid.vue`: DataTable reutilizable con filtros, selección y paginador.
- `shared/ParametrizacionGridActions.vue`: acciones reutilizables de exportar, eliminar, editar y agregar.
- `shared/ParametrizacionButton.vue`: botón de texto reutilizable para búsquedas y acciones de popup.
- `shared/ParametrizacionCloseButton.vue`: botón de cierre reutilizable para popups.
- `shared/ConfirmarAccionDialog.vue`: confirmación reutilizable.
- `shared/exportRowsToExcel.js`: exportación Excel `.xlsx` común mediante ExcelJS.

Los componentes compartidos no conocen Jobtype, Contrato, CMO ni Actividad. Reciben propiedades y emiten eventos.

## Estado Pinia

Cada store vive dentro del módulo dueño de los datos:

- `jobtypeContrato/jobtypeContrato.store.js`: registros y acciones de Jobtype-Contrato.
- `cmoActividad/cmoActividad.store.js`: registros y acciones de CMO-Actividad.

No se deben combinar ambos modelos en un único store ni colocar estos stores dentro de `src/store`.

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
4. Reutilizar `ParametrizacionGrid`, `ParametrizacionGridActions`, `ParametrizacionButton` y `ParametrizacionCloseButton`.
5. Las diferencias de negocio deben quedar visibles en los archivos de cada módulo.
6. Las exportaciones de estas parametrizaciones deben generarse en formato Excel `.xlsx`.
