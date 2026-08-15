$globalPath = 'src/assets/css/fm-global.css'
$menuPath = 'src/components/CustomMenu.vue'

if (-not (Test-Path $globalPath)) { throw "No se encontro $globalPath" }
if (-not (Test-Path $menuPath)) { throw "No se encontro $menuPath" }

$utf8NoBom = New-Object System.Text.UTF8Encoding($false)
$utf8 = [System.Text.Encoding]::UTF8

# 1) Limpia unicamente los overrides experimentales agregados durante estas pruebas.
$global = [System.IO.File]::ReadAllText($globalPath, $utf8)

$comments = @(
  'Conserva el margen visual del primer submenu cuando abre un segundo nivel.',
  'Conserva el margen blanco entre el primer submenu y el segundo nivel.',
  'Separa el segundo nivel sin recortar ni desplazar el panel padre.',
  'Gutter blanco real entre submenu padre y segundo nivel.',
  'El hijo arranca despues del gutter blanco del panel padre.',
  'Separacion limpia del submenu de segundo nivel.',
  'El item que contiene otro submenu debe ser referencia de posicionamiento.',
  'Segundo nivel: queda 6 px por fuera del panel padre, sin alterar su ancho.',
  'Separacion final: el panel padre conserva su geometria original.',
  'El segundo nivel se desplaza por fuera sin participar del layout del padre.',
  'Espacio blanco inferior final de los submenus.'
)

foreach ($comment in $comments) {
  $escaped = [regex]::Escape("/* $comment */")
  $global = [regex]::Replace(
    $global,
    "(?s)\s*$escaped\s*[^{}]*\{[^{}]*\}\s*",
    "`r`n"
  )
}

$compactEnd = '/* ===== FIN: fm-menu-submenu-compact.css ===== */'
if (-not $global.Contains($compactEnd)) {
  throw 'No se encontro el cierre de fm-menu-submenu-compact.css.'
}

$bottomSpace = @'

/* Espacio blanco inferior final de los submenus. */
#app .main-menu .p-menubar-submenu,
#app .main-menu .p-submenu-list,
body > .p-menubar-submenu,
body > .p-submenu-list {
  padding-bottom: 10px !important;
  background: #fff !important;
}

'@

$global = $global.Replace($compactEnd, $bottomSpace + $compactEnd)
[System.IO.File]::WriteAllText($globalPath, $global, $utf8NoBom)

# 2) Mantiene el panel base completo, sin alterar su geometria horizontal.
$menu = [System.IO.File]::ReadAllText($menuPath, $utf8)

$basePattern = '(?s):deep\(\.p-menubar-submenu\),\s*:deep\(\.p-submenu-list\)\s*\{.*?\}'
$baseReplacement = @'
:deep(.p-menubar-submenu),
:deep(.p-submenu-list) {
  min-width: 238px !important;
  width: max-content !important;
  max-width: 360px !important;
  padding: 0 !important;
  border: 1px solid #d7e0e5 !important;
  border-top: 3px solid #00a9bd !important;
  border-radius: 0 !important;
  background: #fff !important;
  box-sizing: content-box !important;
  box-shadow: 0 5px 14px rgba(18, 45, 57, .16) !important;
  overflow: visible !important;
  z-index: 3000 !important;
}
'@

if ($menu -notmatch $basePattern) {
  throw 'No se encontro el bloque base de submenu en CustomMenu.vue.'
}
$menu = [regex]::Replace($menu, $basePattern, $baseReplacement, 1)

# 3) El segundo nivel se separa 6px sin tocar el ancho del panel padre.
$nestedPattern = '(?s):deep\(\.p-menubar-submenu \.p-menubar-submenu\),\s*:deep\(\.p-submenu-list \.p-submenu-list\)\s*\{.*?\}'
$nestedReplacement = @'
:deep(.p-menubar-submenu .p-menubar-submenu),
:deep(.p-submenu-list .p-submenu-list) {
  min-width: 276px !important;
  margin-top: -3px !important;
  margin-left: 6px !important;
  transform: none !important;
}
'@

if ($menu -notmatch $nestedPattern) {
  throw 'No se encontro el bloque del submenu de segundo nivel en CustomMenu.vue.'
}
$menu = [regex]::Replace($menu, $nestedPattern, $nestedReplacement, 1)

[System.IO.File]::WriteAllText($menuPath, $menu, $utf8NoBom)

Write-Host 'Submenus corregidos: margen blanco inferior restaurado (10px).'
Write-Host 'Lectura/escritura UTF-8 aplicada para no corromper textos como Cerrar sesion.'
Write-Host 'Archivos modificados:'
Write-Host " - $globalPath"
Write-Host " - $menuPath"
