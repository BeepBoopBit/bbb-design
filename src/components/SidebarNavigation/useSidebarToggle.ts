import { useRef, useState } from 'react'

// A single mounted control keeps focus while the sidebar changes width.
export function useSidebarToggle() {
  const [collapsed, setCollapsed] = useState(false)
  const buttonRef = useRef<HTMLButtonElement>(null)

  function toggle() {
    setCollapsed(value => !value)
  }

  return { collapsed, buttonRef, toggle }
}
