import { mkdir, rm, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import { createRegistry, projectRoot, serializeRegistryArtifact } from './registry.mjs'
import { publishedArtifacts } from './source-releases.mjs'

export async function buildRegistry() {
  const registry = await createRegistry()
  const artifacts = await publishedArtifacts(registry)
  // Rebuild this generated directory completely; removed catalog entries must
  // not survive as stale files in a release artifact.
  await rm(resolve(projectRoot, 'registry-dist'), { recursive: true, force: true })
  for (const [path, data] of artifacts) {
    const output = resolve(projectRoot, 'registry-dist', path)
    await mkdir(resolve(output, '..'), { recursive: true })
    await writeFile(output, serializeRegistryArtifact(data))
  }
  console.log(`Built ${registry.items.length} complete source bundles in registry-dist/${registry.release}/`)
  return registry
}

if (process.argv[1] && pathToFileURL(resolve(process.argv[1])).href === import.meta.url) await buildRegistry()
