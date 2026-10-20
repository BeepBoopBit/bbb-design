import { createRegistry, serializeRegistryArtifact } from './registry.mjs'
import { publishedArtifacts } from './source-releases.mjs'

// Gallery reads exactly the same artifacts that build:registry writes locally.
export function sourceRegistryPlugin() {
  let pending
  const artifacts = () => pending ??= createRegistry().then(publishedArtifacts)
  return {
    name: 'bbb-source-registry',
    configureServer(server) {
      server.watcher.on('all', (_event, path) => {
        if (/\/(src|registry|docs|releases)\//.test(path) || /\/(package\.json|LICENSE(?:-LUCIDE)?|CHANGELOG\.md)$/.test(path)) pending = undefined
      })
      server.middlewares.use(async (request, response, next) => {
        const path = new URL(request.url, 'http://localhost').pathname
        if (!path.startsWith('/r/')) return next()
        try {
          const item = (await artifacts()).get(path.slice(3))
          response.setHeader('Content-Type', 'application/json; charset=utf-8')
          response.setHeader('Cache-Control', 'no-store')
          response.statusCode = item ? 200 : 404
          response.end(serializeRegistryArtifact(item ?? { error: 'Source bundle not found.' }))
        } catch (error) { next(error) }
      })
    },
    async generateBundle() {
      for (const [path, data] of await artifacts()) this.emitFile({ type: 'asset', fileName: `r/${path}`, source: serializeRegistryArtifact(data) })
    },
  }
}
