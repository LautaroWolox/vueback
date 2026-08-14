$globalPath = 'src/assets/css/fm-global.css'
$menuPath = 'src/components/CustomMenu.vue'

if (-not (Test-Path $globalPath)) { throw "No se encontro $globalPath" }
if (-not (Test-Path $menuPath)) { throw "No se encontro $menuPath" }

# 1) Limpia solamente los bloques experimentales que agregamos en fm-global.css.
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

Set-Content -Path $globalPath -Value $global -Encoding utf8

# 2) Corrige el segundo nivel en el componente que realmente lo renderiza.
$menu = Get-Content -Raw -Path $menuPath

$pattern = '(?s):deep\(\.p-menubar-submenu \.p-menubar-submenu\),\s*:deep\(\.p-submenu-list \.p-submenu-list\)\s*\{\s*min-width:\s*276px\s*!important;\s*margin-top:\s*-3px\s*!important;(?:\s*margin-left:[^;]+;)?(?:\s*transform:[^;]+;)?\s*\}'

$replacement = @'
:deep(.p-menubar-submenu .p-menubar-submenu),
:deep(.p-submenu-list .p-submenu-list) {
  min-width: 276px !important;
  margin-top: -3px !important;
  margin-left: 0 !important;
  transform: translateX(6px) !important;
}
'@

if ($menu -match $pattern) {
  $menu = [regex]::Replace($menu, $pattern, $replacement, 1)
} else {
  throw 'No se encontro el bloque esperado del submenu de segundo nivel en CustomMenu.vue.'
}

Set-Content -Path $menuPath -Value $menu -Encoding utf8

Write-Host 'Menu corregido: padre intacto y segundo nivel separado 6px.'
Write-Host 'Archivos modificados:'
Write-Host " - $globalPath"
Write-Host " - $menuPath"
