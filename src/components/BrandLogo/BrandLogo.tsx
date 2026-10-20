import { useContext, useLayoutEffect, useRef } from 'react'
import type { HTMLAttributes } from 'react'
import { ThemeContext } from '../ThemeProvider/theme'
import type { BrandPreset } from '../../foundations/brands'
import './BrandLogo.css'

export type BrandLogoProps = Omit<HTMLAttributes<HTMLSpanElement>, 'children'> & {
  brand?: BrandPreset
  decorative?: boolean
}

/** Uses the current brand's wordmark or mode-specific image. Wrap in a named link when interactive. */
export function BrandLogo({ brand, decorative = false, className = '', ...props }: BrandLogoProps) {
  const theme = useContext(ThemeContext)
  const logo = (brand ?? theme.preset).logo
  const root = useRef<HTMLSpanElement>(null)
  useLayoutEffect(() => {
    const element = root.current!
    const wordmark = element.querySelector<HTMLElement>('.bbb-brand-logo__wordmark')
    if (!wordmark) return
    const fit = () => element.style.setProperty('--bbb-wordmark-fit', String(Math.min(1, element.clientWidth / Math.max(1, wordmark.offsetWidth))))
    fit()
    const observer = new ResizeObserver(fit)
    observer.observe(element)
    observer.observe(wordmark)
    return () => observer.disconnect()
  }, [logo])
  return <span {...props} ref={root} className={`bbb-brand-logo ${className}`} role={decorative ? undefined : 'img'}
    data-wordmark={logo.type === 'wordmark' || undefined}
    aria-label={decorative ? undefined : logo.label} aria-hidden={decorative || undefined}>
    {logo.type === 'wordmark'
      ? <span className="bbb-brand-logo__wordmark" aria-hidden="true">{logo.text}<span className="bbb-brand-logo__suffix">{logo.suffix}</span></span>
      : <img src={theme.mode === 'dark' ? logo.dark ?? logo.light : logo.light} alt="" />}
  </span>
}
