$path = 'src/assets/css/fm-global.css'
if (-not (Test-Path $path)) { throw "No se encontro $path" }

$utf8NoBom = New-Object System.Text.UTF8Encoding($false)
$content = [System.IO.File]::ReadAllText($path, [System.Text.Encoding]::UTF8)

# Evita que inputs tipo boton entren en la regla responsive de campos de texto.
$content = $content.Replace(
  'body.fm-responsive-legacy input:not([type=checkbox]):not([type=radio]),',
  'body.fm-responsive-legacy input:not([type=checkbox]):not([type=radio]):not([type=button]):not([type=submit]):not([type=reset]),'
)

# Gestion de Operadores conserva el box model nativo/legacy de sus controles.
$content = $content.Replace(
@'body.fm-responsive-legacy *,
body.fm-responsive-legacy *::before,
body.fm-responsive-legacy *::after {'@,
@'body.fm-responsive-legacy:not(.fm-legacy-native-controls) *,
body.fm-responsive-legacy:not(.fm-legacy-native-controls) *::before,
body.fm-responsive-legacy:not(.fm-legacy-native-controls) *::after {'@
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

[System.IO.File]::WriteAllText($path, $content, $utf8NoBom)
Write-Host 'Gestion de Operadores aislada de estilos de botones Vue/legacy responsive.'
Write-Host "Archivo modificado: $path"
