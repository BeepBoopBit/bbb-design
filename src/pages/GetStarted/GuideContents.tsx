import { useState } from 'react'
import Markdown from 'react-markdown'
import type { Components } from 'react-markdown'
import { Link } from '../../components/Link/Link'
import { guideHeadingId } from './guideHeadings'

const contentsComponents: Components = { h2: ({ children }) =>
  <li><Link href={`#${guideHeadingId(children)}`} variant="quiet">{children}</Link></li>,
}

export function GuideContents({ source }: { source: string }) {
  // Use the shell's wide-layout breakpoint for the initial disclosure state.
  // A reader's choice remains in place when they resize the window.
  const [open, setOpen] = useState(() => window.matchMedia('(min-width: 80rem)').matches)
  return <nav className="guide-contents" aria-label="On this page">
    <details open={open} onToggle={event => setOpen(event.currentTarget.open)}>
      <summary>On this page</summary>
      <ol>
        <Markdown allowedElements={['h2']} components={contentsComponents}>{source}</Markdown>
      </ol>
    </details>
  </nav>
}
