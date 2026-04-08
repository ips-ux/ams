// =============================================================================
// Aspire AMS — BrandStrategyPage
// Tabbed multi-section editor for the artist's Brand Strategy document.
// =============================================================================

import { useState, useEffect } from 'react'
import { useBrandProfile } from '@/hooks/useBrandProfile'
import { Spinner } from '@/components/ui/Spinner'
import { Button } from '@/components/ui/Button'
import { BRAND_ARCHETYPES } from '@/types/enums'
import type { BrandArchetype } from '@/types/enums'
import type {
  BrandPersona,
  BrandArchetypeData,
  BrandAesthetic,
  BrandSound,
  BrandVoice,
} from '@/types/models'

// =============================================================================
// Types
// =============================================================================

type TabId = 'persona' | 'archetype' | 'aesthetic' | 'sound' | 'voice' | 'vision'

const TABS: { id: TabId; label: string }[] = [
  { id: 'persona', label: 'PERSONA' },
  { id: 'archetype', label: 'ARCHETYPE' },
  { id: 'aesthetic', label: 'AESTHETIC' },
  { id: 'sound', label: 'SOUND' },
  { id: 'voice', label: 'VOICE' },
  { id: 'vision', label: 'VISION' },
]

// =============================================================================
// Shared styles
// =============================================================================

const labelStyle: React.CSSProperties = {
  fontSize: 11,
  fontFamily: 'var(--font-mono)',
  textTransform: 'uppercase',
  letterSpacing: '0.07em',
  color: 'var(--color-text-secondary)',
  display: 'block',
  marginBottom: 4,
}

const inputStyle: React.CSSProperties = {
  background: 'var(--color-surface-elevated)',
  border: '1px solid var(--color-border)',
  borderRadius: 'var(--radius-sm)',
  color: 'var(--color-text-primary)',
  padding: '8px 12px',
  width: '100%',
  fontSize: 13,
  outline: 'none',
  fontFamily: 'inherit',
  boxSizing: 'border-box',
}

const textareaStyle: React.CSSProperties = {
  ...inputStyle,
  resize: 'vertical',
  minHeight: 80,
}

const fieldStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 0,
  marginBottom: 14,
}

// =============================================================================
// SavedBadge — inline "Saved ✓" confirmation
// =============================================================================

function SavedBadge({ show }: { show: boolean }) {
  if (!show) return null
  return (
    <span style={{
      fontSize: 11,
      fontFamily: 'var(--font-mono)',
      color: 'var(--color-stage-complete)',
      border: '1px solid var(--color-stage-complete)',
      borderRadius: 'var(--radius-sm)',
      padding: '2px 8px',
      marginRight: 8,
    }}>
      SAVED
    </span>
  )
}

// =============================================================================
// Helpers
// =============================================================================

function splitComma(val: string): string[] {
  return val
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
}

function joinComma(arr: string[] | undefined): string {
  return (arr ?? []).join(', ')
}

function splitLines(val: string): string[] {
  return val
    .split('\n')
    .map((s) => s.trim())
    .filter(Boolean)
}

// =============================================================================
// PersonaTab
// =============================================================================

function PersonaTab({
  persona,
  onSave,
}: {
  persona: BrandPersona | undefined
  onSave: (data: Record<string, unknown>) => Promise<void>
}) {
  const [coreIdentity, setCoreIdentity] = useState(persona?.coreIdentity ?? '')
  const [personalityTraits, setPersonalityTraits] = useState(joinComma(persona?.personalityTraits))
  const [story, setStory] = useState(persona?.story ?? '')
  const [emotionalAppeal, setEmotionalAppeal] = useState(persona?.emotionalAppeal ?? '')
  const [uniqueQualities, setUniqueQualities] = useState(joinComma(persona?.uniqueQualities))
  const [demographics, setDemographics] = useState(persona?.demographics ?? '')
  const [saved, setSaved] = useState(false)
  const [saving, setSaving] = useState(false)

  // Sync when profile loads
  useEffect(() => {
    if (persona) {
      setCoreIdentity(persona.coreIdentity ?? '')
      setPersonalityTraits(joinComma(persona.personalityTraits))
      setStory(persona.story ?? '')
      setEmotionalAppeal(persona.emotionalAppeal ?? '')
      setUniqueQualities(joinComma(persona.uniqueQualities))
      setDemographics(persona.demographics ?? '')
    }
  }, [persona])

  const handleSave = async () => {
    setSaving(true)
    await onSave({
      coreIdentity,
      personalityTraits: splitComma(personalityTraits),
      story,
      emotionalAppeal,
      uniqueQualities: splitComma(uniqueQualities),
      demographics,
    })
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div>
      <h2 style={{ margin: '0 0 20px', fontSize: 16, fontWeight: 700, color: 'var(--color-text-primary)' }}>
        Persona
      </h2>
      <div style={fieldStyle}>
        <label style={labelStyle}>Core Identity</label>
        <textarea value={coreIdentity} onChange={(e) => setCoreIdentity(e.target.value)} style={textareaStyle} placeholder="Who are you as an artist at your core?" />
      </div>
      <div style={fieldStyle}>
        <label style={labelStyle}>Personality Traits (comma-separated)</label>
        <input value={personalityTraits} onChange={(e) => setPersonalityTraits(e.target.value)} style={inputStyle} placeholder="bold, introspective, authentic..." />
      </div>
      <div style={fieldStyle}>
        <label style={labelStyle}>Story</label>
        <textarea value={story} onChange={(e) => setStory(e.target.value)} style={{ ...textareaStyle, minHeight: 120 }} placeholder="Your artist origin story and journey..." />
      </div>
      <div style={fieldStyle}>
        <label style={labelStyle}>Emotional Appeal</label>
        <textarea value={emotionalAppeal} onChange={(e) => setEmotionalAppeal(e.target.value)} style={textareaStyle} placeholder="What emotional experience do you create for your audience?" />
      </div>
      <div style={fieldStyle}>
        <label style={labelStyle}>Unique Qualities (comma-separated)</label>
        <input value={uniqueQualities} onChange={(e) => setUniqueQualities(e.target.value)} style={inputStyle} placeholder="What makes you genuinely different?" />
      </div>
      <div style={fieldStyle}>
        <label style={labelStyle}>Demographics</label>
        <textarea value={demographics} onChange={(e) => setDemographics(e.target.value)} style={textareaStyle} placeholder="Describe your core audience demographics..." />
      </div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', marginTop: 8 }}>
        <SavedBadge show={saved} />
        <Button variant="primary" onClick={handleSave} disabled={saving}>
          {saving ? 'Saving...' : 'Save Persona'}
        </Button>
      </div>
    </div>
  )
}

// =============================================================================
// ArchetypeTab
// =============================================================================

function ArchetypeTab({
  archetype,
  onSave,
}: {
  archetype: BrandArchetypeData | undefined
  onSave: (data: Record<string, unknown>) => Promise<void>
}) {
  const [primary, setPrimary] = useState<BrandArchetype>(archetype?.primary ?? 'creator')
  const [secondary, setSecondary] = useState<BrandArchetype | null>(archetype?.secondary ?? null)
  const [coreDesire, setCoreDesire] = useState(archetype?.coreDesire ?? '')
  const [goal, setGoal] = useState(archetype?.goal ?? '')
  const [fear, setFear] = useState(archetype?.fear ?? '')
  const [strategy, setStrategy] = useState(archetype?.strategy ?? '')
  const [saved, setSaved] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (archetype) {
      setPrimary(archetype.primary ?? 'creator')
      setSecondary(archetype.secondary ?? null)
      setCoreDesire(archetype.coreDesire ?? '')
      setGoal(archetype.goal ?? '')
      setFear(archetype.fear ?? '')
      setStrategy(archetype.strategy ?? '')
    }
  }, [archetype])

  const handleSave = async () => {
    setSaving(true)
    await onSave({ primary, secondary, coreDesire, goal, fear, strategy })
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const archetypeGridStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: 6,
    marginBottom: 4,
  }

  const archetypeBtnStyle = (isSelected: boolean): React.CSSProperties => ({
    background: isSelected
      ? 'color-mix(in srgb, var(--color-primary) 12%, transparent)'
      : 'var(--color-surface-elevated)',
    border: isSelected
      ? '2px solid var(--color-primary)'
      : '1px solid var(--color-border)',
    borderRadius: 'var(--radius-sm)',
    color: isSelected ? 'var(--color-primary)' : 'var(--color-text-secondary)',
    cursor: 'pointer',
    fontSize: 10,
    fontFamily: 'var(--font-mono)',
    fontWeight: isSelected ? 700 : 400,
    letterSpacing: '0.05em',
    padding: '7px 4px',
    textAlign: 'center',
    textTransform: 'uppercase',
    transition: 'all 0.12s',
  })

  return (
    <div>
      <h2 style={{ margin: '0 0 20px', fontSize: 16, fontWeight: 700, color: 'var(--color-text-primary)' }}>
        Archetype
      </h2>

      <div style={fieldStyle}>
        <label style={labelStyle}>Primary Archetype</label>
        <div style={archetypeGridStyle}>
          {BRAND_ARCHETYPES.map((a) => (
            <button
              key={a}
              onClick={() => setPrimary(a)}
              style={archetypeBtnStyle(primary === a)}
            >
              {a}
            </button>
          ))}
        </div>
      </div>

      <div style={fieldStyle}>
        <label style={labelStyle}>Secondary Archetype (optional)</label>
        <div style={archetypeGridStyle}>
          <button
            onClick={() => setSecondary(null)}
            style={archetypeBtnStyle(secondary === null)}
          >
            NONE
          </button>
          {BRAND_ARCHETYPES.map((a) => (
            <button
              key={a}
              onClick={() => setSecondary(a)}
              style={archetypeBtnStyle(secondary === a)}
            >
              {a}
            </button>
          ))}
        </div>
      </div>

      <div style={fieldStyle}>
        <label style={labelStyle}>Core Desire</label>
        <input value={coreDesire} onChange={(e) => setCoreDesire(e.target.value)} style={inputStyle} placeholder="What does this archetype fundamentally want?" />
      </div>
      <div style={fieldStyle}>
        <label style={labelStyle}>Goal</label>
        <input value={goal} onChange={(e) => setGoal(e.target.value)} style={inputStyle} placeholder="The archetype's primary goal..." />
      </div>
      <div style={fieldStyle}>
        <label style={labelStyle}>Fear</label>
        <input value={fear} onChange={(e) => setFear(e.target.value)} style={inputStyle} placeholder="What does this archetype fear most?" />
      </div>
      <div style={fieldStyle}>
        <label style={labelStyle}>Strategy</label>
        <input value={strategy} onChange={(e) => setStrategy(e.target.value)} style={inputStyle} placeholder="How does this archetype achieve its goal?" />
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', marginTop: 8 }}>
        <SavedBadge show={saved} />
        <Button variant="primary" onClick={handleSave} disabled={saving}>
          {saving ? 'Saving...' : 'Save Archetype'}
        </Button>
      </div>
    </div>
  )
}

// =============================================================================
// AestheticTab
// =============================================================================

function AestheticTab({
  aesthetic,
  onSave,
}: {
  aesthetic: BrandAesthetic | undefined
  onSave: (data: Record<string, unknown>) => Promise<void>
}) {
  const [colorPalette, setColorPalette] = useState(joinComma(aesthetic?.colorPalette))
  const [typography, setTypography] = useState(joinComma(aesthetic?.typography))
  const [imagery, setImagery] = useState(joinComma(aesthetic?.imagery))
  const [visualStyle, setVisualStyle] = useState(aesthetic?.visualStyle ?? '')
  const [mood, setMood] = useState(aesthetic?.mood ?? '')
  const [saved, setSaved] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (aesthetic) {
      setColorPalette(joinComma(aesthetic.colorPalette))
      setTypography(joinComma(aesthetic.typography))
      setImagery(joinComma(aesthetic.imagery))
      setVisualStyle(aesthetic.visualStyle ?? '')
      setMood(aesthetic.mood ?? '')
    }
  }, [aesthetic])

  const handleSave = async () => {
    setSaving(true)
    await onSave({
      colorPalette: splitComma(colorPalette),
      typography: splitComma(typography),
      imagery: splitComma(imagery),
      visualStyle,
      mood,
    })
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div>
      <h2 style={{ margin: '0 0 20px', fontSize: 16, fontWeight: 700, color: 'var(--color-text-primary)' }}>
        Aesthetic
      </h2>
      <div style={fieldStyle}>
        <label style={labelStyle}>Color Palette (comma-separated)</label>
        <input value={colorPalette} onChange={(e) => setColorPalette(e.target.value)} style={inputStyle} placeholder="#1a1a2e, midnight blue, gold..." />
      </div>
      <div style={fieldStyle}>
        <label style={labelStyle}>Typography (comma-separated)</label>
        <input value={typography} onChange={(e) => setTypography(e.target.value)} style={inputStyle} placeholder="Helvetica Neue, editorial serif, monospace..." />
      </div>
      <div style={fieldStyle}>
        <label style={labelStyle}>Imagery (comma-separated)</label>
        <input value={imagery} onChange={(e) => setImagery(e.target.value)} style={inputStyle} placeholder="urban landscapes, low-light photography, abstract..." />
      </div>
      <div style={fieldStyle}>
        <label style={labelStyle}>Visual Style</label>
        <textarea value={visualStyle} onChange={(e) => setVisualStyle(e.target.value)} style={textareaStyle} placeholder="Describe the overall visual language and aesthetic direction..." />
      </div>
      <div style={fieldStyle}>
        <label style={labelStyle}>Mood</label>
        <input value={mood} onChange={(e) => setMood(e.target.value)} style={inputStyle} placeholder="Dark, cinematic, intimate..." />
      </div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', marginTop: 8 }}>
        <SavedBadge show={saved} />
        <Button variant="primary" onClick={handleSave} disabled={saving}>
          {saving ? 'Saving...' : 'Save Aesthetic'}
        </Button>
      </div>
    </div>
  )
}

// =============================================================================
// SoundTab
// =============================================================================

function SoundTab({
  sound,
  onSave,
}: {
  sound: BrandSound | undefined
  onSave: (data: Record<string, unknown>) => Promise<void>
}) {
  const [genres, setGenres] = useState(joinComma(sound?.genres))
  const [influences, setInfluences] = useState(joinComma(sound?.influences))
  const [productionStyle, setProductionStyle] = useState(sound?.productionStyle ?? '')
  const [emotionalTone, setEmotionalTone] = useState(sound?.emotionalTone ?? '')
  const [signatureElements, setSignatureElements] = useState(joinComma(sound?.signatureElements))
  const [saved, setSaved] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (sound) {
      setGenres(joinComma(sound.genres))
      setInfluences(joinComma(sound.influences))
      setProductionStyle(sound.productionStyle ?? '')
      setEmotionalTone(sound.emotionalTone ?? '')
      setSignatureElements(joinComma(sound.signatureElements))
    }
  }, [sound])

  const handleSave = async () => {
    setSaving(true)
    await onSave({
      genres: splitComma(genres),
      influences: splitComma(influences),
      productionStyle,
      emotionalTone,
      signatureElements: splitComma(signatureElements),
    })
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div>
      <h2 style={{ margin: '0 0 20px', fontSize: 16, fontWeight: 700, color: 'var(--color-text-primary)' }}>
        Sound
      </h2>
      <div style={fieldStyle}>
        <label style={labelStyle}>Genres (comma-separated)</label>
        <input value={genres} onChange={(e) => setGenres(e.target.value)} style={inputStyle} placeholder="techno, ambient, industrial..." />
      </div>
      <div style={fieldStyle}>
        <label style={labelStyle}>Influences (comma-separated)</label>
        <input value={influences} onChange={(e) => setInfluences(e.target.value)} style={inputStyle} placeholder="Artist or producer names..." />
      </div>
      <div style={fieldStyle}>
        <label style={labelStyle}>Production Style</label>
        <input value={productionStyle} onChange={(e) => setProductionStyle(e.target.value)} style={inputStyle} placeholder="Minimalist, layered, sample-heavy..." />
      </div>
      <div style={fieldStyle}>
        <label style={labelStyle}>Emotional Tone</label>
        <input value={emotionalTone} onChange={(e) => setEmotionalTone(e.target.value)} style={inputStyle} placeholder="The emotional feeling your music evokes..." />
      </div>
      <div style={fieldStyle}>
        <label style={labelStyle}>Signature Elements (comma-separated)</label>
        <input value={signatureElements} onChange={(e) => setSignatureElements(e.target.value)} style={inputStyle} placeholder="Characteristic sounds, techniques, motifs..." />
      </div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', marginTop: 8 }}>
        <SavedBadge show={saved} />
        <Button variant="primary" onClick={handleSave} disabled={saving}>
          {saving ? 'Saving...' : 'Save Sound'}
        </Button>
      </div>
    </div>
  )
}

// =============================================================================
// VoiceTab
// =============================================================================

function VoiceTab({
  voice,
  onSave,
}: {
  voice: BrandVoice | undefined
  onSave: (data: Record<string, unknown>) => Promise<void>
}) {
  const [tone, setTone] = useState(voice?.tone ?? '')
  const [vocabulary, setVocabulary] = useState(joinComma(voice?.vocabulary))
  const [communicationStyle, setCommunicationStyle] = useState(voice?.communicationStyle ?? '')
  const [tagline, setTagline] = useState(voice?.tagline ?? '')
  const [saved, setSaved] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (voice) {
      setTone(voice.tone ?? '')
      setVocabulary(joinComma(voice.vocabulary))
      setCommunicationStyle(voice.communicationStyle ?? '')
      setTagline(voice.tagline ?? '')
    }
  }, [voice])

  const handleSave = async () => {
    setSaving(true)
    await onSave({
      tone,
      vocabulary: splitComma(vocabulary),
      communicationStyle,
      tagline,
    })
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div>
      <h2 style={{ margin: '0 0 20px', fontSize: 16, fontWeight: 700, color: 'var(--color-text-primary)' }}>
        Voice
      </h2>
      <div style={fieldStyle}>
        <label style={labelStyle}>Tone</label>
        <input value={tone} onChange={(e) => setTone(e.target.value)} style={inputStyle} placeholder="Confident, raw, poetic..." />
      </div>
      <div style={fieldStyle}>
        <label style={labelStyle}>Vocabulary (comma-separated key words/phrases)</label>
        <input value={vocabulary} onChange={(e) => setVocabulary(e.target.value)} style={inputStyle} placeholder="Words and phrases central to your brand language..." />
      </div>
      <div style={fieldStyle}>
        <label style={labelStyle}>Communication Style</label>
        <textarea value={communicationStyle} onChange={(e) => setCommunicationStyle(e.target.value)} style={textareaStyle} placeholder="How do you communicate with your audience? What's the vibe?" />
      </div>
      <div style={fieldStyle}>
        <label style={{ ...labelStyle, marginBottom: 6 }}>Tagline</label>
        <input
          value={tagline}
          onChange={(e) => setTagline(e.target.value)}
          style={{
            ...inputStyle,
            fontSize: 16,
            fontFamily: 'var(--font-mono)',
            fontWeight: 600,
            letterSpacing: '0.03em',
          }}
          placeholder="Your artist tagline..."
        />
      </div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', marginTop: 8 }}>
        <SavedBadge show={saved} />
        <Button variant="primary" onClick={handleSave} disabled={saving}>
          {saving ? 'Saving...' : 'Save Voice'}
        </Button>
      </div>
    </div>
  )
}

// =============================================================================
// VisionTab
// =============================================================================

function VisionTab({
  vision,
  goals,
  targetMarkets,
  associations,
  onSave,
}: {
  vision: string | undefined
  goals: string[] | undefined
  targetMarkets: string[] | undefined
  associations: string[] | undefined
  onSave: (data: Record<string, unknown>) => Promise<void>
}) {
  const [visionVal, setVisionVal] = useState(vision ?? '')
  const [goalsVal, setGoalsVal] = useState((goals ?? []).join('\n'))
  const [targetMarketsVal, setTargetMarketsVal] = useState(joinComma(targetMarkets))
  const [associationsVal, setAssociationsVal] = useState(joinComma(associations))
  const [saved, setSaved] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    setVisionVal(vision ?? '')
    setGoalsVal((goals ?? []).join('\n'))
    setTargetMarketsVal(joinComma(targetMarkets))
    setAssociationsVal(joinComma(associations))
  }, [vision, goals, targetMarkets, associations])

  const handleSave = async () => {
    setSaving(true)
    await onSave({
      vision: visionVal,
      goals: splitLines(goalsVal),
      targetMarkets: splitComma(targetMarketsVal),
      associations: splitComma(associationsVal),
    })
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div>
      <h2 style={{ margin: '0 0 20px', fontSize: 16, fontWeight: 700, color: 'var(--color-text-primary)' }}>
        Vision
      </h2>
      <div style={fieldStyle}>
        <label style={labelStyle}>Vision</label>
        <textarea
          value={visionVal}
          onChange={(e) => setVisionVal(e.target.value)}
          style={{ ...textareaStyle, minHeight: 120 }}
          placeholder="The big picture — where are you going as an artist?"
        />
      </div>
      <div style={fieldStyle}>
        <label style={labelStyle}>Goals (one per line)</label>
        <textarea
          value={goalsVal}
          onChange={(e) => setGoalsVal(e.target.value)}
          style={{ ...textareaStyle, minHeight: 100 }}
          placeholder={`Release debut EP by Q3\nGrow to 10k monthly listeners\nPerform at 3 festivals`}
        />
      </div>
      <div style={fieldStyle}>
        <label style={labelStyle}>Target Markets (comma-separated)</label>
        <input
          value={targetMarketsVal}
          onChange={(e) => setTargetMarketsVal(e.target.value)}
          style={inputStyle}
          placeholder="Berlin underground, US festival circuit, Asia streaming..."
        />
      </div>
      <div style={fieldStyle}>
        <label style={labelStyle}>Associations (comma-separated)</label>
        <input
          value={associationsVal}
          onChange={(e) => setAssociationsVal(e.target.value)}
          style={inputStyle}
          placeholder="Brands, artists, aesthetics to be associated with..."
        />
      </div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', marginTop: 8 }}>
        <SavedBadge show={saved} />
        <Button variant="primary" onClick={handleSave} disabled={saving}>
          {saving ? 'Saving...' : 'Save Vision'}
        </Button>
      </div>
    </div>
  )
}

// =============================================================================
// BrandStrategyPage — main component
// =============================================================================

export function BrandStrategyPage() {
  const { profile, isLoading, saveSection, saveTopLevel } = useBrandProfile()
  const [activeTab, setActiveTab] = useState<TabId>('persona')

  // Compute completion progress: count non-empty top-level sections out of 6
  const completionProgress = (() => {
    if (!profile) return 0
    let filled = 0
    if (profile.persona?.coreIdentity) filled++
    if (profile.archetype?.primary) filled++
    if (profile.aesthetic?.mood || profile.aesthetic?.visualStyle) filled++
    if (profile.sound?.genres?.length) filled++
    if (profile.voice?.tone) filled++
    if (profile.vision) filled++
    return Math.round((filled / 6) * 100)
  })()

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: 48 }}>
        <Spinner />
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0 }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '16px 24px',
        borderBottom: '1px solid var(--color-border)',
        flexShrink: 0,
      }}>
        <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: 'var(--color-text-primary)' }}>
          Brand Strategy
        </h1>
        <span style={{
          fontSize: 11,
          fontFamily: 'var(--font-mono)',
          fontWeight: 700,
          letterSpacing: '0.07em',
          border: '1px solid var(--color-primary)',
          color: 'var(--color-primary)',
          borderRadius: 'var(--radius-sm)',
          padding: '2px 8px',
        }}>
          {completionProgress}% COMPLETE
        </span>
      </div>

      {/* Body: sidebar + panel */}
      <div style={{ display: 'flex', flex: 1, minHeight: 0, overflow: 'hidden' }}>
        {/* Left sidebar */}
        <div style={{
          width: 160,
          flexShrink: 0,
          background: 'var(--color-surface)',
          borderRight: '1px solid var(--color-border)',
          display: 'flex',
          flexDirection: 'column',
          paddingTop: 8,
        }}>
          {TABS.map((tab) => {
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  width: '100%',
                  height: 40,
                  display: 'flex',
                  alignItems: 'center',
                  paddingLeft: 16,
                  background: 'none',
                  border: 'none',
                  borderLeft: isActive ? '3px solid var(--color-primary)' : '3px solid transparent',
                  cursor: 'pointer',
                  fontSize: 11,
                  fontFamily: 'var(--font-mono)',
                  fontWeight: isActive ? 700 : 400,
                  letterSpacing: '0.07em',
                  textTransform: 'uppercase',
                  color: isActive ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                  textAlign: 'left',
                  transition: 'color 0.12s',
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.color = 'var(--color-primary)'
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.color = 'var(--color-text-secondary)'
                  }
                }}
              >
                {tab.label}
              </button>
            )
          })}
        </div>

        {/* Right panel */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: 24,
        }}>
          {activeTab === 'persona' && (
            <PersonaTab
              persona={profile?.persona}
              onSave={(data) => saveSection('persona', data)}
            />
          )}
          {activeTab === 'archetype' && (
            <ArchetypeTab
              archetype={profile?.archetype}
              onSave={(data) => saveSection('archetype', data)}
            />
          )}
          {activeTab === 'aesthetic' && (
            <AestheticTab
              aesthetic={profile?.aesthetic}
              onSave={(data) => saveSection('aesthetic', data)}
            />
          )}
          {activeTab === 'sound' && (
            <SoundTab
              sound={profile?.sound}
              onSave={(data) => saveSection('sound', data)}
            />
          )}
          {activeTab === 'voice' && (
            <VoiceTab
              voice={profile?.voice}
              onSave={(data) => saveSection('voice', data)}
            />
          )}
          {activeTab === 'vision' && (
            <VisionTab
              vision={profile?.vision}
              goals={profile?.goals}
              targetMarkets={profile?.targetMarkets}
              associations={profile?.associations}
              onSave={saveTopLevel}
            />
          )}
        </div>
      </div>
    </div>
  )
}
