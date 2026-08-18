import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

const root = process.cwd()
const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), 'utf8')

const css = read('src/assets/css/fm-global.css')
const comments = (css.match(/\/\*[\s\S]*?\*\//g) ?? []).join('\n')

const section = (name) => {
  const start = `/* ===== INICIO: ${name} ===== */`
  const end = `/* ===== FIN: ${name} ===== */`
  const startIndex = css.indexOf(start)
  const endIndex = css.indexOf(end)
  if (startIndex < 0 || endIndex < 0 || endIndex <= startIndex) {
    throw new Error(`No se encontró completa la sección ${name}`)
  }
  return css.slice(startIndex, endIndex + end.length)
}

describe('fm-global.css - contratos críticos de regresión', () => {
  it('mantiene documentación legible en UTF-8', () => {
    expect(comments).not.toMatch(/Ã.|Â.|�/)
    expect(comments).not.toContain('HIST??RICOS')
    expect(comments).not.toContain('CLASIFICACI??N')
    expect(comments).not.toContain('VERSI??N')
  })

  it('conserva el espaciado final del menú sin comerse el margen del contenido', () => {
    const menuSpacing = section('fm-menu-spacing.css')

    expect(menuSpacing).toMatch(/#app\s+\.menu-container\s+\.spacer\s*\{[\s\S]*?height:\s*8px\s*!important/)
    expect(menuSpacing).toMatch(/--fm-desktop-header-height:\s*54px\s*!important/)
    expect(menuSpacing).toMatch(/\.main-home\s*\{[\s\S]*?inset:\s*54px\s+0\s+0\s*!important/)
  })

  it('conserva los submenús compactos y sin expansión accidental', () => {
    const submenu = section('fm-menu-submenu-compact.css')

    expect(submenu).toMatch(/height:\s*28px\s*!important/)
    expect(submenu).toMatch(/min-height:\s*28px\s*!important/)
    expect(submenu).toContain('background: #fff !important')
    expect(submenu).toContain('box-shadow: inset 3px 0 0 #00a9bd !important')
  })

  it('mantiene el bloque responsive de iframe legacy separado de Vue', () => {
    const legacy = section('fm-legacy-responsive.css')

    expect(legacy).toContain('body.fm-responsive-legacy')
    expect(legacy).toContain('overflow-x: hidden !important')
    expect(legacy).toMatch(/\.ui-datatable-tablewrapper[\s\S]*?overflow-x:\s*auto\s*!important/)
    expect(legacy).toMatch(/\.ui-dialog[\s\S]*?max-width:\s*calc\(100dvw - 24px\)\s*!important/)
  })

  it('mantiene la grilla compartida con fila de filtros visible', () => {
    const resize = section('fm-grid-resize.css')

    expect(resize).toContain('.p-datatable-filter-row')
    expect(resize).toContain('display: table-row !important')
    expect(resize).toContain('visibility: visible !important')
    expect(resize).toContain('cursor: col-resize !important')
  })

  it('mantiene aislados los estilos específicos de las pantallas migradas', () => {
    expect(css).toContain('.report-sas-page')
    expect(css).toContain('.ot-fallidas-ct')
    expect(css).toContain('.emulation-grid')
  })

  it('conserva archivadas las reglas históricas que no deben participar de la cascada', () => {
    expect(section('fm-report-sas-fullscreen.css')).toContain('@media not all')
    expect(section('nuestros.css')).toContain('@media not all')
  })
})
