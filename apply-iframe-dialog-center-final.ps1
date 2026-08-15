$ErrorActionPreference = 'Stop'

$path = 'src/plugins/responsiveIframes.js'
if (-not (Test-Path $path)) { throw "No se encontro $path" }

$utf8NoBom = New-Object System.Text.UTF8Encoding($false)
$content = [System.IO.File]::ReadAllText($path, [System.Text.Encoding]::UTF8)

# -----------------------------------------------------------------------------
# 1) Helpers para que los estilos aplicados por el responsive sean reversibles.
#    Sin esto, un width/left fijado al 150% podia quedar pegado al volver a 100%.
# -----------------------------------------------------------------------------
$helperStart = '// --- INICIO: fm-dialog-responsive-baseline ---'
$helperEnd = '// --- FIN: fm-dialog-responsive-baseline ---'
$helperStartEscaped = [regex]::Escape($helperStart)
$helperEndEscaped = [regex]::Escape($helperEnd)
$content = [regex]::Replace(
  $content,
  "(?s)\s*$helperStartEscaped.*?$helperEndEscaped\s*",
  "`r`n"
)

$helpers = @'
// --- INICIO: fm-dialog-responsive-baseline ---
const dialogSurfaceStyleBaselines = new WeakMap()
const DIALOG_MANAGED_STYLE_PROPERTIES = [
  'box-sizing',
  'position',
  'top',
  'left',
  'right',
  'bottom',
  'margin',
  'transform',
  'width',
  'max-width',
  'max-height',
  'overflow-x',
  'overflow-y'
]

const rememberDialogSurfaceBaseline = (surface) => {
  if (!surface || dialogSurfaceStyleBaselines.has(surface)) return

  const snapshot = {}
  DIALOG_MANAGED_STYLE_PROPERTIES.forEach((property) => {
    snapshot[property] = {
      value: surface.style.getPropertyValue(property),
      priority: surface.style.getPropertyPriority(property)
    }
  })
  dialogSurfaceStyleBaselines.set(surface, snapshot)
}

const restoreDialogSurfaceBaseline = (surface) => {
  const snapshot = dialogSurfaceStyleBaselines.get(surface)
  if (!surface || !snapshot) return

  DIALOG_MANAGED_STYLE_PROPERTIES.forEach((property) => {
    const saved = snapshot[property]
    if (saved?.value) {
      surface.style.setProperty(property, saved.value, saved.priority || '')
    } else {
      surface.style.removeProperty(property)
    }
  })
}
// --- FIN: fm-dialog-responsive-baseline ---
'@

$anchor = 'const documentScrollState = new WeakMap()'
if (-not $content.Contains($anchor)) {
  throw 'No se encontro el ancla documentScrollState en responsiveIframes.js.'
}
$content = $content.Replace($anchor, $anchor + "`r`n`r`n" + $helpers.Trim())

# -----------------------------------------------------------------------------
# 2) Antes de recalcular el popup restauramos su estilo base.
# -----------------------------------------------------------------------------
$layoutAnchor = @'
  const maxHeight = Math.max(224, viewport.height - margin * 2)

  surface.classList.add('fm-legacy-responsive-dialog')
'@
$layoutReplacement = @'
  const maxHeight = Math.max(224, viewport.height - margin * 2)

  rememberDialogSurfaceBaseline(surface)
  restoreDialogSurfaceBaseline(surface)

  surface.classList.add('fm-legacy-responsive-dialog')
'@

if (-not $content.Contains($layoutAnchor)) {
  if (-not $content.Contains('rememberDialogSurfaceBaseline(surface)')) {
    throw 'No se encontro el inicio de applyDialogSurfaceLayout.'
  }
} else {
  $content = $content.Replace($layoutAnchor, $layoutReplacement)
}

# -----------------------------------------------------------------------------
# 3) Reemplaza el comportamiento anterior (solo compact/outsideViewport)
#    por centrado estable en TODO nivel de zoom. El popup se recalcula contra
#    visualViewport cada vez que cambia zoom/tamano y vuelve a su ancho base
#    antes de aplicar limites.
# -----------------------------------------------------------------------------
$oldCenterPattern = '(?s)\s*const compactNotebook = document\.body\.classList\.contains\(''fm-legacy-notebook-compact''\).*?\n\s*if \(compactNotebook && outsideViewport\) \{.*?\n\s*\}\n\n\s*rect = surface\.getBoundingClientRect\(\)'

$newCenterBlock = @'

  rect = surface.getBoundingClientRect()

  const effectiveHeight = Math.min(rect.height, maxHeight)
  const centeredLeft = viewport.offsetLeft + (viewport.width / 2)
  const centeredTop = viewport.offsetTop + Math.max(
    margin,
    Math.floor((viewport.height - effectiveHeight) / 2)
  )

  // Siempre centrado respecto del visualViewport. Al volver de 150/175/200%
  // a 100%, el calculo se ejecuta otra vez y no conserva el desplazamiento viejo.
  surface.style.setProperty('position', 'fixed', 'important')
  surface.style.setProperty('top', `${centeredTop}px`, 'important')
  surface.style.setProperty('left', `${centeredLeft}px`, 'important')
  surface.style.setProperty('right', 'auto', 'important')
  surface.style.setProperty('bottom', 'auto', 'important')
  surface.style.setProperty('margin', '0', 'important')
  surface.style.setProperty('transform', 'translateX(-50%)', 'important')

  rect = surface.getBoundingClientRect()
'@

if ($content -match $oldCenterPattern) {
  $content = [regex]::Replace($content, $oldCenterPattern, $newCenterBlock, 1)
} elseif (-not $content.Contains('const centeredLeft = viewport.offsetLeft + (viewport.width / 2)')) {
  throw 'No se encontro el bloque antiguo de centrado del dialog.'
}

[System.IO.File]::WriteAllText($path, $content, $utf8NoBom)

Write-Host 'Dialogs iframe: centrado reversible aplicado.'
Write-Host 'El popup se recentra al cambiar zoom y al volver a 100%.'
Write-Host "Archivo modificado: $path"
