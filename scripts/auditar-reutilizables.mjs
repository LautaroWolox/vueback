import { existsSync, promises as fs } from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const sourceRoot = path.join(projectRoot, 'src')
const STRICT = process.argv.includes('--strict')

const TEXT_EXTENSIONS = new Set(['.vue', '.js', '.mjs', '.cjs', '.ts', '.tsx', '.jsx'])
const EXPECTED_SINGLE_IMPLEMENTATIONS = [
  'FmButton.vue',
  'FmGridPaginator.vue',
  'FmDialog.vue'
]

const ALLOWED_DIRECT_PRIME_BUTTON_IMPORTS = new Set([
  'src/components/shared/FmButton.vue',
  'src/components/CustomMenu.vue',
  'src/views/Login2faView.vue'
])

const normalizePath = (value) => value.split(path.sep).join('/')

const walkFiles = async (directory) => {
  if (!existsSync(directory)) return []

  const entries = await fs.readdir(directory, { withFileTypes: true })
  const files = await Promise.all(entries.map(async (entry) => {
    const absolutePath = path.join(directory, entry.name)
    return entry.isDirectory() ? walkFiles(absolutePath) : [absolutePath]
  }))

  return files.flat()
}

const main = async () => {
  const files = (await walkFiles(sourceRoot))
    .filter((filePath) => TEXT_EXTENSIONS.has(path.extname(filePath).toLowerCase()))

  const sources = await Promise.all(files.map(async (filePath) => ({
    filePath,
    relativePath: normalizePath(path.relative(projectRoot, filePath)),
    content: await fs.readFile(filePath, 'utf8')
  })))

  const errors = []
  const warnings = []

  EXPECTED_SINGLE_IMPLEMENTATIONS.forEach((fileName) => {
    const matches = sources.filter(({ filePath }) => path.basename(filePath) === fileName)
    if (matches.length !== 1) {
      errors.push(`${fileName}: se esperaban 1 implementación y se encontraron ${matches.length}.`)
      matches.forEach(({ relativePath }) => errors.push(`  - ${relativePath}`))
    }
  })

  const obsoleteReferences = sources.filter(({ content }) => content.includes('FmActionButton'))
  if (obsoleteReferences.length) {
    errors.push('Se encontraron referencias al botón obsoleto FmActionButton:')
    obsoleteReferences.forEach(({ relativePath }) => errors.push(`  - ${relativePath}`))
  }

  const directPrimeButtonImports = sources.filter(({ content }) => (
    /from\s+['"]primevue\/button['"]/.test(content)
  ))

  directPrimeButtonImports.forEach(({ relativePath }) => {
    if (!ALLOWED_DIRECT_PRIME_BUTTON_IMPORTS.has(relativePath)) {
      warnings.push(`Import directo de primevue/button fuera de la lista especializada: ${relativePath}`)
    }
  })

  console.log('\nAUDITORÍA DE REUTILIZABLES\n')
  console.log('Implementaciones únicas verificadas:')
  EXPECTED_SINGLE_IMPLEMENTATIONS.forEach((fileName) => console.log(`  - ${fileName}`))

  if (warnings.length) {
    console.log('\nADVERTENCIAS')
    warnings.forEach((warning) => console.log(`  - ${warning}`))
  }

  if (errors.length) {
    console.error('\nERRORES')
    errors.forEach((error) => console.error(`  ${error}`))
    process.exitCode = 1
    return
  }

  console.log('\nResultado: no hay componentes base duplicados ni referencias a FmActionButton.')

  if (STRICT && warnings.length) {
    process.exitCode = 1
  }
}

main().catch((error) => {
  console.error('No se pudo completar la auditoría de reutilizables.')
  console.error(error)
  process.exitCode = 1
})
