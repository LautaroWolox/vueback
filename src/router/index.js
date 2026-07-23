import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '@/store/auth';

const rutasLibres = ['login', '401', 'login2FA'];

const allowed = (to, from, next) => {
  const authStore = useAuthStore()
  const autenticado = authStore.autenticado;
  const rutas = authStore.rutas;
  let rutasPermitidas = rutas !== null ? rutas : [];
  if (!autenticado && rutasLibres.includes(to.name)) {
    next();
    return;
  } else if (!autenticado && !rutasLibres.includes(to.name)) {
    next({ name: '401' });
    return;
  } else if (autenticado && rutasPermitidas.includes(to.name)) {
    next();
    return;
  } else {
    next({ name: '401' });
    return;
  }
}

const routes = [
  {
    path: '/login2fa.html',
    name: 'login2fa',
    alias: ['/','/index.html'],
    component: () => import('../views/Login2faView.vue')
  },
  {
    path: '/401.html',
    component: () => import('../views/401.vue'),
    name: '401'
  },
  {
    path: '/FM/detallActa.html',
    name: 'DEAC',
    component: () => import('../views/DetalleView.vue'),
  },
  {
    path: '/FM',
    name: 'main',
    component: () => import('../views/MainView.vue'),
    children: [
      {
        path: 'soporteNegocio.html',
        name: 'SONE',
        beforeEnter: allowed,
        component: () => import('../views/IframeView.vue'),
        props: {
          urlParam: "/soporteNegocio.html",
          titleParam:"Consola de soporte al negocio",
        }
      },      
      {
        path: 'gestionOperadores.html',
        name: 'GEOP',
        beforeEnter: allowed,
        component: () => import('../views/IframeView.vue'),
        props: {
          urlParam: "/gestionOperadores.html",
          titleParam:"Gestion de operadores",
        }
      },
      {
        path: 'gestionEstructuraLogica.html',
        name: 'ESLO',
        beforeEnter: allowed,
        component: () => import('../views/IframeView.vue'),
        props: {
          urlParam: "/gestionEstructuraLogica.html",
          titleParam:"Gestion de estructuras logisricas",
        }
      },
      {
        path: 'administracionPerfiles.html',
        name: 'ABMP',
        beforeEnter: allowed,
        component: () => import('../views/IframeView.vue'),
        props: {
          urlParam: "/administracionPerfiles.html",
          titleParam:"Administración de perfiles",
        }
      },
      {
        path: 'consultaEstructuraLogica.html',
        name: 'CESL',
        beforeEnter: allowed,
        component: () => import('../views/IframeView.vue'),
        props: {
          urlParam: "/consultaEstructuraLogica.html",
          titleParam:"Consulta de EstructuraLogica",
        }
      },
      {
        path: 'emulacion.html',
        name: 'EMUL',
        beforeEnter: allowed,
        component: () => import('../modules/emulacion/views/Emulacion.vue')
      },
      {
        path: 'gestionMaterialesOt.html',
        name: 'GEOT',
        beforeEnter: allowed,
        component: () => import('../views/IframeView.vue'),
        props: {
            urlParam: '/gestionMaterialesOt.html',
            titleParam: 'Gestionar Materiales en OTs',
        }
      },
      {
        path: 'gestionErrores.html',
        name: 'ERGE',
        beforeEnter: allowed,
        component: () => import('../views/IframeView.vue'),
        props: {
          urlParam: '/gestionErrores.html',
          titleParam: 'Errores de Gestión'
        }
      },
      {
        path: 'registroOTFallidas.html',
        name: 'REFA',
        beforeEnter: allowed,
        component: () => import('../views/IframeView.vue'),
        props: {
          urlParam: '/registroOTFallidas.html',
          titleParam: 'Registro de OTs Fallidas'
        }
      },
      {
        path: 'materialesDescargados.html',
        name: 'MADE',
        beforeEnter: allowed,
        component: () => import('../views/IframeView.vue'),
        props: {
          urlParam: '/materialesDescargados.html',
          titleParam: 'Materiales Descargados'
        }
      },
      {
        path: 'gestionErroresSucursal.html',
        name: 'ERGS',
        beforeEnter: allowed,
        component: () => import('../views/IframeView.vue'),
        props: {
          urlParam: '/gestionErroresSucursal.html',
          titleParam: 'Errores de Gestión Sucursal'
        }
      },
      {
        path: 'validarOtRed.html',
        name: 'VARE',
        beforeEnter: allowed,
        component: () => import('../views/IframeView.vue'),
        props: {
          urlParam: '/validarOtRed.html',
          titleParam: 'Validación OT de Redes',
        }
      },
      {
        path: 'configuracionQrtz.html',
        name: 'QRTZ',
        beforeEnter: allowed,
        component: () => import('../views/IframeView.vue'),
        props: {
          urlParam: "/configuracionQrtz.html",
          titleParam:"Configuración de Qrtz",
        }
      }, 
      {
        path: 'extraccionDatosGM.html',
        name: 'EXDA',
        beforeEnter: allowed,
        component: () => import('../modules/reporteSas/ReporteSAS.vue')
      },
      {
        path: 'BusquedaEnZonaOT.html',
        name: 'OTZO',
        beforeEnter: allowed,
        component: () => import('../views/IframeView.vue'),
        props: {
          urlParam: '/BusquedaEnZonaOT.html',
          titleParam: 'busqueda de OT en zona'
        }
      },
      {
        path: 'busquedaEnMapa.html',
        name: 'OMAP',
        beforeEnter: allowed,
        component: () => import('../views/IframeView.vue'),
        props: {
          urlParam: '/busquedaEnMapa.html',
          titleParam: 'busqueda de OT en mapa'
        }
      },
/*       {
        path: 'busquedaTecnico.html',
        name: 'BUTE',
        beforeEnter: allowed,
        component: () => import('../views/IframeView.vue'),
        props: {
          urlParam: '/busquedaTecnico.html',
          titleParam: 'busqueda tecnico'
        }
      }, */
      {
        path: 'workAround.html',
        name: 'WOAR',
        beforeEnter: allowed,
        component: () => import('../views/IframeView.vue'),
        props: {
          urlParam: '/workAround.html',
          titleParam: 'work around'
        }
      },
      {
        path: 'jobtypeContrato.html',
        name: 'JOCO',
        beforeEnter: allowed,
        component: () => import('../views/IframeView.vue'),
        props: {
          urlParam: '/jobtypeContrato.html',
          titleParam: 'configuracion jobtype-contrato'
        }
      },
      {
        path: 'jobtypeCMO.html',
        name: 'JOCM',
        beforeEnter: allowed,
        component: () => import('../modules/parametrizaciones/jobtypeCMO/JobtypeCMO.vue')
      },
      {
        path: 'configuraCmoActividad.html',
        name: 'CMOA',
        beforeEnter: allowed,
        component: () => import('../views/IframeView.vue'),
        props: {
          urlParam: '/configuraCmoActividad.html',
          titleParam: 'configuracion cmo-actividad'
        }
      },
      {
        path: 'consultarActas.html',
        name: 'COAC',
        beforeEnter: allowed,
        component: () => import('../views/IframeView.vue'),
        props: {
          urlParam: '/consultarActas.html',
          titleParam: 'consultarActas'
        }
      },
      {
        path: 'ordenTrabajoSinActa.html',
        name: 'COSA',
        beforeEnter: allowed,
        component: () => import('../views/IframeView.vue'),
        props: {
          urlParam: '/consultarOtSinACTA.html',
          titleParam: 'consultar ots sin acta'
        }
      },
      {
        path: 'consultarNotaDebito.html',
        name: 'NODE',
        beforeEnter: allowed,
        component: () => import('../views/IframeView.vue'),
        props: {
          urlParam: '/consultarNotaDebito.html',
          titleParam: 'consultar notas debito'
        }
      },
      {
        path: 'consultarNotaCredito.html',
        name: 'NOCR',
        beforeEnter: allowed,
        component: () => import('../views/IframeView.vue'),
        props: {
          urlParam: '/consultarNotaCredito.html',
          titleParam: 'consultar notas credito'
        }
      },
      {
        path: 'consultarReglas.html',
        name: 'CORE',
        beforeEnter: allowed,
        component: () => import('../views/IframeView.vue'),
        props: {
          urlParam: '/consultarReglas.html',
          titleParam: 'Consultar Reglas'
        }
      },
      {
        path: 'monitoreoEjecucionreglas.html',
        name: 'MORE',
        beforeEnter: allowed,
        component: () => import('../views/IframeView.vue'),
        props: {
          urlParam: '/monitoreoEjecucionreglas.html',
          titleParam: 'Monitoreo y Ejecución de Reglas'
        }
      },
      {
        path: 'pruebasMasivas.html',
        name: 'PUMA',
        beforeEnter: allowed,
        component: () => import('../views/IframeView.vue'),
        props: {
          urlParam: '/pruebasMasivas.html',
          titleParam: 'Regla Prueba Masiva'
        }
      },
      {
        path: 'registroOTFallidasReproceso.html',
        name: 'ROTF',
        beforeEnter: allowed,
        component: () => import('../modules/otFallidasCT/OtFallidasCT.vue')
      },
      {
        path: 'busquedaOtsGcc.html',
        name: 'BUOT',
        beforeEnter: allowed,
        component: () => import('../views/IframeView.vue'),
        props: {
          urlParam: '/busquedaOtsGcc.html',
          titleParam: 'Búsqueda de Ots'
        }
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

export default router;
