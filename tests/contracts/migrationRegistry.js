export const migratedScreens = [
  {
    routeName: 'EMUL',
    routePath: '/FM/emulacion.html',
    moduleDirectory: 'emulacion',
    componentFile: 'Emulacion.vue',
    rootClass: 'emulation-page',
  },
  {
    routeName: 'EXDA',
    routePath: '/FM/extraccionDatosGM.html',
    moduleDirectory: 'reporteSas',
    componentFile: 'ReporteSAS.vue',
    rootClass: 'report-sas-page',
  },
  {
    routeName: 'ROTF',
    routePath: '/FM/registroOTFallidasReproceso.html',
    moduleDirectory: 'otFallidasCT',
    componentFile: 'OtFallidasCT.vue',
    rootClass: 'ot-fallidas-ct',
  },
]

export const releaseLegacyScreens = [
  {
    routeName: 'BUOT',
    routePath: '/FM/busquedaOtsGcc.html',
    urlParam: '/busquedaOtsGcc.html',
  },
  {
    routeName: 'JOCO',
    routePath: '/FM/jobtypeContrato.html',
    urlParam: '/jobtypeContrato.html',
  },
  {
    routeName: 'JOCM',
    routePath: '/FM/jobtypeCMO.html',
    urlParam: '/jobtypeCMO.html',
  },
]

/*
 * Para migrar una pantalla nueva:
 * 1. Mientras siga en legacy, agregarla a releaseLegacyScreens.
 * 2. Al comenzar la migración, crear sus pruebas unitarias de store/utilidades.
 * 3. Al habilitar Vue, moverla a migratedScreens con moduleDirectory y rootClass.
 * 4. Agregar una prueba de integración del flujo principal de usuario.
 * 5. Mantener una prueba del fallback legacy hasta que la migración quede estable.
 */
