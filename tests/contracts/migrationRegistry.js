export const migratedScreens = [
  {
    routeName: 'EMUL',
    routePath: '/FM/emulacion.html',
    moduleDirectory: 'emulacion',
    componentFile: 'Emulacion.vue',
    rootClass: 'emulation-page',
    unitSpecs: ['tests/unit/modules/emulacionStore.spec.js'],
    integrationSpecs: ['tests/integration/migratedScreens.spec.js'],
  },
  {
    routeName: 'EXDA',
    routePath: '/FM/extraccionDatosGM.html',
    moduleDirectory: 'reporteSas',
    componentFile: 'ReporteSAS.vue',
    rootClass: 'report-sas-page',
    unitSpecs: ['tests/unit/modules/reporteSasStore.spec.js'],
    integrationSpecs: ['tests/integration/migratedScreens.spec.js'],
  },
  {
    routeName: 'ROTF',
    routePath: '/FM/registroOTFallidasReproceso.html',
    moduleDirectory: 'otFallidasCT',
    componentFile: 'OtFallidasCT.vue',
    rootClass: 'ot-fallidas-ct',
    unitSpecs: ['tests/unit/modules/CtFallidaStore.spec.ts'],
    integrationSpecs: ['tests/integration/migratedScreens.spec.js'],
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
 * 2. Al comenzar la migración, crear sus pruebas unitarias de store, validaciones y utilidades.
 * 3. Al habilitar Vue, moverla a migratedScreens con moduleDirectory, componentFile y rootClass.
 * 4. Declarar al menos un unitSpec y un integrationSpec reales.
 * 5. Agregar pruebas de loading, error, vacío, permisos y grilla cuando correspondan.
 * 6. Mantener una prueba del fallback legacy hasta que la migración quede estable.
 *
 * migrationArchitecture.spec.js valida automáticamente que los archivos declarados aquí existan.
 */
