# Estrategia de pruebas - Field Manager

Este directorio protege la migración progresiva de Field Manager sin modificar el comportamiento productivo.

## Capas

- `unit/`: lógica aislada de stores, componentes compartidos y composables.
- `integration/`: interacción entre vistas, router, iframe legacy, responsive y componentes compartidos.
- `contracts/`: reglas de arquitectura y regresión que no deben cambiar accidentalmente.

## Comandos

```bash
npm run test:unit:run
npm run test:integration
npm run test:contracts
npm run test:regression
npm run test:all
```

`test:all` ejecuta toda la regresión Vitest y luego `npm run build`.

## Qué queda protegido en esta entrega

### Pantallas Vue migradas

- Emulación (`EMUL`).
- Reporte SAS (`EXDA`).
- Registro OTs Fallidas CT (`ROTF`).

### Pantallas que continúan en iframe legacy

- Búsqueda de OTs (`BUOT`).
- Jobtype-Contrato (`JOCO`).
- CMO-Actividad (`JOCM`).
- Gestión de Actas y el detalle de acta continúan cubiertos por las pruebas genéricas de `IframeView` y `DetalleView`.

### Regresiones críticas

- Spinner compartido: `Cargando Información` / `Preparando Grilla`.
- Menú y submenús: espaciado, altura compacta y navegación.
- Grillas: fila de filtros, redimensionamiento y estado vacío compartido.
- Iframes: inyección de estilos legacy, recálculo por resize/zoom, scroll y recuperación al cambiar el viewport.
- Popups legacy: límites respecto del viewport y scroll interno sin alterar el documento padre.
- Router: separación explícita entre pantallas Vue y pantallas legacy.
- ABM Materiales: no debe reaparecer accidentalmente en esta versión.

## Regla para una nueva migración

Cada pantalla nueva debe incorporar, como mínimo:

1. pruebas unitarias del store, transformaciones y utilidades;
2. prueba de integración del componente raíz y su flujo principal;
3. contrato de router y permiso;
4. prueba de loading/error/empty state;
5. prueba de grilla si usa DataTable: filtros, selección, paginación y acciones;
6. prueba de responsive o iframe fallback cuando corresponda;
7. registro en `tests/contracts/migrationRegistry.js`.

Mientras una pantalla siga en legacy debe permanecer en `releaseLegacyScreens`. Cuando Vue pase a ser la implementación activa, se mueve a `migratedScreens` y se agrega su prueba de integración específica.

## Regla sobre `fm-global.css`

Las pruebas asumen que las marcas técnicas usadas por runtime permanecen estables. En particular, `responsiveIframes.js` extrae la sección legacy usando los marcadores:

```css
/* ===== INICIO: fm-legacy-responsive.css ===== */
/* ===== FIN: fm-legacy-responsive.css ===== */
```

Los comentarios descriptivos pueden mejorarse, pero estas marcas no deben renombrarse sin actualizar simultáneamente el código que las consume y sus pruebas.
