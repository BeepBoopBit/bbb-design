import { lucideIconNames } from '../../../components/Icon/iconData'
import { useThemeAttributes } from '../../../components/ThemeProvider/theme'
import { useEffect, useRef, useState } from 'react'
import { ThemeProvider } from '../../../components/ThemeProvider/ThemeProvider'
import type { Brand } from '../../../components/ThemeProvider/ThemeProvider'
import { Button } from '../../../components/Button/Button'
import { TextField } from '../../../components/TextField/TextField'
import { Select } from '../../../components/Select/Select'
import { Switch } from '../../../components/Switch/Switch'
import { Dialog } from '../../../components/Dialog/Dialog'
import { Icon, IconProvider } from '../../../components/Icon/Icon'
import { Badge } from '../../../components/Badge/Badge'
import { Card } from '../../../components/Card/Card'
import './SystemFoundationPreviews.css'
function ThemeSample({ brand, rounded }: { brand: Brand; rounded: boolean }) {
  const ref = useRef<HTMLDivElement>(null)
  const label = brand === 'bbb' ? 'BBB' : 'Studio'
  return (
    <ThemeProvider
      brand={brand}
      tokens={rounded ? { '--bbb-button-radius': 'var(--bbb-radius-full)' } : {}}
      className="system-theme-sample"
    >
      <div ref={ref} className="system-preview" role="group" aria-label={`${label} theme preview`}>
        <header>
          <span className="system-eyebrow">{label}</span>
          <h4>Your next idea</h4>
          <p>One set of components. Your own expression.</p>
        </header>
        <TextField label={`${label} idea title`} defaultValue="Something thoughtful" />
        <Select
          label={`${label} project access`}
          defaultValue="team"
          options={[
            { id: 'team', label: 'Team members' },
            { id: 'private', label: 'Only me' },
          ]}
        />
        <div className="preview-row">
          <Dialog
            title={`${label} theme details`}
            trigger={
              <Button>
                <Icon name="plus" />
                New idea
              </Button>
            }
          >
            <p>Fields, buttons, and this dialog share the same theme boundary.</p>
          </Dialog>
          <Badge tone="success">Ready</Badge>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onPress={() => {
            if (!ref.current) return
            const styles = getComputedStyle(ref.current)
            const variables = Array.from(styles)
              .filter((key) => key.startsWith('--bbb-'))
              .sort()
              .map((key) => `  ${key}: ${styles.getPropertyValue(key).trim()};`)
              .join('\n')
            const blob = new Blob(
              [
                `/* Resolved ${label} theme snapshot. Import after BBB styles. */\n[data-bbb-theme].my-brand {\n${variables}\n}\n`,
              ],
              { type: 'text/css' },
            )
            const url = URL.createObjectURL(blob)
            const link = document.createElement('a')
            link.href = url
            link.download = `${brand}-theme.css`
            link.click()
            setTimeout(() => URL.revokeObjectURL(url), 1000)
          }}
        >
          Export {label} CSS
        </Button>
      </div>
    </ThemeProvider>
  )
}
export function ThemesPreview() {
  const [rounded, setRounded] = useState(false)
  return (
    <div className="system-preview">
      <div className="system-theme-grid">
        <ThemeSample brand="bbb" rounded={rounded} />
        <ThemeSample brand="studio" rounded={rounded} />
      </div>
      <Switch
        label="Pill-shaped action buttons"
        checked={rounded}
        onChange={(e) => setRounded(e.target.checked)}
      />
      <p className="preview-note">
        Use Appearance above to change light/dark mode and density. Try a menu or dialog in either
        theme.
      </p>
    </div>
  )
}
export function MotionPreview() {
  const [expanded, setExpanded] = useState(false)
  return (
    <div className="system-preview system-motion-preview">
      <div className="system-preview">
        <Button variant="secondary" aria-expanded={expanded} onPress={() => setExpanded(!expanded)}>
          Toggle motion example
        </Button>
        <div className="system-motion" data-expanded={expanded || undefined}>
          <div>
            <Card title="A little more context" headingLevel={4}>
              <p>
                Reverse the transition at any point. With reduced motion, the change is immediate.
              </p>
            </Card>
          </div>
        </div>
      </div>
      <dl className="system-specs">
        <dt>Feedback</dt>
        <dd>Fast duration · hover and press</dd>
        <dt>Layout</dt>
        <dd>Medium duration · panels and selection</dd>
        <dt>Easing</dt>
        <dd>Shared standard curve</dd>
      </dl>
    </div>
  )
}
export function IconographyPreview() {
  return (
    <div className="system-preview">
      <div className="system-icon-grid">
        {lucideIconNames.map((name) => (
          <span key={name}>
            <Icon name={name} />
            <span>{name}</span>
          </span>
        ))}
      </div>
      <p className="preview-note">
        Lucide outline icons share size, stroke, alignment, and current text color.
        Icons are decorative; controls keep their own names.
      </p>
    </div>
  )
}
export function CustomizationPreview() {
  return (
    <div className="system-preview">
      <IconProvider
        icons={{
          sparkles: (
            <>
              <path d="m12 2 3 7 7 3-7 3-3 7-3-7-7-3Z" />
              <circle cx="12" cy="12" r="2" />
            </>
          ),
        }}
      >
        <ThemeProvider tokens={{ '--bbb-button-radius': 'var(--bbb-radius-full)' }}>
          <div className="system-preview">
            <Button>
              <Icon name="sparkles" />A different signature
            </Button>
            <Select
              label="Custom option content"
              defaultValue="alex"
              options={[
                {
                  id: 'alex',
                  label: 'Alex Morgan',
                  description: 'Design team',
                  leading: <Icon name="user-round" />,
                },
                {
                  id: 'jamie',
                  label: 'Jamie Chen',
                  description: 'Engineering team',
                  leading: <Icon name="box" />,
                },
              ]}
            />
          </div>
        </ThemeProvider>
      </IconProvider>
      <p className="preview-note">
        Replace SVG artwork with IconProvider, override a component token, or supply rich option
        content. Accessible names and selection behavior stay intact.
      </p>
    </div>
  )
}
export function LayoutPreview() {
  return (
    <div className="system-preview">
      <div className="system-layout-demo">
        <Card title="Related details" headingLevel={4}>
          <p>Tracks share the available space and collapse naturally.</p>
        </Card>
        <Card title="Room to read" headingLevel={4}>
          <p>Content stays within the shared page width and gutters.</p>
        </Card>
      </div>
      <dl className="system-specs">
        <dt>Page width</dt>
        <dd>content-width token</dd>
        <dt>Gutters</dt>
        <dd>Fluid page-gutter token</dd>
        <dt>Density</dt>
        <dd>Comfortable or compact; touch controls retain comfortable targets.</dd>
        <dt>Reflow</dt>
        <dd>Labels wrap; scrolling belongs inside tables and tab lists.</dd>
      </dl>
    </div>
  )
}
export function InteractionStatesPreview() {
  const [value, setValue] = useState('')
  return (
    <div className="system-preview">
      <div className="preview-row">
        <Button>Available</Button>
        <Button disabled>Unavailable</Button>
        <Button loading>Saving…</Button>
      </div>
      <TextField
        label="Required detail"
        value={value}
        onChange={(event) => setValue(event.target.value)}
        error={!value.trim() ? 'Add a detail to resolve this error.' : undefined}
      />
      <Switch label="Selected state" defaultChecked />
      <p className="preview-note">
        Tab to see focus. Hover and press available actions. Validation keeps its error edge while
        focused.
      </p>
    </div>
  )
}
const pairs = [
  { label: 'Body on canvas', foreground: '--bbb-color-text', background: '--bbb-color-canvas' },
  {
    label: 'Secondary on surface',
    foreground: '--bbb-color-text-secondary',
    background: '--bbb-color-surface',
  },
  {
    label: 'Placeholder on field',
    foreground: '--bbb-color-text-muted',
    background: '--bbb-color-field-surface',
  },
  {
    label: 'Primary action',
    foreground: '--bbb-color-on-accent',
    background: '--bbb-color-accent',
  },
  {
    label: 'Accent on tint',
    foreground: '--bbb-color-accent-text',
    background: '--bbb-color-accent-subtle',
  },
  {
    label: 'Supporting on tint',
    foreground: '--bbb-color-supporting-hover',
    background: '--bbb-color-supporting-subtle',
  },
  {
    label: 'Error on tint',
    foreground: '--bbb-color-danger',
    background: '--bbb-color-danger-subtle',
  },
  {
    label: 'Destructive action',
    foreground: '--bbb-color-on-danger',
    background: '--bbb-color-danger',
  },
]
function luminance(color: string) {
  const channels = color
    .match(/[\d.]+/g)
    ?.slice(0, 3)
    .map(Number) ?? [0, 0, 0]
  return channels.reduce((sum, value, index) => {
    const v = value / 255
    return (
      sum +
      (v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4) * [0.2126, 0.7152, 0.0722][index]
    )
  }, 0)
}
export function ThemeAccessibilityPreview() {
  const ref = useRef<HTMLDivElement>(null)
  const theme = useThemeAttributes()
  const brand = theme['data-bbb-brand']
  const mode = theme['data-bbb-mode']
  const [ratios, setRatios] = useState<number[]>([])
  useEffect(() => {
    if (!ref.current) return
    const probe = document.createElement('span')
    ref.current.append(probe)
    setRatios(
      pairs.map((pair) => {
        probe.style.color = `var(${pair.foreground})`
        const a = luminance(getComputedStyle(probe).color)
        probe.style.color = `var(${pair.background})`
        const b = luminance(getComputedStyle(probe).color)
        return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05)
      }),
    )
    probe.remove()
  }, [brand, mode, theme.style])
  return (
    <div ref={ref} className="system-preview">
      <dl className="system-contrast">
        {pairs.map((pair, index) => (
          <div key={pair.label}>
            <dt>{pair.label}</dt>
            <dd data-pass={ratios[index] >= 4.5 || undefined}>
              {ratios[index]
                ? `${ratios[index].toFixed(2)}:1 · ${ratios[index] >= 4.5 ? 'Pass' : 'Review'}`
                : 'Checking…'}
            </dd>
          </div>
        ))}
      </dl>
      <p className="preview-note">
        Live normal-text contrast checks for these eight pairings, targeting 4.5:1. Also review
        focus, keyboard behavior, zoom, and assistive technology when making a theme.
      </p>
    </div>
  )
}
