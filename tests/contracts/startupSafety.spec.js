import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

const mainSource = fs.readFileSync(path.resolve(process.cwd(), 'src/main.js'), 'utf8')

describe('Contrato de arranque de Field Manager', () => {
  it('monta Vue antes de cargar el responsive legacy complementario', () => {
    const mountIndex = mainSource.indexOf("app.mount('#app')")
    const responsiveImportIndex = mainSource.indexOf("import('./plugins/responsiveIframes.js')")

    expect(mountIndex).toBeGreaterThan(-1)
    expect(responsiveImportIndex).toBeGreaterThan(mountIndex)
  })

  it('aísla los errores de inicialización del responsive legacy para evitar pantalla blanca', () => {
    expect(mainSource).toContain('installResponsiveIframesSafely')
    expect(mainSource).toContain('try {')
    expect(mainSource).toContain('catch (error)')
    expect(mainSource).toContain('No se pudo inicializar el responsive legacy')
  })
})
