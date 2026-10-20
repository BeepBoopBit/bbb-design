import { createHash } from 'node:crypto'
import { resolve } from 'node:path'
import { applyChanges, exists, planFile, safeRelative } from './files.mjs'

const hash = content => createHash('sha256').update(content).digest('hex')
const checksumPattern = /^[a-f0-9]{64}$/

export function validateBundle(bundle) {
  const metadata = bundle?.meta?.bbb
  if (metadata?.schemaVersion !== 1 || typeof metadata.release !== 'string' || !/^[a-zA-Z0-9][\w.-]*$/.test(metadata.release) ||
      typeof bundle.name !== 'string' || !/^[a-z][a-z0-9-]*$/.test(bundle.name) || !Array.isArray(bundle.files) || !bundle.files.length ||
      !metadata.hashes || typeof metadata.hashes !== 'object') throw new Error('Unsupported BBB source bundle.')
  safeRelative(metadata.targetRoot)
  const prefix = `~/${metadata.targetRoot}/`
  const files = new Map()
  for (const file of bundle.files) {
    if (typeof file.content !== 'string' || !file.target?.startsWith(prefix)) throw new Error('Invalid source file or destination.')
    const name = safeRelative(file.target.slice(prefix.length))
    if (name === '.bbb-source.json') throw new Error(`Invalid file path: ${name}`)
    const checksum = hash(file.content)
    if (!checksumPattern.test(metadata.hashes[file.target]) || metadata.hashes[file.target] !== checksum) throw new Error(`Source checksum does not match: ${name}`)
    if (files.has(name) && files.get(name).content !== file.content) throw new Error(`Conflicting source files: ${name}`)
    files.set(name, { content: file.content, checksum })
  }
  return { metadata, files }
}

export async function readSourceRecord(directory) {
  const root = resolve(directory)
  const file = await planFile(root, '.bbb-source.json', '')
  if (file.previous === undefined) return undefined
  let record
  try { record = JSON.parse(file.previous) } catch { throw new Error('Could not read .bbb-source.json. Restore its valid JSON before adding components.') }
  if (record?.schemaVersion !== 1 || typeof record.release !== 'string' || !Array.isArray(record.items) ||
      !record.items.every(name => typeof name === 'string') || !record.hashes || typeof record.hashes !== 'object' || Array.isArray(record.hashes) ||
      Object.values(record.hashes).some(value => typeof value !== 'string' || !checksumPattern.test(value))) throw new Error('Unsupported .bbb-source.json record.')
  return record
}

export async function planSources(bundles, directory) {
  if (!Array.isArray(bundles) || !bundles.length) throw new Error('Choose at least one BBB source bundle.')
  const root = resolve(directory)
  if ((await exists(root))?.isSymbolicLink()) throw new Error('Choose a destination directory, not a symbolic link.')
  const previous = await readSourceRecord(root)
  const release = bundles[0]?.meta?.bbb?.release
  const targetRoot = bundles[0]?.meta?.bbb?.targetRoot
  const files = new Map()
  const names = new Set(previous?.items ?? [])
  const dependencies = new Set()
  for (const bundle of bundles) {
    const validated = validateBundle(bundle)
    if (validated.metadata.release !== release || validated.metadata.targetRoot !== targetRoot || (previous && previous.release !== release)) throw new Error('This directory uses another BBB release. Review migration changes before combining releases.')
    names.add(bundle.name)
    for (const dependency of bundle.dependencies ?? []) dependencies.add(dependency)
    for (const [name, file] of validated.files) {
      if (files.has(name) && files.get(name).content !== file.content) throw new Error(`Conflicting source files: ${name}`)
      files.set(name, file)
    }
  }
  const changes = []
  const hashes = { ...previous?.hashes }
  for (const [name, file] of files) {
    const change = await planFile(root, name, file.content)
    if (change.previous !== undefined && change.previous !== change.content) throw new Error(`Preserved existing file: ${name}. Review the differences; no files were copied.`)
    changes.push(change)
    hashes[name] = file.checksum
  }
  const added = changes.filter(change => change.previous === undefined).length
  const reused = changes.length - added
  const record = { schemaVersion: 1, release, items: [...names].sort(), hashes }
  const recordChange = await planFile(root, '.bbb-source.json', `${JSON.stringify(record, null, 2)}\n`)
  changes.push(recordChange)
  return { root, changes, added, reused, dependencies: [...dependencies].sort(), release, record }
}

export async function copySource(bundle, directory, { dryRun = false } = {}) {
  const plan = await planSources([bundle], directory)
  if (!dryRun) await applyChanges(plan.changes)
  return { added: plan.added, reused: plan.reused, dependencies: plan.dependencies, release: plan.release }
}
