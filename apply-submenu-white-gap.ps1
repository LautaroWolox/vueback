$path = 'src/assets/css/fm-global.css'
if (-not (Test-Path $path)) { throw "No se encontro $path" }

$content = Get-Content -Raw -Path $path
$selector = '#app \.main-menu \.p-menubar-submenu \.p-menubar-submenu,\s*#app \.main-menu \.p-submenu-list \.p-submenu-list \{[^}]*\}'
$replacement = @'
#app .main-menu .p-menubar-submenu .p-menubar-submenu,
#app .main-menu .p-submenu-list .p-submenu-list {
  margin-top: 0 !important;
  margin-left: 6px !important;
}
'@

if ($content -match $selector) {
  $content = [regex]::Replace($content, $selector, $replacement, 1)
} else {
  $marker = '/* ===== FIN: fm-menu-submenu-compact.css ===== */'
  if (-not $content.Contains($marker)) { throw 'No se encontro el cierre de fm-menu-submenu-compact.css' }
  $block = @'

/* Conserva el margen blanco entre el primer submenu y el segundo nivel. */
#app .main-menu .p-menubar-submenu .p-menubar-submenu,
#app .main-menu .p-submenu-list .p-submenu-list {
  margin-top: 0 !important;
  margin-left: 6px !important;
}

'@
  $content = $content.Replace($marker, $block + $marker)
}

Set-Content -Path $path -Value $content -Encoding utf8
Write-Host 'Margen de submenu aplicado en fm-global.css.'
