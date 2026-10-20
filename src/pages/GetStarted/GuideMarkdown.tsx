import { Children, isValidElement } from 'react'
import type { ReactNode } from 'react'
import Markdown from 'react-markdown'
import type { Components } from 'react-markdown'
import { CodeBlock } from '../../components/CodeBlock/CodeBlock'
import { Link } from '../../components/Link/Link'
import { PageHeader } from '../../components/PageHeader/PageHeader'
import adoptionURL from '../../../docs/ADOPTION.md?url'
import brandsURL from '../../../docs/BRANDS.md?url'
import customizationURL from '../../../docs/CUSTOMIZATION.md?url'
import contentURL from '../../../docs/CONTENT.md?url'
import registryURL from '../../../docs/REGISTRY.md?url'
import qualityURL from '../../../docs/QUALITY.md?url'
import componentsURL from '../../components/README.md?url'
import installerURL from '../../../packages/cli/README.md?url'
import { guideHeadingId, guideText } from './guideHeadings'

const downloads: Record<string, { url: string; name: string }> = {
  'BRANDS.md': { url: brandsURL, name: 'BBB-brands.md' },
  'CUSTOMIZATION.md': { url: customizationURL, name: 'BBB-customization.md' },
  'CONTENT.md': { url: contentURL, name: 'BBB-content.md' },
  'REGISTRY.md': { url: registryURL, name: 'BBB-registry.md' },
  'QUALITY.md': { url: qualityURL, name: 'BBB-quality.md' },
  '../src/components/README.md': { url: componentsURL, name: 'BBB-components.md' },
  '../packages/cli/README.md': { url: installerURL, name: 'BBB-installer.md' },
}

const titleComponents: Components = {
  h1: ({ children }) => <PageHeader
    className="get-started__header"
    title={guideText(children)}
    description="Copy components into your React app. Make the source your own."
    actions={<Link href={adoptionURL} download="BBB-adoption.md">Download guide</Link>}
  />,
}

const articleComponents: Components = {
  h2: ({ children }) => {
    const id = guideHeadingId(children)
    return <h2 id={id} tabIndex={-1}><Link href={`#${id}`} variant="quiet">{children}</Link></h2>
  },
  pre: ({ children }) => {
    const code = Children.toArray(children).find(child => isValidElement(child))
    if (!isValidElement<{ children?: ReactNode; className?: string }>(code)) return <pre>{children}</pre>
    const language = code.props.className?.replace(/^language-/, '')
    return <CodeBlock code={guideText(code.props.children).replace(/\n$/, '')} language={language}
      label={language === 'sh' ? 'Terminal commands' : 'React example'} />
  },
  a: ({ href, children }) => {
    const download = downloads[href ?? '']
    return <Link href={download?.url ?? href} download={download?.name}>
      {children}{download && <span className="bbb-visually-hidden"> (Markdown download)</span>}
    </Link>
  },
}

export function GuideTitle({ source }: { source: string }) {
  return <Markdown allowedElements={['h1']} components={titleComponents}>{source}</Markdown>
}

export function GuideMarkdown({ source }: { source: string }) {
  return <Markdown disallowedElements={['h1']} components={articleComponents}>{source}</Markdown>
}
