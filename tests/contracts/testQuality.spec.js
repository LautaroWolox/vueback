import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

const root = process.cwd()
const testsRoot = path.join(root, 'tests')

const walk = (directory) => fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
  const target = path.join(directory, entry.name)
  return entry.isDirectory() ? walk(target) : [target]
})

const specFiles = walk(testsRoot).filter((file) => /\.(spec|test)\.(js|ts|jsx|tsx)$/.test(file))
const relative = (file) => path.relative(root, file).replaceAll('\\', '/')

describe('Calidad de la suite automática', () => {
  it('mantiene separadas las capas unit, integration y contracts', () => {
    const paths = specFiles.map(relative)

    expect(paths.some((file) => file.startsWith('tests/unit/'))).toBe(true)
    expect(paths.some((file) => file.startsWith('tests/integration/'))).toBe(true)
    expect(paths.some((file) => file.startsWith('tests/contracts/'))).toBe(true)
  })

  it('no deja tests deshabilitados con .skip u .only dentro de la suite', () => {
    const offenders = specFiles.flatMap((file) => {
      const source = fs.readFileSync(file, 'utf8')
      return /\b(?:describe|it|test)\.(?:skip|only)\s*\(/.test(source) ? [relative(file)] : []
    })

    expect(offenders, `Tests deshabilitados o exclusivos: ${offenders.join(', ')}`).toEqual([])
  })

  it('cada spec contiene al menos una aserción', () => {
    const offenders = specFiles.flatMap((file) => {
      const source = fs.readFileSync(file, 'utf8')
      return /\bexpect\s*\(/.test(source) ? [] : [relative(file)]
    })

    expect(offenders, `Specs sin expect(): ${offenders.join(', ')}`).toEqual([])
  })

  it('no mantiene el ejemplo genérico de Cypress como única prueba e2e', () => {
    const example = path.join(root, 'cypress/e2e/example.cy.js')
    if (!fs.existsSync(example)) return

    const source = fs.readFileSync(example, 'utf8')
    expect(source.toLowerCase()).not.toContain('example domain')
  })
})
