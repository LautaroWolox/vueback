import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

const root = process.cwd()
const globalCssPath = path.join(root, 'src/assets/css/fm-global.css')
const menuVideoPath = path.join(root, 'src/assets/css/fm-menu-video.css')
const mainPath = path.join(root, 'src/main.js')

const globalCss = fs.readFileSync(globalCssPath, 'utf8')
const mainSource = fs.readFileSync(mainPath, 'utf8')

describe('Consolidación de estilos globales', () => {
  it('mantiene fm-menu-video.css consolidado dentro de fm-global.css', () => {
    expect(globalCss).toContain('/* ===== INICIO: fm-menu-video.css ===== */')
    expect(globalCss).toContain('/* ===== FIN: fm-menu-video.css ===== */')
    expect(globalCss).toContain('#app .main-menu.p-menubar')
    expect(fs.existsSync(menuVideoPath)).toBe(false)
    expect(mainSource).not.toContain("import './assets/css/fm-menu-video.css'")
  })

  it('conserva intactos los marcadores usados por el responsive legacy', () => {
    expect(globalCss).toContain('/* ===== INICIO: fm-legacy-responsive.css ===== */')
    expect(globalCss).toContain('/* ===== FIN: fm-legacy-responsive.css ===== */')
  })
})
