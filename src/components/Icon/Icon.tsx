import { lucideIcons, resolveIconName } from './iconData'
import type { IconName, LucideIconName } from './iconData'
export type { IconName, LucideIconName } from './iconData'
import { createContext, useContext } from 'react'
import type { ReactNode, SVGProps } from 'react'

export type IconOverrides = Partial<Record<IconName, ReactNode>>
const IconContext = createContext<Partial<Record<LucideIconName, ReactNode>>>({})
/** Overrides use the shared 24 × 24 SVG coordinate system and inherit currentColor. */
export function IconProvider({ icons, children }: { icons: IconOverrides; children: ReactNode }) {
  const parent = useContext(IconContext)
  const merged = { ...parent }
  for (const [name, artwork] of Object.entries(icons)) {
    merged[resolveIconName(name as IconName)] = artwork
  }
  return <IconContext.Provider value={merged}>{children}</IconContext.Provider>
}
export type IconProps = SVGProps<SVGSVGElement> & { name: IconName }

export function Icon({ name, className = '', ...props }: IconProps) {
  const icons = useContext(IconContext)
  const resolvedName = resolveIconName(name)
  const classes = `bbb-icon ${['chevron-left', 'chevron-right', 'arrow-left', 'arrow-right'].includes(resolvedName) ? 'bbb-icon--directional' : ''} ${className}`
  const artwork = icons[resolvedName]
  if (artwork == null) {
    const LucideArtwork = lucideIcons[resolvedName]
    return <LucideArtwork {...props} className={classes} aria-hidden="true" focusable="false" />
  }
  return (
    <svg
      {...props}
      className={classes}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {artwork}
    </svg>
  )
}
