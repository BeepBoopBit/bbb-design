import { CopyButton } from '../CopyButton/CopyButton'
import { useMessages } from '../LocaleProvider/locale'
import './CodeBlock.css'
export type CodeBlockProps = { code: string; language?: string; label?: string; className?: string }
export function CodeBlock({ code, language, label, className = '' }: CodeBlockProps) {
  const { t } = useMessages()
  const name = label ?? t('codeExample')
  return <div className={`bbb-code-block ${className}`}>
    <div className="bbb-code-block__header"><span>{language ?? name}</span><CopyButton text={code} /></div>
    <pre tabIndex={0} role="region" aria-label={name}><code>{code}</code></pre>
  </div>
}
