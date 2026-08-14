$path = 'src/components/CustomMenu.vue'
if (-not (Test-Path $path)) { throw "No se encontro $path" }

$utf8NoBom = New-Object System.Text.UTF8Encoding($false)
$content = [System.IO.File]::ReadAllText($path, [System.Text.Encoding]::UTF8)

$pattern = '(?s)(class="fm-user-v3-logout".*?icon="pi pi-sign-out"\s*)[^\r\n]*label="[^"]*"'
$replacement = @'
$1:label="'Cerrar sesi\u00F3n'"
'@

if ($content -notmatch $pattern) {
  throw 'No se encontro el boton Cerrar sesion en CustomMenu.vue.'
}

$content = [regex]::Replace($content, $pattern, $replacement, 1)
[System.IO.File]::WriteAllText($path, $content, $utf8NoBom)

Write-Host 'Texto Cerrar sesion corregido con Unicode seguro.'
