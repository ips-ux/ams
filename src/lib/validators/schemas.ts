// =============================================================================
// Aspire AMS — Zod Validation Schemas
// One schema per major entity. Each exports both the schema and its inferred type.
// Enum schemas are derived directly from the const arrays in enums.ts to keep
// the two files in sync without duplication.
// =============================================================================

import { z } from 'zod'
import {
  PROJECT_STAGES,
  CONTACT_ROLES,
  USER_ROLES,
  SUBMISSION_STATUSES,
  BRAND_ARCHETYPES,
  CONTENT_STATUSES,
  PROMO_TYPES,
  MERCH_STATUSES,
  TODO_PRIORITIES,
  TODO_CATEGORIES,
  MUSICAL_KEYS,
  SOCIAL_PLATFORMS,
  CHALLENGE_TYPES,
  CHALLENGE_STATUSES,
} from '@/types/enums'

// =============================================================================
// Reusable enum sub-schemas
// =============================================================================

const projectStageEnum = z.enum(PROJECT_STAGES)
const submissionStatusEnum = z.enum(SUBMISSION_STATUSES)
const contactRoleEnum = z.enum(CONTACT_ROLES)
const userRoleEnum = z.enum(USER_ROLES)
const brandArchetypeEnum = z.enum(BRAND_ARCHETYPES)
const contentStatusEnum = z.enum(CONTENT_STATUSES)
const promoTypeEnum = z.enum(PROMO_TYPES)
const merchStatusEnum = z.enum(MERCH_STATUSES)
const todoPriorityEnum = z.enum(TODO_PRIORITIES)
const todoCategoryEnum = z.enum(TODO_CATEGORIES)
const musicalKeyEnum = z.enum(MUSICAL_KEYS)
const socialPlatformEnum = z.enum(SOCIAL_PLATFORMS)

// =============================================================================
// Project schema
// =============================================================================

export const projectSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  bpm: z.number().positive('BPM must be positive').optional(),
  key: musicalKeyEnum.optional(),
  genre: z.string().optional(),
  stage: projectStageEnum,
  notes: z.string().optional(),
  tags: z.array(z.string()).optional(),
  submissionStatus: submissionStatusEnum.default('draft'),
})

export type ProjectFormData = z.infer<typeof projectSchema>

// =============================================================================
// Contact schema
// =============================================================================

export const contactSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  role: contactRoleEnum,
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  phone: z.string().optional(),
  notes: z.string().optional(),
})

export type ContactFormData = z.infer<typeof contactSchema>

// =============================================================================
// Label schema
// =============================================================================

export const labelSchema = z.object({
  name: z.string().min(1, 'Label name is required'),
  genres: z.array(z.string()),
  email: z
    .string()
    .email('Invalid email address')
    .optional()
    .or(z.literal('')),
  demoSubmissionUrl: z.string().url('Invalid URL').optional().or(z.literal('')),
  discographyUrl: z.string().url('Invalid URL').optional().or(z.literal('')),
  notes: z.string().optional(),
})

export type LabelFormData = z.infer<typeof labelSchema>

// =============================================================================
// PromoPlatform schema
// =============================================================================

export const promoPlatformSchema = z.object({
  name: z.string().min(1, 'Platform name is required'),
  type: promoTypeEnum,
  url: z.string().url('Invalid URL'),
  contactEmail: z
    .string()
    .email('Invalid email address')
    .optional()
    .or(z.literal('')),
  genres: z.array(z.string()).optional(),
  notes: z.string().optional(),
  customGroup: z.string().optional().nullable(),
})

export type PromoPlatformFormData = z.infer<typeof promoPlatformSchema>

// =============================================================================
// SyncPlatform schema
// =============================================================================

export const syncPlatformSchema = z.object({
  name: z.string().min(1, 'Platform name is required'),
  url: z.string().url('Invalid URL'),
  contactInfo: z.string().optional(),
  notes: z.string().optional(),
})

export type SyncPlatformFormData = z.infer<typeof syncPlatformSchema>

// =============================================================================
// BrandProfile schema — all fields optional (progressive completion)
// =============================================================================

const brandPersonaSchema = z
  .object({
    coreIdentity: z.string(),
    personalityTraits: z.array(z.string()),
    story: z.string(),
    emotionalAppeal: z.string(),
    uniqueQualities: z.array(z.string()),
    demographics: z.string(),
  })
  .optional()

const brandArchetypeDataSchema = z
  .object({
    primary: brandArchetypeEnum,
    secondary: brandArchetypeEnum.nullable(),
    coreDesire: z.string(),
    goal: z.string(),
    fear: z.string(),
    strategy: z.string(),
  })
  .optional()

const brandAestheticSchema = z
  .object({
    colorPalette: z.array(z.string()),
    typography: z.array(z.string()),
    imagery: z.array(z.string()),
    visualStyle: z.string(),
    mood: z.string(),
  })
  .optional()

const brandSoundSchema = z
  .object({
    genres: z.array(z.string()),
    influences: z.array(z.string()),
    productionStyle: z.string(),
    emotionalTone: z.string(),
    signatureElements: z.array(z.string()),
  })
  .optional()

const brandVoiceSchema = z
  .object({
    tone: z.string(),
    vocabulary: z.array(z.string()),
    communicationStyle: z.string(),
    tagline: z.string(),
  })
  .optional()

export const brandProfileSchema = z.object({
  persona: brandPersonaSchema,
  archetype: brandArchetypeDataSchema,
  aesthetic: brandAestheticSchema,
  sound: brandSoundSchema,
  vision: z.string().optional(),
  goals: z.array(z.string()).optional(),
  targetMarkets: z.array(z.string()).optional(),
  associations: z.array(z.string()).optional(),
  voice: brandVoiceSchema,
  boardImages: z.array(z.string()).optional(),
  completionProgress: z.number().min(0).max(100).optional(),
})

export type BrandProfileFormData = z.infer<typeof brandProfileSchema>

// =============================================================================
// ContentIdea schema
// =============================================================================

const scoreField = z
  .number()
  .int()
  .min(1, 'Score must be at least 1')
  .max(5, 'Score must be at most 5')

export const contentIdeaSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  type: z.string().min(1, 'Content type is required'),
  platforms: z
    .array(socialPlatformEnum)
    .min(1, 'At least one platform is required'),
  status: contentStatusEnum.default('idea'),
  caption: z.string().optional(),
  valueScore: scoreField,
  effortScore: scoreField,
  alignmentScore: scoreField,
})

export type ContentIdeaFormData = z.infer<typeof contentIdeaSchema>

// =============================================================================
// Todo schema
// =============================================================================

export const todoSchema = z.object({
  text: z.string().min(1, 'Todo text is required'),
  completed: z.boolean().default(false),
  category: todoCategoryEnum.default('general'),
  priority: todoPriorityEnum.default('medium'),
})

export type TodoFormData = z.infer<typeof todoSchema>

// =============================================================================
// MerchProduct schema
// =============================================================================

export const merchSchema = z.object({
  name: z.string().min(1, 'Product name is required'),
  cost: z.number().min(0, 'Cost cannot be negative'),
  price: z.number().min(0, 'Price cannot be negative'),
  quantity: z.number().int().min(0, 'Quantity cannot be negative'),
  supplier: z.string().optional(),
  status: merchStatusEnum,
  stockAlert: z.number().int().min(0, 'Stock alert cannot be negative').default(5),
})

export type MerchFormData = z.infer<typeof merchSchema>

// =============================================================================
// UserProfile schema (editable fields only — role/email managed separately)
// =============================================================================

export const userProfileSchema = z.object({
  displayName: z.string().min(1, 'Display name is required'),
  artistName: z.string().optional(),
  bio: z.string().max(500, 'Bio must be 500 characters or fewer').optional(),
})

export type UserProfileFormData = z.infer<typeof userProfileSchema>

// =============================================================================
// Release schema
// =============================================================================

export const releaseSchema = z.object({
  title: z.string().min(1, 'Release title is required'),
  projectRef: z.string().optional(),
  releaseDate: z.string().min(1, 'Release date is required'),
  distributionPlatform: z.string().optional(),
  isrc: z.string().optional(),
})

export type ReleaseFormData = z.infer<typeof releaseSchema>

// =============================================================================
// Re-export enum schemas for use in other modules
// =============================================================================

export {
  projectStageEnum,
  submissionStatusEnum,
  contactRoleEnum,
  userRoleEnum,
  brandArchetypeEnum,
  contentStatusEnum,
  promoTypeEnum,
  merchStatusEnum,
  todoPriorityEnum,
  todoCategoryEnum,
  musicalKeyEnum,
  socialPlatformEnum,
}

// =============================================================================
// Challenge schema
// =============================================================================

const challengeTypeEnum = z.enum(CHALLENGE_TYPES)
const challengeStatusEnum = z.enum(CHALLENGE_STATUSES)

export const challengeSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  type: challengeTypeEnum,
  status: challengeStatusEnum.default('active'),
  notes: z.string().optional(),
  completionNotes: z.string().optional(),
})

export type ChallengeFormData = z.infer<typeof challengeSchema>

// =============================================================================
// LinkItem schema
// =============================================================================

export const linkItemSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  url: z.string().url('Must be a valid URL'),
  emoji: z.string().optional(),
  enabled: z.boolean().default(true),
})

export type LinkItemFormData = z.infer<typeof linkItemSchema>
