# Estrategia de pruebas - Field Manager

Este directorio protege la migración progresiva de Field Manager sin modificar el comportamiento productivo. Las pruebas están separadas por responsabilidad para que un fallo indique con claridad si el problema pertenece a lógica aislada, integración entre componentes o arquitectura de la aplicación.

## Capas

- `unit/`: lógica aislada de stores, componentes compartidos, paginadores, acciones, loaders y composables.
- `integration/`: interacción entre vistas, menú, router, iframe legacy, responsive y componentes compartidos.
- `contracts/`: reglas de arquitectura y regresión que no deben cambiar accidentalmente.
- `cypress/e2e/`: smoke tests reales de navegador para validar que la aplicación puede arrancar y renderizar flujos críticos.

## Comandos

```bash
npm run test
npm run test:unit:run
npm run test:integration
npm run test:contracts
npm run test:smoke
npm run test:regression
npm run test:watch
npm run test:watch:unit
npm run test:ci
npm run test:e2e
npm run test:all
```

- `test`: ejecuta toda la suite Vitest una vez.
- `test:unit:run`: ejecuta únicamente unitarios.
- `test:integration`: ejecuta únicamente integración.
- `test:contracts`: valida arquitectura y regresiones estructurales.
- `test:smoke`: ejecuta rápidamente los contratos más sensibles de ruta, iframe y spinner.
- `test:watch`: queda observando cambios y vuelve a ejecutar automáticamente las pruebas afectadas durante el desarrollo.
- `test:watch:unit`: modo automático limitado a unitarios.
- `test:regression`: unitarios + integración + contratos.
- `test:ci`: regresión completa y, si todo pasa, build de producción.
- `test:e2e`: ejecuta Cypress contra el build servido con Vite Preview.
- `test:all`: ejecuta regresión, build y E2E en una sola cadena.

## Criterio de calidad

Un test no debe quedar verde cambiando la expectativa para esconder una regresión real. Si una prueba falla, primero se clasifica el motivo:

1. **Fallo real de producto:** el comportamiento, texto, ruta o estructura dejó de cumplir el contrato esperado. Se corrige el código productivo.
2. **Falso positivo del test:** la prueba depende de detalles internos que no forman parte del contrato público. Se corrige la prueba para observar comportamiento estable.
3. **Cambio intencional de contrato:** se actualizan juntos implementación, documentación y pruebas.

Los tests deben privilegiar comportamiento observable, accesibilidad, estado del store, payloads, rutas y contratos DOM estables. Se evita depender de posiciones de líneas, tamaños arbitrarios de fragmentos de código o identidades internas de componentes cuando existe una señal observable más confiable.

## Qué queda protegido en esta entrega

### Pantallas Vue migradas

- Emulación (`EMUL`).
- Reporte SAS (`EXDA`).
- Registro OTs Fallidas CT (`ROTF`).

### Pantallas que continúan en iframe legacy

- Búsqueda de OTs (`BUOT`).
- Jobtype-Contrato (`JOCO`).
- CMO-Actividad (`JOCM`).
- Gestión de Actas y Detalle de Acta continúan cubiertos por las pruebas genéricas de `IframeView`, `DetalleView`, `useLegacyIframeLayout` y `responsiveIframes`.

### Regresiones críticas

- Spinner compartido: `Cargando Información` / `Preparando Grilla`.
- Menú de usuario: nombre y apellido, legajo, iniciales y cierre de sesión.
- Menú y submenús: espaciado, altura compacta y navegación.
- Grillas: fila de filtros, redimensionamiento, paginación, acciones y estado vacío compartido.
- Iframes: inyección de estilos legacy, recálculo por resize/zoom, scroll y recuperación del layout.
- Popups legacy: límites respecto del viewport y scroll interno sin alterar el documento padre.
- Router: separación explícita entre pantallas Vue y pantallas legacy, permisos y compatibilidad JOCM/JOCO.
- ABM Materiales: no debe reaparecer accidentalmente en esta versión.
- Codificación: comentarios y textos visibles no deben volver a quedar con caracteres rotos.
- Arranque de aplicación: Cypress verifica la pantalla de acceso tanto en escritorio como en viewport móvil.

## Regla para una nueva migración

Cada pantalla nueva debe incorporar, como mínimo:

1. pruebas unitarias del store, transformaciones, validaciones y utilidades;
2. pruebas de errores de backend, respuestas vacías y estados de loading;
3. prueba de integración del componente raíz y su flujo principal;
4. contrato de router, permiso y menú;
5. prueba de loading/error/empty state;
6. prueba de grilla si usa DataTable: filtros, selección, paginación, acciones y exportación cuando corresponda;
7. prueba de responsive o iframe fallback cuando corresponda;
8. registro en `tests/contracts/migrationRegistry.js` con sus `unitSpecs` e `integrationSpecs`;
9. smoke E2E cuando la pantalla incorpore un flujo crítico que pueda validarse sin depender de datos reales de producción.

Mientras una pantalla siga en legacy debe permanecer en `releaseLegacyScreens`. Cuando Vue pase a ser la implementación activa, se mueve a `migratedScreens` y se agrega su prueba de integración específica. De esta forma, una migración incompleta no puede cambiar silenciosamente la ruta productiva.

## Regla sobre `fm-global.css`

Las pruebas distinguen comentarios descriptivos de marcadores técnicos. Los comentarios pueden mejorarse y profesionalizarse, pero `responsiveIframes.js` extrae la sección legacy usando literalmente estos marcadores:

```css
/* ===== INICIO: fm-legacy-responsive.css ===== */
/* ===== FIN: fm-legacy-responsive.css ===== */
```

Esos dos marcadores son parte del contrato de runtime y no deben renombrarse sin actualizar simultáneamente el código que los consume y sus pruebas.

La prueba de codificación también informa líneas de comentario sospechosas (`??`, `Ã`, `Â` o `�`) para que el error sea corto y accionable en lugar de imprimir todo `fm-global.css`.

## Uso recomendado durante desarrollo

Durante una migración mantener abierta una segunda terminal con:

```bash
npm run test:watch
```

Antes de entregar o subir la rama ejecutar:

```bash
npm run test:ci
```

Para validar absolutamente todo, incluido navegador:

```bash
npm run test:all
```

Si `test:ci` termina correctamente, unitarios, integración, contratos y build completaron sin errores. `test:all` agrega los smoke tests Cypress. El pipeline corporativo puede invocar `npm run test:ci` sin duplicar la lógica de ejecución dentro de los tests.
