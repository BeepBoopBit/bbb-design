import { Avatar } from '../../../components/Avatar/Avatar'
import { Badge } from '../../../components/Badge/Badge'
import { Button } from '../../../components/Button/Button'
import { Dialog } from '../../../components/Dialog/Dialog'
import { DropdownMenu } from '../../../components/DropdownMenu/DropdownMenu'
import { Icon } from '../../../components/Icon/Icon'
import { projectStatusLabels, projectUpdatedLabel } from './collectionData'
import type { Project, ProjectStatus } from './collectionData'

export function ProjectStatusBadge({ status }: { status: ProjectStatus }) {
  return (
    <Badge tone={status === 'active' ? 'accent' : status === 'review' ? 'warning' : 'neutral'}>
      {projectStatusLabels[status]}
    </Badge>
  )
}

export function ProjectNameCell({ project }: { project: Project }) {
  return (
    <Dialog
      title={project.name}
      description={project.summary}
      trigger={
        <Button variant="ghost" className="collection-project__name">
          {project.name}
        </Button>
      }
    >
      <dl className="collection-project__details">
        <div>
          <dt>Owner</dt>
          <dd>{project.owner}</dd>
        </div>
        <div>
          <dt>Status</dt>
          <dd>
            <ProjectStatusBadge status={project.status} />
          </dd>
        </div>
        <div>
          <dt>Updated</dt>
          <dd>{projectUpdatedLabel(project.updated)}</dd>
        </div>
      </dl>
    </Dialog>
  )
}

export function ProjectOwnerCell({ name }: { name: string }) {
  return (
    <span className="collection-project__owner">
      <Avatar name={name} size="sm" tone="teal" decorative />
      <span>{name}</span>
    </span>
  )
}

export function ProjectActions({
  project,
  onStatusChange,
}: {
  project: Project
  onStatusChange: (id: string, status: ProjectStatus) => void
}) {
  const archived = project.status === 'archived'
  return (
    <DropdownMenu
      label={`Project actions for ${project.name}`}
      trigger={
        <Button variant="ghost" iconOnly aria-label={`Actions for ${project.name}`}>
          <Icon name="ellipsis" />
        </Button>
      }
      items={[
        {
          id: archived ? 'restore' : 'archive',
          label: archived ? 'Restore project' : 'Archive project',
        },
      ]}
      onAction={() => onStatusChange(project.id, archived ? 'active' : 'archived')}
    />
  )
}
