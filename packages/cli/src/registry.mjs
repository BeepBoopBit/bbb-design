import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import semver from 'semver'
import { validateBundle } from './source.mjs'
import { DEFAULT_REGISTRY_URL } from './config.mjs'

export function registryLocation(value = DEFAULT_REGISTRY_URL, cwd) {
  if (typeof value !== 'string' || !value.trim()) throw new Error('Choose a nonempty registry directory or HTTP(S) URL.')
  if (/^https?:\/\//.test(value)) {
    const url = new URL(value)
    if (url.username || url.password || url.search || url.hash) throw new Error('Use a registry base URL without credentials, query, or fragment.')
    url.pathname = `${url.pathname.replace(/\/$/, '')}/`
    return url.href
  }
  if (/^[a-z]+:/i.test(value) && !/^[a-z]:[\\/]/i.test(value)) throw new Error('Registry URLs must use HTTP or HTTPS.')
  return resolve(cwd, value)
}

async function readJSON(location, name) {
  try {
    if (/^https?:\/\//.test(location)) {
      const response = await fetch(new URL(name, location), { signal: AbortSignal.timeout(15000) })
      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      return await response.json()
    }
    return JSON.parse(await readFile(resolve(location, name), 'utf8'))
  } catch (error) { throw new Error(`Could not read registry ${location} (${name}): ${error.message}. Check the URL or use --registry <directory-or-URL>.`) }
}

function validateManifest(manifest, release) {
  if (manifest?.schemaVersion !== 1 || !semver.valid(manifest.release) || (release && manifest.release !== release) || !Array.isArray(manifest.items)) throw new Error('Unsupported registry manifest or source release.')
  const names = new Set()
  for (const item of manifest.items) {
    if (!/^[a-z][a-z0-9-]*$/.test(item.name) || names.has(item.name) || item.release !== manifest.release || item.schemaVersion !== 1 || !Array.isArray(item.files) || !item.hashes) throw new Error('Invalid registry item metadata.')
    names.add(item.name)
  }
  return manifest
}

export async function loadManifest(location, release) {
  if (release && !semver.valid(release)) throw new Error('Choose an exact source release, such as 0.2.0.')
  const selected = release ?? validateManifest(await readJSON(location, 'manifest.json')).release
  return validateManifest(await readJSON(location, `${selected}/manifest.json`), selected)
}

export async function loadBundles(location, manifest, names) {
  const chosen = [...new Set(names.map(name => manifest.items.some(item => item.name === name) ? name : manifest.gallery?.[name] ?? name))]
  // Validate all requested names before doing any downloads or writes.
  for (const name of chosen) if (!manifest.items.some(item => item.name === name)) throw new Error(`Unknown BBB item: ${name}. Run bbb-ui list to see available names.`)
  return Promise.all(chosen.map(async name => {
    const item = manifest.items.find(candidate => candidate.name === name)
    const bundle = await readJSON(location, `${manifest.release}/${name}.json`)
    const { metadata, files } = validateBundle(bundle)
    const sorted = object => JSON.stringify(Object.entries(object).sort(([a], [b]) => a.localeCompare(b)))
    if (bundle.name !== name || metadata.release !== manifest.release || metadata.targetRoot !== item.targetRoot ||
        JSON.stringify(bundle.dependencies) !== JSON.stringify(item.dependencies) || files.size !== item.files.length ||
        JSON.stringify(bundle.files.map(file => file.target).sort()) !== JSON.stringify(item.files.map(file => file.target).sort()) ||
        sorted(metadata.hashes) !== sorted(item.hashes)) throw new Error(`Bundle differs from the release manifest: ${name}`)
    return bundle
  }))
}
