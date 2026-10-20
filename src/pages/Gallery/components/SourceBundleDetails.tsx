import { useEffect, useRef, useState } from 'react'
import { Button } from '../../../components/Button/Button'
import { CodeBlock } from '../../../components/CodeBlock/CodeBlock'
import { Link } from '../../../components/Link/Link'
import { LoadingIndicator } from '../../../components/LoadingIndicator/LoadingIndicator'
import { Select } from '../../../components/Select/Select'

type SourceFile = { path: string; target: string; content: string }
type SourceBundle = { name: string; dependencies: string[]; docs: string; files: SourceFile[];
  meta: { bbb: { release: string; targetRoot: string; category: string; entrypoints: string[] } } }
type Manifest = { release: string; gallery: Record<string, string> }
const registryRoot = `${import.meta.env.BASE_URL}r/`

async function readJSON<T>(url: string, signal: AbortSignal): Promise<T> {
  const response = await fetch(url, { signal })
  if (!response.ok) throw new Error('Source files are unavailable.')
  return response.json() as Promise<T>
}

export function SourceBundleDetails({ itemId }: { itemId: string }) {
  const [bundle, setBundle] = useState<SourceBundle>()
  const [bundleURL, setBundleURL] = useState('')
  const [selected, setSelected] = useState<string>()
  const [state, setState] = useState<'loading' | 'ready' | 'reference' | 'error'>('loading')
  const [attempt, setAttempt] = useState(0)
  const selectorRef = useRef<HTMLButtonElement>(null)
  const retryFocus = useRef(false)
  useEffect(() => {
    if (state === 'ready' && retryFocus.current) {
      selectorRef.current?.focus()
      retryFocus.current = false
    }
  }, [state])
  useEffect(() => {
    const controller = new AbortController()
    readJSON<Manifest>(`${registryRoot}manifest.json`, controller.signal).then(async manifest => {
      if (controller.signal.aborted) return
      const name = manifest.gallery[itemId]
      if (!name) { setState('reference'); return }
      const url = `${registryRoot}${encodeURIComponent(manifest.release)}/${encodeURIComponent(name)}.json`
      const source = await readJSON<SourceBundle>(url, controller.signal)
      if (controller.signal.aborted) return
      setBundle(source)
      setBundleURL(url)
      setSelected(source.files.find(file => file.target.endsWith(source.meta.bbb.entrypoints[0]))?.target ?? source.files[0]?.target)
      setState('ready')
    }).catch(() => { if (!controller.signal.aborted) setState('error') })
    return () => controller.abort()
  }, [itemId, attempt])
  if (state === 'reference') return <p>This foundation provides guidance. Use the component examples below to copy working source.</p>
  if (state === 'error') return <div role="status">Couldn’t load the component files. <Button variant="ghost" onPress={() => { retryFocus.current = true; setState('loading'); setAttempt(value => value + 1) }}>Try source files again</Button></div>
  if (!bundle || state === 'loading') return <LoadingIndicator label="Loading component files…" />
  const file = bundle.files.find(file => file.target === selected) ?? bundle.files[0]
  const prefix = `~/${bundle.meta.bbb.targetRoot}/`
  return <div className="gallery-source-bundle">
    <p>Copy the files into <code>{bundle.meta.bbb.targetRoot}</code>, keeping their folders together. Edit them freely in your app.</p>
    <div className="gallery-card__example-tools">
      <Link href={bundleURL} download={`bbb-${bundle.name}-${bundle.meta.bbb.release}.json`}>Download source bundle</Link>
      <span>Version {bundle.meta.bbb.release} · {bundle.files.length} files</span>
    </div>
    <details>
      <summary>Setup and dependencies</summary>
      <p>From the bbb-design repository, initialize your app once, then add this source. The CLI is available locally while npm publication is being prepared.</p>
      <CodeBlock code={`npm run build:registry\nnpm run cli -- init --cwd ../my-app --registry ./registry-dist\nnpm run cli -- add ${bundle.name} --cwd ../my-app`} language="sh" label="Copy with the local CLI" />
      <p>{bundle.docs}</p>
      {bundle.dependencies.length > 0 && <CodeBlock code={`npm install ${bundle.dependencies.join(' ')}`} language="sh" label="Install dependencies" />}
      <CodeBlock code="import './bbb/foundations/styles.css'" language="tsx" label="Required styles" />
      <p>The optional application baseline is a separate bundle. Keep the included license notices with copied source.</p>
    </details>
    <Select ref={selectorRef} label="Source file" hideLabel variant="subtle" value={file.target} onChange={setSelected}
      options={bundle.files.map(file => ({ id: file.target, label: file.target.split('/').pop()!, description: file.target.slice(prefix.length) }))} />
    <CodeBlock code={file.content} language={file.target.slice(prefix.length)} label="Component source" />
  </div>
}
