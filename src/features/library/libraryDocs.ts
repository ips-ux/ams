// =============================================================================
// Aspire AMS — Library Docs
// Static manifest of all Aspire Academy methodology documents.
// Files are imported as raw text via Vite's ?raw query.
// =============================================================================

import amsRaw from '../../../Artist Management System.md?raw'
import brandRaw from '../../../Brand Strategy System.md?raw'
import promoRaw from '../../../Promotion Protocol.md?raw'
import socialRaw from '../../../Social Strategy System.md?raw'
import sparkRaw from '../../../Spark Strategies.md?raw'
import arrangeRaw from '../../../Arrangement Strategies.md?raw'
import elevateRaw from '../../../Elevate Strategies.md?raw'
import mixingRaw from '../../../Mixing Methodology.md?raw'
import workflowRaw from '../../../Workflow Methodology.md?raw'

export interface LibraryDoc {
  slug: string
  title: string
  category: 'production' | 'business' | 'workflow'
  icon: string
  raw: string
}

export const LIBRARY_DOCS: LibraryDoc[] = [
  { slug: 'artist-management', title: 'Artist Management System', category: 'business', icon: '🎯', raw: amsRaw },
  { slug: 'brand-strategy', title: 'Brand Strategy System', category: 'business', icon: '🎨', raw: brandRaw },
  { slug: 'promotion-protocol', title: 'Promotion Protocol', category: 'business', icon: '📢', raw: promoRaw },
  { slug: 'social-strategy', title: 'Social Strategy System', category: 'business', icon: '🌐', raw: socialRaw },
  { slug: 'spark-strategies', title: 'Spark Strategies', category: 'production', icon: '⚡', raw: sparkRaw },
  { slug: 'arrangement-strategies', title: 'Arrangement Strategies', category: 'production', icon: '🎛️', raw: arrangeRaw },
  { slug: 'elevate-strategies', title: 'Elevate Strategies', category: 'production', icon: '🚀', raw: elevateRaw },
  { slug: 'mixing-methodology', title: 'Mixing Methodology', category: 'production', icon: '🎚️', raw: mixingRaw },
  { slug: 'workflow-methodology', title: 'Workflow Methodology', category: 'workflow', icon: '⚙️', raw: workflowRaw },
]

export function getDocBySlug(slug: string): LibraryDoc | undefined {
  return LIBRARY_DOCS.find((d) => d.slug === slug)
}
