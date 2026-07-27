# Auditoría de compatibilidad de la UI compartida

Rama auditada: `CajonesDeFiltros`.

Objetivo: comprobar que la unificación de botones, paginadores y diálogos conserve el comportamiento y el diseño que tenía `main` antes de la limpieza.

> Esta auditoría es estática sobre el código del repositorio. Debe completarse con la prueba local indicada al final porque el entorno del conector de GitHub no ejecuta Vite ni renderiza el navegador.

## 1. Buscar y Limpiar en los cajones

### Registro OTs Fallidas

- `BUSCAR` continúa llamando `store.setData()`.
- El botón queda deshabilitado durante `store.loading`.
- `LIMPIAR` continúa llamando `store.clearFilters()`.
- El endpoint de búsqueda continúa siendo `/pc/registroOTFallidasReproceso/searchFallidas.html`.
- La limpieza no alteró filtros, payload ni store.

Estado: **compatible con main**.

### Emulación

- `BUSCAR` continúa llamando `storeEmulacion.$fetchData()`.
- Los errores siguen mostrándose mediante Toast.
- `LIMPIAR` continúa ejecutando `$resetFilters()` y eliminando los Toast activos.
- Los botones continúan deshabilitados durante el loader.

Estado: **compatible con main**.

### Buscador OTs Vue

- Los botones y estados visuales siguen funcionando.
- `LIMPIAR` reinicia textarea, filas, filtros de columnas, filtro de fallidas y página.
- `BUSCAR` todavía no consume un endpoint: el propio archivo deja documentado que falta confirmar el contrato legacy.
- La ruta `BUOT` continúa usando `IframeView`, por lo que este componente Vue no reemplaza todavía la pantalla productiva.

Estado: **sin regresión por la limpieza, pero la migración Vue sigue incompleta por contrato backend pendiente**.

### Parametrizaciones Jobtype/CMO

- `BUSCAR` abre el panel de resultados y reinicia la página.
- Las altas, ediciones, eliminaciones y exportación operan sobre estado local.
- No existe todavía integración backend en `JobtypeRelacion.vue`.

Estado: **sin regresión por la limpieza, pero funciona como estructura/prototipo local**.

### Reporte SAS

No tiene cajón Buscar/Limpiar: la consulta se ejecuta automáticamente al montar la pantalla.

## 2. Aceptar, Cancelar y Cerrar en popups

`FmDialog` reenvía sin transformar:

- `visible`;
- `update:visible`;
- `show`;
- `hide`;
- `header` y demás atributos PrimeVue mediante `$attrs`;
- `modal`, `closable`, `draggable`, `resizable` y `appendTo`.

Se conservaron las clases específicas de cada popup, por lo que los selectores CSS existentes continúan aplicándose al elemento raíz de PrimeVue.

Popups revisados:

- Alerta compartida.
- OTs externas.
- Confirmación de Emulación.
- Excluir OT.
- Incluir OT.
- Detalle de Nota.
- Resultado de Reproceso.
- Confirmación de eliminación de CMO-Actividad.

Estado: **compatible con main**.

Observaciones preexistentes:

- Cerrar Incluir OT con el botón propio ejecuta `reset`; cerrar con la X nativa solo actualiza `visible`, igual que antes.
- Excluir OT cierra antes de esperar el resultado y no muestra el `ActionResponse` fallido; esta conducta ya existía y no fue modificada.

## 3. Iconos de descargar, eliminar y reprocesar

`FmGridActions` conserva:

- las mismas props;
- los mismos emits;
- las mismas clases `fm-grid-actions-final` y `fm-grid-action-final`;
- los mismos iconos PrimeIcons;
- los mismos títulos y estados deshabilitados;
- el mismo elemento raíz `button.p-button`, ya que `FmButton` encapsula el mismo `Button` de PrimeVue.

Casos comprobados:

- Reporte SAS: exporta mediante `exportarExcel`.
- Registro OTs Fallidas: exporta, abre exclusión y ejecuta reproceso.
- Parametrizaciones: exporta CSV, abre eliminación, edición y alta.
- Buscador OTs: `downloadResults` utiliza `DataTable.exportCSV()` cuando existen filas.

Pendiente preexistente:

- El icono Descargar del popup OTs externas no tiene handler asociado.
- El popup tampoco recibe filas mientras el Buscador OTs Vue no tenga endpoint.

## 4. Paginador de Registro OTs Fallidas

La pantalla usa ahora `FmGridPaginator` y conserva:

- `currentRows = 500` desde el primer render;
- opciones `[100, 250, 500]`;
- flechas simples anterior/siguiente;
- texto `Pagina`;
- página vacía mostrada como `0`;
- contador `Mostrando X de Y`;
- acciones a la izquierda;
- navegación centrada;
- contador a la derecha;
- medidas específicas mediante `fm-otf-paginator-compat.css`.

`autoMaxRows` está desactivado en esta instancia porque el estado ya se inicializa realmente en 500.

Estado: **compatible con el comportamiento aprobado**.

## 5. Paginadores de Reporte SAS y Buscador OTs

### Reporte SAS

- `pageRows` se inicializa realmente en 200.
- Opciones `[10, 20, 50, 100, 200]`.
- `autoMaxRows` desactivado porque el estado ya tiene el máximo.
- Contador simplificado.
- Exportación conservada.
- La altura crece por filas hasta el límite de viewport y luego mantiene scroll interno.

Estado: **compatible con el último comportamiento aprobado**.

### Buscador OTs

- `pageRows` se inicializa en 100, máximo de `[10, 50, 100]`.
- Contador, navegación y selector conservados.
- La lógica de datos sigue pendiente del endpoint legacy, pero el paginador no fue alterado por la limpieza.

Estado: **compatible a nivel de componente; datos pendientes por migración**.

## 6. Popup OTs externas

Se conservaron:

- clases `fm-dialog` y `busqueda-ots-external-dialog`;
- ancho, alto y layout del popup;
- grilla, columnas y scroll;
- paginador compartido;
- botón Cerrar;
- apertura y cierre mediante `v-model:visible`.

Pendientes preexistentes:

- `externalRows` permanece vacío mientras la búsqueda Vue no esté conectada.
- Descargar no tiene handler.

Estado: **el cambio de `Dialog` a `FmDialog` es compatible; la funcionalidad de datos sigue incompleta**.

## 7. Confirmación de Emulación

Se conservaron:

- clase `emulation-confirm-dialog`;
- contenido del operador y perfiles;
- Cancelar: cierra y limpia la confirmación;
- Aceptar: conserva legajo, ejecuta `$emulate()`, muestra Toast en error y recarga el aplicativo al finalizar correctamente;
- evento `hide` y estilos específicos.

Estado: **compatible con main**.

## 8. Excluir, Incluir, Nota y Reproceso

### Excluir

- Conserva selección múltiple, motivo obligatorio, nota opcional, ResizeObserver y ancho dinámico.
- Conserva endpoint y recarga posterior.

### Incluir

- Conserva OT seleccionada, motivo obligatorio, nota opcional y actualización posterior.

### Nota

- Conserva contenido, saltos de línea y botón Cerrar.

### Reproceso

- Conserva endpoint, estado de error, cantidad procesada y botón Cerrar.

Estado: **los cuatro contenedores son compatibles con main**.

## 9. Confirmación CMO-Actividad

Se conservaron:

- captura del botón original de eliminación;
- prevención del primer click;
- almacenamiento del botón pendiente;
- Cancelar y cierre;
- Aceptar y repetición controlada del click original;
- clase `cmo-delete-confirm-dialog`;
- botones personalizados y todos sus estilos;
- MutationObserver del popup de alta.

La limpieza reemplazó únicamente el contenedor PrimeVue directo por `FmDialog` con `base-class=""`, para no introducir la clase global `fm-dialog` en este diseño particular.

Estado: **compatible con main**.

## Resultado general

La unificación no cambia el comportamiento de los nueve puntos respecto de `main`.

No debe afirmarse todavía que todas las migraciones Vue están funcionalmente terminadas:

1. Buscador OTs Vue no tiene endpoint confirmado y la ruta productiva sigue en iframe.
2. OTs externas no tiene datos ni acción de descarga conectada.
3. Jobtype/CMO opera con datos locales, sin persistencia backend.

Estas limitaciones son anteriores a la limpieza y quedaron explícitamente fuera del alcance para evitar inventar contratos.

## Prueba local obligatoria

```powershell
git fetch origin
git switch CajonesDeFiltros
git pull --ff-only origin CajonesDeFiltros
Remove-Item -Recurse -Force node_modules\.vite -ErrorAction SilentlyContinue
npm install
npm run type-check
npm run build
npm run dev
```

Prueba manual mínima:

1. Buscar y Limpiar en Registro OTs Fallidas y Emulación.
2. Paginación y selección en Registro OTs Fallidas.
3. Descargar, Excluir y Reprocesar.
4. Excluir, Incluir, Nota y Reproceso.
5. Reporte SAS con menos y más filas que la altura visible.
6. Confirmación de Emulación.
7. Alta, edición y eliminación local de CMO-Actividad.
8. Apertura, scroll, paginador y cierre de OTs externas.
9. Comparación visual de tamaños, colores, espacios y tipografías contra `main`.
