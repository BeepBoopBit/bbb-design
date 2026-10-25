export const compositionPages = {
  'button-group': 'Button group',
  toggle: 'Toggle',
  'toggle-group': 'Toggle group',
  'input-group': 'Input group',
  collapsible: 'Collapsible',
  drawer: 'Drawer',
} as const
export type CompositionPage = keyof typeof compositionPages
export function isCompositionPage(value: string): value is CompositionPage {
  return Object.hasOwn(compositionPages, value)
}

export const componentPages = {
  button: 'Button',
  ...compositionPages,
  'hover-card': 'Hover card',
  'navigation-menu': 'Navigation menu',
  separator: 'Separator',
  'native-select': 'Native select',
  select: 'Select',
  dialog: 'Dialog',
  table: 'Table',
  calendar: 'Calendar',
  'file-upload': 'File upload',
} as const

export type ComponentPage = keyof typeof componentPages
export function isComponentPage(value: string): value is ComponentPage {
  return Object.hasOwn(componentPages, value)
}
