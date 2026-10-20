import { Button } from '../../../components/Button/Button'
import { Icon } from '../../../components/Icon/Icon'
import { Popover } from '../../../components/Popover/Popover'
import { Link } from '../../../components/Link/Link'
import { Tooltip } from '../../../components/Tooltip/Tooltip'
import adoptionUrl from '../../../../docs/ADOPTION.md?url'
import componentsUrl from '../../../components/README.md?url'
import changelogUrl from '../../../../CHANGELOG.md?url'

export function HelpResources({ compact = false, getStartedHref }: { compact?: boolean; getStartedHref?: string }) {
  return (
    <Popover title="Help & resources" trigger={
      <Tooltip disabled={!compact} placement="right" content="Help & resources"><Button variant="ghost" iconOnly={compact} aria-label="Help & resources">
        <Icon name="info" />
        {!compact && 'Help & resources'}
      </Button></Tooltip>
    }>
      <div className="field-preview">
        <p className="preview-note">Set up BBB or download a guide for your product.</p>
        {getStartedHref && <Link href={getStartedHref}>Get started</Link>}
        <Link href={adoptionUrl} download="BBB-adoption.md">{getStartedHref ? 'Download setup guide' : 'Getting started'}</Link>
        <Link href={componentsUrl} download="BBB-components.md">Component documentation</Link>
        <Link href={changelogUrl} download="BBB-changelog.md">What’s new</Link>
      </div>
    </Popover>
  )
}
