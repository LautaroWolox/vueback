$globalPath = 'src/assets/css/fm-global.css'
$menuPath = 'src/components/CustomMenu.vue'

if (-not (Test-Path $globalPath)) { throw "No se encontro $globalPath" }
if (-not (Test-Path $menuPath)) { throw "No se encontro $menuPath" }

$utf8NoBom = New-Object System.Text.UTF8Encoding($false)

# 1) Limpia únicamente los overrides experimentales agregados durante estas pruebas.
$global = Get-Content -Raw -Path $globalPath

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
  'El segundo nivel se desplaza por fuera sin participar del layout del padre.'
)

foreach ($comment in $comments) {
  $escaped = [regex]::Escape("/* $comment */")
  $global = [regex]::Replace(
    $global,
    "(?s)\s*$escaped\s*[^{}]*\{[^{}]*\}\s*",
    "`r`n"
  )
}

[System.IO.File]::WriteAllText($globalPath, $global, $utf8NoBom)

# 2) Corrige el panel base. El ancho de 238px corresponde al contenido;
# los bordes quedan por fuera para que el panel no pierda esos píxeles visuales.
$menu = Get-Content -Raw -Path $menuPath

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

# 3) El segundo nivel se separa 6px usando sólo margen del elemento absoluto.
# No se modifica padding, width ni box model del panel padre.
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

Write-Host 'Submenus corregidos: panel base completo y segundo nivel separado 6px.'
Write-Host 'Archivos modificados:'
Write-Host " - $globalPath"
Write-Host " - $menuPath"
