import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

const root = process.cwd()
const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), 'utf8')

const css = read('src/assets/css/fm-global.css')
const comments = (css.match(/\/\*[\s\S]*?\*\//g) ?? []).join('\n')

const legacyStart = '/* ===== INICIO: fm-legacy-responsive.css ===== */'
const legacyEnd = '/* ===== FIN: fm-legacy-responsive.css ===== */'
const legacyStartIndex = css.indexOf(legacyStart)
const legacyEndIndex = css.indexOf(legacyEnd)
const legacyCss = (
  legacyStartIndex >= 0 && legacyEndIndex > legacyStartIndex
    ? css.slice(legacyStartIndex, legacyEndIndex + legacyEnd.length)
    : ''
)

describe('fm-global.css - contratos críticos de regresión', () => {
  it('mantiene documentación legible en UTF-8', () => {
    expect(comments).not.toMatch(/Ã.|Â.|�/)
    expect(comments).not.toContain('HIST??RICOS')
    expect(comments).not.toContain('CLASIFICACI??N')
    expect(comments).not.toContain('VERSI??N')
  })

  it('conserva el espaciado final del menú sin comerse el margen del contenido', () => {
    expect(css).toMatch(/#app\s+\.menu-container\s+\.spacer\s*\{[\s\S]*?height:\s*8px\s*!important/)
    expect(css).toMatch(/--fm-desktop-header-height:\s*54px\s*!important/)
    expect(css).toMatch(/#app\s+\.main-home\s*\{[\s\S]*?inset:\s*54px\s+0\s+0\s*!important/)
  })

  it('conserva los submenús compactos y sin expansión accidental', () => {
    expect(css).toContain('fm-menu-submenu-compact.css')
    expect(css).toMatch(/\.fm-menu-link--submenu[\s\S]*?height:\s*28px\s*!important/)
    expect(css).toMatch(/\.fm-menu-link--submenu[\s\S]*?min-height:\s*28px\s*!important/)
    expect(css).toContain('box-shadow: inset 3px 0 0 #00a9bd !important')
  })

  it('conserva las marcas técnicas que responsiveIframes.js necesita para extraer CSS legacy', () => {
    expect(legacyStartIndex).toBeGreaterThanOrEqual(0)
    expect(legacyEndIndex).toBeGreaterThan(legacyStartIndex)
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

  it('mantiene aislados los estilos específicos de las pantallas migradas', () => {
    expect(css).toContain('.report-sas-page')
    expect(css).toContain('.ot-fallidas-ct')
    expect(css).toContain('.emulation-grid')
  })

  it('conserva archivadas las reglas históricas sin activarlas accidentalmente', () => {
    expect(css).toMatch(/fm-report-sas-fullscreen\.css[\s\S]*?@media\s+not\s+all/)
    expect(css).toMatch(/nuestros\.css[\s\S]*?@media\s+not\s+all/)
  })
})
