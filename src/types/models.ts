// =============================================================================
// Aspire AMS — Firestore Document Types
// All document models use Firestore Timestamp for date fields.
// =============================================================================

import { Timestamp } from 'firebase/firestore'

import type {
  BrandArchetype,
  ChallengeStatus,
  ChallengeType,
  CollabStatus,
  ContactRole,
  ContentStatus,
  FeedbackStatus,
  MerchStatus,
  MethodologyCategory,
  MusicalKey,
  ProjectStage,
  PromoType,
  SocialPlatform,
  SubmissionStatus,
  TodoCategory,
  TodoPriority,
  UserRole,
} from './enums'

// Import ThemeKey from theme (canonical source with full DAW theme list)
import type { ThemeKey } from './theme'

// =============================================================================
// Base document fields shared by every Firestore document
// =============================================================================

export interface BaseDocument {
  id: string
  createdAt: Timestamp
  updatedAt: Timestamp
}

// =============================================================================
// Sub-types (nested objects within documents)
// =============================================================================

// -- Project sub-types --------------------------------------------------------

export interface MixVersion {
  url: string
  version: number
  notes: string
  createdAt: Timestamp
}

export interface Credit {
  name: string
  role: string
  contactRef?: string
}

// -- Brand sub-types ----------------------------------------------------------

export interface BrandPersona {
  coreIdentity: string
  personalityTraits: string[]
  story: string
  emotionalAppeal: string
  uniqueQualities: string[]
  demographics: string
}

export interface BrandArchetypeData {
  primary: BrandArchetype
  secondary: BrandArchetype | null
  coreDesire: string
  goal: string
  fear: string
  strategy: string
}

/** @deprecated Use BrandArchetypeData */
export type BrandArchetypeProfile = BrandArchetypeData

export interface BrandAesthetic {
  colorPalette: string[]
  typography: string[]
  imagery: string[]
  visualStyle: string
  mood: string
}

export interface BrandSound {
  genres: string[]
  influences: string[]
  productionStyle: string
  emotionalTone: string
  signatureElements: string[]
}

export interface BrandVoice {
  tone: string
  vocabulary: string[]
  communicationStyle: string
  tagline: string
}

// -- Release sub-types --------------------------------------------------------

export interface PromoChecklistItem {
  task: string
  dueDate: Timestamp
  completed: boolean
  dayOffset: number
}

export interface SubmissionLogEntry {
  labelRef: string
  dateSent: Timestamp
  status: string
  response: string
  followUpDate: Timestamp | null
}

// -- Methodology sub-types ----------------------------------------------------

export interface MethodologySection {
  title: string
  anchor: string
  level: number
  contentPreview: string
}

// =============================================================================
// Document models
// =============================================================================

// -- UserProfile --------------------------------------------------------------

export interface UserProfile extends BaseDocument {
  displayName: string
  artistName: string
  email: string
  role: UserRole
  avatarUrl: string
  bio: string
  theme: ThemeKey
  onboardingComplete: boolean
  brandStrategyComplete: boolean
}

// -- Project ------------------------------------------------------------------

export interface Project extends BaseDocument {
  title: string
  bpm: number | null
  key: MusicalKey | null
  genre: string
  stage: ProjectStage
  notes: string
  collaborators: string[]
  tags: string[]
  artworkUrl: string | null
  mixVersions: MixVersion[]
  submissionStatus: SubmissionStatus
  releaseDate: Timestamp | null
  streamingLinks: Record<string, string>
  credits: Credit[]
}

// -- Contact ------------------------------------------------------------------

export interface Contact extends BaseDocument {
  name: string
  role: ContactRole
  email: string
  phone: string
  socials: Partial<Record<SocialPlatform, string>>
  labelRefs: string[]
  notes: string
}

// -- Label --------------------------------------------------------------------

export interface Label extends BaseDocument {
  name: string
  genres: string[]
  notableArtists: string[]
  events: string[]
  email: string
  demoSubmissionUrl: string
  contactRefs: string[]
  discographyUrl: string
  notes: string
}

// -- PromoPlatform ------------------------------------------------------------

export interface PromoPlatform extends BaseDocument {
  name: string
  type: PromoType
  url: string
  contactEmail: string
  genres: string[]
  notes: string
  customGroup: string | null
}

// -- SyncPlatform -------------------------------------------------------------

export interface SyncPlatform extends BaseDocument {
  name: string
  url: string
  contactInfo: string
  notes: string
}

// -- BrandProfile -------------------------------------------------------------

export interface BrandProfile extends BaseDocument {
  persona: BrandPersona
  archetype: BrandArchetypeData
  aesthetic: BrandAesthetic
  sound: BrandSound
  vision: string
  goals: string[]
  targetMarkets: string[]
  associations: string[]
  voice: BrandVoice
  boardImages: string[]
  completionProgress: number
}

// -- SocialAccount ------------------------------------------------------------

export interface SocialAccount extends BaseDocument {
  platform: SocialPlatform
  handle: string
  url: string
  followerCount: number | null
  notes: string
}

// -- ContentIdea --------------------------------------------------------------

export interface ContentIdea extends BaseDocument {
  title: string
  type: string
  platforms: SocialPlatform[]
  status: ContentStatus
  dueDate: Timestamp | null
  caption: string
  strengths: string[]
  interests: string[]
  valueScore: number
  effortScore: number
  alignmentScore: number
}

// -- PressKit -----------------------------------------------------------------

export interface PressKit extends BaseDocument {
  bio: string
  pressPhotoUrls: string[]
  prLinks: string[]
  epkUrl: string | null
}

// -- Release ------------------------------------------------------------------

export interface Release extends BaseDocument {
  projectRef: string
  title: string
  releaseDate: Timestamp
  platforms: Record<string, string>
  promoChecklist: PromoChecklistItem[]
  submissionLog: SubmissionLogEntry[]
  distributionPlatform: string
  isrc: string
}

// -- Todo ---------------------------------------------------------------------

export interface Todo extends BaseDocument {
  text: string
  completed: boolean
  dueDate: Timestamp | null
  category: TodoCategory
  priority: TodoPriority
}

// -- HabitDay -----------------------------------------------------------------

export interface HabitDay extends BaseDocument {
  date: string
  habits: Record<string, boolean>
}

// -- MerchProduct -------------------------------------------------------------

export interface MerchProduct extends BaseDocument {
  name: string
  cost: number
  price: number
  quantity: number
  supplier: string
  status: MerchStatus
  stockAlert: number
  imageUrl: string | null
}

// -- Playlist -----------------------------------------------------------------

export interface Playlist extends BaseDocument {
  name: string
  platform: SocialPlatform
  url: string
  trackNames: string[]
  notes: string
}

// -- CommunityProfile ---------------------------------------------------------

export interface CommunityProfile extends BaseDocument {
  userId: string
  artistName: string
  avatarUrl: string | null
  genres: string[]
  socials: Record<string, string>
  bio: string
  lookingFor: string[]
}

// -- FeedbackRequest ----------------------------------------------------------

export interface FeedbackRequest extends BaseDocument {
  fromUserId: string
  toUserId: string
  projectRef: string
  mixVersion: number
  comments: string
  rating: number | null
  status: FeedbackStatus
}

// -- CollaborationRequest -----------------------------------------------------

export interface CollaborationRequest extends BaseDocument {
  requestedBy: string
  requestedTo: string
  projectRef: string | null
  status: CollabStatus
  message: string
}

// -- MethodologyDoc -----------------------------------------------------------

export interface MethodologyDoc extends BaseDocument {
  title: string
  slug: string
  category: MethodologyCategory
  order: number
  content: string
  sections: MethodologySection[]
}

// -- Challenge ----------------------------------------------------------------

export interface Challenge extends BaseDocument {
  title: string
  type: ChallengeType
  status: ChallengeStatus
  dueDate: Timestamp | null
  notes: string
  completionNotes: string
}

// -- LinkItem (sub-type for LinkPageProfile) -----------------------------------

export interface LinkItem {
  id: string
  title: string
  url: string
  emoji: string
  enabled: boolean
  order: number
}

// -- LinkPageProfile ----------------------------------------------------------

export interface LinkPageProfile extends BaseDocument {
  links: LinkItem[]
  pageTitle: string
  bio: string
  avatarUrl: string | null
}
