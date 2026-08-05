from pathlib import Path
import re
import shutil
import subprocess

ROOT = Path('.')
ROUTER_PATH = ROOT / 'src/router/index.js'
CSS_PATH = ROOT / 'src/assets/css/fm-global.css'
CERT_ROOT = ROOT / 'src/modules/certificacionContratista'


def run(*args: str) -> None:
    subprocess.run(args, check=True)


def replace_once(text: str, old: str, new: str, label: str) -> str:
    if old not in text:
        raise SystemExit(f'No se encontró el bloque requerido: {label}')
    return text.replace(old, new, 1)


def replace_child_route(text: str, path: str, replacement: str) -> str:
    pattern = re.compile(
        r"      \{\n        path: '" + re.escape(path) + r"',\n.*?\n      \},",
        re.S,
    )
    updated, count = pattern.subn(replacement, text, count=1)
    if count != 1:
        raise SystemExit(f'No se pudo reemplazar la ruta hija: {path}')
    return updated


def replace_top_route(text: str, path: str, replacement: str) -> str:
    pattern = re.compile(
        r"  \{\n    path: '" + re.escape(path) + r"',\n.*?\n  \},",
        re.S,
    )
    updated, count = pattern.subn(replacement, text, count=1)
    if count != 1:
        raise SystemExit(f'No se pudo reemplazar la ruta superior: {path}')
    return updated


def remove_css_section(css: str, section_name: str) -> str:
    start = f'/* ===== INICIO: {section_name} ===== */'
    end = f'/* ===== FIN: {section_name} ===== */'
    pattern = re.compile(re.escape(start) + r'.*?' + re.escape(end), re.S)
    updated, count = pattern.subn('', css, count=1)
    if count > 1:
        raise SystemExit(f'La sección CSS está duplicada: {section_name}')
    return updated


# Obtener las dos implementaciones que deben conservarse en esta rama.
run('git', 'fetch', 'origin', 'Emulacion', 'Certificacion-Contratista')
run(
    'git', 'checkout', 'origin/Emulacion', '--',
    'src/modules/emulacion/components/ConfirmarEmulacionDialog.vue',
    'src/modules/emulacion/components/TablaEmulacion.vue',
    'src/modules/emulacion/components/filtros/inputs/Legajo.vue',
)
run(
    'git', 'checkout', 'origin/Certificacion-Contratista', '--',
    'src/modules/certificacionContratista',
)

# Retirar las migraciones que deben continuar funcionando mediante IframeView.
for relative in (
    'src/modules/gestionMateriales/abmMateriales',
    'src/modules/parametrizaciones/jobtypeContrato',
    'src/modules/parametrizaciones/jobtypeCMO',
    'src/modules/buscadorOts',
    'src/modules/otFallidasCT',
):
    target = ROOT / relative
    if target.exists():
        shutil.rmtree(target)

# BUOT continúa siendo legacy: no conservar su vista ni su diálogo Vue.
for relative in (
    'src/modules/certificacionContratista/views/BusquedaOtsView.vue',
    'src/modules/certificacionContratista/dialogs/CambioTecnicoDialog.vue',
):
    target = ROOT / relative
    if target.exists():
        target.unlink()

# Eliminar de la API de certificación los endpoints exclusivos del buscador BUOT.
api_path = CERT_ROOT / 'api/certificacionApi.js'
api = api_path.read_text(encoding='utf-8')
api, removed_api = re.subn(
    r"\nexport const buscarOtsGcc = .*\Z",
    '\n',
    api,
    count=1,
    flags=re.S,
)
if removed_api != 1:
    raise SystemExit('No se encontraron los endpoints Vue exclusivos de BUOT.')
api_path.write_text(api.rstrip() + '\n', encoding='utf-8')

# Mantener la documentación alineada con el alcance solicitado.
readme_path = CERT_ROOT / 'README.md'
readme = readme_path.read_text(encoding='utf-8')
readme = readme.replace(
    '| `BUOT` | `busquedaOtsGcc.html` | `views/BusquedaOtsView.vue` |\n',
    '',
)
readme = readme.replace(
    'Los detalles nuevos navegan por `/FM/certificacion/:tipo/:numero`, sin `iframe`, `postMessage` ni `window.open`.\n',
    'La ruta `BUOT` (`busquedaOtsGcc.html`) permanece en `IframeView.vue` y no forma parte de esta migración.\n\n'
    'Los detalles nuevos navegan por `/FM/certificacion/:tipo/:numero`, sin `iframe`, `postMessage` ni `window.open`.\n',
)
readme = readme.replace(
    '- búsqueda de OTs internas/externas y cambio de técnico.\n',
    '',
)
readme_path.write_text(readme, encoding='utf-8')

# Router: sólo Reporte SAS, Emulación y Certificación Contratista quedan en Vue.
router = ROUTER_PATH.read_text(encoding='utf-8')
router = replace_once(
    router,
    "  } else if (autenticado && (\n"
    "    rutasPermitidas.includes(to.name) ||\n"
    "    (to.name === 'JOCM' && rutasPermitidas.includes('JOCO')) ||\n"
    "    (to.name === 'ABMM' && import.meta.env.DEV)\n"
    "  )) {",
    "  } else if (autenticado && (\n"
    "    rutasPermitidas.includes(to.name) ||\n"
    "    (to.name === 'JOCM' && rutasPermitidas.includes('JOCO'))\n"
    "  )) {",
    'permiso temporal de ABM Materiales',
)

router = replace_top_route(
    router,
    '/FM/detallActa.html',
    "  {\n"
    "    path: '/FM/detallActa.html',\n"
    "    name: 'DEAC',\n"
    "    component: () => import('../modules/certificacionContratista/views/DocumentoDetalleView.vue'),\n"
    "    props: () => {\n"
    "      const legacyUrl = sessionStorage.getItem('urlDetalle') || ''\n"
    "      const tipo = legacyUrl.includes('Debito')\n"
    "        ? 'nota-debito'\n"
    "        : legacyUrl.includes('Credito')\n"
    "          ? 'nota-credito'\n"
    "          : 'acta'\n"
    "      return {\n"
    "        tipo,\n"
    "        numero: sessionStorage.getItem('nroActa') || ''\n"
    "      }\n"
    "    }\n"
    "  },",
)

router = replace_child_route(
    router,
    'abmMateriales.html',
    "      {\n"
    "        path: 'abmMateriales.html',\n"
    "        name: 'ABMM',\n"
    "        beforeEnter: allowed,\n"
    "        component: () => import('../views/IframeView.vue'),\n"
    "        props: {\n"
    "          urlParam: '/abmMateriales.html',\n"
    "          titleParam: 'ABM Materiales'\n"
    "        }\n"
    "      },",
)

router = replace_child_route(
    router,
    'jobtypeContrato.html',
    "      {\n"
    "        path: 'jobtypeContrato.html',\n"
    "        name: 'JOCO',\n"
    "        beforeEnter: allowed,\n"
    "        component: () => import('../views/IframeView.vue'),\n"
    "        props: {\n"
    "          urlParam: '/jobtypeContrato.html',\n"
    "          titleParam: 'Jobtype - Contrato'\n"
    "        }\n"
    "      },",
)

router = replace_child_route(
    router,
    'jobtypeCMO.html',
    "      {\n"
    "        path: 'jobtypeCMO.html',\n"
    "        name: 'JOCM',\n"
    "        beforeEnter: allowed,\n"
    "        component: () => import('../views/IframeView.vue'),\n"
    "        props: {\n"
    "          urlParam: '/jobtypeCMO.html',\n"
    "          titleParam: 'CMO - Actividad'\n"
    "        }\n"
    "      },",
)

router = replace_child_route(
    router,
    'consultarActas.html',
    "      {\n"
    "        path: 'consultarActas.html',\n"
    "        name: 'COAC',\n"
    "        beforeEnter: allowed,\n"
    "        component: () => import('../modules/certificacionContratista/views/DocumentosListView.vue'),\n"
    "        props: { documentType: 'ACTA' }\n"
    "      },",
)

router = replace_child_route(
    router,
    'ordenTrabajoSinActa.html',
    "      {\n"
    "        path: 'ordenTrabajoSinActa.html',\n"
    "        name: 'COSA',\n"
    "        beforeEnter: allowed,\n"
    "        component: () => import('../modules/certificacionContratista/views/OtsSinActaView.vue')\n"
    "      },",
)

router = replace_child_route(
    router,
    'consultarNotaDebito.html',
    "      {\n"
    "        path: 'consultarNotaDebito.html',\n"
    "        name: 'NODE',\n"
    "        beforeEnter: allowed,\n"
    "        component: () => import('../modules/certificacionContratista/views/DocumentosListView.vue'),\n"
    "        props: { documentType: 'NOTA_DEBITO' }\n"
    "      },",
)

router = replace_child_route(
    router,
    'consultarNotaCredito.html',
    "      {\n"
    "        path: 'consultarNotaCredito.html',\n"
    "        name: 'NOCR',\n"
    "        beforeEnter: allowed,\n"
    "        component: () => import('../modules/certificacionContratista/views/DocumentosListView.vue'),\n"
    "        props: { documentType: 'NOTA_CREDITO' }\n"
    "      },\n"
    "      {\n"
    "        path: 'certificacion/:tipo/:numero',\n"
    "        name: 'CECO_DETALLE',\n"
    "        component: () => import('../modules/certificacionContratista/views/DocumentoDetalleView.vue'),\n"
    "        props: true\n"
    "      },",
)

router = replace_child_route(
    router,
    'consultarReglas.html',
    "      {\n"
    "        path: 'consultarReglas.html',\n"
    "        name: 'CORE',\n"
    "        beforeEnter: allowed,\n"
    "        component: () => import('../modules/certificacionContratista/views/ConsultarReglasView.vue')\n"
    "      },",
)

router = replace_child_route(
    router,
    'monitoreoEjecucionreglas.html',
    "      {\n"
    "        path: 'monitoreoEjecucionreglas.html',\n"
    "        name: 'MORE',\n"
    "        beforeEnter: allowed,\n"
    "        component: () => import('../modules/certificacionContratista/views/MonitoreoReglasView.vue')\n"
    "      },",
)

router = replace_child_route(
    router,
    'pruebasMasivas.html',
    "      {\n"
    "        path: 'pruebasMasivas.html',\n"
    "        name: 'PUMA',\n"
    "        beforeEnter: allowed,\n"
    "        component: () => import('../modules/certificacionContratista/views/PruebasMasivasView.vue')\n"
    "      },",
)

router = replace_child_route(
    router,
    'registroOTFallidasReproceso.html',
    "      {\n"
    "        path: 'registroOTFallidasReproceso.html',\n"
    "        name: 'ROTF',\n"
    "        beforeEnter: allowed,\n"
    "        component: () => import('../views/IframeView.vue'),\n"
    "        props: {\n"
    "          urlParam: '/registroOTFallidasReproceso.html',\n"
    "          titleParam: 'Registro de OTs Fallidas para Reproceso'\n"
    "        }\n"
    "      },",
)

router = replace_child_route(
    router,
    'busquedaOtsGcc.html',
    "      {\n"
    "        path: 'busquedaOtsGcc.html',\n"
    "        name: 'BUOT',\n"
    "        beforeEnter: allowed,\n"
    "        component: () => import('../views/IframeView.vue'),\n"
    "        props: {\n"
    "          urlParam: '/busquedaOtsGcc.html',\n"
    "          titleParam: 'Búsqueda de OTs'\n"
    "        }\n"
    "      },",
)

for forbidden_import in (
    '../modules/gestionMateriales/abmMateriales',
    '../modules/parametrizaciones/jobtypeContrato',
    '../modules/parametrizaciones/jobtypeCMO',
    '../modules/buscadorOts',
    '../modules/otFallidasCT',
    'BusquedaOtsView.vue',
):
    if forbidden_import in router:
        raise SystemExit(f'El router todavía referencia una migración excluida: {forbidden_import}')

ROUTER_PATH.write_text(router, encoding='utf-8')

# CSS: conservar la base global y retirar sólo secciones dedicadas a los módulos excluidos.
css = CSS_PATH.read_text(encoding='utf-8')
for section in (
    'abm-materiales.css',
    'jobtype-contrato.css',
    'parametrizaciones-panel-accent.css',
    'jobtype-required-validation.css',
    'parametrizaciones-grid-selection.css',
    'jobtype-contrato-main-funcionalidad.css',
    'cmo-actividad.css',
):
    css = remove_css_section(css, section)

cert_css = subprocess.check_output(
    ['git', 'show', 'origin/Certificacion-Contratista:src/assets/css/fm-global.css'],
    text=True,
)
cert_start = '/* ===== INICIO: certificacion-contratista.css ===== */'
cert_end = '/* ===== FIN: certificacion-contratista.css ===== */'
match = re.search(re.escape(cert_start) + r'.*?' + re.escape(cert_end), cert_css, re.S)
if not match:
    raise SystemExit('No se encontró la sección CSS de Certificación Contratista.')

css = re.sub(re.escape(cert_start) + r'.*?' + re.escape(cert_end), '', css, flags=re.S)
css = re.sub(r'\n{3,}', '\n\n', css).rstrip()
css = css + '\n\n' + match.group(0).strip() + '\n'
CSS_PATH.write_text(css, encoding='utf-8')
