$path = 'src/assets/css/fm-global.css'
if (-not (Test-Path $path)) { throw "No se encontro $path" }

$utf8NoBom = New-Object System.Text.UTF8Encoding($false)
$content = [System.IO.File]::ReadAllText($path, [System.Text.Encoding]::UTF8)

# Evita que inputs tipo boton entren en la regla responsive de campos de texto.
$content = $content.Replace(
  'body.fm-responsive-legacy input:not([type=checkbox]):not([type=radio]),',
  'body.fm-responsive-legacy input:not([type=checkbox]):not([type=radio]):not([type=button]):not([type=submit]):not([type=reset]),'
)

# Gestion de Operadores conserva el box model legacy de sus controles generales.
$content = [regex]::Replace(
  $content,
  'body\.fm-responsive-legacy \*,\r?\nbody\.fm-responsive-legacy \*::before,\r?\nbody\.fm-responsive-legacy \*::after \{',
  "body.fm-responsive-legacy:not(.fm-legacy-native-controls) *,`r`nbody.fm-responsive-legacy:not(.fm-legacy-native-controls) *::before,`r`nbody.fm-responsive-legacy:not(.fm-legacy-native-controls) *::after {",
  1
)

$selectors = @(
  '.btn-toolbar',
  '.button-bar',
  '.actions',
  '.form-actions',
  '.toolbar',
  '[class*=action-bar]',
  '[class*=button-bar]',
  '.ui-dialog-buttonpane',
  '.p-dialog-footer',
  '.modal-footer',
  'button:not(.ui-datepicker-trigger):not(.p-datepicker-trigger)',
  'input[type=button]',
  'input[type=submit]',
  '.btn',
  '.ui-button',
  '.p-button'
)

foreach ($selector in $selectors) {
  $from = "body.fm-responsive-legacy $selector"
  $to = "body.fm-responsive-legacy:not(.fm-legacy-native-controls) $selector"
  $content = $content.Replace($from, $to)
}

# En pantallas <=1366 no reducimos la tipografia base de Gestion de Operadores.
$content = [regex]::Replace(
  $content,
  '(?m)^(\s*)body\.fm-responsive-legacy \{\r?\n(\s*)font-size: 12px !important;',
  '$1body.fm-responsive-legacy:not(.fm-legacy-native-controls) {' + "`r`n" + '$2font-size: 12px !important;',
  1
)

$markerStart = '/* --- INICIO: gestion-operadores-action-buttons --- */'
$markerEnd = '/* --- FIN: gestion-operadores-action-buttons --- */'

# Si el bloque ya existe, se reemplaza para que el script sea idempotente.
$escapedStart = [regex]::Escape($markerStart)
$escapedEnd = [regex]::Escape($markerEnd)
$content = [regex]::Replace(
  $content,
  "(?s)\s*$escapedStart.*?$escapedEnd\s*",
  "`r`n"
)

$buttonCss = @'
/* --- INICIO: gestion-operadores-action-buttons --- */
/* Gestion de Operadores: BUSCAR y LIMPIAR con la misma apariencia FM/Vue. */
body.fm-responsive-legacy.fm-legacy-native-controls .fm-legacy-action-search,
body.fm-responsive-legacy.fm-legacy-native-controls input.fm-legacy-action-search,
body.fm-responsive-legacy.fm-legacy-native-controls button.fm-legacy-action-search {
  width: auto !important;
  min-width: 80px !important;
  max-width: none !important;
  height: 34px !important;
  min-height: 34px !important;
  max-height: 34px !important;
  padding: 0 14px !important;
  border: 1px solid #00a9bd !important;
  border-radius: 18px !important;
  background: #00a9bd !important;
  background-image: none !important;
  color: #fff !important;
  font-family: inherit !important;
  font-size: 13px !important;
  font-weight: 500 !important;
  line-height: 32px !important;
  text-align: center !important;
  text-shadow: none !important;
  box-shadow: none !important;
  vertical-align: middle !important;
}

body.fm-responsive-legacy.fm-legacy-native-controls .fm-legacy-action-search:hover,
body.fm-responsive-legacy.fm-legacy-native-controls .fm-legacy-action-search:focus {
  border-color: #008fa1 !important;
  background: #008fa1 !important;
  color: #fff !important;
}

body.fm-responsive-legacy.fm-legacy-native-controls .fm-legacy-action-clear,
body.fm-responsive-legacy.fm-legacy-native-controls input.fm-legacy-action-clear,
body.fm-responsive-legacy.fm-legacy-native-controls button.fm-legacy-action-clear {
  width: auto !important;
  min-width: 78px !important;
  max-width: none !important;
  height: 34px !important;
  min-height: 34px !important;
  max-height: 34px !important;
  padding: 0 14px !important;
  border: 1px solid #00a9bd !important;
  border-radius: 18px !important;
  background: #fff !important;
  background-image: none !important;
  color: #00a0b4 !important;
  font-family: inherit !important;
  font-size: 13px !important;
  font-weight: 400 !important;
  line-height: 32px !important;
  text-align: center !important;
  text-shadow: none !important;
  box-shadow: none !important;
  vertical-align: middle !important;
}

body.fm-responsive-legacy.fm-legacy-native-controls .fm-legacy-action-clear:hover,
body.fm-responsive-legacy.fm-legacy-native-controls .fm-legacy-action-clear:focus {
  border-color: #008fa1 !important;
  background: #f2fcfe !important;
  color: #008fa1 !important;
}
/* --- FIN: gestion-operadores-action-buttons --- */
'@

$legacyEnd = '/* ===== FIN: fm-legacy-responsive.css ===== */'
if (-not $content.Contains($legacyEnd)) {
  throw 'No se encontro el cierre de fm-legacy-responsive.css en fm-global.css.'
}

$content = $content.Replace($legacyEnd, "$buttonCss`r`n$legacyEnd")

[System.IO.File]::WriteAllText($path, $content, $utf8NoBom)
Write-Host 'Gestion de Operadores: botones BUSCAR y LIMPIAR alineados al estilo FM.'
Write-Host "Archivo modificado: $path"
