import type { ComponentPropsWithRef, ReactNode } from 'react'
import { FormField } from '../FormField/FormField'
import type { FieldProps } from '../FormField/FormField'
import '../TextField/TextField.css'
import '../Textarea/Textarea.css'
import './InputGroup.css'

type Addons = FieldProps & {
  startAddon?: ReactNode
  endAddon?: ReactNode
  header?: ReactNode
  footer?: ReactNode
}
export type InputGroupProps = Addons & (
  | (ComponentPropsWithRef<'input'> & { multiline?: false })
  | (ComponentPropsWithRef<'textarea'> & { multiline: true })
)

/** One labeled field surface, with optional text or independently labeled controls. */
export function InputGroup({ label, hideLabel, hint, error, variant, startAddon, endAddon, header, footer, id, className = '', 'aria-describedby': describedBy, ...control }: InputGroupProps) {
  return <FormField {...{ label, hideLabel, hint, error, variant, id, describedBy }} className={`bbb-input-group ${className}`}>
    {({ id: inputId, describedBy: description }) => {
      const shared = { id: inputId, 'aria-describedby': description, 'aria-invalid': error ? true as const : control['aria-invalid'] }
      let input: ReactNode
      if (control.multiline) {
        const { multiline: _multiline, ...props } = control
        input = <textarea {...props} {...shared} className="bbb-input bbb-textarea" />
      } else {
        const { multiline: _multiline, ...props } = control
        input = <input {...props} {...shared} />
      }
      return <>
        {header != null && <div className="bbb-input-group__bar">{header}</div>}
        <div className="bbb-field__control bbb-input-group__control">
          {startAddon != null && <div className="bbb-input-group__addon">{startAddon}</div>}
          {input}
          {endAddon != null && <div className="bbb-input-group__addon">{endAddon}</div>}
        </div>
        {footer != null && <div className="bbb-input-group__bar">{footer}</div>}
      </>
    }}
  </FormField>
}
