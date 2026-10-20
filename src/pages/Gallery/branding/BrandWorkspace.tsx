import { useState } from 'react'
import { exampleBrands } from './exampleBrands'
import { BrandSample } from './BrandSample'
import { BrandTokenEditor } from './BrandTokenEditor'
import { BrandReview } from './BrandReview'
import type { BrandReviewResult } from './BrandReview'
import { bbbBrand } from '../../../foundations/brands'
import type { BrandPreset, BrandMode } from '../../../foundations/brands'
import { parseBrand, serializeBrand, brandToCSS } from '../../../foundations/brandValidation'
import { Select } from '../../../components/Select/Select'
import { TextField } from '../../../components/TextField/TextField'
import { Textarea } from '../../../components/Textarea/Textarea'
import { Button } from '../../../components/Button/Button'
import { Tabs } from '../../../components/Tabs/Tabs'
import { useThemeAttributes } from '../../../components/ThemeProvider/theme'
import type { Density } from '../../../components/ThemeProvider/theme'
import './BrandWorkspace.css'

const storageKey = 'bbb-brand-workspace-v1'
function readSaved() {
  try { const value = localStorage.getItem(storageKey); return value ? parseBrand(value) : null } catch { return null }
}
function download(text: string, filename: string, type: string) {
  const url = URL.createObjectURL(new Blob([text], { type }))
  const link = document.createElement('a')
  link.href = url; link.download = filename; link.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
export function BrandWorkspace() {
  const [brand, setBrand] = useState<BrandPreset>(() => readSaved() ?? structuredClone(bbbBrand))
  const [starter, setStarter] = useState('bbb')
  const [editorVersion, setEditorVersion] = useState(0)
  const theme = useThemeAttributes()
  const [previewMode, setMode] = useState<BrandMode>()
  const mode = previewMode ?? theme['data-bbb-mode']
  const [density, setDensity] = useState<Density>('comfortable')
  const [review, setReview] = useState<BrandReviewResult>()
  const [json, setJson] = useState('')
  const [importError, setImportError] = useState<string>()
  const [status, setStatus] = useState('Changes stay in this workspace. Save a preset to keep it on this device.')
  const ready = review?.brand === brand && review.ready
  function loadPreset(next: BrandPreset) { setBrand(next); setEditorVersion(value => value + 1) }
  return <div className="brand-workspace">
    <div className="brand-workspace__controls">
      <Select label="Starter brand" value={starter} onChange={id => {
        setStarter(id); loadPreset(structuredClone(exampleBrands.find(brand => brand.id === id)!)); setStatus('Starter loaded. Your saved preset is unchanged.')
      }} options={exampleBrands.map(brand => ({ id: brand.id, label: brand.name }))} />
      <Select label="Brand preview mode" value={mode} onChange={mode => setMode(mode as BrandMode)} options={[{ id: 'light', label: 'Light' }, { id: 'dark', label: 'Dark' }]} />
      <Select label="Brand preview density" value={density} onChange={density => setDensity(density as Density)} options={[{ id: 'comfortable', label: 'Comfortable' }, { id: 'compact', label: 'Compact' }]} />
    </div>
    <div className="brand-workspace__layout">
      <div className="brand-workspace__editor">
        <Tabs label="Brand configuration" items={[
          { id: 'identity', label: 'Identity', content: <div className="system-preview">
            <TextField label="Brand name" value={brand.name} onChange={event => setBrand({ ...brand, name: event.target.value })} />
            <TextField label="Brand ID" value={brand.id} onChange={event => setBrand({ ...brand, id: event.target.value })} hint="A stable lowercase name for using this preset in another app." />
            <Select label="Logo format" value={brand.logo.type} onChange={type => setBrand({ ...brand, logo: type === 'wordmark'
              ? { type, text: brand.name.toLowerCase(), suffix: '.', label: brand.name }
              : { type: 'image', light: '/logo.svg', label: brand.name } })}
              options={[{ id: 'wordmark', label: 'Wordmark' }, { id: 'image', label: 'Image assets' }]} />
            {brand.logo.type === 'wordmark' ? <>
              <TextField label="Wordmark text" value={brand.logo.text} onChange={event => setBrand({ ...brand, logo: { ...brand.logo, type: 'wordmark', text: event.target.value } })} />
              <TextField label="Wordmark accent" value={brand.logo.suffix ?? ''} onChange={event => setBrand({ ...brand, logo: { ...brand.logo, type: 'wordmark', text: brand.logo.type === 'wordmark' ? brand.logo.text : brand.name, suffix: event.target.value } })} />
            </> : <>
              <TextField label="Light logo URL" value={brand.logo.light} onChange={event => setBrand({ ...brand, logo: { ...brand.logo, type: 'image', light: event.target.value } })} />
              <TextField label="Dark logo URL" value={brand.logo.dark ?? ''} onChange={event => setBrand({ ...brand, logo: { ...brand.logo, type: 'image', light: brand.logo.type === 'image' ? brand.logo.light : '', dark: event.target.value || undefined } })} hint="Optional; uses the light logo when empty. Assets stay in your app." />
            </>}
            <TextField label="Logo accessible name" value={brand.logo.label} onChange={event => setBrand({ ...brand, logo: { ...brand.logo, label: event.target.value } })} />
          </div> },
          { id: 'tokens', label: 'Tokens', content: <BrandTokenEditor key={editorVersion} brand={brand} onChange={setBrand} /> },
          { id: 'import', label: 'Import', content: <div className="system-preview">
            <Textarea label="Import brand JSON" value={json} onChange={event => { setJson(event.target.value); setImportError(undefined) }} error={importError} />
            <Button variant="secondary" disabled={!json.trim()} onPress={() => {
              try { loadPreset(parseBrand(json)); setImportError(undefined); setStatus('Preset imported. Review both modes before saving.') }
              catch (error) { setImportError(error instanceof Error ? error.message : 'Unable to read this preset.') }
            }}>Import preset</Button>
          </div> },
        ]} />
      </div>
      <BrandSample brand={brand} mode={mode} density={density} />
    </div>
    <BrandReview brand={brand} onReview={setReview} />
    <div className="preview-row">
      <Button disabled={!ready} onPress={() => {
        try { localStorage.setItem(storageKey, serializeBrand(brand)); setStatus(`${brand.name} is saved on this device.`) }
        catch { setStatus('Your browser could not save this preset. Export JSON to keep a copy.') }
      }}>Save preset</Button>
      <Button variant="secondary" onPress={() => {
        const saved = readSaved()
        if (saved) { loadPreset(saved); setStatus('Saved preset restored.') } else setStatus('No readable preset is saved on this device yet.')
      }}>Restore saved</Button>
      <Button variant="ghost" onPress={() => { loadPreset(structuredClone(exampleBrands.find(brand => brand.id === starter)!)); setStatus('Starter values restored. Your saved preset is unchanged.') }}>Reset changes</Button>
      <Button variant="secondary" disabled={!ready} onPress={() => download(serializeBrand(brand), `${brand.id}.brand.json`, 'application/json')}>Export JSON</Button>
      <Button variant="secondary" disabled={!ready} onPress={() => download(brandToCSS(brand), `${brand.id}.brand.css`, 'text/css')}>Export CSS</Button>
    </div>
    <p role="status" className="preview-note">{status}</p>
    <p className="preview-note">JSON keeps the identity, both modes, and token references. CSS carries visual values; keep logo assets and the preset with your application.</p>
  </div>
}
