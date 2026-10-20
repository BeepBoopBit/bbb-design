import { Icon } from '../../../components/Icon/Icon'
import type { IconName } from '../../../components/Icon/Icon'

const principles: { icon: IconName; title: string; description: string }[] = [
  { icon: 'sparkles', title: 'Clarity comes first', description: 'Less noise. More meaning.' },
  { icon: 'scan', title: 'Space to breathe', description: 'A calm, effortless rhythm.' },
  { icon: 'mouse-pointer', title: 'Care in every detail', description: 'Feels as good as it looks.' },
]

export function DesignPrinciples() {
  return (
    <section className="gallery-principles" aria-label="Our design principles">
      {principles.map(({ icon, title, description }) => (
        <div className="gallery-principle" key={title}>
          <span className="gallery-principle__icon"><Icon name={icon} /></span>
          <div>
            <h2>{title}</h2>
            <p>{description}</p>
          </div>
        </div>
      ))}
    </section>
  )
}
