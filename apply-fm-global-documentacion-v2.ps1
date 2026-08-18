$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest

$cssPath = 'src/assets/css/fm-global.css'
if (-not (Test-Path $cssPath)) {
  throw "No existe $cssPath. Ejecutar desde la raiz del proyecto."
}

Write-Host ''
Write-Host 'FM-GLOBAL - DOCUMENTACION V2' -ForegroundColor Cyan
Write-Host 'Solo corrige comentarios. No modifica reglas CSS.' -ForegroundColor Yellow

$dirty = @(git status --porcelain -- $cssPath)
if ($dirty.Count -gt 0) {
  Write-Host 'ABORTADO: fm-global.css ya tiene cambios locales.' -ForegroundColor Yellow
  git status --short -- $cssPath
  exit 1
}

$fullPath = (Resolve-Path $cssPath).Path
$utf8NoBom = New-Object System.Text.UTF8Encoding($false)
$utf8Strict = New-Object System.Text.UTF8Encoding($false,$true)
$commentRx = [regex]::new('/\*[\s\S]*?\*/')

$original = [System.IO.File]::ReadAllText($fullPath, [System.Text.Encoding]::UTF8)
$functionalBefore = $commentRx.Replace($original, '')

function Repair-Mojibake([string]$value) {
  $sb = New-Object System.Text.StringBuilder
  $i = 0
  while ($i -lt $value.Length) {
    $code = [int][char]$value[$i]
    $fixed = $false

    if (($code -eq 0x00C3 -or $code -eq 0x00C2) -and ($i + 1 -lt $value.Length)) {
      $code2 = [int][char]$value[$i + 1]
      if ($code2 -le 255) {
        try {
          $bytes = [byte[]]@([byte]$code, [byte]$code2)
          $decoded = $utf8Strict.GetString($bytes)
          [void]$sb.Append($decoded)
          $i += 2
          $fixed = $true
        } catch {}
      }
    }

    if (-not $fixed) {
      [void]$sb.Append($value[$i])
      $i++
    }
  }

  $result = $sb.ToString()
  $result = $result.Replace('â€“', '–')
  $result = $result.Replace('â€”', '—')
  $result = $result.Replace('â€™', '’')
  $result = $result.Replace('â€œ', '“')
  $result = $result.Replace('â€', '”')
  $result = $result.Replace('Â¿', '¿')
  $result = $result.Replace('Â¡', '¡')
  return $result
}

$text = $commentRx.Replace(
  $original,
  [System.Text.RegularExpressions.MatchEvaluator]{
    param($m)
    Repair-Mojibake $m.Value
  }
)

$headerB64 = 'LyogPT09IElOSUNJTyBET0NVTUVOVEFDSU9OIEdFTkVSQUwgRk0tR0xPQkFMID09PSAqLwovKgogKiBHVcONQSBERSBNQU5URU5JTUlFTlRPIERFIEZNLUdMT0JBTC5DU1MKICogPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PTQogKgogKiBFc3RlIGFyY2hpdm8gY2VudHJhbGl6YSBsb3MgZXN0aWxvcyBjb21wYXJ0aWRvcyBkZSBGaWVsZCBNYW5hZ2VyLgogKiBBbnRlcyBkZSBtb2RpZmljYXIgdW5hIHJlZ2xhLCB2ZXJpZmljYXIgc3UgYWxjYW5jZSB5IGxhcyBwYW50YWxsYXMgYWZlY3RhZGFzLgogKgogKiBDTEFTSUZJQ0FDScOTTgogKiAtLS0tLS0tLS0tLS0tCiAqCiAqIFtHTE9CQUwgQ1LDjVRJQ08gLSBOTyBUT0NBUiBQT1IgVU5BIFNPTEEgUEFOVEFMTEFdCiAqIFJlZ2xhcyBjb21wYXJ0aWRhcyBwb3IgdG9kYSBsYSBhcGxpY2FjacOzbi4KICogVW4gY2FtYmlvIHB1ZWRlIGFmZWN0YXIgbWVuIMO6LCBncmlsbGFzLCBkasOhbG9nb3MsIGZvcm11bGFyaW9zIHkgcmVzcG9uc2l2ZS4KICoKICogU2kgZWwgY2FtYmlvIGNvcnJlc3BvbmRlIGEgdW5hIHNvbGEgcGFudGFsbGEsIHVzYXIgc2llbXByZSBzdSBjbGFzZSByYcOtegogKiBlbiBsdWdhciBkZSBtb2RpZmljYXIgZGlyZWN0YW1lbnRlIHVuYSByZWdsYSBnbG9iYWwuCiAqCiAqIEVqZW1wbG86CiAqIC5yZXBvcnQtc2FzLXBhZ2UgLnAtZGF0YXRhYmxlLXRoZWFkIHsgcG9zaXRpb246IHN0aWNreTsgfQogKiBBc8OtIGVsIGNhbWJpbyBxdWVkYSBsaW1pdGFkbyDDum5pY2FtZW50ZSBhIFJlcG9ydGUgU0FTLgogKgogKiBbR0xPQkFMIENPTVBBUlRJRE8gLSBNT0RJRklDQVJDT04gUFJVRUJBIFJFR1JFU0lWQV0KICogUmVnbGFzIHVzYWRhcyBwb3IgdmFyaW9zIGNvbXBvbmVudGVzIG8gcGFudGFsbGFzLgogKiBNb2RpZmljYXIgc29sYW1lbnRlIGN1YW5kbyBlbCBjYW1iaW8gZGViYSBhcGxpY2Fyc2UgYSB0b2RvcyBlbGxvcy4KICoKICogW03Dk0RVTE8gLyBQQU5UQUxMQV0KICogUmVnbGFzIGVzcGVjw61maWNhcyBkZSB1bmEgcGFudGFsbGEuCiAqIFNpZW1wcmUgZGViZW4gY29tZW56YXIgZGVzZGUgbGEgY2xhc2UgcmHDrXogZGUgZXNlIG3Ds2R1bG8uCiAqCiAqIFtJRlJBTUUgTEVHQUNZXQogKiBSZWdsYXMgYXBsaWNhZGFzIGEgbGFzIHDDoWdpbmFzIGFudGlndWFzIGNhcmdhZGFzIG1lZGlhbnRlIGlmcmFtZS4KICogTm8gZ29iaWVybmFuIGRpcmVjdGFtZW50ZSBsb3MgY29tcG9uZW50ZXMgVnVlIG1pZ3JhZG9zLgogKgogKiBbQVJDSElWQURPIC0gSU5BQ1RJVk9dCiAqIEPDs2RpZ28gaGlzdMOzcmljbyBxdWUgbm8gcGFydGljaXBhIGFjdHVhbG1lbnRlIGRlIGxhIGludGVyZmF6LgogKiBObyByZWFjdGl2YXIgc2luIHJldmlzYXIgY29uZmxpY3RvcyB5IGVzcGVjaWZpY2lkYWQuCiAqCiAqIFZFUlNJw5NOIEFDVFVBTAogKiAtLS0tLS0tLS0tLS0tLQogKiBQYW50YWxsYXMgVnVlIG1pZ3JhZGFzOgogKiAtIEVtdWxhY2nDs24KICogLSBSZXBvcnRlIFNBUwogKiAtIFJlZ2lzdHJvIE9UcyBGYWxsaWRhcyBDVAogKgogKiBQYW50YWxsYXMgcXVlIGNvbnRpbsO6YW4gcG9yIGlmcmFtZSBsZWdhY3k6CiAqIC0gQsO6c3F1ZWRhIGRlIE9UcwogKiAtIEpvYnR5cGUtQ29udHJhdG8KICogLSBDTU8tQWN0aXZpZGFkCiAqIC0gUGFyYW1ldHJpemFjaW9uZXMKICoKICogQUJNIE1hdGVyaWFsZXMgbm8gZm9ybWEgcGFydGUgZGUgZXN0YSB2ZXJzacOzbi4KICoKICogUkVHTEEgUFJJTkNJUEFMCiAqIC0tLS0tLS0tLS0tLS0tLS0KICogTnVuY2Egc29sdWNpb25hciB1biBwcm9ibGVtYSBkZSB1bmEgc29sYSBwYW50YWxsYSBtb2RpZmljYW5kbyB1bmEgcmVnbGEKICogR0xPQkFMIENSw41USUNBIHNpIHB1ZWRlIHJlc29sdmVyc2UgZGVzZGUgbGEgY2xhc2UgcmHDrXogZGUgZXNhIHBhbnRhbGxhLgoqLwovKiA9PT0gRklOIERPQ1VNRU5UQUNJT04gR0VORVJBTCBGTS1HTE9CQUwgPT09ICov'
$header = [System.Text.Encoding]::UTF8.GetString([Convert]::FromBase64String($headerB64))

$start = '/* === INICIO DOCUMENTACION GENERAL FM-GLOBAL === */'
$end = '/* === FIN DOCUMENTACION GENERAL FM-GLOBAL === */'
$headerRx = [regex]::new([regex]::Escape($start) + '[\s\S]*?' + [regex]::Escape($end))
if (-not $headerRx.IsMatch($text)) {
  throw 'No se encontro el bloque DOCUMENTACION GENERAL FM-GLOBAL.'
}

$text = $headerRx.Replace(
  $text,
  [System.Text.RegularExpressions.MatchEvaluator]{
    param($m)
    $header
  },
  1
)

$functionalAfter = $commentRx.Replace($text, '')
if ($functionalAfter -ne $functionalBefore) {
  throw 'SEGURIDAD: se detecto un cambio fuera de comentarios. No se escribio el archivo.'
}

if ($text -eq $original) {
  Write-Host 'SIN CAMBIOS: fm-global.css ya tenia esta documentacion.' -ForegroundColor DarkYellow
  exit 0
}

[System.IO.File]::WriteAllText($fullPath, $text, $utf8NoBom)
Write-Host ''
Write-Host 'OK: comentarios reparados y documentacion general actualizada.' -ForegroundColor Green
Write-Host 'OK: reglas CSS funcionales intactas.' -ForegroundColor Green
Write-Host ''
git status --short -- $cssPath
