import { useEffect, useId, useRef, useState } from 'react'
import { WorkspaceAccount } from './WorkspaceAccount'
import { ShellIdentity } from '../components/ShellIdentity'
import { BrandLogo } from '../../../components/BrandLogo/BrandLogo'
import { HelpResources } from '../components/HelpResources'
import { Breadcrumbs } from '../../../components/Breadcrumbs/Breadcrumbs'
import { Button } from '../../../components/Button/Button'
import { Icon } from '../../../components/Icon/Icon'
import { PageHeader } from '../../../components/PageHeader/PageHeader'
import { Sheet } from '../../../components/Sheet/Sheet'
import { SidebarNavigation } from '../../../components/SidebarNavigation/SidebarNavigation'
import type { SidebarNavigationGroup } from '../../../components/SidebarNavigation/SidebarNavigation'
import { WorkspaceContent } from './WorkspaceContent'
import type { WorkspaceView } from './WorkspaceContent'
import { WorkspaceDetails } from './WorkspaceDetails'
import type { WorkspaceDetailsValue } from './WorkspaceDetails'
import { SidebarToggle } from '../../../components/SidebarNavigation/SidebarToggle'
import { useSidebarToggle } from '../../../components/SidebarNavigation/useSidebarToggle'
import './WorkspaceShellPattern.css'

const viewDetails = {
  overview: {
    title: 'Overview',
    description: 'Your people, projects, and a little room to think.',
  },
  projects: { title: 'Projects', description: 'A closer look at what your team is making.' },
  'active-projects': { title: 'Active projects', description: 'The work moving forward right now.' },
  'review-projects': { title: 'In review', description: 'Ready for a fresh pair of eyes.' },
  members: { title: 'Members', description: 'The people who make this workspace yours.' },
}

export function WorkspaceShellPattern({ navigationDropdowns = false, branded = true }: { navigationDropdowns?: false | 'pages' | 'sections'; branded?: boolean }) {
  const prefix = useId()
  const headingRef = useRef<HTMLHeadingElement>(null)
  const menuRef = useRef<HTMLButtonElement>(null)
  const menuContentRef = useRef<HTMLDivElement>(null)
  const { collapsed: sidebarCollapsed, buttonRef, toggle: toggleSidebar } = useSidebarToggle()
  const pendingFocus = useRef<'heading' | 'menu' | null>(null)
  const [view, setView] = useState<WorkspaceView>('overview')
  const [menuOpen, setMenuOpen] = useState(false)
  const [activeWorkspace, setActiveWorkspace] = useState(0)
  const [signedOut, setSignedOut] = useState(false)
  const [workspaces, setWorkspaces] = useState<WorkspaceDetailsValue[]>([{
    name: 'Studio',
    description: 'Good ideas come together here.',
    digest: true,
  }, { name: 'Personal', description: 'A space for your own ideas.', digest: false }])
  const workspace = workspaces[activeWorkspace]
  function setWorkspace(value: WorkspaceDetailsValue) {
    setWorkspaces(items => items.map((item, index) => index === activeWorkspace ? value : item))
  }
  const [message, setMessage] = useState('Sample workspace. Changes stay in this preview.')

  // Wait for the exiting sheet and its focus scope to unmount before handing
  // focus to the destination. This also handles closing after a viewport resize.
  useEffect(() => {
    if (menuOpen || !pendingFocus.current) return
    let frame: number
    function restoreFocus() {
      if (menuContentRef.current) {
        frame = requestAnimationFrame(restoreFocus)
        return
      }
      frame = requestAnimationFrame(() => {
        const target =
          pendingFocus.current === 'menu' && menuRef.current?.getClientRects().length
            ? menuRef.current
            : headingRef.current
        target?.focus()
        pendingFocus.current = null
      })
    }
    frame = requestAnimationFrame(restoreFocus)
    return () => cancelAnimationFrame(frame)
  }, [menuOpen, view])

  function navigate(id: string) {
    if (!(id in viewDetails)) return
    pendingFocus.current = 'heading'
    setView(id as WorkspaceView)
    setMenuOpen(false)
    if (id === view && !menuOpen) {
      headingRef.current?.focus()
      pendingFocus.current = null
    }
  }
  const groups: SidebarNavigationGroup[] = [
    {
      id: 'workspace',
      label: 'Workspace',
      collapsible: navigationDropdowns === 'sections',
      icon: 'layers',
      items: [
        { id: 'overview', label: 'Overview', icon: 'layout-grid', href: `#${prefix}-overview` },
        {
          id: 'projects',
          label: 'Projects',
          icon: 'layers',
          badge: navigationDropdowns === 'pages' ? undefined : '3',
          ...(navigationDropdowns === 'pages' ? {
            id: 'project-pages',
            children: [
              { id: 'projects', label: 'All projects', icon: 'layout-grid' as const, href: `#${prefix}-projects` },
              { id: 'active-projects', label: 'Active projects', icon: 'layers' as const, href: `#${prefix}-active-projects` },
              { id: 'review-projects', label: 'In review', icon: 'check' as const, href: `#${prefix}-review-projects` },
            ],
          } : { href: `#${prefix}-projects` }),
        },
      ],
    },
    {
      id: 'manage',
      label: 'Manage',
      collapsible: navigationDropdowns === 'sections',
      defaultExpanded: false,
      icon: 'user-round',
      items: [
        { id: 'members', label: 'Members', icon: 'user-round', badge: '4', href: `#${prefix}-members` },
        {
          id: 'billing',
          label: 'Billing',
          icon: 'box',
          badge: 'Soon',
          href: `#${prefix}-billing`,
          disabled: true,
        },
      ],
    },
  ]
  return (
    <div
      className="workspace-shell"
      role="group"
      aria-label={navigationDropdowns ? 'Sidebar dropdowns example' : 'Workspace shell example'}
      data-branded={branded || undefined}
      data-sidebar-collapsed={sidebarCollapsed || undefined}
    >
      <div className="workspace-shell__topbar">
        <div className="workspace-shell__desktop-toggle">
          {branded ? <ShellIdentity collapsed={sidebarCollapsed}>
            <SidebarToggle collapsed={sidebarCollapsed} controls={`${prefix}-sidebar`} onToggle={toggleSidebar} buttonRef={buttonRef} />
          </ShellIdentity> : <SidebarToggle collapsed={sidebarCollapsed} controls={`${prefix}-sidebar`} onToggle={toggleSidebar} buttonRef={buttonRef} />}
        </div>
        <div className="workspace-shell__mobile-menu">
          <Sheet
            side="start"
            title="Workspace navigation"
            open={menuOpen}
            onOpenChange={open => {
              if (!open && !pendingFocus.current) pendingFocus.current = 'menu'
              setMenuOpen(open)
            }}
            trigger={
              <Button
                ref={menuRef}
                variant="ghost"
                iconOnly
                aria-label="Open workspace navigation"
                disabled={signedOut}
              >
                <Icon name="menu" />
              </Button>
            }
          >
            <div ref={menuContentRef}>
              <SidebarNavigation
                label="Studio mobile navigation"
                groups={groups}
                currentId={view}
                onNavigate={navigate}
              />
              <HelpResources />
            </div>
          </Sheet>
        </div>
        <span className="workspace-shell__name">Workspace</span>
        {branded && <span className="workspace-shell__mobile-brand"><BrandLogo /></span>}
        <WorkspaceAccount workspaces={workspaces} active={activeWorkspace} onSave={setWorkspace}
          signedOut={signedOut} onSessionChange={value => { setSignedOut(value); setMessage(value ? 'Signed out of this preview.' : 'Signed in to this preview.') }}
          onSwitch={index => { setActiveWorkspace(index); setView('overview'); setMessage(`Switched to ${workspaces[index].name}. Changes stay in this preview.`) }} />
      </div>
      <div
        id={`${prefix}-sidebar`}
        className="workspace-shell__sidebar-track"
      >
        <aside className="workspace-shell__sidebar">
          <SidebarNavigation
            inert={signedOut}
            aria-hidden={signedOut || undefined}
            label="Studio desktop navigation"
            compact={sidebarCollapsed}
            groups={groups}
            currentId={view}
            onNavigate={navigate}
          />
          <div className="workspace-shell__help"><HelpResources compact={sidebarCollapsed} /></div>
        </aside>
      </div>
      <div className="workspace-shell__main">
        <div className="workspace-shell__content">
          {signedOut ? <p>Sign in through the account menu to return to your workspace.</p> : <>
            <PageHeader
              headingLevel={4}
              title={viewDetails[view].title}
              description={
                view === 'overview' ? workspace.description : viewDetails[view].description
              }
              titleId={`${prefix}-${view}`}
              titleRef={headingRef}
              breadcrumbs={
                <Breadcrumbs
                  label="Workspace shell location"
                  items={[
                    { id: 'workspace', label: workspace.name, href: `#${prefix}-${view}` },
                    { id: view, label: viewDetails[view].title },
                  ]}
                />
              }
              actions={
                <WorkspaceDetails
                  value={workspace}
                  onSave={next => {
                    setWorkspace(next)
                    setMessage(`${next.name} workspace saved in this preview.`)
                  }}
                />
              }
            />
            <WorkspaceContent view={view} />
          </>}
          <p className="workspace-shell__status" role="status">
            {message}
          </p>
        </div>
      </div>
    </div>
  )
}
