import type { CSSProperties } from 'react'
import { Icon } from '../../../components/Icon/Icon'
import './Previews.css'

const colors = [
  { name: 'Ink', token: '--bbb-color-text' },
  { name: 'Sand', token: '--bbb-color-surface-warm' },
  { name: 'Pearl', token: '--bbb-color-canvas' },
  { name: 'Teal', token: '--bbb-color-supporting' },
  { name: 'Ember', token: '--bbb-color-accent' },
]

export function ColorPreview() {
  return (
    <ul className="color-preview" aria-label="BBB brand colors: ink, sand, pearl, teal, and ember">
      {colors.map(({ name, token }) => (
        <li key={token} title={token}>
          <span
            className="color-preview__swatch"
            style={{ '--bbb-swatch-color': `var(${token})` } as CSSProperties}
          />
          <span>{name}</span>
        </li>
      ))}
    </ul>
  )
}

export function TypographyPreview() {
  return (
    <div className="type-preview">
      <span className="type-preview__specimen" aria-hidden="true">Aa</span>
      <p className="type-preview__heading">Simply feels right.</p>
      <p className="type-preview__body">Clear at every size.</p>
      <span className="preview-caption">Native. Familiar. Effortless.</span>
    </div>
  )
}

export function SpacingPreview() {
  return (
    <ul className="spacing-preview" aria-label="Spacing scale in pixels at the default font size">
      {[1, 2, 3, 4, 6, 8].map((step) => (
        <li key={step} title={`--bbb-space-${step}`}>
          <span
            className="spacing-preview__bar"
            style={{ '--bbb-space-value': `var(--bbb-space-${step})` } as CSSProperties}
          />
          <span>{step * 4}</span>
        </li>
      ))}
    </ul>
  )
}

export function SurfacePreview() {
  return (
    <div className="surface-preview">
      <div className="surface-preview__stack" aria-hidden="true">
        <div className="surface-preview__sheet surface-preview__sheet--back" />
        <div className="surface-preview__sheet surface-preview__sheet--front">
          <Icon name="layers" />
          <span>A softer surface.</span>
        </div>
      </div>
      <span className="preview-caption">Subtle depth. Clear hierarchy.</span>
    </div>
  )
}
