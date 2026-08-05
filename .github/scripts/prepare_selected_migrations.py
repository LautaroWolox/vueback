from pathlib import Path
import re
import shutil
import subprocess

ROOT = Path('.')
ROUTER = ROOT / 'src/router/index.js'


def run(*args: str) -> None:
    subprocess.run(args, check=True)


def replace_child_route(text: str, path: str, replacement: str) -> str:
    pattern = re.compile(
        r"      \{\n        path: '" + re.escape(path) + r"',\n.*?\n      \}(?=,\n      \{|\n    \])",
        re.S,
    )
    updated, count = pattern.subn(replacement, text, count=1)
    if count != 1:
        raise SystemExit(f'No se pudo reemplazar la ruta: {path}')
    return updated


# Conservar los últimos ajustes aprobados de Emulación.
run('git', 'fetch', 'origin', 'Emulacion')
run(
    'git', 'checkout', 'origin/Emulacion', '--',
    'src/modules/emulacion/components/ConfirmarEmulacionDialog.vue',
    'src/modules/emulacion/components/TablaEmulacion.vue',
    'src/modules/emulacion/components/filtros/inputs/Legajo.vue',
)

# Estas implementaciones Vue deben continuar mediante IframeView.
for relative in (
    'src/modules/gestionMateriales/abmMateriales',
    'src/modules/parametrizaciones/jobtypeContrato',
    'src/modules/parametrizaciones/jobtypeCMO',
    'src/modules/buscadorOts',
):
    target = ROOT / relative
    if target.exists():
        shutil.rmtree(target)

router = ROUTER.read_text(encoding='utf-8')

# Quitar la excepción exclusiva de desarrollo de ABM Materiales.
router = router.replace(
    "    (to.name === 'JOCM' && rutasPermitidas.includes('JOCO')) ||\n"
    "    (to.name === 'ABMM' && import.meta.env.DEV)\n",
    "    (to.name === 'JOCM' && rutasPermitidas.includes('JOCO'))\n",
)

routes = {
    'abmMateriales.html': (
        "      {\n"
        "        path: 'abmMateriales.html',\n"
        "        name: 'ABMM',\n"
        "        beforeEnter: allowed,\n"
        "        component: () => import('../views/IframeView.vue'),\n"
        "        props: {\n"
        "          urlParam: '/abmMateriales.html',\n"
        "          titleParam: 'ABM Materiales'\n"
        "        }\n"
        "      }"
    ),
    'jobtypeContrato.html': (
        "      {\n"
        "        path: 'jobtypeContrato.html',\n"
        "        name: 'JOCO',\n"
        "        beforeEnter: allowed,\n"
        "        component: () => import('../views/IframeView.vue'),\n"
        "        props: {\n"
        "          urlParam: '/jobtypeContrato.html',\n"
        "          titleParam: 'Jobtype - Contrato'\n"
        "        }\n"
        "      }"
    ),
    'jobtypeCMO.html': (
        "      {\n"
        "        path: 'jobtypeCMO.html',\n"
        "        name: 'JOCM',\n"
        "        beforeEnter: allowed,\n"
        "        component: () => import('../views/IframeView.vue'),\n"
        "        props: {\n"
        "          urlParam: '/jobtypeCMO.html',\n"
        "          titleParam: 'CMO - Actividad'\n"
        "        }\n"
        "      }"
    ),
    'busquedaOtsGcc.html': (
        "      {\n"
        "        path: 'busquedaOtsGcc.html',\n"
        "        name: 'BUOT',\n"
        "        beforeEnter: allowed,\n"
        "        component: () => import('../views/IframeView.vue'),\n"
        "        props: {\n"
        "          urlParam: '/busquedaOtsGcc.html',\n"
        "          titleParam: 'Búsqueda de OTs'\n"
        "        }\n"
        "      }"
    ),
}

for path, replacement in routes.items():
    router = replace_child_route(router, path, replacement)

for forbidden in (
    '../modules/gestionMateriales/abmMateriales',
    '../modules/parametrizaciones/jobtypeContrato',
    '../modules/parametrizaciones/jobtypeCMO',
    '../modules/buscadorOts',
):
    if forbidden in router:
        raise SystemExit(f'El router todavía referencia un módulo excluido: {forbidden}')

# Estas tres migraciones deben continuar activas en Vue.
required = (
    "../modules/reporteSas/ReporteSAS.vue",
    "../modules/emulacion/views/Emulacion.vue",
    "../modules/otFallidasCT/OtFallidasCT.vue",
)
for value in required:
    if value not in router:
        raise SystemExit(f'Falta una migración requerida en el router: {value}')

ROUTER.write_text(router, encoding='utf-8')
