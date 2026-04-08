// =============================================================================
// Aspire AMS — Application Enums
// Each enum is defined as a const array with a derived union type.
// =============================================================================

// -- Project stages (8-stage pipeline) ----------------------------------------
export const PROJECT_STAGES = [
  'spark',
  'expand',
  'arrange',
  'elevate',
  'finalize',
  'mixing',
  'mastering',
  'complete',
] as const
export type ProjectStage = (typeof PROJECT_STAGES)[number]

// -- Submission statuses ------------------------------------------------------
export const SUBMISSION_STATUSES = [
  'draft',
  'submitted',
  'reviewing',
  'accepted',
  'rejected',
  'scheduled',
  'released',
] as const
export type SubmissionStatus = (typeof SUBMISSION_STATUSES)[number]

// -- Contact roles ------------------------------------------------------------
export const CONTACT_ROLES = [
  'producer',
  'dj',
  'vocalist',
  'artist',
  'designer',
  'mastering-engineer',
  'engineer',
  'writer',
  'a&r',
  'manager',
  'agent',
  'other',
] as const
export type ContactRole = (typeof CONTACT_ROLES)[number]

// -- User roles ---------------------------------------------------------------
export const USER_ROLES = ['artist', 'manager', 'agent', 'admin'] as const
export type UserRole = (typeof USER_ROLES)[number]

// -- Social platforms ---------------------------------------------------------
export const SOCIAL_PLATFORMS = [
  'soundcloud',
  'tiktok',
  'instagram',
  'snapchat',
  'youtube',
  'facebook',
  'spotify',
  'apple-music',
  'twitter',
] as const
export type SocialPlatform = (typeof SOCIAL_PLATFORMS)[number]

// -- Brand archetypes (Brand Strategy System) ---------------------------------
export const BRAND_ARCHETYPES = [
  'innocent',
  'everyman',
  'hero',
  'outlaw',
  'creator',
  'lover',
  'jester',
  'sage',
  'magician',
  'caregiver',
  'ruler',
  'explorer',
] as const
export type BrandArchetype = (typeof BRAND_ARCHETYPES)[number]

// -- Content idea status ------------------------------------------------------
export const CONTENT_STATUSES = [
  'idea',
  'planned',
  'in-progress',
  'published',
  'archived',
] as const
export type ContentStatus = (typeof CONTENT_STATUSES)[number]

// -- Musical keys -------------------------------------------------------------
export const MUSICAL_KEYS = [
  'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B',
  'Cm', 'C#m', 'Dm', 'D#m', 'Em', 'Fm', 'F#m', 'Gm', 'G#m', 'Am', 'A#m', 'Bm',
] as const
export type MusicalKey = (typeof MUSICAL_KEYS)[number]

// -- Promo platform types -----------------------------------------------------
export const PROMO_TYPES = [
  'spotify-playlist',
  'youtube-channel',
  'blog',
  'radio',
  'dj-pool',
  'podcast',
  'other',
] as const
export type PromoType = (typeof PROMO_TYPES)[number]

// -- Merch status -------------------------------------------------------------
export const MERCH_STATUSES = [
  'in-stock',
  'low-stock',
  'out-of-stock',
  'incoming',
  'discontinued',
] as const
export type MerchStatus = (typeof MERCH_STATUSES)[number]

// -- Collaboration status -----------------------------------------------------
export const COLLAB_STATUSES = [
  'pending',
  'accepted',
  'declined',
  'completed',
] as const
export type CollabStatus = (typeof COLLAB_STATUSES)[number]

// -- Feedback request status --------------------------------------------------
export const FEEDBACK_STATUSES = ['requested', 'completed'] as const
export type FeedbackStatus = (typeof FEEDBACK_STATUSES)[number]

// -- Methodology document categories ------------------------------------------
export const METHODOLOGY_CATEGORIES = [
  'production',
  'business',
  'workflow',
] as const
export type MethodologyCategory = (typeof METHODOLOGY_CATEGORIES)[number]

// -- Todo priority ------------------------------------------------------------
export const TODO_PRIORITIES = ['low', 'medium', 'high', 'urgent'] as const
export type TodoPriority = (typeof TODO_PRIORITIES)[number]

// -- Todo category ------------------------------------------------------------
export const TODO_CATEGORIES = [
  'general',
  'production',
  'marketing',
  'branding',
  'admin',
] as const
export type TodoCategory = (typeof TODO_CATEGORIES)[number]

// -- Challenge types ---------------------------------------------------------
export const CHALLENGE_TYPES = [
  'time-limit',
  'constraint',
  'collab',
  'listening',
  'genre-surf',
] as const
export type ChallengeType = (typeof CHALLENGE_TYPES)[number]

// -- Challenge statuses -------------------------------------------------------
export const CHALLENGE_STATUSES = ['active', 'completed', 'archived'] as const
export type ChallengeStatus = (typeof CHALLENGE_STATUSES)[number]

// -- Theme keys — see src/types/theme.ts (canonical source with full DAW theme list)
// ThemeKey and THEME_KEYS are intentionally defined in theme.ts, not here.
