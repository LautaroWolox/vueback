# Certificación Contratista — migración Vue

Este módulo reemplaza las pantallas legacy que se cargaban mediante `IframeView.vue` dentro del menú **Certificación Contratista**.

## Rutas migradas

| Código | Ruta | Vista Vue |
|---|---|---|
| `CORE` | `consultarReglas.html` | `views/ConsultarReglasView.vue` |
| `MORE` | `monitoreoEjecucionreglas.html` | `views/MonitoreoReglasView.vue` |
| `PUMA` | `pruebasMasivas.html` | `views/PruebasMasivasView.vue` |
| `COAC` | `consultarActas.html` | `views/DocumentosListView.vue` (`ACTA`) |
| `COSA` | `ordenTrabajoSinActa.html` | `views/OtsSinActaView.vue` |
| `NODE` | `consultarNotaDebito.html` | `views/DocumentosListView.vue` (`NOTA_DEBITO`) |
| `NOCR` | `consultarNotaCredito.html` | `views/DocumentosListView.vue` (`NOTA_CREDITO`) |
| `DEAC` | detalle legacy | `views/DocumentoDetalleView.vue` |

La ruta `BUOT` (`busquedaOtsGcc.html`) permanece en `IframeView.vue` y no forma parte de esta migración.

Los detalles nuevos navegan por `/FM/certificacion/:tipo/:numero`, sin `iframe`, `postMessage` ni `window.open`.

## JSP y pop-ups absorbidos

- `certificacionContratistaConsultarActas.jsp`
- `certificacionContratistaConsultarNotaDebito.jsp`
- `certificacionContratistaConsultarNotaCredito.jsp`
- `ordenTrabajoSinActa.jsp`
- `detalleActa.jsp`
- `detalleActaDebito.jsp`
- `detalleActaCredito.jsp`
- `detalleOtActividadesModal.jsp`
- `detalleOtActividadesModalNDC.jsp`
- `actasDetalleNota.jsp`
- `detalleActaExportarCertificada.jsp`
- `exportarNDCDetalle.jsp`
- `gestionTraspasoOtsActas.jsp`

Las ventanas legacy se reemplazan por los diálogos de `dialogs/` y por filas expandibles para actividades e historial.

## Funcionalidades cubiertas

- filtros, paginación, selección y exportación de consultas;
- apertura de actas y notas por router;
- detalle y filtrado de OTs;
- grilla expandible de actividades;
- actividades originales/resultantes, altas, bajas y modificación de cantidades;
- historial del domicilio con subgrilla y exportación;
- materiales, base instalada y siniestros;
- notas completas de OT y traspaso;
- inclusión y exclusión de OTs;
- validación de reglas y de actividades;
- verificación de OTs de red en notas de débito;
- calificación y certificación de actas;
- cierre de notas de débito/crédito;
- traspaso de OTs, incluyendo advertencia por notas relacionadas;
- consulta/alta de reglas, monitoreo y ejecución;
- prueba masiva secuencial por OT;

## Estilos

Los componentes del módulo no contienen bloques `<style>`. Toda la presentación está centralizada en:

```text
src/assets/css/fm-global.css
```

Sección:

```css
/* ===== INICIO: certificacion-contratista.css ===== */
/* ===== FIN: certificacion-contratista.css ===== */
```

Se reutilizan las clases globales `fm-screen`, `fm-accordion`, `fm-field`, `fm-actions`, `fm-grid-shell`, `fm-pass-grid`, `fm-dialog`, `FmButton`, `FmGridPaginator`, `FmTypingLoader` y `FmAlertDialog`. Los ajustes particulares están encapsulados bajo `.certificacion-contratista-page` y `.certificacion-contratista-dialog`.

## Backend legacy

La capa `api/certificacionApi.js` conserva los contratos HTTP existentes en `/pc`. La pantalla PUMA utiliza el endpoint domiciliario de ejecución por cada OT porque el backend legacy no expone una página/controlador independiente para `pruebasMasivas.html`.
