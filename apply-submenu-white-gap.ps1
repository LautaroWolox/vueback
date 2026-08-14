$path = 'src/assets/css/fm-global.css'
if (-not (Test-Path $path)) { throw "No se encontro $path" }

$content = Get-Content -Raw -Path $path
$marker = '/* ===== FIN: fm-menu-submenu-compact.css ===== */'
if (-not $content.Contains($marker)) { throw 'No se encontro el cierre de fm-menu-submenu-compact.css' }

# Elimina cualquier intento anterior de separacion para no dejar reglas compitiendo.
$content = [regex]::Replace(
  $content,
  '(?s)/\* (?:Conserva el margen visual|Conserva el margen blanco|Separa el segundo nivel).*?\*/\s*#app \.main-menu \.p-menubar-submenu \.p-menubar-submenu,\s*#app \.main-menu \.p-submenu-list \.p-submenu-list \{.*?\}\s*',
  ''
)

$block = @'

/* Gutter blanco real entre submenu padre y segundo nivel. */
#app .main-menu .p-menubar-submenu,
#app .main-menu .p-submenu-list {
  padding-right: 6px !important;
  background: #fff !important;
  box-sizing: border-box !important;
  overflow: visible !important;
}

/* El hijo arranca despues del gutter blanco del panel padre. */
#app .main-menu .p-menubar-submenu > .p-menubar-item > .p-menubar-submenu,
#app .main-menu .p-menubar-submenu > .p-menuitem > .p-submenu-list,
#app .main-menu .p-submenu-list > .p-menubar-item > .p-menubar-submenu,
#app .main-menu .p-submenu-list > .p-menuitem > .p-submenu-list {
  left: calc(100% + 6px) !important;
  right: auto !important;
  margin-left: 0 !important;
  margin-top: -3px !important;
}

'@

$content = $content.Replace($marker, $block + $marker)
Set-Content -Path $path -Value $content -Encoding utf8
Write-Host 'Gutter blanco de submenu aplicado correctamente.'
