import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

const root = process.cwd()
const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), 'utf8')

const css = read('src/assets/css/fm-global.css')
const commentBlocks = css.match(/\/\*[\s\S]*?\*\//g) ?? []
const comments = commentBlocks.join('\n')
const cssWithoutComments = css.replace(/\/\*[\s\S]*?\*\//g, '')

const legacyStart = '/* ===== INICIO: fm-legacy-responsive.css ===== */'
const legacyEnd = '/* ===== FIN: fm-legacy-responsive.css ===== */'
const legacyStartIndex = css.indexOf(legacyStart)
const legacyEndIndex = css.indexOf(legacyEnd)
const legacyCss = (
  legacyStartIndex >= 0 && legacyEndIndex > legacyStartIndex
    ? css.slice(legacyStartIndex, legacyEndIndex + legacyEnd.length)
    : ''
)

const countMatches = (source, expression) => source.match(expression)?.length ?? 0

describe('fm-global.css - contratos funcionales de regresión', () => {
  it('no contiene corrupción de encoding dentro de reglas CSS ejecutables', () => {
    expect(cssWithoutComments).not.toMatch(/Ã.|Â.|�/)
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

  it('mantiene consumible por runtime el bloque responsive de iframe legacy', () => {
    expect(
      legacyStartIndex,
      'Falta la marca exacta de INICIO que responsiveIframes.js consume en runtime',
    ).toBeGreaterThanOrEqual(0)
    expect(
      legacyEndIndex,
      'Falta la marca exacta de FIN que responsiveIframes.js consume en runtime',
    ).toBeGreaterThan(legacyStartIndex)
    expect(countMatches(css, /\/\* ===== INICIO: fm-legacy-responsive\.css ===== \*\//g)).toBe(1)
    expect(countMatches(css, /\/\* ===== FIN: fm-legacy-responsive\.css ===== \*\//g)).toBe(1)
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

  it('conserva las implementaciones históricas inactivas dentro de @media not all', () => {
    const archivedBlocks = countMatches(css, /@media\s+not\s+all/g)
    const archivedReferences = countMatches(comments, /ARCHIVAD[OA]|INACTIV[OA]/gi)

    expect(archivedBlocks).toBeGreaterThanOrEqual(2)
    expect(archivedReferences).toBeGreaterThanOrEqual(2)
  })

  it('mantiene las clases base de loader y grillas compartidas', () => {
    expect(css).toContain('.fm-grid-shell')
    expect(css).toContain('.fm-custom-paginator')
    expect(css).toMatch(/\.fm-(?:loader|typing-loader|grid-loader)/)
  })
})
