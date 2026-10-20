import { useEffect, useRef, useState } from 'react'
/** Local demo latency only; consuming products supply their own async operations. */
export function useDemoRequest() {
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const [pending, setPending] = useState(false)
  useEffect(() => () => clearTimeout(timer.current), [])
  return {
    pending,
    cancel: () => {
      clearTimeout(timer.current)
      setPending(false)
    },
    run: (complete: () => void) => {
      clearTimeout(timer.current)
      setPending(true)
      timer.current = setTimeout(() => {
        setPending(false)
        complete()
      }, 650)
    },
  }
}
