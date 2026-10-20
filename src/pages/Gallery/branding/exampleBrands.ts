import { bbbBrand, studioBrand, createBrand } from '../../../foundations/brands'

// A consumer-defined identity. It is deliberately absent from the provider's registry.
export const fieldnotesBrand = createBrand({
  id: 'fieldnotes', name: 'Fieldnotes', extends: bbbBrand,
  logo: { type: 'wordmark', text: 'fieldnotes', suffix: '.', label: 'Fieldnotes' },
  tokens: {
    '--bbb-font-heading': 'var(--bbb-font-serif)',
    '--bbb-font-wordmark': 'var(--bbb-font-serif)',
    '--bbb-button-radius': 'var(--bbb-radius-full)',
    '--bbb-field-radius': 'var(--bbb-radius-md)',
  },
  modes: Object.fromEntries((['light', 'dark'] as const).map(mode => [mode, {
    '--bbb-color-accent': 'var(--bbb-color-supporting)',
    '--bbb-color-accent-hover': 'var(--bbb-color-supporting-hover)',
    '--bbb-color-accent-pressed': 'var(--bbb-color-supporting-pressed)',
    '--bbb-color-accent-text': 'var(--bbb-color-supporting-hover)',
    '--bbb-color-accent-subtle': 'var(--bbb-color-supporting-subtle)',
  }])),
})
export const exampleBrands = [bbbBrand, studioBrand, fieldnotesBrand]
