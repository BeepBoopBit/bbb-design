import { ThemeSwitcher } from '../../../components/ThemeSwitcher/ThemeSwitcher'
import { AppearanceSettings } from '../../../components/AppearanceSettings/AppearanceSettings'
import { Button } from '../../../components/Button/Button'
import { Popover } from '../../../components/Popover/Popover'
import { Select } from '../../../components/Select/Select'
import { Icon } from '../../../components/Icon/Icon'
import type { Brand, Density, ThemeMode } from '../../../components/ThemeProvider/ThemeProvider'
export type Appearance = { brand: Brand; mode: ThemeMode; density: Density }
export function GalleryAppearance({
  value,
  onChange,
}: {
  value: Appearance
  onChange: (value: Appearance) => void
}) {
  return (
    <div className="gallery-appearance-controls">
    <ThemeSwitcher value={value.mode} onChange={mode => onChange({ ...value, mode })} />
    <Popover
      title="Site appearance"
      trigger={
        <Button variant="secondary" size="sm" iconOnly aria-label="Appearance">
          <Icon name="settings" />
        </Button>
      }
    >
      <div className="field-preview">
        <Select
          label="Brand"
          value={value.brand}
          onChange={(brand) => onChange({ ...value, brand: brand as Brand })}
          options={[
            { id: 'bbb', label: 'BBB · warm and calm' },
            { id: 'studio', label: 'Studio · cool and precise' },
          ]}
        />
        <AppearanceSettings mode={value.mode} onModeChange={mode => onChange({ ...value, mode })}
          density={value.density} onDensityChange={density => onChange({ ...value, density })} />
        <p className="preview-note">
          Applies across the site, including open overlays. Saved on this device.
        </p>
      </div>
    </Popover>
    </div>
  )
}
