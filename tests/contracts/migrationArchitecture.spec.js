import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'
import { migratedScreens, releaseLegacyScreens } from './migrationRegistry'

const root = process.cwd()
const routerSource = fs.readFileSync(path.join(root, 'src/router/index.js'), 'utf8')
const modulesDirectory = path.join(root, 'src/modules')

const routeBlock = (routeName) => {
  const marker = `name: '${routeName}'`
  const markerIndex = routerSource.indexOf(marker)
  if (markerIndex < 0) throw new Error(`No se encontró la ruta ${routeName}`)

  const start = routerSource.lastIndexOf('{', markerIndex)
  if (start < 0) throw new Error(`No se pudo determinar el inicio de la ruta ${routeName}`)

  let depth = 0
  let quote = null
  let escaped = false

  for (let index = start; index < routerSource.length; index += 1) {
    const char = routerSource[index]

    if (quote) {
      if (escaped) {
        escaped = false
        continue
      }
      if (char === '\\') {
        escaped = true
        continue
      }
      if (char === quote) quote = null
      continue
    }

    if (char === "'" || char === '"' || char === '`') {
      quote = char
      continue
    }

    if (char === '{') depth += 1
    if (char === '}') {
      depth -= 1
      if (depth === 0) return routerSource.slice(start, index + 1)
    }
  }

  throw new Error(`No se pudo determinar el final de la ruta ${routeName}`)
}

describe('Arquitectura de migración de Field Manager', () => {
  it('mantiene registrados todos los módulos Vue activos de esta entrega', () => {
    const actualModules = fs.readdirSync(modulesDirectory, { withFileTypes: true })
      .filter((entry) => entry.isDirectory())
      .map((entry) => entry.name)
      .sort()

    const registeredModules = migratedScreens.map((screen) => screen.moduleDirectory).sort()

    expect(actualModules).toEqual(registeredModules)
  })

  it.each(migratedScreens)('$routeName apunta exclusivamente al módulo Vue $moduleDirectory', (screen) => {
    const block = routeBlock(screen.routeName)

    expect(block).toContain(`modules/${screen.moduleDirectory}`)
    expect(block).toContain(screen.componentFile)
    expect(block).not.toContain('IframeView.vue')
    expect(block).not.toContain('urlParam:')
  })

  it.each(releaseLegacyScreens)('$routeName permanece explícitamente en IframeView', (screen) => {
    const block = routeBlock(screen.routeName)

    expect(block).toContain('views/IframeView.vue')
    expect(block).toContain(`urlParam: '${screen.urlParam}'`)
  })

  it('no reintroduce módulos descartados accidentalmente', () => {
    const forbiddenDirectories = [
      'buscadorOts',
      'parametrizaciones',
      'gestionMateriales',
    ]

    forbiddenDirectories.forEach((directory) => {
      expect(fs.existsSync(path.join(modulesDirectory, directory))).toBe(false)
    })
  })

  it('no reintroduce ABM Materiales en router ni módulos', () => {
    expect(routerSource).not.toContain("name: 'ABMM'")
    expect(routerSource).not.toContain('abmMateriales')
  })

  it.each(migratedScreens)('$routeName conserva una clase raíz documentada para aislar estilos', (screen) => {
    const moduleRoot = path.join(modulesDirectory, screen.moduleDirectory)
    const files = []

    const walk = (directory) => {
      for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
        const target = path.join(directory, entry.name)
        if (entry.isDirectory()) walk(target)
        else if (/\.(vue|css)$/.test(entry.name)) files.push(target)
      }
    }

    walk(moduleRoot)
    const combinedSource = files.map((file) => fs.readFileSync(file, 'utf8')).join('\n')

    expect(combinedSource).toContain(screen.rootClass)
  })
})
