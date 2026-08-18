import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

const root = process.cwd()
const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), 'utf8')

const css = read('src/assets/css/fm-global.css')
const commentBlocks = css.match(/\/\*[\s\S]*?\*\//g) ?? []
const comments = commentBlocks.join('\n')

const legacyStart = '/* ===== INICIO: fm-legacy-responsive.css ===== */'
const legacyEnd = '/* ===== FIN: fm-legacy-responsive.css ===== */'
const legacyStartIndex = css.indexOf(legacyStart)
const legacyEndIndex = css.indexOf(legacyEnd)
const legacyCss = (
  legacyStartIndex >= 0 && legacyEndIndex > legacyStartIndex
    ? css.slice(legacyStartIndex, legacyEndIndex + legacyEnd.length)
    : ''
)

const suspiciousCommentLines = comments
  .split(/\r?\n/)
  .map((line) => line.trim())
  .filter(Boolean)
  .filter((line) => /Ã.|Â.|�|\?\?/.test(line))

const countMatches = (source, expression) => source.match(expression)?.length ?? 0

describe('fm-global.css - contratos críticos de regresión', () => {
  it('mantiene todos los comentarios legibles y correctamente codificados en UTF-8', () => {
    expect(
      suspiciousCommentLines,
      `Se encontraron comentarios con codificación inválida:\n${suspiciousCommentLines.slice(0, 20).join('\n')}`,
    ).toEqual([])
  })

  it('conserva el espaciado final del menú sin comerse el margen del contenido', () => {
    expect(css).toMatch(/#app\s+\.menu-container\s+\.spacer\s*\{[\s\S]*?height:\s*8px\s*!important/)
    expect(css).toMatch(/--fm-desktop-header-height:\s*54px\s*!important/)
    expect(css).toMatch(/#app\s+\.main-home\s*\{[\s\S]*?inset:\s*54px\s+0\s+0\s*!important/)
  })

  it('conserva los submenús compactos y su separación visual', () => {
    expect(css).toContain('.fm-menu-link--submenu')
    expect(css).toMatch(/\.fm-menu-link--submenu[\s\S]*?min-height:\s*(?:28|32)px\s*!important/)
    expect(css).toContain('background: #fff !important')
    expect(css).toContain('#00a9bd')
  })

  it('conserva exactamente las marcas técnicas que responsiveIframes.js usa en runtime', () => {
    expect(legacyStartIndex).toBeGreaterThanOrEqual(0)
    expect(legacyEndIndex).toBeGreaterThan(legacyStartIndex)
    expect(countMatches(css, /\/\* ===== INICIO: fm-legacy-responsive\.css ===== \*\//g)).toBe(1)
    expect(countMatches(css, /\/\* ===== FIN: fm-legacy-responsive\.css ===== \*\//g)).toBe(1)
  })

  it('mantiene el bloque responsive de iframe legacy separado de Vue', () => {
    expect(legacyCss).toContain('body.fm-responsive-legacy')
    expect(legacyCss).toContain('overflow-x: hidden !important')
    expect(legacyCss).toMatch(/\.ui-datatable-tablewrapper[\s\S]*?overflow-x:\s*auto\s*!important/)
    expect(legacyCss).toMatch(/\.ui-dialog[\s\S]*?max-width:\s*calc\(100dvw - 24px\)\s*!important/)
  })

  it('mantiene la grilla compartida con fila de filtros visible y resize activo', () => {
    expect(css).toContain('.p-datatable-filter-row')
    expect(css).toContain('display: table-row !important')
    expect(css).toContain('visibility: visible !important')
    expect(css).toContain('cursor: col-resize !important')
  })

  it('mantiene aislados los estilos específicos de las pantallas Vue migradas', () => {
    expect(css).toContain('.report-sas-page')
    expect(css).toContain('.ot-fallidas-ct')
    expect(css).toMatch(/\.emulation-(?:page|grid)/)
  })

  it('conserva las implementaciones archivadas dentro de @media not all', () => {
    expect(css).toMatch(/(?:PANTALLA COMPLETA ARCHIVADA|fm-report-sas-fullscreen\.css)[\s\S]{0,1400}?@media\s+not\s+all/)
    expect(css).toMatch(/(?:ORIGEN:\s*)?nuestros\.css[\s\S]{0,1400}?@media\s+not\s+all/)
    expect(countMatches(css, /@media\s+not\s+all/g)).toBeGreaterThanOrEqual(2)
  })
})
