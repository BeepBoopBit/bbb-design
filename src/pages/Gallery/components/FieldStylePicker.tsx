import { SegmentedControl } from '../../../components/SegmentedControl/SegmentedControl'
import type { FieldVariant } from '../../../components/FormField/FieldSurface'
import { fieldStyles } from './fieldStyles'
import './FieldStylePicker.css'

export function FieldStylePicker({ value, onChange }: {
  value: FieldVariant
  onChange: (value: FieldVariant) => void
}) {
  return <SegmentedControl label="Field style" className="field-style-picker"
    value={value} onChange={value => onChange(value as FieldVariant)} options={fieldStyles} />
}
