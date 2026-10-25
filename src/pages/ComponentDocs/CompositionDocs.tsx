import { Button } from '../../components/Button/Button'
import { ButtonGroup } from '../../components/ButtonGroup/ButtonGroup'
import { Toggle } from '../../components/Toggle/Toggle'
import { ToggleGroup } from '../../components/ToggleGroup/ToggleGroup'
import { InputGroup } from '../../components/InputGroup/InputGroup'
import { Collapsible } from '../../components/Collapsible/Collapsible'
import { Drawer } from '../../components/Drawer/Drawer'
import { ComponentDocPage } from './ComponentDocPage'
import type { ComponentGuidance } from './ComponentDocPage'
import type { CompositionPage } from './componentRoutes'

const guidance: Record<CompositionPage, ComponentGuidance> = {
  'button-group': {
    use: 'Group closely related actions. Use a primary button beside a DropdownMenu trigger for a split action, or secondary buttons for equal emphasis. Keep the children the same size and variant.',
    states: 'Horizontal is the default. Use vertical for a narrow action stack. Each child keeps its own disabled, loading, and focus states. Button is re-exported for convenient composition.',
    keyboard: ['Give the group a concise label describing its purpose.', 'Tab reaches each enabled action. Enter or Space activates it. A menu trigger keeps its usual arrow-key and Escape behavior.', 'For arrow navigation between actions, use Toolbar. For persistent selection, use ToggleGroup.'],
    api: [['label', 'string', 'Required accessible group name'], ['orientation', "'horizontal' | 'vertical'", 'horizontal'], ['children', 'ReactNode', 'Button or DropdownMenu triggers'], ['className / ref', 'string / Ref<HTMLDivElement>', 'Native div attributes are forwarded']],
    extraCode: `import { ButtonGroup, Button } from './bbb/components/ButtonGroup/ButtonGroup'
import { DropdownMenu } from './bbb/components/DropdownMenu/DropdownMenu'

<ButtonGroup label="Save actions">
  <Button onPress={() => console.log('Saved')}>Save</Button>
  <DropdownMenu label="More save options"
    trigger={<Button aria-label="More save options">More</Button>}
    items={[{ id: 'copy', label: 'Save a copy' }]}
    onAction={id => console.log(id)} />
</ButtonGroup>`,
  },
  toggle: {
    use: 'Use Toggle for an action that stays on or off, such as saving an item or enabling a formatting option. Keep its label stable so the pressed state communicates the change.',
    states: 'Use defaultSelected for local state, or isSelected with onChange for controlled state. Ghost and secondary variants both show the selected surface. Small and icon-only buttons follow Button sizing.',
    keyboard: ['Enter or Space toggles the pressed state. Disabled toggles leave the tab order.', 'The native button exposes aria-pressed. Give an icon-only toggle an aria-label.', 'Use Switch for a labeled setting and Checkbox for form submission. Toggle does not submit a selected value.'],
    api: [['isSelected / defaultSelected', 'boolean', 'Controlled / initial state'], ['onChange', '(selected: boolean) => void', 'Selection callback'], ['disabled', 'boolean', 'false'], ['variant / size', "'ghost' | 'secondary' / 'sm' | 'md'", 'ghost / md'], ['iconOnly / ref', 'boolean / Ref<HTMLButtonElement>', 'false / —']],
  },
  'toggle-group': {
    use: 'Use multiple selection for independent choices such as text formatting. Use single selection when at most one choice may remain active. For a required form choice, use RadioGroup or SegmentedControl.',
    states: 'Each Toggle needs a unique id. selectedKeys and onSelectionChange control the group; defaultSelectedKeys sets its initial selection. Single selection can clear the last choice unless disallowEmptySelection is set.',
    keyboard: ['Multiple selection uses a toolbar of pressed buttons. Tab enters the group; arrow keys move between enabled toggles. Enter or Space changes selection.', 'Single selection exposes radio semantics. Arrows move focus; Enter or Space chooses an option. Orientation controls navigation and horizontal arrows follow the locale’s writing direction.', 'Supply a group label and meaningful button names. The group owns selection, so do not also set isSelected on its children.'],
    api: [['label', 'string', 'Required'], ['selectionMode', "'single' | 'multiple'", 'multiple'], ['selectedKeys / defaultSelectedKeys', 'Iterable<Key>', 'Controlled / initial selection'], ['onSelectionChange', '(keys: Set<Key>) => void', 'Selection callback'], ['disallowEmptySelection', 'boolean', 'false'], ['orientation / disabled', "'horizontal' | 'vertical' / boolean", 'horizontal / false'], ['children', 'Toggle elements with unique id values', 'Toggle is re-exported']],
  },
  'input-group': {
    use: 'Keep prefixes, units, and related actions inside one field surface. InputGroup uses the same label, feedback, and field variants as TextField. Set multiline for a textarea with a header or footer action bar.',
    states: 'Native value, defaultValue, name, required, disabled, readOnly, and ref work on the input or textarea. Addon controls keep independent names and states. Include units in the label or hint; visual addon text is not automatically an accessible description.',
    keyboard: ['The visible label is associated with the input. Hints and errors are linked through aria-describedby.', 'Tab follows the DOM order: header, start addon, field, end addon, footer. Give each addon control its own accessible label.', 'An addon button defaults to type="button". Use type="submit" deliberately. Disable addon actions separately when the entire task is unavailable.'],
    api: [['label / hint / error', 'string', 'Label required'], ['variant', "'filled' | 'outlined' | 'subtle' | 'plain'", 'filled'], ['multiline', 'boolean', 'false; true renders a textarea'], ['startAddon / endAddon', 'ReactNode', 'Inline text or controls'], ['header / footer', 'ReactNode', 'Content inside the shared surface'], ['ref', 'Ref<HTMLInputElement> or Ref<HTMLTextAreaElement>', 'Matches multiline'], ['Native control attributes', 'Input or textarea props', 'Forwarded to the field']],
  },
  collapsible: {
    use: 'Reveal extra details or advanced controls without building an accordion. Use the default labeled trigger or pass a BBB Button for a custom trigger. Keep interactive elements outside the trigger’s contents.',
    states: 'Use defaultOpen for initial expansion, or open with onOpenChange to control it. The hidden panel keeps its contents mounted, preserving form values while collapsed.',
    keyboard: ['Enter or Space toggles the trigger. aria-expanded and aria-controls describe its relationship to the panel.', 'Collapsed contents leave the tab order and accessibility tree. Expanded controls follow the trigger in Tab order.', 'A custom trigger must accept the Button slot prop. Use the shared Button to retain disclosure and disabled behavior.'],
    api: [['label', 'string', 'Required trigger / panel name'], ['open / defaultOpen', 'boolean', 'Controlled / initial state'], ['onOpenChange', '(open: boolean) => void', 'Expansion callback'], ['trigger', 'ReactElement<ButtonProps>', 'Optional custom Button'], ['disabled', 'boolean', 'false'], ['children / ref', 'ReactNode / Ref<HTMLDivElement>', 'Panel content / root element']],
  },
  drawer: {
    use: 'Open a focused task from the bottom of the screen. Use it for filters, quick actions, or a short form. The surface fits its content, caps its height to the viewport, and scrolls its body while keeping actions available.',
    states: 'Drawer shares Dialog’s title, description, trigger, controlled open state, and close render functions. Theme, density, and direction follow the surrounding provider. Use Sheet for start/end placement. Dismiss with the close button, backdrop, or Escape; swipe and snap points are not part of this API.',
    keyboard: ['Opening contains focus in the drawer and makes the background inert. Closing restores focus to the trigger.', 'Escape and the close button dismiss the drawer. Give it a descriptive title and keep a visible way to finish or cancel.', 'Footer buttons can submit a body form using matching form and id attributes. Safe-area spacing and reduced-motion preferences are respected.'],
    api: [['trigger', 'ReactElement', 'Required; use Button'], ['title / description', 'string', 'Title required'], ['open / onOpenChange', 'boolean / (open: boolean) => void', 'Optional controlled state'], ['children / footer', 'ReactNode or (close) => ReactNode', 'Body / persistent actions'], ['closeLabel', 'string', 'Localized sheet close label'], ['className / bodyClassName', 'string', 'Dialog / body styles']],
  },
}

function StateExamples({ id }: { id: CompositionPage }) {
  switch (id) {
    case 'button-group': return <ButtonGroup label="Vertical actions" orientation="vertical"><Button variant="secondary" size="sm">Duplicate</Button><Button variant="secondary" size="sm" disabled>Move to folder</Button></ButtonGroup>
    case 'toggle': return <div className="component-docs__row"><Toggle defaultSelected size="sm">Selected</Toggle><Toggle variant="secondary">Secondary</Toggle><Toggle disabled defaultSelected>Unavailable</Toggle></div>
    case 'toggle-group': return <ToggleGroup label="Text alignment" selectionMode="single" defaultSelectedKeys={['left']}><Toggle id="left" size="sm">Left</Toggle><Toggle id="center" size="sm">Center</Toggle><Toggle id="right" size="sm">Right</Toggle></ToggleGroup>
    case 'input-group': return <div className="composition-preview--fields"><InputGroup variant="outlined" label="Length in meters" type="number" defaultValue="24" endAddon={<span>m</span>} /><InputGroup label="Project address" error="This address is already in use." defaultValue="studio" endAddon={<span>.bbb.app</span>} /><InputGroup label="Managed address" value="design" readOnly startAddon={<span>https://</span>} /><InputGroup label="Unavailable address" disabled endAddon={<span>.bbb.app</span>} /></div>
    case 'collapsible': return <div className="composition-preview--fields"><Collapsible label="Technical details" defaultOpen trigger={<Button variant="secondary">Technical details</Button>}><p>Use a custom button and start expanded.</p></Collapsible><Collapsible label="Unavailable options" disabled><p>More options</p></Collapsible></div>
    case 'drawer': return <Drawer title="A little more room" trigger={<Button variant="secondary">Open a longer drawer</Button>} footer={close => <Button onPress={close}>Done</Button>}><div className="composition-preview--fields">{Array.from({ length: 12 }, (_, index) => <p key={index}>Section {index + 1}. Longer content scrolls within the drawer while the title and actions stay available.</p>)}</div></Drawer>
  }
}

export default function CompositionDocs({ id }: { id: CompositionPage }) {
  return <ComponentDocPage id={id} info={guidance[id]}><StateExamples id={id} /></ComponentDocPage>
}
