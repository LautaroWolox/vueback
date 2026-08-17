$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest

$routerPath = 'src/router/index.js'
$utf8NoBom = New-Object System.Text.UTF8Encoding($false)

if (-not (Test-Path $routerPath)) {
  throw "No existe $routerPath"
}

$content = [System.IO.File]::ReadAllText((Resolve-Path $routerPath), [System.Text.Encoding]::UTF8)
$content = $content.Replace("`r`n", "`n")

$allowedStart = $content.IndexOf('const allowed = (to, from, next) => {')
$routesStart = $content.IndexOf('const routes = [')

if ($allowedStart -lt 0) { throw 'No se encontro const allowed.' }
if ($routesStart -le $allowedStart) { throw 'No se encontro const routes despues de allowed.' }

$allowedCanonical = @'
const allowed = (to, from, next) => {
  const authStore = useAuthStore()
  const autenticado = authStore.autenticado;
  const rutas = authStore.rutas;
  const rutasPermitidas = rutas !== null ? rutas : [];

  if (!autenticado && rutasLibres.includes(to.name)) {
    next();
    return;
  }

  if (!autenticado && !rutasLibres.includes(to.name)) {
    next({ name: '401' });
    return;
  }

  if (autenticado && rutasPermitidas.includes(to.name)) {
    next();
    return;
  }

  next({ name: '401' });
};

'@

# Conserva imports + rutasLibres exactamente como estan y reconstruye solo allowed.
$prefix = $content.Substring(0, $allowedStart)
$suffix = $content.Substring($routesStart)
$fixed = $prefix + $allowedCanonical + $suffix

# Reparaciones defensivas por si quedaron tokens pegados de scripts anteriores.
$fixed = $fixed.Replace('};const routes = [', "};`n`nconst routes = [")
$fixed = $fixed.Replace('}const routes = [', "};`n`nconst routes = [")
$fixed = $fixed.Replace('||`n', "||`n")

[System.IO.File]::WriteAllText((Resolve-Path $routerPath), $fixed.Replace("`n", "`r`n"), $utf8NoBom)

Write-Host ''
Write-Host 'ROUTER REPARADO: prefijo allowed reconstruido.' -ForegroundColor Green
Write-Host 'No se tocaron las rutas ni ningun otro archivo.' -ForegroundColor Yellow
Write-Host ''
Write-Host 'Verificacion rapida:' -ForegroundColor Yellow
Get-Content $routerPath | Select-Object -First 34
Write-Host ''
Write-Host 'Ahora ejecutar: npm run build' -ForegroundColor Yellow
