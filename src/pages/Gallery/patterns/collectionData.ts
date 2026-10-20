export type ProjectStatus = 'active' | 'review' | 'archived'
export type CollectionFilters = { query: string; status: string; owner: string }
export const emptyCollectionFilters: CollectionFilters = { query: '', status: 'all', owner: 'all' }
export type Project = {
  id: string
  name: string
  summary: string
  owner: string
  status: ProjectStatus
  updated: number
}
export const projectStatusLabels: Record<ProjectStatus, string> = {
  active: 'Active',
  review: 'In review',
  archived: 'Archived',
}
export const projectOwners = ['Alex Morgan', 'Jamie Chen', 'Robin Lee', 'Sam Rivera']
export const initialProjects: Project[] = [
  {
    id: 'brand',
    name: 'Brand refresh',
    summary: 'A familiar identity, thoughtfully refined.',
    owner: 'Alex Morgan',
    status: 'active',
    updated: 12,
  },
  {
    id: 'stories',
    name: 'Customer stories',
    summary: 'Good work, told by the people behind it.',
    owner: 'Jamie Chen',
    status: 'review',
    updated: 11,
  },
  {
    id: 'library',
    name: 'Design library',
    summary: 'Shared pieces for a consistent experience.',
    owner: 'Robin Lee',
    status: 'active',
    updated: 10,
  },
  {
    id: 'launch',
    name: 'Launch checklist',
    summary: 'The small details before the big day.',
    owner: 'Sam Rivera',
    status: 'active',
    updated: 9,
  },
  {
    id: 'onboarding',
    name: 'Member onboarding',
    summary: 'A warm welcome and a clear first step.',
    owner: 'Alex Morgan',
    status: 'review',
    updated: 8,
  },
  {
    id: 'mobile',
    name: 'Mobile experience',
    summary: 'Thoughtful interactions, wherever you are.',
    owner: 'Jamie Chen',
    status: 'active',
    updated: 7,
  },
  {
    id: 'notes',
    name: 'Product notes',
    summary: 'Useful context for the next decision.',
    owner: 'Robin Lee',
    status: 'active',
    updated: 6,
  },
  {
    id: 'research',
    name: 'Research archive',
    summary: 'What we learned along the way.',
    owner: 'Sam Rivera',
    status: 'archived',
    updated: 5,
  },
  {
    id: 'campaign',
    name: 'Seasonal campaign',
    summary: 'A fresh perspective for the season.',
    owner: 'Alex Morgan',
    status: 'review',
    updated: 4,
  },
  {
    id: 'website',
    name: 'Studio website',
    summary: 'A small window into the work we do.',
    owner: 'Jamie Chen',
    status: 'active',
    updated: 3,
  },
  {
    id: 'handbook',
    name: 'Team handbook',
    summary: 'The ways we work well together.',
    owner: 'Robin Lee',
    status: 'archived',
    updated: 2,
  },
  {
    id: 'search',
    name: 'Workspace search',
    summary: 'Find the right thing with a little less effort.',
    owner: 'Sam Rivera',
    status: 'active',
    updated: 1,
  },
]
export function projectUpdatedLabel(updated: number) {
  return updated >= 10 ? 'Today' : updated >= 7 ? 'Yesterday' : 'Last week'
}
