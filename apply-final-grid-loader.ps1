$ErrorActionPreference = 'Stop'

$sourceRef = 'github-origen/fix-grids-fullscreen-loader-final'
$patchFile = 'final-grid-loader.patch.gz.b64'
$tempPatch = Join-Path $env:TEMP ("fm-final-grid-loader-" + [guid]::NewGuid().ToString() + '.patch')

try {
    $status = (& git status --porcelain) -join "`n"
    if ($LASTEXITCODE -ne 0) {
        throw 'No se pudo consultar el estado del repositorio.'
    }

    if ($status.Trim()) {
        throw 'El working tree no esta limpio. Guarda o descarta los cambios locales antes de aplicar este ajuste.'
    }

    $encoded = (& git show "${sourceRef}:${patchFile}") -join ''
    if ($LASTEXITCODE -ne 0 -or -not $encoded.Trim()) {
        throw "No se pudo leer ${patchFile} desde ${sourceRef}. Ejecuta primero: git fetch github-origen fix-grids-fullscreen-loader-final"
    }

    $compressed = [Convert]::FromBase64String($encoded.Trim())
    $inputStream = New-Object IO.MemoryStream(,$compressed)
    $gzipStream = New-Object IO.Compression.GZipStream($inputStream, [IO.Compression.CompressionMode]::Decompress)
    $reader = New-Object IO.StreamReader($gzipStream, [Text.Encoding]::UTF8)
    $patch = $reader.ReadToEnd()
    $reader.Dispose()
    $gzipStream.Dispose()
    $inputStream.Dispose()

    [IO.File]::WriteAllText($tempPatch, $patch, (New-Object Text.UTF8Encoding($false)))

    & git apply --check $tempPatch
    if ($LASTEXITCODE -ne 0) {
        throw 'El patch no coincide con esta base. No se aplico ningun cambio.'
    }

    & git apply $tempPatch
    if ($LASTEXITCODE -ne 0) {
        throw 'Git no pudo aplicar el patch.'
    }

    Write-Host ''
    Write-Host 'Cambios aplicados correctamente.' -ForegroundColor Green
    Write-Host 'Archivos esperados:' -ForegroundColor Cyan
    Write-Host '  src/assets/css/fm-global.css'
    Write-Host '  src/composables/useLegacyIframeLayout.js'
    Write-Host '  src/views/IframeView.vue'
    Write-Host '  src/views/DetalleView.vue'
    Write-Host ''
    & git status --short
}
finally {
    if (Test-Path $tempPatch) {
        Remove-Item $tempPatch -Force
    }
}
