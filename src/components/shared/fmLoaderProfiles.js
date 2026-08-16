const DEFAULT_PROFILE = Object.freeze({
  title: 'Cargando información',
  message: 'Preparando pantalla',
  variant: 'default',
  forceMessage: false,
})

const ROUTE_PROFILES = Object.freeze({
  login2fa: {
    title: 'Cargando perfil',
    message: 'Obteniendo información del perfil',
    variant: 'profile',
    forceMessage: true,
  },
  DEAC: {
    title: 'Cargando detalle',
    message: 'Preparando detalle del acta',
    variant: 'detail',
  },
  EMUL: {
    title: 'Cargando emulación',
    message: 'Consultando información del operador',
    variant: 'emulation',
  },
  EXDA: {
    title: 'Cargando reporte SAS',
    message: 'Consultando información del reporte',
    variant: 'report',
  },
  ROTF: {
    title: 'Cargando grilla',
    message: 'Consultando OTs fallidas para reproceso',
    variant: 'grid',
  },

  SONE: { title: 'Cargando soporte al negocio', message: 'Preparando consola de soporte', variant: 'iframe' },
  GEOP: { title: 'Cargando operadores', message: 'Preparando gestión de operadores', variant: 'iframe' },
  ESLO: { title: 'Cargando estructura lógica', message: 'Preparando gestión de estructuras', variant: 'config' },
  ABMP: { title: 'Cargando perfiles', message: 'Preparando administración de perfiles', variant: 'profile' },
  CESL: { title: 'Cargando estructura lógica', message: 'Consultando estructura lógica', variant: 'search' },
  GEOT: { title: 'Cargando materiales', message: 'Preparando gestión de materiales en OTs', variant: 'grid' },
  ABMM: { title: 'Cargando materiales', message: 'Preparando ABM de materiales', variant: 'grid' },
  ERGE: { title: 'Cargando errores', message: 'Consultando errores de gestión', variant: 'report' },
  REFA: { title: 'Cargando OTs fallidas', message: 'Preparando registro de OTs fallidas', variant: 'grid' },
  MADE: { title: 'Cargando materiales descargados', message: 'Consultando materiales descargados', variant: 'report' },
  ERGS: { title: 'Cargando errores', message: 'Consultando errores de gestión de sucursal', variant: 'report' },
  VARE: { title: 'Validando OT', message: 'Preparando validación de OT de redes', variant: 'process' },
  QRTZ: { title: 'Cargando configuración', message: 'Preparando configuración de Qrtz', variant: 'config' },
  OTZO: { title: 'Buscando OTs', message: 'Consultando OTs en zona', variant: 'search' },
  OMAP: { title: 'Cargando mapa', message: 'Preparando búsqueda de OTs en mapa', variant: 'search' },
  WOAR: { title: 'Cargando WorkAround', message: 'Preparando pantalla', variant: 'process' },
  JOCO: { title: 'Cargando parametrización', message: 'Preparando Jobtype - Contrato', variant: 'config' },
  JOCM: { title: 'Cargando parametrización', message: 'Preparando CMO - Actividad', variant: 'config' },
  COAC: { title: 'Cargando actas', message: 'Consultando actas', variant: 'search' },
  COSA: { title: 'Cargando OTs sin acta', message: 'Consultando OTs sin acta', variant: 'search' },
  NODE: { title: 'Cargando notas de débito', message: 'Consultando notas de débito', variant: 'report' },
  NOCR: { title: 'Cargando notas de crédito', message: 'Consultando notas de crédito', variant: 'report' },
  CORE: { title: 'Cargando reglas', message: 'Consultando reglas', variant: 'config' },
  MORE: { title: 'Cargando reglas', message: 'Preparando monitoreo y ejecución de reglas', variant: 'process' },
  PUMA: { title: 'Cargando prueba masiva', message: 'Preparando regla de prueba masiva', variant: 'process' },
  BUOT: { title: 'Buscando OTs', message: 'Preparando búsqueda de OTs', variant: 'search' },
})

export const GENERIC_LOADER_TITLES = Object.freeze([
  'Cargando Información',
  'Cargando información',
])

export const GENERIC_LOADER_MESSAGES = Object.freeze([
  'Preparando Grilla',
  'Preparando grilla',
  'Preparando pantalla',
])

export const getLoaderProfile = (routeName) => {
  const key = String(routeName ?? '')
  return ROUTE_PROFILES[key] ?? DEFAULT_PROFILE
}
