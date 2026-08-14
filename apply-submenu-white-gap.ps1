$path = 'src/assets/css/fm-global.css'
if (-not (Test-Path $path)) { throw "No se encontro $path" }

$content = Get-Content -Raw -Path $path
$marker = '/* ===== FIN: fm-menu-submenu-compact.css ===== */'
if (-not $content.Contains($marker)) { throw 'No se encontro el cierre de fm-menu-submenu-compact.css' }

# Elimina todos los ajustes experimentales anteriores de este cambio.
$comments = @(
  'Conserva el margen visual del primer submenu cuando abre un segundo nivel.',
  'Conserva el margen blanco entre el primer submenu y el segundo nivel.',
  'Separa el segundo nivel sin recortar ni desplazar el panel padre.',
  'Gutter blanco real entre submenu padre y segundo nivel.',
  'Separacion limpia del submenu de segundo nivel.',
  'El item que contiene otro submenu debe ser referencia de posicionamiento.',
  'Segundo nivel: queda 6 px por fuera del panel padre, sin alterar su ancho.',
  'El hijo arranca despues del gutter blanco del panel padre.',
  'Ajuste definitivo del submenu de segundo nivel.'
)

foreach ($comment in $comments) {
  $escaped = [regex]::Escape($comment)
  $content = [regex]::Replace(
    $content,
    "(?s)/\*\s*$escaped\s*\*/\s*[^{}]+\{[^{}]*\}\s*",
    ''
  )
}

# Revierte propiedades experimentales que pudieron quedar en el bloque global de submenu.
$content = $content -replace '(?m)^\s*padding-right:\s*6px\s*!important;\s*$', ''

$block = @'

/* Ajuste definitivo del submenu de segundo nivel. */
#app .main-menu .p-menubar-submenu > .p-menubar-item,
#app .main-menu .p-menubar-submenu > .p-menuitem,
#app .main-menu .p-submenu-list > .p-menubar-item,
#app .main-menu .p-submenu-list > .p-menuitem {
  position: relative !important;
  overflow: visible !important;
}

#app .main-menu .p-menubar-submenu > .p-menubar-item > .p-menubar-submenu,
#app .main-menu .p-menubar-submenu > .p-menubar-item > .p-submenu-list,
#app .main-menu .p-menubar-submenu > .p-menuitem > .p-menubar-submenu,
#app .main-menu .p-menubar-submenu > .p-menuitem > .p-submenu-list,
#app .main-menu .p-submenu-list > .p-menubar-item > .p-menubar-submenu,
#app .main-menu .p-submenu-list > .p-menubar-item > .p-submenu-list,
#app .main-menu .p-submenu-list > .p-menuitem > .p-menubar-submenu,
#app .main-menu .p-submenu-list > .p-menuitem > .p-submenu-list {
  top: -3px !important;
  left: 100% !important;
  right: auto !important;
  margin: 0 0 0 6px !important;
  padding-right: 0 !important;
  transform: none !important;
  translate: none !important;
  overflow: visible !important;
}

'@

$content = $content.Replace($marker, $block + $marker)
Set-Content -Path $path -Value $content -Encoding utf8
Write-Host 'Submenu nivel 2 corregido: panel padre intacto y separacion blanca de 6px.'
