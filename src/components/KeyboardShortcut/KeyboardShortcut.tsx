import './KeyboardShortcut.css'
export type KeyboardShortcutProps = { keys: string[]; label?: string; className?: string }
/** Visual hint only. The consuming application installs the shortcut. */
export function KeyboardShortcut({ keys, label, className = '' }: KeyboardShortcutProps) {
  return <span className={`bbb-keyboard-shortcut ${className}`} role="img" aria-label={label ?? keys.join(' + ')}>
    {keys.map((key, index) => <kbd key={`${key}-${index}`} aria-hidden="true">{key}</kbd>)}
  </span>
}
