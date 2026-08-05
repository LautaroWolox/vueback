export const DOCUMENT_TYPES = Object.freeze({
  ACTA: 'ACTA',
  NOTA_DEBITO: 'NOTA_DEBITO',
  NOTA_CREDITO: 'NOTA_CREDITO'
})

export const DOCUMENT_TYPE_CONFIG = Object.freeze({
  [DOCUMENT_TYPES.ACTA]: {
    routeName: 'COAC',
    detailRouteName: 'CECO_DETALLE',
    title: 'Consultar Actas',
    singular: 'Acta',
    legacyPage: '/pc/consultarActas.html',
    searchEndpoint: '/pc/consultarActas/buscarActas.html',
    idField: 'idActa',
    numberField: 'nroActa',
    associatedActField: 'nroActa',
    detailTypeParam: 'acta',
    filters: [
      'provincia', 'contratista', 'sociedad', 'tipoContrato',
      'periodoAnio', 'periodoNombre', 'estadoActa', 'nroActa', 'nroOt'
    ],
    columns: [
      { field: 'nroActa', header: 'ACTA', width: '132px' },
      { field: 'hayND', header: 'ND', width: '68px' },
      { field: 'hayNC', header: 'NC', width: '68px' },
      { field: 'estadoActa', header: 'ESTADO', width: '132px' },
      { field: 'periodo', header: 'PERÍODO', width: '100px' },
      { field: 'anio', header: 'AÑO', width: '74px' },
      { field: 'fechaCreacion', header: 'FECHA CREACIÓN', width: '138px' },
      { field: 'fechaCierre', header: 'FECHA CIERRE', width: '138px' },
      { field: 'contratista', header: 'CONTRATISTA', width: '170px' },
      { field: 'pais', header: 'PAÍS', width: '92px' },
      { field: 'provincia', header: 'PROVINCIA', width: '130px' },
      { field: 'region', header: 'REGIÓN', width: '120px' },
      { field: 'tipoContrato', header: 'TIPO CONTRATO', width: '150px' },
      { field: 'sociedad', header: 'SOCIEDAD', width: '120px' },
      { field: 'usuarioCierre', header: 'USUARIO CIERRE', width: '130px' },
      { field: 'valoracion', header: 'VALORACIÓN', width: '105px' },
      { field: 'cantOtExcluida', header: 'OTS EXCLUIDAS', width: '110px', numeric: true },
      { field: 'cantOtNoExcluida', header: 'OTS INCLUIDAS', width: '110px', numeric: true },
      { field: 'cantActividadActiva', header: 'ACT. ACTIVAS', width: '105px', numeric: true },
      { field: 'cantActividadDesac', header: 'ACT. INACTIVAS', width: '110px', numeric: true },
      { field: 'cantOtFlujoInicial', header: 'FLUJO INICIAL', width: '110px', numeric: true },
      { field: 'cantOtFlujoVerificada', header: 'VERIFICADAS', width: '105px', numeric: true },
      { field: 'cantOtAApli', header: 'REGLAS A APLIC.', width: '115px', numeric: true },
      { field: 'cantOtAVali', header: 'REGLAS A VALID.', width: '115px', numeric: true },
      { field: 'cantOtBApli', header: 'REGLAS B APLIC.', width: '115px', numeric: true },
      { field: 'cantOtBVali', header: 'REGLAS B VALID.', width: '115px', numeric: true }
    ]
  },
  [DOCUMENT_TYPES.NOTA_DEBITO]: {
    routeName: 'NODE',
    detailRouteName: 'CECO_DETALLE',
    title: 'Consultar Notas de Débito',
    singular: 'Nota de Débito',
    legacyPage: '/pc/consultarNotaDebito.html',
    searchEndpoint: '/pc/consultarNotaDebito/buscarND.html',
    periodEndpoint: '/pc/consultarNotaDebito/periodos',
    idField: 'actaDCId',
    numberField: 'nroActaDC',
    associatedActField: 'nroActa',
    detailTypeParam: 'nota-debito',
    filters: [
      'provincia', 'contratista', 'sociedad', 'tipoContrato',
      'periodoAnio', 'periodoNombre', 'estadoActa', 'nroActa', 'nroOt', 'nroActaAsoc'
    ],
    columns: [
      { field: 'numeroOT', header: 'N.º OT', width: '120px' },
      { field: 'nroActaDC', header: 'NOTA DÉBITO', width: '140px' },
      { field: 'nroActa', header: 'ACTA ASOCIADA', width: '132px' },
      { field: 'estadoNota', header: 'ESTADO', width: '128px' },
      { field: 'periodo', header: 'PERÍODO', width: '100px' },
      { field: 'anio', header: 'AÑO', width: '74px' },
      { field: 'fechaCreacionDC', header: 'FECHA CREACIÓN', width: '138px' },
      { field: 'fechaCierreDC', header: 'FECHA CIERRE', width: '138px' },
      { field: 'contratista', header: 'CONTRATISTA', width: '170px' },
      { field: 'pais', header: 'PAÍS', width: '92px' },
      { field: 'provincia', header: 'PROVINCIA', width: '130px' },
      { field: 'region', header: 'REGIÓN', width: '120px' },
      { field: 'contrato', header: 'CONTRATO', width: '150px' },
      { field: 'sociedad', header: 'SOCIEDAD', width: '120px' },
      { field: 'usuarioCierre', header: 'USUARIO CIERRE', width: '130px' },
      { field: 'calificacion', header: 'CALIFICACIÓN', width: '110px' },
      { field: 'qotsNoExcluidas', header: 'OTS INCLUIDAS', width: '110px', numeric: true },
      { field: 'qotsExcluidas', header: 'OTS EXCLUIDAS', width: '110px', numeric: true },
      { field: 'qactividadesActivas', header: 'ACT. ACTIVAS', width: '105px', numeric: true },
      { field: 'qactividadesDesactivadas', header: 'ACT. INACTIVAS', width: '110px', numeric: true },
      { field: 'qotsFlujoInicial', header: 'FLUJO INICIAL', width: '110px', numeric: true },
      { field: 'qotsFlujoVerificado', header: 'VERIFICADAS', width: '105px', numeric: true },
      { field: 'qotsFlujoAAplicadas', header: 'REGLAS A APLIC.', width: '115px', numeric: true },
      { field: 'qotsFlujoAValidadas', header: 'REGLAS A VALID.', width: '115px', numeric: true },
      { field: 'qotsFlujoBAplicadas', header: 'REGLAS B APLIC.', width: '115px', numeric: true },
      { field: 'qotsFlujoBValidadas', header: 'REGLAS B VALID.', width: '115px', numeric: true }
    ]
  },
  [DOCUMENT_TYPES.NOTA_CREDITO]: {
    routeName: 'NOCR',
    detailRouteName: 'CECO_DETALLE',
    title: 'Consultar Notas de Crédito',
    singular: 'Nota de Crédito',
    legacyPage: '/pc/consultarNotaCredito.html',
    searchEndpoint: '/pc/consultarNotaCredito/buscarNC.html',
    periodEndpoint: '/pc/consultarNotaCredito/periodos',
    idField: 'actaDCId',
    numberField: 'nroActaDC',
    associatedActField: 'nroActa',
    detailTypeParam: 'nota-credito',
    filters: [
      'provincia', 'contratista', 'sociedad', 'tipoContrato',
      'periodoAnio', 'periodoNombre', 'estadoActa', 'nroActa', 'nroOt', 'nroActaAsoc'
    ],
    columns: [
      { field: 'numeroOT', header: 'N.º OT', width: '120px' },
      { field: 'nroActaDC', header: 'NOTA CRÉDITO', width: '140px' },
      { field: 'nroActa', header: 'ACTA ASOCIADA', width: '132px' },
      { field: 'estadoNota', header: 'ESTADO', width: '128px' },
      { field: 'periodo', header: 'PERÍODO', width: '100px' },
      { field: 'anio', header: 'AÑO', width: '74px' },
      { field: 'fechaCreacionDC', header: 'FECHA CREACIÓN', width: '138px' },
      { field: 'fechaCierreDC', header: 'FECHA CIERRE', width: '138px' },
      { field: 'contratista', header: 'CONTRATISTA', width: '170px' },
      { field: 'pais', header: 'PAÍS', width: '92px' },
      { field: 'provincia', header: 'PROVINCIA', width: '130px' },
      { field: 'region', header: 'REGIÓN', width: '120px' },
      { field: 'contrato', header: 'CONTRATO', width: '150px' },
      { field: 'sociedad', header: 'SOCIEDAD', width: '120px' },
      { field: 'usuarioCierre', header: 'USUARIO CIERRE', width: '130px' },
      { field: 'calificacion', header: 'CALIFICACIÓN', width: '110px' },
      { field: 'qactividadesActivas', header: 'ACT. ACTIVAS', width: '105px', numeric: true },
      { field: 'qactividadesDesactivadas', header: 'ACT. INACTIVAS', width: '110px', numeric: true },
      { field: 'qots', header: 'CANTIDAD OTS', width: '110px', numeric: true }
    ]
  }
})

export const EMPTY_DOCUMENT_FILTERS = Object.freeze({
  provincia: '',
  contratista: '',
  sociedad: '',
  tipoContrato: '',
  periodoAnio: '',
  periodoNombre: '',
  estadoActa: '',
  nroActa: '',
  nroOt: '',
  nroActaAsoc: '',
  sinFiltros: false,
  page: 0,
  size: 20
})

export const DETAIL_TYPE_CONFIG = Object.freeze({
  acta: {
    documentType: DOCUMENT_TYPES.ACTA,
    label: 'Acta',
    detailEndpoint: '/pc/detalleActa/getOtsAndActaDetallebynroActa.html',
    filterEndpoint: '/pc/detalleActa/getByNroActaAndNroOt.html',
    activitiesExportEndpoint: '/pc/detalleActa/getOtsDetalleByNroActa_ActivitiesNueva.html',
    reasonsEndpoint: '/pc/detalleActa/getAllMotivos.html',
    excludeEndpoint: '/pc/detalleActa/excluirOTMultiple.html',
    includeEndpoint: '/pc/detalleActa/incluirOtActaExcluida.html',
    validateRulesEndpoint: '/pc/detalleActa/validarReglas.html',
    certifyEndpoint: '/pc/detalleActa/certificarActa.html',
    qualifyEndpoint: '/pc/detalleActa/calificarActa.html',
    failedOtsEndpoint: '/pc/detalleActa/hayOTFallidas.html',
    canInclude: true,
    canTransfer: true,
    canQualify: true,
    canCertify: true,
    canClose: false
  },
  'nota-debito': {
    documentType: DOCUMENT_TYPES.NOTA_DEBITO,
    label: 'Nota de Débito',
    detailEndpoint: '/pc/detalleActaDebito/getOtsAndActaDetallebynroActa.html',
    filterEndpoint: '/pc/detalleActaDebito/getByNDAndNroOt.html',
    activitiesExportEndpoint: '/pc/detalleActaDebito/getOtsDetalleByNroActa_ActivitiesView.html',
    reasonsEndpoint: '/pc/detalleActaDebito/getAllMotivos.html',
    excludeEndpoint: '/pc/detalleActaDebito/excluirOTMultiple.html',
    includeEndpoint: '/pc/detalleActa/incluirOrdenTrabajo.html',
    validateRulesEndpoint: '/pc/detalleActaDebito/validarReglas.html',
    validateActivitiesEndpoint: '/pc/detalleActaDebito/validarActActaDC.html',
    closeEndpoint: '/pc/detalleActaDebito/cerrarActaDebito.html',
    canInclude: true,
    canTransfer: false,
    canQualify: false,
    canCertify: false,
    canClose: true
  },
  'nota-credito': {
    documentType: DOCUMENT_TYPES.NOTA_CREDITO,
    label: 'Nota de Crédito',
    detailEndpoint: '/pc/detalleActaCredito/getOtsAndActaDetallebynroActa.html',
    filterEndpoint: '/pc/detalleActaCredito/getByNDAndNroOt.html',
    activitiesExportEndpoint: '/pc/detalleActaDebito/getOtsDetalleByNroActa_ActivitiesView.html',
    reasonsEndpoint: '/pc/detalleActaCredito/getAllMotivos.html',
    excludeEndpoint: '/pc/detalleActaCredito/excluirOTMultiple.html',
    validateActivitiesEndpoint: '/pc/detalleActaCredito/validarActActaDC.html',
    closeEndpoint: '/pc/detalleActaCredito/cerrarActaCredito.html',
    canInclude: false,
    canTransfer: false,
    canQualify: false,
    canCertify: false,
    canClose: true
  }
})

export const OT_DETAIL_COLUMNS = Object.freeze([
  { field: 'numeroOT', header: 'N.º OT', width: '120px', frozen: true },
  { field: 'fechaOrden', header: 'FECHA ORDEN', width: '130px' },
  { field: 'fechaCierre', header: 'FECHA CIERRE', width: '130px' },
  { field: 'tarea', header: 'TAREA', width: '190px' },
  { field: 'direccion', header: 'DIRECCIÓN', width: '210px' },
  { field: 'ciudad', header: 'CIUDAD', width: '135px' },
  { field: 'sector', header: 'SECTOR', width: '120px' },
  { field: 'provincia', header: 'PROVINCIA', width: '130px' },
  { field: 'pais', header: 'PAÍS', width: '95px' },
  { field: 'baseNombre', header: 'BASE', width: '130px' },
  { field: 'region', header: 'REGIÓN', width: '120px' },
  { field: 'contratista', header: 'CONTRATISTA', width: '175px' },
  { field: 'contrato', header: 'CONTRATO', width: '150px' },
  { field: 'sociedad', header: 'SOCIEDAD', width: '120px' },
  { field: 'area', header: 'ÁREA', width: '105px' },
  { field: 'techNum', header: 'TECH NUM', width: '115px' },
  { field: 'actividades', header: 'ACTIVIDADES', width: '200px' },
  { field: 'cmos', header: 'CMOS', width: '165px' },
  { field: 'validado', header: 'ESTADO REGLAS', width: '150px' },
  { field: 'excluida', header: 'EXCLUIDA', width: '94px' },
  { field: 'motivoExclusion', header: 'MOTIVO EXCLUSIÓN', width: '170px' },
  { field: 'nota', header: 'NOTA', width: '220px' },
  { field: 'origenTraspaso', header: 'ORIGEN TRASPASO', width: '160px' },
  { field: 'notaTraspaso', header: 'NOTA TRASPASO', width: '180px' },
  { field: 'nroOI', header: 'N.º OI', width: '110px' }
])

export const FLOW_OPTIONS = Object.freeze([
  { label: 'Todos', value: '' },
  { label: 'Inicial', value: 'INICIAL' },
  { label: 'Verificado', value: 'VERIFICADO' },
  { label: 'Reglas A aplicadas', value: 'REGLAS_A_APLICADAS' },
  { label: 'Reglas A validadas', value: 'REGLAS_A_VALIDADAS' },
  { label: 'Reglas B aplicadas', value: 'REGLAS_B_APLICADAS' },
  { label: 'Reglas B validadas', value: 'REGLAS_B_VALIDADAS' }
])

export const EXCLUDED_OPTIONS = Object.freeze([
  { label: 'Todas', value: '' },
  { label: 'Incluidas', value: 'N' },
  { label: 'Excluidas', value: 'S' }
])
