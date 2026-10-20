import { useEffect } from 'react'
import { GuideContents } from './GuideContents'
import { GuideMarkdown, GuideTitle } from './GuideMarkdown'
import source from '../../../docs/ADOPTION.md?raw'
import './GetStarted.css'

export default function GetStarted() {
  useEffect(() => {
    let id: string
    try { id = decodeURIComponent(window.location.hash.slice(1)) } catch { return }
    if (!id) return
    const frame = requestAnimationFrame(() => {
      const target = document.getElementById(id)
      target?.focus({ preventScroll: true })
      target?.scrollIntoView()
    })
    return () => cancelAnimationFrame(frame)
  }, [])

  return <div className="get-started">
    <GuideTitle source={source} />
    <div className="get-started__layout">
      <GuideContents source={source} />
      <article className="guide-article" aria-label="Get started guide">
        <GuideMarkdown source={source} />
      </article>
    </div>
  </div>
}
