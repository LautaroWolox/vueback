$ErrorActionPreference = 'Stop'

$pluginPath = 'src/plugins/responsiveIframes.js'
$cssPath = 'src/assets/css/fm-global.css'

if (-not (Test-Path $pluginPath)) { throw "No se encontro $pluginPath" }
if (-not (Test-Path $cssPath)) { throw "No se encontro $cssPath" }

$utf8NoBom = New-Object System.Text.UTF8Encoding($false)
$plugin = [System.IO.File]::ReadAllText($pluginPath, [System.Text.Encoding]::UTF8)

# Mantiene notebook aunque Windows/Chrome reduzcan mucho el viewport CSS.
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
  if (!document || !element) return

  if (!dialogStyleSnapshots.has(element)) {
    const snapshot = {}
    DIALOG_MANAGED_PROPERTIES.forEach((property) => {
      snapshot[property] = {
        value: element.style.getPropertyValue(property),
        priority: element.style.getPropertyPriority(property)
      }
    })
    dialogStyleSnapshots.set(element, snapshot)
  }

  let managed = dialogManagedElements.get(document)
  if (!managed) {
    managed = new Set()
    dialogManagedElements.set(document, managed)
  }
  managed.add(element)
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
    dialogStyleSnapshots.delete(element)
  }

  element.classList.remove(
    'fm-legacy-responsive-dialog',
    'fm-legacy-responsive-dialog-overlay',
    'fm-legacy-responsive-dialog-scroll'
  )
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
  const rect = surface.getBoundingClientRect()
  const compactNotebook = document.body.classList.contains('fm-legacy-notebook-compact')

  const outsideViewport = (
    rect.top < viewport.offsetTop + margin ||
    rect.left < viewport.offsetLeft + margin ||
    rect.right > viewport.offsetLeft + viewport.width - margin ||
    rect.bottom > viewport.offsetTop + viewport.height - margin
  )

  const oversize = rect.width > maxWidth + 1 || rect.height > maxHeight + 1

  // A 100%/viewport amplio se conserva EXACTAMENTE la geometria del JSP.
  // Solo intervenimos cuando el zoom deja el viewport compacto y el dialog ya no entra.
  if (!compactNotebook || (!outsideViewport && !oversize)) return false

  rememberDialogElement(document, surface)
  surface.classList.add('fm-legacy-responsive-dialog')
  surface.style.setProperty('box-sizing', 'border-box', 'important')
  surface.style.setProperty('max-width', `${maxWidth}px`, 'important')
  surface.style.setProperty('max-height', `${maxHeight}px`, 'important')

  if (rect.width > maxWidth + 1) {
    surface.style.setProperty('width', `${maxWidth}px`, 'important')
  }

  // En zoom alto se centra dentro del visualViewport actual. Al volver el zoom,
  // resetManagedDialogs() restaura top/left/transform originales antes de recalcular.
  surface.style.setProperty('position', 'fixed', 'important')
  surface.style.setProperty('top', `${viewport.offsetTop + margin}px`, 'important')
  surface.style.setProperty('left', `${viewport.offsetLeft + viewport.width / 2}px`, 'important')
  surface.style.setProperty('right', 'auto', 'important')
  surface.style.setProperty('bottom', 'auto', 'important')
  surface.style.setProperty('margin', '0', 'important')
  surface.style.setProperty('transform', 'translateX(-50%)', 'important')

  const wrapper = surface.closest?.(DIALOG_WRAPPER_SELECTOR)
  if (wrapper && wrapper !== surface && isVisibleElement(wrapper, view)) {
    rememberDialogElement(document, wrapper)
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

  if (scrollArea) {
    rememberDialogElement(document, scrollArea)
    scrollArea.classList.add('fm-legacy-responsive-dialog-scroll')
    scrollArea.style.setProperty('min-width', '0', 'important')
    scrollArea.style.setProperty('max-width', '100%', 'important')
    scrollArea.style.setProperty('max-height', `${availableBodyHeight}px`, 'important')
    scrollArea.style.setProperty('overflow-x', 'auto', 'important')
    scrollArea.style.setProperty('overflow-y', 'auto', 'important')
    scrollArea.style.setProperty('overscroll-behavior', 'contain', 'important')
  }

  surface.style.setProperty('overflow-x', 'auto', 'important')
  surface.style.setProperty('overflow-y', 'auto', 'important')
  return true
}

const applyResponsiveDialogLayout = (iframe, document) => {
  const view = document?.defaultView || iframe?.contentWindow
  if (!document?.body || !view) return

  // Fundamental al cambiar zoom: primero volver a la geometria original.
  resetManagedDialogs(document)

  const viewport = getVisualViewportSize(view, document)
  const surfaces = findVisibleDialogSurfaces(document, view, viewport)
  const compactNotebook = document.body.classList.contains('fm-legacy-notebook-compact')
  let adapted = false

  surfaces.forEach((surface) => {
    adapted = applyDialogSurfaceLayout(surface, document, view, viewport) || adapted
  })

  // No alterar el scroll del documento en viewport normal. Bootstrap/JSP conserva
  // su comportamiento nativo; solo lo liberamos mientras realmente adaptamos zoom.
  setDocumentScroll(document, compactNotebook && adapted)
}

'@

$plugin = $plugin.Substring(0, $start) + $newDialogBlock + $plugin.Substring($end)
[System.IO.File]::WriteAllText($pluginPath, $plugin, $utf8NoBom)

# CSS: los selectores genericos de dialog solo deben actuar durante zoom compacto.
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
Write-Host 'ZOOM REVERSIBLE DE POPUPS LEGACY APLICADO'
Write-Host '============================================================'
Write-Host 'OK - al cambiar zoom se restauran primero los estilos originales del popup.'
Write-Host 'OK - a 100% no se fuerza position/top/left/transform ni tamanos del dialog.'
Write-Host 'OK - a zoom alto el popup se adapta solo si realmente queda fuera del viewport.'
Write-Host 'OK - wrapper y area de scroll tambien se restauran al volver el zoom.'
Write-Host 'OK - el scroll del documento solo se libera mientras el popup esta adaptado.'
Write-Host 'Archivos modificados:'
Write-Host '  src/plugins/responsiveIframes.js'
Write-Host '  src/assets/css/fm-global.css'
