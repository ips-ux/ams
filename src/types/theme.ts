export const THEME_KEYS = ['dark', 'light', 'live', 'loops', 'logical', 'tools', 'cubes'] as const
export type ThemeKey = (typeof THEME_KEYS)[number]

export interface ThemeMetadata {
  key: ThemeKey
  label: string
  description: string
  inspiration: string
}

export const THEME_METADATA: Record<ThemeKey, ThemeMetadata> = {
  dark: { key: 'dark', label: 'Dark', description: 'Default dark theme', inspiration: 'Universal' },
  light: { key: 'light', label: 'Light', description: 'Clean light theme', inspiration: 'Universal' },
  live: { key: 'live', label: 'Live', description: 'Warm orange-accented dark theme', inspiration: 'Ableton Live' },
  loops: { key: 'loops', label: 'Loops', description: 'Cool blue-gray dark theme', inspiration: 'FL Studio' },
  logical: { key: 'logical', label: 'Logical', description: 'Sleek silver-blue dark theme', inspiration: 'Logic Pro' },
  tools: { key: 'tools', label: 'Tools', description: 'Industrial slate-blue theme', inspiration: 'Pro Tools' },
  cubes: { key: 'cubes', label: 'Cubes', description: 'Purple-accented dark theme', inspiration: 'Cubase' },
}
