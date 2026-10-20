import { Tree, TreeItem, TreeItemContent } from 'react-aria-components'
import type { CSSProperties } from 'react'
import { Button } from '../Button/Button'
import { Icon } from '../Icon/Icon'
import { useMessages } from '../LocaleProvider/locale'
import './TreeView.css'
export type TreeViewItem = { id: string; label: string; disabled?: boolean; children?: TreeViewItem[] }
export type TreeViewProps = {
  label: string
  items: TreeViewItem[]
  selectedId?: string
  onSelectionChange: (id: string) => void
  expandedIds?: string[]
  defaultExpandedIds?: string[]
  onExpandedChange?: (ids: string[]) => void
  className?: string
}
export function TreeView({ label, items, selectedId, onSelectionChange, expandedIds, defaultExpandedIds, onExpandedChange, className = '' }: TreeViewProps) {
  const { t } = useMessages()
  function render(items: TreeViewItem[]) {
    return items.map(item => <TreeItem key={item.id} id={item.id} textValue={item.label} isDisabled={item.disabled}
      className="bbb-tree-view__item" style={({ level }) => ({ '--bbb-tree-depth': level - 1 } as CSSProperties)}>
      <TreeItemContent>{({ hasChildItems, isExpanded }) => <>
        {hasChildItems && <Button slot="chevron" variant="ghost" size="sm" iconOnly aria-label={t(isExpanded ? 'collapseRow' : 'expandRow', { name: item.label })}><Icon name={isExpanded ? 'chevron-down' : 'chevron-right'} /></Button>}
        {!hasChildItems && <Icon name="file-text" />}<span>{item.label}</span>
      </>}</TreeItemContent>
      {item.children && render(item.children)}
    </TreeItem>)
  }
  return <Tree aria-label={label} selectionMode="single" selectionBehavior="replace" selectedKeys={selectedId ? [selectedId] : []}
    onSelectionChange={keys => { if (keys !== 'all') { const first = [...keys][0]; if (first !== undefined) onSelectionChange(String(first)) } }}
    expandedKeys={expandedIds} defaultExpandedKeys={defaultExpandedIds} onExpandedChange={keys => onExpandedChange?.([...keys].map(String))}
    className={`bbb-tree-view ${className}`} renderEmptyState={() => <p>{t('noItems')}</p>}>
    {render(items)}
  </Tree>
}
