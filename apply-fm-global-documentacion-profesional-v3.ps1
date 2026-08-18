$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest

$cssPath = 'src/assets/css/fm-global.css'
if (-not (Test-Path $cssPath)) {
  throw "No existe $cssPath. Ejecutar desde la raíz del proyecto."
}

$dirty = @(git status --porcelain -- $cssPath)
if ($dirty.Count -gt 0) {
  Write-Host ''
  Write-Host 'ABORTADO: fm-global.css ya tiene cambios locales.' -ForegroundColor Yellow
  Write-Host 'No se sobrescribió nada.' -ForegroundColor Yellow
  git status --short -- $cssPath
  exit 1
}

Write-Host ''
Write-Host 'FM-GLOBAL - DOCUMENTACIÓN PROFESIONAL COMPLETA' -ForegroundColor Cyan
Write-Host '------------------------------------------------' -ForegroundColor Cyan
Write-Host 'Se modificarán ÚNICAMENTE comentarios.' -ForegroundColor Yellow
Write-Host 'Las reglas CSS, selectores y valores funcionales deben quedar idénticos.' -ForegroundColor Yellow
Write-Host ''

$fullPath = (Resolve-Path $cssPath).Path
$utf8NoBom = New-Object System.Text.UTF8Encoding($false)
$utf8Strict = New-Object System.Text.UTF8Encoding($false, $true)
$commentRx = [regex]::new('/\*[\s\S]*?\*/')

$original = [System.IO.File]::ReadAllText($fullPath, [System.Text.Encoding]::UTF8)
$functionalBefore = $commentRx.Replace($original, '')

function Get-Cp1252Byte([char]$c) {
  $code = [int]$c
  if ($code -le 255) { return [byte]$code }

  $map = @{
    0x20AC = 0x80; 0x201A = 0x82; 0x0192 = 0x83; 0x201E = 0x84
    0x2026 = 0x85; 0x2020 = 0x86; 0x2021 = 0x87; 0x02C6 = 0x88
    0x2030 = 0x89; 0x0160 = 0x8A; 0x2039 = 0x8B; 0x0152 = 0x8C
    0x017D = 0x8E; 0x2018 = 0x91; 0x2019 = 0x92; 0x201C = 0x93
    0x201D = 0x94; 0x2022 = 0x95; 0x2013 = 0x96; 0x2014 = 0x97
    0x02DC = 0x98; 0x2122 = 0x99; 0x0161 = 0x9A; 0x203A = 0x9B
    0x0153 = 0x9C; 0x017E = 0x9E; 0x0178 = 0x9F
  }

  if ($map.ContainsKey($code)) { return [byte]$map[$code] }
  return $null
}

function Repair-MojibakeOnce([string]$value) {
  $sb = New-Object System.Text.StringBuilder
  $i = 0

  while ($i -lt $value.Length) {
    $firstCode = [int][char]$value[$i]
    $done = $false

    if (($firstCode -eq 0x00C3 -or $firstCode -eq 0x00C2) -and ($i + 1 -lt $value.Length)) {
      $b2 = Get-Cp1252Byte $value[$i + 1]
      if ($null -ne $b2) {
        try {
          $bytes = [byte[]]@([byte]$firstCode, [byte]$b2)
          $decoded = $utf8Strict.GetString($bytes)
          [void]$sb.Append($decoded)
          $i += 2
          $done = $true
        } catch {}
      }
    }

    if (-not $done -and $firstCode -eq 0x00E2 -and ($i + 2 -lt $value.Length)) {
      $b2 = Get-Cp1252Byte $value[$i + 1]
      $b3 = Get-Cp1252Byte $value[$i + 2]
      if ($null -ne $b2 -and $null -ne $b3) {
        try {
          $bytes = [byte[]]@([byte]0xE2, [byte]$b2, [byte]$b3)
          $decoded = $utf8Strict.GetString($bytes)
          [void]$sb.Append($decoded)
          $i += 3
          $done = $true
        } catch {}
      }
    }

    if (-not $done) {
      [void]$sb.Append($value[$i])
      $i++
    }
  }

  return $sb.ToString()
}

function Repair-MojibakeComment([string]$value) {
  $current = $value
  for ($pass = 0; $pass -lt 3; $pass++) {
    $next = Repair-MojibakeOnce $current
    if ($next -ceq $current) { break }
    $current = $next
  }
  return $current
}

function New-Metadata(
  [string]$component,
  [string]$classification,
  [string]$scope,
  [string]$responsibility,
  [string]$maintenance
) {
  [pscustomobject]@{
    Component = $component
    Classification = $classification
    Scope = $scope
    Responsibility = $responsibility
    Maintenance = $maintenance
  }
}

function Get-SectionMetadata([string]$name) {
  switch -Regex ($name) {
    '^fm-global\.css$' {
      return New-Metadata 'Base visual global' 'GLOBAL CRÍTICO' 'Toda la aplicación Vue.' 'Variables de diseño, estructura base, formularios, botones, grillas, diálogos, calendario, loader y estilos PrimeVue compartidos.' 'Modificar únicamente cuando el cambio sea transversal. Para una pantalla puntual, trabajar bajo su clase raíz.'
    }
    '^fm-grid-resize\.css$' {
      return New-Metadata 'Grillas compartidas - redimensionamiento' 'GLOBAL COMPARTIDO' 'DataTable que utilizan las clases fm-pass-grid o fm-pt-datatable; incluye ajustes dirigidos a OTs Fallidas, Emulación y Reporte SAS.' 'Fila de filtros, redimensionamiento de columnas, cursores y estados visuales de filas.' 'Validar todas las grillas consumidoras. Los selectores específicos deben permanecer acotados a su pantalla.'
    }
    '^fm-responsive\.css$' {
      return New-Metadata 'Responsive global' 'GLOBAL CRÍTICO' 'Layout, formularios, grillas, diálogos, paginadores y contenedores responsive.' 'Sistema responsive general y puntos de quiebre de la aplicación Vue.' 'No corregir una sola pantalla desde este bloque; usar la clase raíz del módulo dentro de su sección específica.'
    }
    '^fm-legacy-responsive\.css$' {
      return New-Metadata 'Responsive de iframe legacy' 'IFRAME LEGACY' 'Páginas antiguas cargadas mediante IframeView o DetalleView.' 'Adaptación de formularios, tablas, paginadores, diálogos, scroll y uso táctil dentro del documento legacy.' 'Este bloque se inyecta dentro del iframe. No utilizarlo para componentes Vue migrados.'
    }
    '^fm-menu-responsive\.css$' {
      return New-Metadata 'Menú principal - responsive' 'GLOBAL CRÍTICO' 'Navegación principal en notebook, tablet y móvil.' 'Apertura, posición y tamaño del menú y submenús, controles táctiles y scroll.' 'Cualquier cambio exige prueba regresiva del menú completo en escritorio, notebook y móvil.'
    }
    '^fm-menu-tuning\.css$' {
      return New-Metadata 'Menú principal - ajustes visuales' 'GLOBAL CRÍTICO' 'Cabecera, menú principal, submenús y sector de usuario.' 'Apariencia del menú, perfil, cierre de sesión, estados activos, hover, bordes, sombras y franja decorativa.' 'No utilizar este bloque para ajustar contenido interno de una pantalla.'
    }
    '^fm-menu-spacing\.css$' {
      return New-Metadata 'Menú principal - espaciado y área de contenido' 'GLOBAL CRÍTICO' 'Todas las rutas dentro del layout principal.' 'Altura efectiva de cabecera, separación inferior y cálculo del área útil de contenido.' 'Modificar estos valores desplaza todas las pantallas; validar el layout completo.'
    }
    '^fm-menu-submenu-compact\.css$' {
      return New-Metadata 'Menú principal - submenús compactos' 'GLOBAL CRÍTICO' 'Todos los paneles desplegables y submenús anidados.' 'Fondo, altura de filas, tipografía, divisores y estado al pasar el cursor.' 'Mantener el orden de esta sección para evitar que PrimeVue sobrescriba el ajuste final.'
    }
    '^fm-report-sas-auto-height\.css$' {
      return New-Metadata 'Reporte SAS - altura de grilla' 'MÓDULO / PANTALLA' 'Reporte SAS.' 'Uso del alto disponible, crecimiento de la grilla y control del scroll interno.' 'Los cambios deben permanecer bajo .report-sas-page, .report-sas-grid-shell o .report-sas-grid.'
    }
    '^fm-report-sas-fullscreen\.css$' {
      return New-Metadata 'Reporte SAS - pantalla completa archivada' 'ARCHIVADO / INACTIVO' 'Implementación histórica de Reporte SAS.' 'Conservar una referencia de la implementación anterior de pantalla completa.' 'No reactivar ni retirar @media not all sin una revisión específica de regresión.'
    }
    '^fm-select\.css$' {
      return New-Metadata 'Select y MultiSelect compartidos' 'GLOBAL COMPARTIDO' 'Select y MultiSelect PrimeVue utilizados por distintas pantallas.' 'Panel desplegable, opciones, selección, foco, estados deshabilitados y adaptación táctil.' 'Para un selector puntual, crear una regla bajo la clase raíz del módulo.'
    }
    '^fm-grid-empty-state\.css$' {
      return New-Metadata 'Grillas compartidas - estado vacío' 'GLOBAL COMPARTIDO' 'Todas las grillas que utilizan el mensaje compartido sin resultados.' 'Altura, color, alineación y compatibilidad de la fila vacía de DataTable.' 'Un cambio se refleja en múltiples tablas; validar OTs Fallidas y Reporte SAS como mínimo.'
    }
    '^fm-desktop-notebook-responsive\.css$' {
      return New-Metadata 'Layout de escritorio y notebook' 'GLOBAL CRÍTICO' 'Resoluciones de escritorio y notebook, especialmente 1920x1080, 1366x768, 1280x720 y 1024x768.' 'Altura útil, viewport, scroll y adaptación general de tablas, filtros y diálogos.' 'Modificar únicamente para necesidades transversales verificadas en todas las resoluciones objetivo.'
    }
    '^fm-desktop-notebook-modules\.css$' {
      return New-Metadata 'Ajustes de módulos en escritorio y notebook' 'MULTI-MÓDULO' 'Reglas de altura y flex que históricamente alcanzan módulos migrados y módulos que hoy se resuelven por legacy.' 'Compatibilidad de medidas históricas, expansión de grillas y comportamiento en notebook.' 'Antes de modificar un selector, verificar si corresponde a una pantalla vigente o a código histórico fuera de esta entrega.'
    }
    '^nuestros\.css$' {
      return New-Metadata 'Estilos globales históricos' 'ARCHIVADO / INACTIVO' 'Reglas antiguas de PrimeVue, botones y menú.' 'Conservar código histórico sin participar de la cascada actual.' 'No activar. Sus selectores entrarían en conflicto con el sistema visual vigente.'
    }
    '^abm-materiales.*\.css$' {
      return New-Metadata 'ABM Materiales - estilos históricos' 'FUERA DE ESTA VERSIÓN' 'ABM Materiales no forma parte de esta entrega.' 'Conservar temporalmente selectores históricos mientras se define su futura implementación.' 'No utilizar como referencia para nuevas pantallas ni promover estas reglas a globales.'
    }
    '^(jobtype|parametrizaciones|cmo).*\.css$' {
      return New-Metadata 'Parametrizaciones Jobtype / CMO - estilos históricos' 'FUERA DE ESTA VERSIÓN' 'Jobtype-Contrato y CMO-Actividad se resuelven por iframe legacy en esta entrega.' 'Conservar temporalmente estilos de la migración descartada para trazabilidad y posible reutilización futura.' 'No modificar para resolver la pantalla legacy actual; el responsive legacy se mantiene en su sección específica.'
    }
    '(buscador|busqueda-ots)' {
      return New-Metadata 'Búsqueda de OTs - estilos históricos' 'FUERA DE ESTA VERSIÓN' 'Búsqueda de OTs se resuelve por iframe legacy en esta entrega.' 'Conservar temporalmente estilos de la versión Vue anterior sin considerarlos parte activa del módulo.' 'No utilizar estos selectores para corregir el iframe; usar la sección de responsive legacy.'
    }
    '(ot-fallidas|otfallidas|otf-)' {
      return New-Metadata 'Registro OTs Fallidas CT' 'MÓDULO / PANTALLA' 'Registro OTs Fallidas CT.' 'Estilos específicos de su grilla, filtros, selección, acciones, sticky y comportamiento de pantalla.' 'Mantener las reglas bajo .ot-fallidas-ct, .otf-grid o identificadores propios de la pantalla.'
    }
    '(emulacion|emulation)' {
      return New-Metadata 'Emulación' 'MÓDULO / PANTALLA' 'Pantalla migrada de Emulación.' 'Estilos específicos de la grilla, paneles y elementos visuales propios del flujo de emulación.' 'Mantener las reglas bajo las clases raíz de Emulación; no trasladarlas a bloques globales.'
    }
    '(reporte-sas|report-sas)' {
      return New-Metadata 'Reporte SAS' 'MÓDULO / PANTALLA' 'Pantalla migrada de Reporte SAS.' 'Estilos específicos de grilla, altura, filtros, sticky y distribución del reporte.' 'Mantener las reglas bajo .report-sas-page y clases propias de Reporte SAS.'
    }
    default {
      $label = [System.IO.Path]::GetFileNameWithoutExtension($name) -replace '^fm-', '' -replace '-', ' '
      return New-Metadata $label 'SECCIÓN ESPECÍFICA' 'Selectores contenidos en esta sección.' 'Agrupar una responsabilidad visual concreta dentro de fm-global.css.' 'Revisar sus clases raíz antes de modificar. No ampliar el alcance a nivel global sin una necesidad transversal.'
    }
  }
}

function New-SectionDocumentation([string]$name, $meta) {
@"
/* ===== COMPONENTE: $($meta.Component.ToUpperInvariant()) | ORIGEN: $name ===== */
/*
 * CLASIFICACIÓN: [$($meta.Classification)]
 * ALCANCE: $($meta.Scope)
 * RESPONSABILIDAD: $($meta.Responsibility)
 * MANTENIMIENTO: $($meta.Maintenance)
 */
"@
}

# 1) Reparar únicamente comentarios con mojibake.
$text = $commentRx.Replace(
  $original,
  [System.Text.RegularExpressions.MatchEvaluator]{ param($m) Repair-MojibakeComment $m.Value }
)

# 2) Documentación general profesional y explícita sobre alcance.
$generalHeader = @'
/* === INICIO DOCUMENTACIÓN GENERAL FM-GLOBAL === */
/*
 * GUÍA DE MANTENIMIENTO DE FM-GLOBAL.CSS
 * ======================================
 *
 * OBJETIVO
 * --------
 * Este archivo centraliza estilos compartidos y estilos específicos de las
 * pantallas de Field Manager. Centralizar no significa que todas las reglas
 * deban ser globales: cada selector debe conservar el menor alcance posible.
 *
 * REGLA DE ALCANCE
 * ----------------
 * Si un cambio corresponde a una sola pantalla, debe comenzar desde la clase
 * raíz de esa pantalla. No modificar una regla GLOBAL CRÍTICA para resolver
 * un problema local si puede acotarse al módulo.
 *
 * Ejemplo correcto:
 * .report-sas-page .p-datatable-thead > tr > th { position: sticky; }
 *
 * De esta forma el cambio queda limitado a Reporte SAS y no afecta el resto
 * de las grillas de la aplicación.
 *
 * CLASIFICACIONES
 * ---------------
 * [GLOBAL CRÍTICO]
 *   Afecta a toda la aplicación o a una infraestructura visual transversal.
 *   Requiere prueba regresiva de las pantallas principales antes de integrarse.
 *
 * [GLOBAL COMPARTIDO]
 *   Es utilizado por varios componentes. Debe modificarse únicamente cuando
 *   el comportamiento nuevo corresponda a todos sus consumidores.
 *
 * [MÓDULO / PANTALLA]
 *   Está limitado a una pantalla concreta mediante su clase raíz o selectores
 *   propios. Es el lugar preferido para ajustes visuales específicos.
 *
 * [IFRAME LEGACY]
 *   Se aplica a páginas antiguas cargadas mediante iframe. No debe utilizarse
 *   para corregir componentes Vue migrados.
 *
 * [ARCHIVADO / INACTIVO]
 *   Se conserva únicamente como referencia histórica y no participa de la UI.
 *
 * [FUERA DE ESTA VERSIÓN]
 *   Corresponde a una migración o módulo que no forma parte de esta entrega.
 *   Se conserva temporalmente para trazabilidad, sin considerarlo código activo.
 *
 * VERSIÓN ACTUAL
 * --------------
 * Pantallas Vue migradas:
 *   - Emulación.
 *   - Reporte SAS.
 *   - Registro OTs Fallidas CT.
 *
 * Pantallas que continúan mediante iframe legacy:
 *   - Búsqueda de OTs.
 *   - Jobtype-Contrato.
 *   - CMO-Actividad.
 *   - Resto de pantallas legacy no migradas.
 *
 * ABM Materiales no forma parte de esta versión.
 *
 * CRITERIO DE MANTENIMIENTO
 * ------------------------
 * Antes de modificar una sección, revisar su encabezado: COMPONENTE,
 * CLASIFICACIÓN, ALCANCE, RESPONSABILIDAD y MANTENIMIENTO indican el impacto
 * esperado. Los nombres de clases, APIs y componentes de terceros se conservan
 * en su denominación técnica original cuando corresponde.
 */
/* === FIN DOCUMENTACIÓN GENERAL FM-GLOBAL === */
'@

$generalRx = [regex]::new(
  '/\* === INICIO DOCUMENTACI(?:O|Ó)N GENERAL FM-GLOBAL === \*/[\s\S]*?/\* === FIN DOCUMENTACI(?:O|Ó)N GENERAL FM-GLOBAL === \*/'
)
if (-not $generalRx.IsMatch($text)) {
  throw 'No se encontró el bloque de documentación general esperado.'
}
$text = $generalRx.Replace($text, $generalHeader.TrimEnd(), 1)

# 3) Reescribir/insertar la documentación de TODAS las secciones concatenadas.
$sectionRx = [regex]::new(
  '(?ms)^/\* ===== INICIO: (?<name>[^*\r\n]+?) ===== \*/\r?\n(?:/\* --- INICIO DOCUMENTACION DE SECCION --- \*/\r?\n/\*[\s\S]*?\*/\r?\n/\* --- FIN DOCUMENTACION DE SECCION --- \*/\r?\n)?'
)

$sectionNames = New-Object System.Collections.Generic.List[string]
$text = $sectionRx.Replace(
  $text,
  [System.Text.RegularExpressions.MatchEvaluator]{
    param($m)
    $name = $m.Groups['name'].Value.Trim()
    [void]$sectionNames.Add($name)
    $meta = Get-SectionMetadata $name
    return (New-SectionDocumentation $name $meta)
  }
)

# 4) Normalizar títulos de cierre sin alterar contenido funcional.
$endRx = [regex]::new('(?m)^/\* ===== FIN: (?<name>[^*\r\n]+?) ===== \*/$')
$text = $endRx.Replace(
  $text,
  [System.Text.RegularExpressions.MatchEvaluator]{
    param($m)
    $name = $m.Groups['name'].Value.Trim()
    $meta = Get-SectionMetadata $name
    return "/* ===== FIN COMPONENTE: $($meta.Component.ToUpperInvariant()) | ORIGEN: $name ===== */"
  }
)

# 5) Mejoras terminológicas solo dentro de comentarios narrativos.
$text = $commentRx.Replace(
  $text,
  [System.Text.RegularExpressions.MatchEvaluator]{
    param($m)
    $c = $m.Value
    $c = $c -replace '\bPopup\b', 'Diálogo'
    $c = $c -replace '\bpopups\b', 'diálogos'
    $c = $c -replace '\bfullscreen\b', 'pantalla completa'
    $c = $c -replace '\bresize\b', 'redimensionamiento'
    $c = $c -replace '\btemplates\b', 'plantillas'
    $c = $c -replace '\brama main\b', 'rama principal'
    return $c
  }
)

# 6) Garantía: fuera de comentarios, el CSS debe ser byte-lógicamente equivalente.
$functionalAfter = $commentRx.Replace($text, '')
if ($functionalAfter -cne $functionalBefore) {
  throw 'SEGURIDAD: se detectó una modificación fuera de comentarios. No se escribió el archivo.'
}

[System.IO.File]::WriteAllText($fullPath, $text, $utf8NoBom)

Write-Host "OK: se documentaron $($sectionNames.Count) secciones de fm-global.css." -ForegroundColor Green
Write-Host 'OK: se reparó la codificación de los comentarios.' -ForegroundColor Green
Write-Host 'OK: todos los encabezados explican componente, alcance y mantenimiento.' -ForegroundColor Green
Write-Host 'OK: las reglas CSS funcionales quedaron intactas.' -ForegroundColor Green
Write-Host ''
Write-Host 'Revisar ahora:' -ForegroundColor Yellow
Write-Host '  git status --short -- src/assets/css/fm-global.css'
Write-Host '  git diff -- src/assets/css/fm-global.css'
Write-Host '  npm run build'
Write-Host ''
Write-Host 'SIN COMMIT NI PUSH.' -ForegroundColor Cyan
