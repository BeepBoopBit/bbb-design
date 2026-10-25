import {
  ArrowDown, ArrowLeft, ArrowRight, ArrowUp, Bell, Bot, Box, Calendar, Check,
  ChevronDown, ChevronLeft, ChevronRight, ChevronsUpDown, CircleCheck, Clock,
  Columns2, Combine, Copy, Ellipsis, Expand, ExternalLink, Eye, EyeOff, FileText,
  Folder, FolderPlus, House, Image, Inbox, Info, Layers, LayoutGrid, Mail,
  Maximize, Menu, MessageSquareReply, MessagesSquare, Mic, MicOff, Minimize,
  Monitor, Moon, MousePointer, Orbit, PanelLeft, PanelRight, PanelsTopLeft,
  Pencil, Phone, PhoneOff, Plug, Plus, RefreshCw, RotateCcwClock, Rows2, Scan,
  ScrollText, Search, Send, Settings, Sparkles, SquareCheck, SquareTerminal,
  Sun, Trash2, TriangleAlert, UserRound, Volume2, VolumeX, Wallet, Workflow,
  Wrench, X, Minus, Bookmark, SlidersHorizontal,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

// Named imports keep the shared selection small. Add new Lucide icons here.
export const lucideIcons = {
  'arrow-down': ArrowDown,
  'arrow-left': ArrowLeft,
  'arrow-right': ArrowRight,
  'arrow-up': ArrowUp,
  bell: Bell,
  bookmark: Bookmark,
  bot: Bot,
  box: Box,
  calendar: Calendar,
  check: Check,
  'chevron-down': ChevronDown,
  'chevron-left': ChevronLeft,
  'chevron-right': ChevronRight,
  'chevrons-up-down': ChevronsUpDown,
  'circle-check': CircleCheck,
  clock: Clock,
  'columns-2': Columns2,
  combine: Combine,
  copy: Copy,
  ellipsis: Ellipsis,
  expand: Expand,
  'external-link': ExternalLink,
  eye: Eye,
  'eye-off': EyeOff,
  'file-text': FileText,
  folder: Folder,
  'folder-plus': FolderPlus,
  house: House,
  image: Image,
  inbox: Inbox,
  info: Info,
  layers: Layers,
  'layout-grid': LayoutGrid,
  mail: Mail,
  maximize: Maximize,
  menu: Menu,
  'message-square-reply': MessageSquareReply,
  'messages-square': MessagesSquare,
  mic: Mic,
  'mic-off': MicOff,
  minimize: Minimize,
  minus: Minus,
  monitor: Monitor,
  moon: Moon,
  'mouse-pointer': MousePointer,
  orbit: Orbit,
  'panel-left': PanelLeft,
  'panel-right': PanelRight,
  'panels-top-left': PanelsTopLeft,
  pencil: Pencil,
  phone: Phone,
  'phone-off': PhoneOff,
  plug: Plug,
  plus: Plus,
  'refresh-cw': RefreshCw,
  'rotate-ccw-clock': RotateCcwClock,
  'rows-2': Rows2,
  scan: Scan,
  'scroll-text': ScrollText,
  search: Search,
  send: Send,
  settings: Settings,
  'sliders-horizontal': SlidersHorizontal,
  sparkles: Sparkles,
  'square-check': SquareCheck,
  'square-terminal': SquareTerminal,
  sun: Sun,
  'trash-2': Trash2,
  'triangle-alert': TriangleAlert,
  'user-round': UserRound,
  'volume-2': Volume2,
  'volume-x': VolumeX,
  wallet: Wallet,
  workflow: Workflow,
  wrench: Wrench,
  x: X,
} satisfies Record<string, LucideIcon>

export type LucideIconName = keyof typeof lucideIcons

// Preserve the original BBB names for existing consumers and artwork overrides.
export const iconAliases = {
  app: 'panels-top-left',
  arrow: 'arrow-right',
  close: 'x',
  external: 'external-link',
  grid: 'layout-grid',
  more: 'ellipsis',
  note: 'file-text',
  person: 'user-round',
  pointer: 'mouse-pointer',
  refresh: 'refresh-cw',
  sidebar: 'panel-left',
  sort: 'chevrons-up-down',
  space: 'scan',
  sparkle: 'sparkles',
  trash: 'trash-2',
  warning: 'triangle-alert',
} as const satisfies Record<string, LucideIconName>

export type IconName = LucideIconName | keyof typeof iconAliases

export function resolveIconName(name: IconName): LucideIconName {
  return Object.hasOwn(iconAliases, name)
    ? iconAliases[name as keyof typeof iconAliases]
    : name as LucideIconName
}

export const lucideIconNames = Object.keys(lucideIcons) as LucideIconName[]
export const iconNames: IconName[] = [
  ...lucideIconNames,
  ...Object.keys(iconAliases) as (keyof typeof iconAliases)[],
]
