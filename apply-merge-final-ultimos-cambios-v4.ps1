$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest

$remote = 'github-origen'
$sourceRef = "$remote/merge-final-ultimos-cambios-v3"
$sourcePath = 'apply-merge-final-ultimos-cambios-v3.ps1'
$utf8NoBom = New-Object System.Text.UTF8Encoding($false)

function Copy-GitFileRaw {
    param(
        [Parameter(Mandatory=$true)][string]$Ref,
        [Parameter(Mandatory=$true)][string]$SourcePath,
        [Parameter(Mandatory=$true)][string]$DestinationPath
    )

    $command = "git show $Ref`:$SourcePath > `"$DestinationPath`""
    cmd.exe /d /s /c $command
    if ($LASTEXITCODE -ne 0) {
        throw "No se pudo copiar $SourcePath desde $Ref"
    }
}

Write-Host ''
Write-Host 'FM - MERGE FINAL ULTIMOS CAMBIOS V4' -ForegroundColor Cyan
Write-Host '-----------------------------------' -ForegroundColor Cyan

# Ejecuta el merge completo V3.
git rev-parse --verify "$sourceRef^{commit}" *> $null
if ($LASTEXITCODE -ne 0) {
    throw "No existe $sourceRef. Ejecuta primero: git fetch github-origen"
}

$tempFile = Join-Path $env:TEMP ("fm-" + [guid]::NewGuid().ToString('N') + '.ps1')
try {
    Copy-GitFileRaw -Ref $sourceRef -SourcePath $sourcePath -DestinationPath $tempFile
    & powershell.exe -NoProfile -ExecutionPolicy Bypass -File $tempFile
    if ($LASTEXITCODE -ne 0) {
        throw 'Fallo el merge V3.'
    }
}
finally {
    Remove-Item -Force $tempFile -ErrorAction SilentlyContinue
}

# Correccion final: ABM Materiales tampoco debe quedar como perfil de spinner.
$profilesPath = 'src/components/shared/fmLoaderProfiles.js'
if (-not (Test-Path $profilesPath)) {
    throw "Falta $profilesPath"
}

$profiles = [System.IO.File]::ReadAllText((Resolve-Path $profilesPath), [System.Text.Encoding]::UTF8)
$profiles = $profiles.Replace("`r`n", "`n")
$profiles = [regex]::Replace($profiles, '(?m)^\s*ABMM:\s*\{[^\n]*\},\s*\n?', '')
[System.IO.File]::WriteAllText((Resolve-Path $profilesPath), $profiles.Replace("`n", "`r`n"), $utf8NoBom)

$finalProfiles = [System.IO.File]::ReadAllText((Resolve-Path $profilesPath), [System.Text.Encoding]::UTF8)
if ($finalProfiles.Contains('ABMM:')) {
    throw 'ABMM sigue presente en fmLoaderProfiles.js'
}

if (Test-Path 'src/modules/gestionMateriales/abmMateriales') {
    Remove-Item -Recurse -Force 'src/modules/gestionMateriales/abmMateriales'
}
if (Test-Path 'src/assets/css/fm-menu-video.css') {
    Remove-Item -Force 'src/assets/css/fm-menu-video.css'
}

Write-Host ''
Write-Host 'LISTO. ESTE ES EL MERGE FINAL QUE TENES QUE USAR.' -ForegroundColor Green
Write-Host 'Incluye menu nuevo, spinners nuevos, Reporte SAS final y deja ABM Materiales afuera.' -ForegroundColor Cyan
Write-Host ''
Write-Host 'Ahora valida:' -ForegroundColor Yellow
Write-Host '  git status --short'
Write-Host '  npm run build'
