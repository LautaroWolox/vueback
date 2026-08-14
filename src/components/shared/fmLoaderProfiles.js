const DEFAULT_PROFILE = Object.freeze({
  variant: 'iframe',
  title: 'Cargando información',
  message: 'Aguarde unos instantes'
})

const PROFILES = Object.freeze({
  LOGIN2FA: {
    variant: 'profile',
    title: 'Cargando perfil',
    message: 'Obteniendo información del usuario'
  },
  MAIN: {
    variant: 'dashboard',
    title: 'Cargando datos',
    message: 'Preparando la pantalla principal'
  },
  DEAC: {
    variant: 'detail',
    title: 'Cargando detalle',
    message: 'Preparando el detalle del acta'
  },
  SONE: {
    variant: 'process',
    title: 'Cargando soporte al negocio',
    message: 'Preparando la consola de soporte'
  },
  GEOP: {
    variant: 'grid',
    title: 'Cargando operadores',
    message: 'Preparando la gestión de operadores'
  },
  ESLO: {
    variant: 'config',
    title: 'Cargando estructuras lógicas',
    message: 'Preparando la configuración de estructuras'
  },
  ABMP: {
    variant: 'config',
    title: 'Cargando perfiles',
    message: 'Preparando la administración de perfiles'
  },
  CESL: {
    variant: 'detail',
    title: 'Cargando estructura lógica',
    message: 'Preparando la consulta de estructura'
  },
  EMUL: {
    variant: 'emulation',
    title: 'Cargando emulación',
    message: 'Consultando información del legajo'
  },
  GEOT: {
    variant: 'materials',
    title: 'Cargando materiales de OT',
    message: 'Preparando la gestión de materiales'
  },
  ABMM: {
    variant: 'materials',
    title: 'Cargando materiales',
    message: 'Preparando el catálogo de materiales'
  },
  ERGE: {
    variant: 'grid',
    title: 'Cargando errores de gestión',
    message: 'Preparando la grilla de errores'
  },
  REFA: {
    variant: 'grid',
    title: 'Cargando OTs fallidas',
    message: 'Preparando el registro de OTs fallidas'
  },
  MADE: {
    variant: 'materials',
    title: 'Cargando materiales descargados',
    message: 'Preparando la información de materiales'
  },
  ERGS: {
    variant: 'grid',
    title: 'Cargando errores de sucursal',
    message: 'Preparando la grilla de errores'
  },
  VARE: {
    variant: 'process',
    title: 'Validando OT de redes',
    message: 'Procesando la información de la orden'
  },
  QRTZ: {
    variant: 'config',
    title: 'Cargando configuración',
    message: 'Preparando la configuración de Qrtz'
  },
  EXDA: {
    variant: 'report',
    title: 'Cargando reporte SAS',
    message: 'Consultando materiales descargados'
  },
  OTZO: {
    variant: 'search',
    title: 'Buscando OTs en zona',
    message: 'Consultando órdenes de trabajo'
  },
  OMAP: {
    variant: 'search',
    title: 'Cargando mapa de OTs',
    message: 'Preparando la ubicación de las órdenes'
  },
  WOAR: {
    variant: 'process',
    title: 'Cargando WorkAround',
    message: 'Preparando la información del proceso'
  },
  JOCO: {
    variant: 'config',
    title: 'Cargando Jobtype - Contrato',
    message: 'Preparando la parametrización'
  },
  JOCM: {
    variant: 'config',
    title: 'Cargando CMO - Actividad',
    message: 'Preparando la parametrización'
  },
  COAC: {
    variant: 'search',
    title: 'Cargando actas',
    message: 'Consultando actas'
  },
  COSA: {
    variant: 'search',
    title: 'Cargando OTs sin acta',
    message: 'Consultando órdenes de trabajo'
  },
  NODE: {
    variant: 'search',
    title: 'Cargando notas de débito',
    message: 'Consultando notas'
  },
  NOCR: {
    variant: 'search',
    title: 'Cargando notas de crédito',
    message: 'Consultando notas'
  },
  CORE: {
    variant: 'config',
    title: 'Cargando reglas',
    message: 'Preparando las reglas del sistema'
  },
  MORE: {
    variant: 'process',
    title: 'Cargando monitoreo de reglas',
    message: 'Preparando ejecución y monitoreo'
  },
  PUMA: {
    variant: 'process',
    title: 'Cargando pruebas masivas',
    message: 'Preparando el proceso masivo'
  },
  ROTF: {
    variant: 'grid',
    title: 'Cargando grilla',
    message: 'Consultando OTs fallidas para reproceso'
  },
  BUOT: {
    variant: 'search',
    title: 'Cargando búsqueda de OTs',
    message: 'Consultando órdenes de trabajo'
  }
})

const cleanTitle = (value) => String(value ?? '').replace(/\s+/g, ' ').trim()

export const getLoaderProfile = (routeLike = {}) => {
  const routeName = String(routeLike?.name ?? '').trim().toUpperCase()
  const profile = PROFILES[routeName]

  if (profile) return { ...profile }

  const contextualTitle = cleanTitle(routeLike?.title ?? routeLike?.meta?.title)
  if (contextualTitle) {
    return {
      variant: 'iframe',
      title: `Cargando ${contextualTitle}`,
      message: 'Preparando pantalla'
    }
  }

  return { ...DEFAULT_PROFILE }
}

export const loaderShowcaseItems = Object.freeze([
  { variant: 'profile', title: 'Cargando perfil', message: 'Obteniendo información del usuario' },
  { variant: 'dashboard', title: 'Cargando datos', message: 'Preparando la pantalla principal' },
  { variant: 'grid', title: 'Cargando grilla', message: 'Consultando datos y preparando resultados' },
  { variant: 'detail', title: 'Cargando detalle', message: 'Preparando la información seleccionada' },
  { variant: 'emulation', title: 'Cargando emulación', message: 'Consultando información del legajo' },
  { variant: 'report', title: 'Cargando reporte', message: 'Generando y preparando información' },
  { variant: 'search', title: 'Cargando búsqueda', message: 'Consultando órdenes de trabajo' },
  { variant: 'materials', title: 'Cargando materiales', message: 'Preparando el catálogo de materiales' },
  { variant: 'config', title: 'Cargando parametrización', message: 'Preparando configuración y reglas' },
  { variant: 'process', title: 'Procesando información', message: 'Aguarde mientras se completa la operación' },
  { variant: 'iframe', title: 'Cargando pantalla', message: 'Preparando el módulo legacy' }
])
