import { usageExamples } from '../usageExamples'
import { useEffect, useState } from 'react'
import { CodeBlock } from '../../../components/CodeBlock/CodeBlock'
import { LoadingIndicator } from '../../../components/LoadingIndicator/LoadingIndicator'
import { Link } from '../../../components/Link/Link'
import { Button } from '../../../components/Button/Button'
import { previewSources } from '../previewSources'
import documentationUrl from '../../../components/README.md?url'
import { sitePath } from '../useGalleryLocation'
import { SourceBundleDetails } from './SourceBundleDetails'

export function ExampleDetails({ name, itemId }: { name: string; itemId: string }) {
  const [source, setSource] = useState('')
  const [failed, setFailed] = useState(false)
  const [attempt, setAttempt] = useState(0)
  useEffect(() => {
    let current = true
    const load = previewSources[name]
    if (!load) return
    load().then(module => { if (current) setSource(module.default) }).catch(() => { if (current) setFailed(true) })
    return () => { current = false }
  }, [name, attempt])
  return <div className="gallery-card__example-details">
    <SourceBundleDetails itemId={itemId} />
    {source ? <>
      {usageExamples[name] && <CodeBlock code={usageExamples[name]} language="tsx" label="Example source" />}
      <details>
        <summary>Gallery preview reference</summary>
        <p>This reference includes Gallery layout and local example state. Use the component files above in your app.</p>
        <CodeBlock code={source} language="tsx" label="Full preview source" />
      </details>
    </> : failed ?
      <div role="status">Couldn’t load the example. <Button variant="ghost" onPress={() => { setFailed(false); setAttempt(value => value + 1) }}>Try again</Button></div> : <LoadingIndicator label="Loading example…" />}
    <div className="gallery-card__example-tools">
      <Link href={sitePath('getting-started')}>Copy and setup guide</Link>
      <Link href={documentationUrl} external>Read component APIs and usage</Link>
    </div>
  </div>
}
