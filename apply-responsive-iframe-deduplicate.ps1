$ErrorActionPreference = 'Stop'

$path = 'src/plugins/responsiveIframes.js'
if (-not (Test-Path $path)) { throw "No se encontro $path" }

$utf8NoBom = New-Object System.Text.UTF8Encoding($false)
$content = [System.IO.File]::ReadAllText($path, [System.Text.Encoding]::UTF8)

$token = 'const DIALOG_MANAGED_PROPERTIES = ['
$first = $content.IndexOf($token)
$last = $content.LastIndexOf($token)

if ($first -ge 0 -and $last -gt $first) {
  # El script de zoom reversible podia dejar una version anterior del bloque
  # delante de la version nueva al ejecutarse mas de una vez. Conservamos solo
  # la ultima (la mas reciente) para que las const/function no se declaren doble.
  $content = $content.Substring(0, $first) + $content.Substring($last)
  [System.IO.File]::WriteAllText($path, $content, $utf8NoBom)
  Write-Host 'responsiveIframes.js: bloque duplicado eliminado.' -ForegroundColor Green
} else {
  Write-Host 'responsiveIframes.js: no hay bloques DIALOG_MANAGED_PROPERTIES duplicados.' -ForegroundColor Green
}

# Validacion simple adicional: debe quedar exactamente una declaracion del bloque.
$content = [System.IO.File]::ReadAllText($path, [System.Text.Encoding]::UTF8)
$count = ([regex]::Matches($content, [regex]::Escape($token))).Count
if ($count -gt 1) {
  throw "Siguen existiendo $count declaraciones DIALOG_MANAGED_PROPERTIES en $path"
}

Write-Host "OK - $path queda sin declaraciones duplicadas." -ForegroundColor Green
