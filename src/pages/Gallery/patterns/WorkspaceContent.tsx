import { Avatar } from '../../../components/Avatar/Avatar'
import { AvatarGroup } from '../../../components/AvatarGroup/AvatarGroup'
import { Badge } from '../../../components/Badge/Badge'
import { Button } from '../../../components/Button/Button'
import { Card } from '../../../components/Card/Card'
import { ListRow } from '../../../components/ListRow/ListRow'
import { Sheet } from '../../../components/Sheet/Sheet'
import { initialProjects, projectOwners, projectUpdatedLabel } from './collectionData'
import { ProjectStatusBadge } from './CollectionProjectCells'

export type WorkspaceView = 'overview' | 'projects' | 'members' | 'active-projects' | 'review-projects'
const projects = initialProjects.slice(0, 3)
const members = projectOwners.map(name => ({ id: name, name, tone: 'teal' as const }))

function WorkspaceProjects({ overview, status }: { overview: boolean; status?: 'active' | 'review' }) {
  const visibleProjects = status ? projects.filter(project => project.status === status) : projects
  return (
    <Card
      title={overview ? 'Recent projects' : 'Project directory'}
      headingLevel={4}
      description="Thoughtful work, moving forward."
      footer={`${visibleProjects.length} ${visibleProjects.length === 1 ? 'project' : 'projects'}${status ? ' in this view' : ' in this workspace'}`}
    >
      <ul className="workspace-content__list">
        {visibleProjects.map(project => (
          <li key={project.id}>
            <ListRow
              label={project.name}
              description={project.summary}
              trailing={
                <Sheet
                  title={project.name}
                  description={project.summary}
                  trigger={
                    <Button variant="ghost" size="sm" aria-label={`Details for ${project.name}`}>
                      Details
                    </Button>
                  }
                >
                  <div className="workspace-project-details">
                    <ListRow label="Owner" trailing={<span>{project.owner}</span>} />
                    <ListRow
                      label="Status"
                      trailing={<ProjectStatusBadge status={project.status} />}
                    />
                    <ListRow
                      label="Updated"
                      trailing={<span>{projectUpdatedLabel(project.updated)}</span>}
                    />
                  </div>
                </Sheet>
              }
            />
          </li>
        ))}
      </ul>
    </Card>
  )
}

export function WorkspaceContent({ view }: { view: WorkspaceView }) {
  if (view === 'members')
    return (
      <Card
        title="People in your workspace"
        description="A small team with room for big ideas."
        headingLevel={4}
      >
        <ul className="workspace-content__list">
          {members.map((member, index) => (
            <li key={member.id}>
              <ListRow
                leading={<Avatar name={member.name} tone="teal" decorative />}
                label={member.name}
                description={index === 0 ? 'Workspace administrator' : 'Workspace member'}
                trailing={
                  <Badge tone={index === 0 ? 'accent' : 'neutral'}>
                    {index === 0 ? 'Owner' : 'Member'}
                  </Badge>
                }
              />
            </li>
          ))}
        </ul>
      </Card>
    )
  return (
    <div className="workspace-content">
      <WorkspaceProjects overview={view === 'overview'} status={view === 'active-projects' ? 'active' : view === 'review-projects' ? 'review' : undefined} />
      {view === 'overview' && (
        <Card
          title="Better together"
          headingLevel={4}
          variant="quiet"
          description="Four people bringing their ideas to life."
        >
          <AvatarGroup label="Studio workspace members" members={members} />
        </Card>
      )}
    </div>
  )
}
