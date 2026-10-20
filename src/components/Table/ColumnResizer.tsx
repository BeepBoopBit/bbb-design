import { useLayoutEffect, useRef, useState } from 'react'
import { useMessages } from '../LocaleProvider/locale'

function measureToken(element: HTMLElement, token: string) {
  const probe = document.createElement('span')
  probe.style.cssText = `position:absolute;visibility:hidden;display:block;width:var(${token});height:0;pointer-events:none`
  element.append(probe)
  const value = probe.getBoundingClientRect().width
  probe.remove()
  return value
}

export function ColumnResizer({ label, width, onResize }: { label: string; width?: number; onResize: (width: number) => void }) {
  const { t, direction } = useMessages()
  const drag = useRef<{ start: number; width: number } | null>(null)
  const handle = useRef<HTMLDivElement>(null)
  const [measured, setMeasured] = useState({ width: 0, min: 0, max: 0 })
  useLayoutEffect(() => {
    const element = handle.current!
    const header = element.closest('th')!
    const update = () => setMeasured({ width: header.getBoundingClientRect().width, min: measureToken(element, '--bbb-column-min-width'), max: measureToken(element, '--bbb-column-max-width') })
    update()
    const observer = new ResizeObserver(update)
    observer.observe(header)
    return () => observer.disconnect()
  }, [])
  function change(element: HTMLElement, next: number) {
    const min = measureToken(element, '--bbb-column-min-width')
    const max = measureToken(element, '--bbb-column-max-width')
    onResize(Math.round(Math.max(min, Math.min(max, next))))
  }
  return <div
    ref={handle} className="bbb-table__resizer" role="separator" tabIndex={0}
    aria-label={t('resizeColumn', { name: label })} aria-orientation="vertical"
    aria-valuemin={measured.min} aria-valuemax={measured.max}
    aria-valuenow={Math.round(width ?? measured.width)} aria-valuetext={`${Math.round(width ?? measured.width)}px`}
    onKeyDown={event => {
      if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return
      event.preventDefault()
      const current = event.currentTarget.closest('th')!.getBoundingClientRect().width
      const step = measureToken(event.currentTarget, '--bbb-column-resize-step')
      const sign = (event.key === 'ArrowRight' ? 1 : -1) * (direction === 'rtl' ? -1 : 1)
      change(event.currentTarget, event.key === 'Home' ? 0 : event.key === 'End' ? Infinity : current + step * sign)
    }}
    onPointerDown={event => {
      if (event.button !== 0) return
      event.preventDefault()
      event.currentTarget.focus()
      event.currentTarget.setPointerCapture(event.pointerId)
      drag.current = { start: event.clientX, width: event.currentTarget.closest('th')!.getBoundingClientRect().width }
    }}
    onPointerMove={event => {
      if (drag.current) change(event.currentTarget, drag.current.width + (event.clientX - drag.current.start) * (direction === 'rtl' ? -1 : 1))
    }}
    onPointerUp={event => {
      drag.current = null
      if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId)
    }}
    onLostPointerCapture={() => { drag.current = null }}
    onPointerCancel={() => { drag.current = null }}
  />
}
