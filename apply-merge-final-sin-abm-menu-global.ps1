$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest

$utf8NoBom = New-Object System.Text.UTF8Encoding($false)

function Read-Utf8([string]$Path) {
  if (-not (Test-Path $Path)) { throw "Falta archivo requerido: $Path" }
  [System.IO.File]::ReadAllText((Resolve-Path $Path), [System.Text.Encoding]::UTF8)
}

function Write-Utf8([string]$Path, [string]$Content) {
  $full = if (Test-Path $Path) { (Resolve-Path $Path).Path } else { Join-Path (Get-Location) $Path }
  $dir = Split-Path -Parent $full
  if ($dir -and -not (Test-Path $dir)) { New-Item -ItemType Directory -Force -Path $dir | Out-Null }
  [System.IO.File]::WriteAllText($full, $Content, $utf8NoBom)
}

Write-Host ''
Write-Host 'FM - MERGE FINAL SIN ABM MATERIALES' -ForegroundColor Cyan
Write-Host '-----------------------------------' -ForegroundColor Cyan

# 1) CSS global: elimina ABM Materiales y consolida el menu del video.
$cssPath = 'src/assets/css/fm-global.css'
$css = (Read-Utf8 $cssPath).Replace("`r`n", "`n")

$abmPattern = '(?s)\n?/\* ===== INICIO: abm-materiales\.css ===== \*/.*?/\* ===== FIN: abm-materiales\.css ===== \*/\n?'
$css = [regex]::Replace($css, $abmPattern, "`n", 1)

$menuPattern = '(?s)\n?/\* ===== INICIO: fm-menu-video\.css \(integrado en fm-global\.css\) ===== \*/.*?/\* ===== FIN: fm-menu-video\.css \(integrado en fm-global\.css\) ===== \*/\n?'
$css = [regex]::Replace($css, $menuPattern, "`n", 1)

$menuBlock = @'
/* ===== INICIO: fm-menu-video.css (integrado en fm-global.css) ===== */
/*
 * Menú principal basado en la referencia visual aprobada.
 * Alcance: solo Menubar y sus submenús.
 */

#app .main-menu.p-menubar {
  background: #0fb8bb !important;
}

#app .main-menu .p-menubar-root-list > .p-menubar-item > .p-menubar-item-content,
#app .main-menu .p-menubar-root-list > .p-menuitem > .p-menuitem-content {
  border-radius: 0 !important;
  background: transparent !important;
}

#app .main-menu .p-menubar-root-list > .p-menubar-item:hover > .p-menubar-item-content,
#app .main-menu .p-menubar-root-list > .p-menubar-item.p-focus > .p-menubar-item-content,
#app .main-menu .p-menubar-root-list > .p-menubar-item.p-menubar-item-active > .p-menubar-item-content,
#app .main-menu .p-menubar-root-list > .p-menubar-item[data-p-active="true"] > .p-menubar-item-content,
#app .main-menu .p-menubar-root-list > .p-menuitem:hover > .p-menuitem-content,
#app .main-menu .p-menubar-root-list > .p-menuitem.p-focus > .p-menuitem-content {
  background: #0b9d9e !important;
}

#app .main-menu .fm-menu-link--root,
#app .main-menu .fm-menu-link--root .fm-menu-label,
#app .main-menu .fm-menu-link--root .fm-menu-chevron {
  color: #fff !important;
}

#app .main-menu .p-menubar-submenu,
#app .main-menu .p-submenu-list {
  min-width: 208px !important;
  width: max-content !important;
  max-width: 340px !important;
  margin: 0 !important;
  padding: 0 !important;
  border: 1px solid #dfe5e8 !important;
  border-radius: 0 !important;
  background: #fff !important;
  box-shadow: 0 8px 18px rgba(28, 47, 53, .20) !important;
  overflow: visible !important;
}

/* Primer nivel: pegado directamente debajo del ítem principal. */
#app .main-menu .p-menubar-root-list > .p-menubar-item > .p-menubar-submenu,
#app .main-menu .p-menubar-root-list > .p-menuitem > .p-submenu-list {
  top: 100% !important;
  inset-block-start: 100% !important;
  left: 0 !important;
  inset-inline-start: 0 !important;
  margin: 0 !important;
}

/*
 * Segundo nivel: nace desde la misma fila que lo abre y queda unido al panel padre.
 * No se fuerza hacia arriba: conserva el comportamiento del video.
 */
#app .main-menu .p-menubar-submenu > .p-menubar-item > .p-menubar-submenu,
#app .main-menu .p-menubar-submenu > .p-menuitem > .p-submenu-list,
#app .main-menu .p-submenu-list > .p-menubar-item > .p-menubar-submenu,
#app .main-menu .p-submenu-list > .p-menuitem > .p-submenu-list {
  top: 0 !important;
  inset-block-start: 0 !important;
  left: calc(100% - 1px) !important;
  inset-inline-start: calc(100% - 1px) !important;
  right: auto !important;
  margin: 0 !important;
  transform: none !important;
  border-top: 3px solid #0fb8bb !important;
}

#app .main-menu .p-menubar-submenu .p-menubar-item,
#app .main-menu .p-menubar-submenu .p-menuitem,
#app .main-menu .p-submenu-list .p-menubar-item,
#app .main-menu .p-submenu-list .p-menuitem,
#app .main-menu .p-menubar-submenu .p-menubar-item-content,
#app .main-menu .p-menubar-submenu .p-menuitem-content,
#app .main-menu .p-submenu-list .p-menubar-item-content,
#app .main-menu .p-submenu-list .p-menuitem-content {
  min-height: 28px !important;
  height: 28px !important;
  margin: 0 !important;
  padding: 0 !important;
  border-radius: 0 !important;
  background: #fff !important;
  box-shadow: none !important;
}

#app .main-menu .p-menubar-submenu .p-menubar-item-content,
#app .main-menu .p-menubar-submenu .p-menuitem-content,
#app .main-menu .p-submenu-list .p-menubar-item-content,
#app .main-menu .p-submenu-list .p-menuitem-content {
  border-bottom: 1px solid #edf1f3 !important;
}

#app .main-menu .p-menubar-submenu .p-menubar-item:last-child > .p-menubar-item-content,
#app .main-menu .p-menubar-submenu .p-menuitem:last-child > .p-menuitem-content,
#app .main-menu .p-submenu-list .p-menubar-item:last-child > .p-menubar-item-content,
#app .main-menu .p-submenu-list .p-menuitem:last-child > .p-menuitem-content {
  border-bottom: 0 !important;
}

#app .main-menu .fm-menu-link--submenu {
  width: 100% !important;
  min-height: 28px !important;
  height: 28px !important;
  padding: 0 13px !important;
  gap: 8px !important;
  background: transparent !important;
  color: #3d4a4d !important;
  box-sizing: border-box !important;
}

#app .main-menu .fm-menu-link--submenu .fm-menu-label {
  color: #3d4a4d !important;
  font-size: 12px !important;
  font-weight: 400 !important;
  line-height: 1 !important;
}

#app .main-menu .fm-menu-link--submenu .fm-menu-chevron {
  color: #a8b2b6 !important;
  font-size: 8px !important;
}

#app .main-menu .p-menubar-submenu .p-menubar-item-content:hover,
#app .main-menu .p-menubar-submenu .p-menuitem-content:hover,
#app .main-menu .p-submenu-list .p-menubar-item-content:hover,
#app .main-menu .p-submenu-list .p-menuitem-content:hover,
#app .main-menu .p-menubar-submenu .p-menubar-item.p-focus > .p-menubar-item-content,
#app .main-menu .p-submenu-list .p-menubar-item.p-focus > .p-menubar-item-content,
#app .main-menu .p-menubar-submenu .p-menubar-item.p-menubar-item-active > .p-menubar-item-content,
#app .main-menu .p-submenu-list .p-menubar-item.p-menubar-item-active > .p-menubar-item-content,
#app .main-menu .p-menubar-submenu .p-menubar-item[data-p-active="true"] > .p-menubar-item-content,
#app .main-menu .p-submenu-list .p-menubar-item[data-p-active="true"] > .p-menubar-item-content {
  background: #e2f8fa !important;
  box-shadow: inset 3px 0 0 #0fb8bb !important;
  transform: none !important;
}

#app .main-menu .p-menubar-submenu .p-menubar-item-content:hover .fm-menu-label,
#app .main-menu .p-menubar-submenu .p-menubar-item-content:hover .fm-menu-chevron,
#app .main-menu .p-submenu-list .p-menubar-item-content:hover .fm-menu-label,
#app .main-menu .p-submenu-list .p-menubar-item-content:hover .fm-menu-chevron,
#app .main-menu .p-menubar-submenu .p-menubar-item.p-focus > .p-menubar-item-content .fm-menu-label,
#app .main-menu .p-menubar-submenu .p-menubar-item.p-focus > .p-menubar-item-content .fm-menu-chevron,
#app .main-menu .p-submenu-list .p-menubar-item.p-focus > .p-menubar-item-content .fm-menu-label,
#app .main-menu .p-submenu-list .p-menubar-item.p-focus > .p-menubar-item-content .fm-menu-chevron,
#app .main-menu .p-menubar-submenu .p-menubar-item[data-p-active="true"] > .p-menubar-item-content .fm-menu-label,
#app .main-menu .p-menubar-submenu .p-menubar-item[data-p-active="true"] > .p-menubar-item-content .fm-menu-chevron,
#app .main-menu .p-submenu-list .p-menubar-item[data-p-active="true"] > .p-menubar-item-content .fm-menu-label,
#app .main-menu .p-submenu-list .p-menubar-item[data-p-active="true"] > .p-menubar-item-content .fm-menu-chevron {
  color: #0b9d9e !important;
}
/* ===== FIN: fm-menu-video.css (integrado en fm-global.css) ===== */
'@
$css = $css.TrimEnd() + "`n`n" + $menuBlock.Trim() + "`n"
Write-Utf8 $cssPath ($css.Replace("`n", "`r`n"))
Write-Host 'OK fm-global.css: ABM fuera + menu-video integrado.' -ForegroundColor Green

# 2) Menu logico: CMO legacy JOCM con compatibilidad JOCO.
$rutasPath = 'src/components/rutas.ts'
$rutas = (Read-Utf8 $rutasPath).Replace("`r`n", "`n")
$rutas = $rutas.Replace("command: () => { router.push({ name: 'CMOA' }); },", "command: () => { router.push({ name: 'JOCM' }); },")
$rutas = $rutas.Replace("visible: hasMenu('CMOA')", "visible: hasMenu('JOCM') || hasMenu('JOCO')")
Write-Utf8 $rutasPath ($rutas.Replace("`n", "`r`n"))
Write-Host 'OK rutas.ts: CMO navega a JOCM.' -ForegroundColor Green

# 3) Router: permiso JOCM y pantalla legacy jobtypeCMO.html.
$routerPath = 'src/router/index.js'
$router = (Read-Utf8 $routerPath).Replace("`r`n", "`n")

$router = [regex]::Replace(
  $router,
  "rutasPermitidas\.includes\(to\.name\)(?!\s*\|\|)",
  "rutasPermitidas.includes(to.name) ||`n    (to.name === 'JOCM' && rutasPermitidas.includes('JOCO'))",
  1
)

$cmoPattern = "(?s)\{\s*path:\s*'configuraCmoActividad\.html',\s*name:\s*'CMOA',.*?titleParam:\s*'Configuración CMO-Actividad'\s*\}\s*\},"
$cmoReplacement = @'
{
        path: 'jobtypeCMO.html',
        name: 'JOCM',
        beforeEnter: allowed,
        component: () => import('../views/IframeView.vue'),
        props: {
          urlParam: '/jobtypeCMO.html',
          titleParam: 'CMO - Actividad'
        }
      },
'@
if ([regex]::IsMatch($router, $cmoPattern)) {
  $router = [regex]::Replace($router, $cmoPattern, $cmoReplacement.Trim(), 1)
}

Write-Utf8 $routerPath ($router.Replace("`n", "`r`n"))
Write-Host 'OK router: JOCM legacy + compatibilidad JOCO.' -ForegroundColor Green

# 4) Plugin que cierra menu/submenu al hacer click dentro de iframe.
$pluginPath = 'src/plugins/menuSubmenuBehavior.js'
$plugin = @'
const OPEN_MENU_SELECTOR = [
  '.main-menu .p-menubar-item-active',
  '.main-menu [data-p-active="true"]',
  '#fm-user-menu-v3'
].join(',')

let documentObserver = null

const iframeLoadHandlers = new Map()
const iframeDocumentHandlers = new Map()

const hasOpenMenu = () => Boolean(document.querySelector(OPEN_MENU_SELECTOR))

const notifyParentOutsideClick = () => {
  if (!hasOpenMenu()) return

  const target = document.body || document.documentElement
  if (!target) return

  /*
   * Los clicks dentro de un iframe no burbujean hacia el documento padre.
   * PrimeVue ya sabe cerrar el menú al hacer click fuera en el documento principal,
   * por lo que reenviamos un click sintético únicamente cuando el click ocurrió
   * dentro de una pantalla embebida.
   */
  target.dispatchEvent(new MouseEvent('click', {
    bubbles: true,
    cancelable: true,
    view: window
  }))
}

const bindIframeDocument = (iframe) => {
  try {
    const iframeDocument = iframe.contentDocument || iframe.contentWindow?.document
    if (!iframeDocument || iframeDocumentHandlers.has(iframeDocument)) return

    const outsideHandler = () => notifyParentOutsideClick()
    iframeDocument.addEventListener('pointerdown', outsideHandler, true)
    iframeDocumentHandlers.set(iframeDocument, outsideHandler)
  } catch {
    // Si el iframe fuera cross-origin, el blur global cubre el cierre del menú.
  }
}

const bindIframe = (iframe) => {
  if (!(iframe instanceof HTMLIFrameElement)) return

  if (!iframeLoadHandlers.has(iframe)) {
    const loadHandler = () => bindIframeDocument(iframe)
    iframe.addEventListener('load', loadHandler)
    iframeLoadHandlers.set(iframe, loadHandler)
  }

  bindIframeDocument(iframe)
}

const bindIframesFrom = (root) => {
  if (!root) return

  if (root instanceof HTMLIFrameElement) bindIframe(root)
  root.querySelectorAll?.('iframe').forEach(bindIframe)
}

const handleWindowBlur = () => {
  window.setTimeout(() => {
    if (document.activeElement instanceof HTMLIFrameElement) {
      notifyParentOutsideClick()
    }
  }, 0)
}

export const installMenuSubmenuBehavior = () => {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return () => {}
  }

  bindIframesFrom(document)
  window.addEventListener('blur', handleWindowBlur)

  documentObserver = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (!(node instanceof Element)) return
        bindIframesFrom(node)
      })
    })
  })

  documentObserver.observe(document.documentElement, {
    childList: true,
    subtree: true
  })

  return () => {
    documentObserver?.disconnect()
    window.removeEventListener('blur', handleWindowBlur)

    iframeLoadHandlers.forEach((handler, iframe) => {
      iframe.removeEventListener('load', handler)
    })

    iframeDocumentHandlers.forEach((handler, iframeDocument) => {
      iframeDocument.removeEventListener('pointerdown', handler, true)
    })

    iframeLoadHandlers.clear()
    iframeDocumentHandlers.clear()
    documentObserver = null
  }
}
'@
Write-Utf8 $pluginPath ($plugin.TrimStart().Replace("`n", "`r`n"))
Write-Host 'OK menuSubmenuBehavior.js instalado.' -ForegroundColor Green

# 5) main.js: instala comportamiento del menu y carga responsive legacy de forma segura.
$mainPath = 'src/main.js'
$main = (Read-Utf8 $mainPath).Replace("`r`n", "`n")
$main = [regex]::Replace($main, "(?m)^import \{ installResponsiveIframes \} from './plugins/responsiveIframes\.js'\s*\n", '')
$main = [regex]::Replace($main, "(?m)^import './assets/css/fm-menu-video\.css'\s*\n", '')

if (-not $main.Contains("installMenuSubmenuBehavior")) {
  $needle = "import { installReportSasAutoHeight } from './plugins/reportSasAutoHeight.js'"
  if (-not $main.Contains($needle)) { throw 'No se encontro el punto de import para menuSubmenuBehavior.' }
  $main = $main.Replace($needle, $needle + "`nimport { installMenuSubmenuBehavior } from './plugins/menuSubmenuBehavior.js'")
}

$runtimeBlock = @'
installMenuSubmenuBehavior()

/*
 * El responsive legacy es una mejora complementaria para las pantallas en iframe.
 * Se carga después de montar Vue para que un problema en esa integración nunca
 * pueda impedir el arranque completo de Field Manager.
 */
const installResponsiveIframesSafely = async () => {
  try {
    const { installResponsiveIframes } = await import('./plugins/responsiveIframes.js')
    installResponsiveIframes()
  } catch (error) {
    console.error('[Field Manager] No se pudo inicializar el responsive legacy.', error)
  }
}

installResponsiveIframesSafely()
'@

if ($main.Contains("installResponsiveIframes()")) {
  $main = $main.Replace("installResponsiveIframes()", $runtimeBlock.Trim())
} elseif (-not $main.Contains('installResponsiveIframesSafely()')) {
  $needle = "app.mount('#app')"
  if (-not $main.Contains($needle)) { throw 'No se encontro app.mount en main.js.' }
  $main = $main.Replace($needle, $needle + "`n`n" + $runtimeBlock.Trim())
}

Write-Utf8 $mainPath ($main.Replace("`n", "`r`n"))
Write-Host 'OK main.js: menu iframe + responsive seguro.' -ForegroundColor Green

# 6) Limpieza final.
foreach ($path in @(
  'src/assets/css/fm-menu-video.css',
  'src/modules/shared/components/LoadingOverlay.vue'
)) {
  if (Test-Path $path) {
    Remove-Item -Force $path
    Write-Host "OK eliminado: $path" -ForegroundColor Green
  }
}

$badRefs = @()
Get-ChildItem -Path 'src' -Recurse -File -Include *.vue,*.js,*.ts,*.css | ForEach-Object {
  $text = [System.IO.File]::ReadAllText($_.FullName, [System.Text.Encoding]::UTF8)
  $hasBadMenuRef = $_.Extension -ne '.css' -and $text.Contains('fm-menu-video.css')
  if ($text.Contains('ABMM') -or $text.Contains('abmMateriales') -or $hasBadMenuRef) {
    $badRefs += $_.FullName
  }
}

if ($badRefs.Count -gt 0) {
  Write-Host 'Quedaron referencias que hay que revisar:' -ForegroundColor Red
  $badRefs | ForEach-Object { Write-Host "  $_" -ForegroundColor Red }
  throw 'Validacion final incompleta.'
}

Write-Host ''
Write-Host 'LISTO. Merge aplicado sin commit ni push.' -ForegroundColor Green
Write-Host 'Ahora ejecutar:' -ForegroundColor Yellow
Write-Host '  git status --short'
Write-Host '  npm run build'
Write-Host ''
