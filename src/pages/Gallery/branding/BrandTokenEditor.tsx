import { useState } from 'react'
import { brandTokenNames, foundationTokens } from '../../../foundations/brands'
import type { BrandPreset, ThemeTokens } from '../../../foundations/brands'
import { validateBrand } from '../../../foundations/brandValidation'
import { Select } from '../../../components/Select/Select'
import { TextField } from '../../../components/TextField/TextField'
import { Button } from '../../../components/Button/Button'

export function BrandTokenEditor({ brand, onChange }: { brand: BrandPreset; onChange: (brand: BrandPreset) => void }) {
  const [scope, setScope] = useState<'tokens' | 'light' | 'dark'>('light')
  const [token, setToken] = useState<keyof ThemeTokens>('--bbb-color-accent')
  const [value, setValue] = useState<string | null>(null)
  const [error, setError] = useState<string>()
  const isColor = (name: string) => name.startsWith('--bbb-color-') || /^--bbb-brand-(ink|ember|teal|sand|pearl)$/.test(name)
  const available = scope === 'tokens' ? brandTokenNames.filter(name => !isColor(name)) : brandTokenNames
  const inherited = (scope === 'tokens' ? brand.tokens[token] : brand.modes[scope][token] ?? brand.tokens[token]) ?? foundationTokens[token] ?? ''
  return <div className="system-preview">
    <Select label="Token scope" value={scope} onChange={next => { setScope(next as typeof scope); if (next === 'tokens' && isColor(token)) setToken('--bbb-font-heading'); setValue(null); setError(undefined) }} options={[
      { id: 'light', label: 'Light mode' }, { id: 'dark', label: 'Dark mode' }, { id: 'tokens', label: 'Shared typography, shape, and motion' },
    ]} />
    <Select label="Design token" value={token} onChange={next => { setToken(next as keyof ThemeTokens); setValue(null); setError(undefined) }} options={available.map(name => ({ id: name, label: name }))} />
    <TextField label="Token value" value={value ?? inherited} error={error} onChange={event => { setValue(event.target.value); setError(undefined) }}
      hint="Use a CSS value or var(--bbb-token-name). Color families need coordinated light and dark states." />
    <Button variant="secondary" onPress={() => {
      const next = scope === 'tokens' ? { ...brand, tokens: { ...brand.tokens, [token]: value ?? inherited } } :
        { ...brand, modes: { ...brand.modes, [scope]: { ...brand.modes[scope], [token]: value ?? inherited } } }
      const issues = validateBrand(next)
      if (issues.length) { setError(issues[0].message); return }
      onChange(next); setValue(null); setError(undefined)
    }}>Apply token</Button>
  </div>
}
