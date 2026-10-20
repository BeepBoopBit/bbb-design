import type { FieldVariant } from '../../../components/FormField/FieldSurface'

export const fieldStyles: { value: FieldVariant; label: string; description: string }[] = [
  { value: 'filled', label: 'Filled', description: 'Inset labels for prominent forms and settings.' },
  { value: 'outlined', label: 'Outlined', description: 'Slim controls with a clear edge for everyday forms.' },
  { value: 'subtle', label: 'Subtle', description: 'Quiet fills for filters and supporting controls.' },
  { value: 'plain', label: 'Plain', description: 'Minimal chrome for toolbars and inline editing.' },
]
