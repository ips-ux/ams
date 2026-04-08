import { IconDefinition } from '@fortawesome/fontawesome-svg-core'
import {
  faGaugeHigh,
  faFileWaveform,
  faCloudBolt,
  faTrophy,
  faClipboardList,
  faCompactDisc,
  faChartLine,
  faNewspaper,
  faHeart,
  faLink,
  faCloudArrowDown,
  faPeopleGroup,
  faRecordVinyl,
  faGroupArrowsRotate,
  faPhotoFilm,
  faScrewdriverWrench,
  faCalendarDays,
  faClipboardCheck,
  faDumbbell,
  faShirt,
  faHeadphones,
  faBookAtlas,
  faHandshake,
  faAddressBook,
  faComment,
} from '@fortawesome/free-solid-svg-icons'
import {
  faItunesNote,
  faFirstdraft,
} from '@fortawesome/free-brands-svg-icons'

export interface RouteConfig {
  path: string
  label: string
  icon: IconDefinition
  divider?: boolean // renders a thin line BEFORE this item
  disabled?: boolean
}

export interface NavSection {
  id: string
  label: string
  icon: IconDefinition
  routes: RouteConfig[]
}

// Community bottom-bar items (icon-only, always visible at bottom of sidebar)
export interface CommunityItem {
  path: string
  label: string
  icon: IconDefinition
}

// Sidebar layout constants — shared between Sidebar and TopBar
export const SIDEBAR_EXPANDED_WIDTH = '260px'
export const SIDEBAR_COLLAPSED_WIDTH = '64px'

export const DASHBOARD_ROUTE: RouteConfig = {
  path: '/',
  label: 'Dashboard',
  icon: faGaugeHigh,
}

export const COMMUNITY_ITEMS: CommunityItem[] = [
  { path: '/library',             label: 'Aspire Library',  icon: faBookAtlas },
  { path: '/community/collabs',  label: 'Collaborations',  icon: faHandshake },
  { path: '/community',          label: 'Directory',       icon: faAddressBook },
  { path: '/community/feedback', label: 'Feedback',        icon: faComment },
]

export const NAV_SECTIONS: NavSection[] = [
  {
    id: 'creative',
    label: 'Creative',
    icon: faItunesNote,
    routes: [
      { path: '/projects',    label: 'Projects',    icon: faFirstdraft },
      { path: '/discography', label: 'Discography', icon: faFileWaveform },
      { path: '/brainstorm',  label: 'Brain Storm', icon: faCloudBolt,   divider: true },
      { path: '/challenges',  label: 'Challenges',  icon: faTrophy },
    ],
  },
  {
    id: 'management',
    label: 'Management',
    icon: faClipboardList,
    routes: [
      { path: '/releases',        label: 'Releases',        icon: faCompactDisc },
      { path: '/brand',           label: 'Brand Strategy',  icon: faChartLine,       divider: true },
      { path: '/press-kit',       label: 'Press Kit',       icon: faNewspaper },
      { path: '/social',          label: 'Social Accounts', icon: faHeart },
      { path: '/link-page',       label: 'Links Page',      icon: faLink },
      { path: '/download-gates',  label: 'Download Gates',  icon: faCloudArrowDown, disabled: true },
      { path: '/contacts',        label: 'Contacts',        icon: faPeopleGroup,     divider: true },
      { path: '/labels',          label: 'Labels',          icon: faRecordVinyl },
      { path: '/promo-platforms', label: 'Promo Platforms', icon: faGroupArrowsRotate },
      { path: '/sync-platforms',  label: 'Sync Platforms',  icon: faPhotoFilm },
    ],
  },
  {
    id: 'tools',
    label: 'Tools',
    icon: faScrewdriverWrench,
    routes: [
      { path: '/calendar',  label: 'Calendar',  icon: faCalendarDays },
      { path: '/todos',     label: 'Todos',     icon: faClipboardCheck },
      { path: '/habits',    label: 'Habits',    icon: faDumbbell },
      { path: '/merch',     label: 'Merch',     icon: faShirt },
      { path: '/playlists', label: 'Playlists', icon: faHeadphones },
    ],
  },
]
