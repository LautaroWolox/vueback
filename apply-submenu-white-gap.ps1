$path = 'src/assets/css/fm-global.css'
if (-not (Test-Path $path)) { throw "No se encontro $path" }

$content = Get-Content -Raw -Path $path
$selector = '#app \.main-menu \.p-menubar-submenu \.p-menubar-submenu,\s*#app \.main-menu \.p-submenu-list \.p-submenu-list \{[^}]*\}'
$replacement = @'
#app .main-menu .p-menubar-submenu .p-menubar-submenu,
#app .main-menu .p-submenu-list .p-submenu-list {
  left: calc(100% + 6px) !important;
  right: auto !important;
  margin-left: 0 !important;
  margin-top: -3px !important;
}
'@

if ($content -match $selector) {
  $content = [regex]::Replace($content, $selector, $replacement, 1)
} else {
  $marker = '/* ===== FIN: fm-menu-submenu-compact.css ===== */'
  if (-not $content.Contains($marker)) { throw 'No se encontro el cierre de fm-menu-submenu-compact.css' }
  $block = @'

/* Separa el segundo nivel sin recortar ni desplazar el panel padre. */
#app .main-menu .p-menubar-submenu .p-menubar-submenu,
#app .main-menu .p-submenu-list .p-submenu-list {
  left: calc(100% + 6px) !important;
  right: auto !important;
  margin-left: 0 !important;
  margin-top: -3px !important;
}

'@
  $content = $content.Replace($marker, $block + $marker)
}

Set-Content -Path $path -Value $content -Encoding utf8
Write-Host 'Separacion de submenu aplicada sin recortar el panel padre.'
