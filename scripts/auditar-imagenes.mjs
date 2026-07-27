import { existsSync, promises as fs } from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url))
const projectRoot = path.resolve(scriptDirectory, '..')
const imagesDirectory = path.join(projectRoot, 'src', 'assets', 'images')
const sourceDirectories = [
  path.join(projectRoot, 'src'),
  path.join(projectRoot, 'public')
].filter(existsSync)

const IMAGE_EXTENSIONS = new Set([
  '.png',
  '.jpg',
  '.jpeg',
  '.gif',
  '.webp',
  '.svg',
  '.ico',
  '.avif'
])

const TEXT_EXTENSIONS = new Set([
  '.vue',
  '.js',
  '.mjs',
  '.cjs',
  '.ts',
  '.tsx',
  '.jsx',
  '.css',
  '.scss',
  '.sass',
  '.less',
  '.html',
  '.json',
  '.md'
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

const readSourceFiles = async () => {
  const sourceFiles = (await Promise.all(sourceDirectories.map(walkFiles)))
    .flat()
    .filter((filePath) => TEXT_EXTENSIONS.has(path.extname(filePath).toLowerCase()))

  return Promise.all(sourceFiles.map(async (filePath) => ({
    filePath,
    relativePath: normalizePath(path.relative(projectRoot, filePath)),
    content: await fs.readFile(filePath, 'utf8')
  })))
}

const findReferences = (imagePath, sourceFiles) => {
  const fileName = path.basename(imagePath)
  const relativeFromSrc = normalizePath(path.relative(path.join(projectRoot, 'src'), imagePath))
  const relativeFromProject = normalizePath(path.relative(projectRoot, imagePath))
  const aliases = new Set([
    fileName,
    relativeFromSrc,
    relativeFromProject,
    `@/${relativeFromSrc}`,
    `/${relativeFromProject}`
  ])

  return sourceFiles
    .filter(({ filePath, content }) => (
      path.resolve(filePath) !== path.resolve(imagePath) &&
      [...aliases].some((alias) => alias && content.includes(alias))
    ))
    .map(({ relativePath }) => relativePath)
}

const main = async () => {
  if (!existsSync(imagesDirectory)) {
    console.log('No existe la carpeta src/assets/images.')
    return
  }

  const [allImageFiles, sourceFiles] = await Promise.all([
    walkFiles(imagesDirectory),
    readSourceFiles()
  ])

  const imageFiles = allImageFiles
    .filter((filePath) => IMAGE_EXTENSIONS.has(path.extname(filePath).toLowerCase()))
    .sort((left, right) => left.localeCompare(right))

  if (!imageFiles.length) {
    console.log('La carpeta src/assets/images no contiene imágenes auditables.')
    return
  }

  const results = imageFiles.map((imagePath) => ({
    image: normalizePath(path.relative(projectRoot, imagePath)),
    references: findReferences(imagePath, sourceFiles)
  }))

  const used = results.filter(({ references }) => references.length > 0)
  const unused = results.filter(({ references }) => references.length === 0)

  console.log('\nAUDITORÍA DE IMÁGENES\n')

  results.forEach(({ image, references }) => {
    const state = references.length ? 'USADA' : 'SIN REFERENCIAS'
    console.log(`[${state}] ${image}`)
    references.forEach((reference) => console.log(`  - ${reference}`))
  })

  console.log('\nRESUMEN')
  console.log(`  Imágenes encontradas: ${results.length}`)
  console.log(`  Imágenes usadas: ${used.length}`)
  console.log(`  Imágenes sin referencias: ${unused.length}`)

  if (unused.length && process.argv.includes('--fail-on-unused')) {
    process.exitCode = 1
  }
}

main().catch((error) => {
  console.error('No se pudo completar la auditoría de imágenes.')
  console.error(error)
  process.exitCode = 1
})
