$ErrorActionPreference = 'Stop'

$pluginPath = 'src/plugins/responsiveIframes.js'
$cssPath = 'src/assets/css/fm-global.css'

if (-not (Test-Path $pluginPath)) { throw "No se encontro $pluginPath" }
if (-not (Test-Path $cssPath)) { throw "No se encontro $cssPath" }

$utf8NoBom = New-Object System.Text.UTF8Encoding($false)
$plugin = [System.IO.File]::ReadAllText($pluginPath, [System.Text.Encoding]::UTF8)

# Limpia el helper del intento anterior de centrado, si ya habia sido aplicado.
$oldHelperStart = '// --- INICIO: fm-dialog-responsive-baseline ---'
$oldHelperEnd = '// --- FIN: fm-dialog-responsive-baseline ---'
$plugin = [regex]::Replace(
  $plugin,
  "(?s)\s*$([regex]::Escape($oldHelperStart)).*?$([regex]::Escape($oldHelperEnd))\s*",
  "`r`n"
)

# Mantiene perfil notebook incluso con zoom extremo de Chrome.
$plugin = $plugin.Replace(
  'return screenWidth >= 800 && screenHeight >= 480 && (finePointer || !coarsePointer)',
  'return screenWidth >= 640 && screenHeight >= 400 && (finePointer || !coarsePointer)'
)

$startToken = 'const applyDialogSurfaceLayout = (surface, document, view, viewport) => {'
$endToken = 'const applyViewportProfile = (iframe, document) => {'
$start = $plugin.IndexOf($startToken)
$end = $plugin.IndexOf($endToken)

if ($start -lt 0 -or $end -le $start) {
  throw 'No se encontro el bloque de dialog responsive en responsiveIframes.js.'
}

$newDialogBlock = @'
const DIALOG_MANAGED_PROPERTIES = [
  'box-sizing',
  'width',
  'height',
  'min-width',
  'min-height',
  'max-width',
  'max-height',
  'position',
  'top',
  'left',
  'right',
  'bottom',
  'margin',
  'transform',
  'overflow',
  'overflow-x',
  'overflow-y',
  'overscroll-behavior'
]

const dialogStyleSnapshots = new WeakMap()
const dialogManagedElements = new WeakMap()

const rememberDialogElement = (document, element) => {
  if (!document || !element || dialogStyleSnapshots.has(element)) return

  const snapshot = {}
  DIALOG_MANAGED_PROPERTIES.forEach((property) => {
    snapshot[property] = {
      value: element.style.getPropertyValue(property),
      priority: element.style.getPropertyPriority(property)
    }
  })
  dialogStyleSnapshots.set(element, snapshot)
}

const restoreDialogElement = (element) => {
  if (!element) return

  const snapshot = dialogStyleSnapshots.get(element)
  if (snapshot) {
    DIALOG_MANAGED_PROPERTIES.forEach((property) => {
      const saved = snapshot[property]
      if (saved?.value) {
        element.style.setProperty(property, saved.value, saved.priority || '')
      } else {
        element.style.removeProperty(property)
      }
    })
  }

  element.classList.remove(
    'fm-legacy-responsive-dialog',
    'fm-legacy-responsive-dialog-overlay',
    'fm-legacy-responsive-dialog-scroll'
  )
}

const markDialogManaged = (document, element) => {
  if (!document || !element) return
  let managed = dialogManagedElements.get(document)
  if (!managed) {
    managed = new Set()
    dialogManagedElements.set(document, managed)
  }
  managed.add(element)
}

const resetManagedDialogs = (document) => {
  const managed = dialogManagedElements.get(document)
  if (!managed) return

  managed.forEach((element) => restoreDialogElement(element))
  managed.clear()
}

const applyDialogSurfaceLayout = (surface, document, view, viewport) => {
  const margin = 8
  const maxWidth = Math.max(240, viewport.width - margin * 2)
  const maxHeight = Math.max(180, viewport.height - margin * 2)

  // El baseline se captura desde que el popup esta visible a 100%.
  // Asi, al volver de 400%, no restauramos una geometria ya deformada por el zoom.
  rememberDialogElement(document, surface)
  restoreDialogElement(surface)

  let rect = surface.getBoundingClientRect()
  const compactNotebook = document.body.classList.contains('fm-legacy-notebook-compact')
  const outsideViewport = (
    rect.top < viewport.offsetTop + margin ||
    rect.left < viewport.offsetLeft + margin ||
    rect.right > viewport.offsetLeft + viewport.width - margin ||
    rect.bottom > viewport.offsetTop + viewport.height - margin
  )
  const oversize = rect.width > maxWidth + 1 || rect.height > maxHeight + 1

  markDialogManaged(document, surface)
  surface.classList.add('fm-legacy-responsive-dialog')
  surface.style.setProperty('box-sizing', 'border-box', 'important')
  surface.style.setProperty('max-width', `${maxWidth}px`, 'important')
  surface.style.setProperty('max-height', `${maxHeight}px`, 'important')

  if (rect.width > maxWidth + 1) {
    surface.style.setProperty('width', `${maxWidth}px`, 'important')
  }

  // Centrado horizontal deterministico en TODOS los niveles de zoom.
  // El top nativo se conserva a 100%; en zoom compacto se lleva arriba con margen.
  rect = surface.getBoundingClientRect()
  const effectiveHeight = Math.min(rect.height, maxHeight)
  const minTop = viewport.offsetTop + margin
  const maxTop = Math.max(minTop, viewport.offsetTop + viewport.height - effectiveHeight - margin)
  const nativeTop = Number.isFinite(rect.top) ? rect.top : minTop
  const targetTop = compactNotebook
    ? minTop
    : Math.min(Math.max(nativeTop, minTop), maxTop)
  const centeredLeft = viewport.offsetLeft + (viewport.width / 2)

  surface.style.setProperty('position', 'fixed', 'important')
  surface.style.setProperty('top', `${targetTop}px`, 'important')
  surface.style.setProperty('left', `${centeredLeft}px`, 'important')
  surface.style.setProperty('right', 'auto', 'important')
  surface.style.setProperty('bottom', 'auto', 'important')
  surface.style.setProperty('margin', '0', 'important')
  surface.style.setProperty('transform', 'translateX(-50%)', 'important')

  const wrapper = surface.closest?.(DIALOG_WRAPPER_SELECTOR)
  if (wrapper && wrapper !== surface && isVisibleElement(wrapper, view)) {
    rememberDialogElement(document, wrapper)
    restoreDialogElement(wrapper)
    markDialogManaged(document, wrapper)
    wrapper.classList.add('fm-legacy-responsive-dialog-overlay')
    wrapper.style.setProperty('overflow-x', 'auto', 'important')
    wrapper.style.setProperty('overflow-y', 'auto', 'important')
    wrapper.style.setProperty('max-width', `${viewport.width}px`, 'important')
    wrapper.style.setProperty('max-height', `${viewport.height}px`, 'important')
  }

  const header = [...surface.querySelectorAll(DIALOG_HEADER_SELECTOR)]
    .find((element) => isVisibleElement(element, view))
  const footer = [...surface.querySelectorAll(DIALOG_FOOTER_SELECTOR)]
    .find((element) => isVisibleElement(element, view))
  const scrollArea = findDialogScrollArea(surface, view)

  const headerHeight = header?.getBoundingClientRect().height || 0
  const footerHeight = footer?.getBoundingClientRect().height || 0
  const availableBodyHeight = Math.max(
    100,
    Math.floor(maxHeight - headerHeight - footerHeight - 20)
  )

  if (scrollArea && (compactNotebook || oversize || outsideViewport)) {
    rememberDialogElement(document, scrollArea)
    restoreDialogElement(scrollArea)
    markDialogManaged(document, scrollArea)
    scrollArea.classList.add('fm-legacy-responsive-dialog-scroll')
    scrollArea.style.setProperty('min-width', '0', 'important')
    scrollArea.style.setProperty('max-width', '100%', 'important')
    scrollArea.style.setProperty('max-height', `${availableBodyHeight}px`, 'important')
    scrollArea.style.setProperty('overflow-x', 'auto', 'important')
    scrollArea.style.setProperty('overflow-y', 'auto', 'important')
    scrollArea.style.setProperty('overscroll-behavior', 'contain', 'important')
  }

  if (compactNotebook || oversize || outsideViewport) {
    surface.style.setProperty('overflow-x', 'auto', 'important')
    surface.style.setProperty('overflow-y', 'auto', 'important')
  }

  return compactNotebook || oversize || outsideViewport
}

const applyResponsiveDialogLayout = (iframe, document) => {
  const view = document?.defaultView || iframe?.contentWindow
  if (!document?.body || !view) return

  // Siempre deshacemos primero nuestra pasada anterior.
  resetManagedDialogs(document)

  const viewport = getVisualViewportSize(view, document)
  const surfaces = findVisibleDialogSurfaces(document, view, viewport)
  const compactNotebook = document.body.classList.contains('fm-legacy-notebook-compact')
  let adapted = false

  surfaces.forEach((surface) => {
    adapted = applyDialogSurfaceLayout(surface, document, view, viewport) || adapted
  })

  setDocumentScroll(document, compactNotebook && adapted)
}

'@

$plugin = $plugin.Substring(0, $start) + $newDialogBlock + $plugin.Substring($end)

# Reemplaza bindViewportProfile completo para reintentar luego del resize/zoom.
# Algunos JSP recalculan left/top unos milisegundos DESPUES del evento de Chrome;
# estos retries vuelven a centrar el popup una vez que termino ese recalculo legacy.
$bindStartToken = 'const bindViewportProfile = (iframe, document) => {'
$bindEndToken = 'const observeResponsiveDialogs = (iframe, document) => {'
$bindStart = $plugin.IndexOf($bindStartToken)
$bindEnd = $plugin.IndexOf($bindEndToken)

if ($bindStart -lt 0 -or $bindEnd -le $bindStart) {
  throw 'No se encontro bindViewportProfile en responsiveIframes.js.'
}

$newBindBlock = @'
const bindViewportProfile = (iframe, document) => {
  const view = document?.defaultView || iframe?.contentWindow
  if (!view) return

  let retryTimers = []

  const clearRetries = () => {
    retryTimers.forEach((timer) => view.clearTimeout(timer))
    retryTimers = []
  }

  const runUpdate = () => {
    applyViewportProfile(iframe, document)
    applyResponsiveDialogLayout(iframe, document)
  }

  const scheduleUpdate = () => {
    clearRetries()
    runUpdate()
    retryTimers = [60, 160, 320, 650, 1100, 1700].map((delay) =>
      view.setTimeout(runUpdate, delay)
    )
  }

  if (viewportBindings.has(document)) {
    scheduleUpdate()
    return
  }

  view.addEventListener('resize', scheduleUpdate, { passive: true })
  view.visualViewport?.addEventListener('resize', scheduleUpdate, { passive: true })
  view.visualViewport?.addEventListener('scroll', scheduleUpdate, { passive: true })
  viewportBindings.set(document, scheduleUpdate)
  scheduleUpdate()
}

'@

$plugin = $plugin.Substring(0, $bindStart) + $newBindBlock + $plugin.Substring($bindEnd)
[System.IO.File]::WriteAllText($pluginPath, $plugin, $utf8NoBom)

# CSS: los selectores genericos del dialog se limitan al zoom compacto.
$css = [System.IO.File]::ReadAllText($cssPath, [System.Text.Encoding]::UTF8)

$css = $css.Replace(
  'body.fm-responsive-legacy .ui-dialog,',
  'body.fm-responsive-legacy.fm-legacy-notebook-compact .ui-dialog,'
)
$css = $css.Replace(
  'body.fm-responsive-legacy .p-dialog,',
  'body.fm-responsive-legacy.fm-legacy-notebook-compact .p-dialog,'
)
$css = $css.Replace(
  'body.fm-responsive-legacy .modal-dialog,',
  'body.fm-responsive-legacy.fm-legacy-notebook-compact .modal-dialog,'
)
$css = $css.Replace(
  'body.fm-responsive-legacy .modal-content,',
  'body.fm-responsive-legacy.fm-legacy-notebook-compact .modal-content,'
)
$css = $css.Replace(
  'body.fm-responsive-legacy [role=dialog],',
  'body.fm-responsive-legacy.fm-legacy-notebook-compact [role=dialog],'
)
$css = $css.Replace(
  'body.fm-responsive-legacy [aria-modal=true],',
  'body.fm-responsive-legacy.fm-legacy-notebook-compact [aria-modal=true],'
)
$css = $css.Replace(
  'body.fm-responsive-legacy .ui-dialog-content,',
  'body.fm-responsive-legacy.fm-legacy-notebook-compact .ui-dialog-content,'
)
$css = $css.Replace(
  'body.fm-responsive-legacy .p-dialog-content,',
  'body.fm-responsive-legacy.fm-legacy-notebook-compact .p-dialog-content,'
)
$css = $css.Replace(
  'body.fm-responsive-legacy .modal-body,',
  'body.fm-responsive-legacy.fm-legacy-notebook-compact .modal-body,'
)

[System.IO.File]::WriteAllText($cssPath, $css, $utf8NoBom)

Write-Host ''
Write-Host '============================================================'
Write-Host 'ZOOM REVERSIBLE DE POPUPS LEGACY V2 APLICADO'
Write-Host '============================================================'
Write-Host 'OK - baseline capturado antes del zoom extremo.'
Write-Host 'OK - popup centrado horizontalmente en 100/125/150/175/200/400%.'
Write-Host 'OK - al volver a 100% se restaura ancho y se recentra.'
Write-Host 'OK - retries corrigen recalculos tardios del JSP despues del zoom.'
Write-Host 'OK - scroll interno se aplica solo cuando realmente hace falta.'
Write-Host 'Archivos modificados:'
Write-Host '  src/plugins/responsiveIframes.js'
Write-Host '  src/assets/css/fm-global.css'
