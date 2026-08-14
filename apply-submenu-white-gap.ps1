$path = 'src/assets/css/fm-global.css'
if (-not (Test-Path $path)) { throw "No se encontro $path" }

$content = Get-Content -Raw -Path $path
$marker = '/* ===== FIN: fm-menu-submenu-compact.css ===== */'
if (-not $content.Contains($marker)) { throw 'No se encontro el cierre de fm-menu-submenu-compact.css' }

# Limpia todos los intentos anteriores de separacion/gutter para que no compitan.
$content = [regex]::Replace(
  $content,
  '(?s)/\* (?:Conserva el margen visual|Conserva el margen blanco|Separa el segundo nivel|Gutter blanco real).*?\*/.*?(?=(?:/\* ===== FIN: fm-menu-submenu-compact\.css ===== \*/)|(?:/\* (?:Conserva el margen visual|Conserva el margen blanco|Separa el segundo nivel|Gutter blanco real)))',
  ''
)

$block = @'

/* Separacion limpia del submenu de segundo nivel. */
#app .main-menu .p-menubar-submenu,
#app .main-menu .p-submenu-list {
  padding-right: 0 !important;
  background: #fff !important;
  box-sizing: border-box !important;
  overflow: visible !important;
}

/* El item que contiene otro submenu debe ser referencia de posicionamiento. */
#app .main-menu .p-menubar-submenu > .p-menubar-item,
#app .main-menu .p-menubar-submenu > .p-menuitem,
#app .main-menu .p-submenu-list > .p-menubar-item,
#app .main-menu .p-submenu-list > .p-menuitem {
  position: relative !important;
  overflow: visible !important;
}

/* Segundo nivel: queda 6 px por fuera del panel padre, sin alterar su ancho. */
#app .main-menu .p-menubar-submenu > .p-menubar-item > .p-menubar-submenu,
#app .main-menu .p-menubar-submenu > .p-menubar-item > .p-submenu-list,
#app .main-menu .p-menubar-submenu > .p-menuitem > .p-menubar-submenu,
#app .main-menu .p-menubar-submenu > .p-menuitem > .p-submenu-list,
#app .main-menu .p-submenu-list > .p-menubar-item > .p-menubar-submenu,
#app .main-menu .p-submenu-list > .p-menubar-item > .p-submenu-list,
#app .main-menu .p-submenu-list > .p-menuitem > .p-menubar-submenu,
#app .main-menu .p-submenu-list > .p-menuitem > .p-submenu-list {
  left: 100% !important;
  right: auto !important;
  margin: 0 !important;
  top: -3px !important;
  translate: 6px 0 !important;
}

'@

$content = $content.Replace($marker, $block + $marker)
Set-Content -Path $path -Value $content -Encoding utf8
Write-Host 'Submenus limpiados y separados correctamente.'
