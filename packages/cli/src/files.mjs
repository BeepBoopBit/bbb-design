import { randomUUID } from 'node:crypto'
import { lstat, mkdir, readFile, rename, rmdir, unlink, writeFile } from 'node:fs/promises'
import { dirname, isAbsolute, relative, resolve, sep } from 'node:path'

export const exists = path => lstat(path).catch(error => { if (error.code !== 'ENOENT') throw error; return undefined })
export const readText = path => readFile(path, 'utf8').catch(error => { if (error.code !== 'ENOENT') throw error; return undefined })

export function safeRelative(name) {
  if (typeof name !== 'string' || !name || /[\\:]/.test(name) || [...name].some(character => character.charCodeAt(0) < 32) || name.split('/').some(part => !part || part === '.' || part === '..')) throw new Error(`Invalid file path: ${name}`)
  return name
}

export async function assertSafePath(root, path) {
  const inside = relative(root, path)
  if (!inside || inside === '..' || inside.startsWith(`..${sep}`) || isAbsolute(inside)) throw new Error(`File escapes the destination: ${path}`)
  let current = root
  for (const part of ['', ...inside.split(sep)]) {
    current = resolve(current, part)
    if ((await exists(current))?.isSymbolicLink()) throw new Error(`Refusing to replace a symbolic link: ${current}`)
  }
}

export async function planFile(root, name, content) {
  safeRelative(name)
  const path = resolve(root, name)
  await assertSafePath(root, path)
  const info = await exists(path)
  if (info && !info.isFile()) throw new Error(`Expected a file: ${path}`)
  return { root, path, content, previous: await readText(path), mode: info?.mode }
}

// Check the complete plan again after prompts/dependency installation. No file is
// changed if another editor or command modified it while the plan was pending.
export async function validateChanges(changes) {
  const paths = new Map()
  for (const change of changes) {
    await assertSafePath(change.root, change.path)
    if (paths.has(change.path) && paths.get(change.path) !== change.content) throw new Error(`Conflicting file plans: ${change.path}`)
    paths.set(change.path, change.content)
    if (await readText(change.path) !== change.previous) throw new Error(`File changed after planning: ${change.path}. Run the command again.`)
  }
}

export async function applyChanges(changes) {
  await validateChanges(changes)
  const unique = [...new Map(changes.map(change => [change.path, change])).values()]
  const written = []
  const directories = []
  async function ensureDirectory(path) {
    const info = await exists(path)
    if (info) {
      if (!info.isDirectory() || info.isSymbolicLink()) throw new Error(`Expected a directory: ${path}`)
      return
    }
    await ensureDirectory(dirname(path))
    try { await mkdir(path); directories.push(path) } catch (error) { if (error.code !== 'EEXIST') throw error }
  }
  async function replace(change, content) {
    const temporary = `${change.path}.${randomUUID()}.tmp`
    try {
      await writeFile(temporary, content, { flag: 'wx', mode: change.mode })
      await rename(temporary, change.path)
    } finally { await unlink(temporary).catch(error => { if (error.code !== 'ENOENT') throw error }) }
  }
  try {
    for (const change of unique) {
      if (change.content === change.previous) continue
      await assertSafePath(change.root, change.path)
      await ensureDirectory(dirname(change.path))
      if (await readText(change.path) !== change.previous) throw new Error(`File changed after planning: ${change.path}`)
      if (change.previous === undefined) await writeFile(change.path, change.content, { flag: 'wx' })
      else await replace(change, change.content)
      written.push(change)
    }
  } catch (error) {
    // Restore only files that still contain our writes; never discard concurrent
    // edits made by the consumer while recovering from an I/O failure.
    for (const change of written.reverse()) {
      if (await readText(change.path) !== change.content) continue
      if (change.previous === undefined) await unlink(change.path)
      else await replace(change, change.previous)
    }
    for (const directory of directories.reverse()) await rmdir(directory).catch(() => {})
    throw error
  }
}
