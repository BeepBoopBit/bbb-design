import { useId, useLayoutEffect, useRef, useState } from 'react'
import type { CSSProperties, ReactNode } from 'react'
import { useMessages } from '../LocaleProvider/locale'
import './SplitPane.css'
export type SplitPaneProps = { label: string; primary: ReactNode; children: ReactNode; className?: string; onResize?: (percent: number) => void }
export function SplitPane({ label, primary, children, className = '', onResize }: SplitPaneProps) {
  const { direction } = useMessages()
  const primaryId = useId()
  const root = useRef<HTMLDivElement>(null)
  const drag = useRef(false)
  const [size, setSize] = useState<number>()
  const [limits, setLimits] = useState({ min: 0, max: 100, step: 0 })
  useLayoutEffect(() => {
    const style = getComputedStyle(root.current!)
    const read = (name: string) => parseFloat(style.getPropertyValue(`--bbb-split-${name}`))
    setLimits({ min: read('min'), max: read('max'), step: read('step') })
    setSize(read('default'))
  }, [])
  function resize(value: number) {
    const next = Math.max(limits.min, Math.min(limits.max, value))
    setSize(next); onResize?.(next)
  }
  return <div className={`bbb-split-pane ${className}`} ref={root}>
    <div className="bbb-split-pane__layout" style={size === undefined ? undefined : { '--bbb-split-position': `${size}%` } as CSSProperties}>
      <div id={primaryId} className="bbb-split-pane__panel">{primary}</div>
      <div className="bbb-split-pane__separator" role="separator" tabIndex={0} aria-label={label} aria-controls={primaryId}
        aria-orientation="vertical" aria-valuemin={limits.min} aria-valuemax={limits.max} aria-valuenow={Math.round(size ?? 0)}
        onKeyDown={event => {
          if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return
          event.preventDefault()
          const sign = (event.key === 'ArrowRight' ? 1 : -1) * (direction === 'rtl' ? -1 : 1)
          resize(event.key === 'Home' ? limits.min : event.key === 'End' ? limits.max : (size ?? limits.min) + limits.step * sign)
        }}
        onPointerDown={event => { if (event.button !== 0) return; event.preventDefault(); event.currentTarget.focus(); drag.current = true; event.currentTarget.setPointerCapture(event.pointerId) }}
        onPointerMove={event => { if (!drag.current) return; const rect = root.current!.getBoundingClientRect(); resize((direction === 'rtl' ? rect.right - event.clientX : event.clientX - rect.left) / rect.width * 100) }}
        onPointerUp={event => { drag.current = false; if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId) }}
        onPointerCancel={() => { drag.current = false }} onLostPointerCapture={() => { drag.current = false }} />
      <div className="bbb-split-pane__panel">{children}</div>
    </div>
  </div>
}
