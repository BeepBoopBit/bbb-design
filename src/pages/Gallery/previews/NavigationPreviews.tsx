import { Accordion } from '../../../components/Accordion/Accordion'
import { Tabs } from '../../../components/Tabs/Tabs'
import './Previews.css'

export function TabsPreview() {
  return (
    <div className="preview-wide">
      <Tabs
        label="Project information"
        items={[
          {
            id: 'overview',
            label: 'Overview',
            content: (
              <p>A little space for the big picture. Use the arrow keys to explore the tabs.</p>
            ),
          },
          {
            id: 'activity',
            label: 'Activity',
            content: <p>You’re all caught up. New activity will appear here.</p>,
          },
          { id: 'archive', label: 'Archive', content: 'Archived items', disabled: true },
        ]}
      />
    </div>
  )
}

export function AccordionPreview() {
  return (
    <div className="preview-wide">
      <Accordion
        defaultExpandedKeys={['details']}
        items={[
          {
            id: 'details',
            title: 'The details',
            content: <p>Everything you need, with room for the rest to stay out of the way.</p>,
          },
          {
            id: 'sharing',
            title: 'Sharing and access',
            content: <p>You decide who gets to see your work. Open one section at a time.</p>,
          },
          {
            id: 'advanced',
            title: 'Advanced · unavailable',
            content: 'More settings',
            disabled: true,
          },
        ]}
      />
    </div>
  )
}
