// =============================================================================
// Aspire AMS — Library Docs
// Static metadata skeleton for the library — slugs, titles, icons, categories.
// No content is stored here. Full content and preview text are fetched from
// Firestore via useLibraryDocs (manifest) and useLibraryDoc (full doc).
// =============================================================================

export interface LibraryDoc {
  slug: string
  title: string
  category: 'production' | 'business' | 'workflow'
  icon: string
}

export const LIBRARY_DOCS: LibraryDoc[] = [
  { slug: 'artist-management',    title: 'Artist Management System', category: 'business',  icon: '🎯'  },
  { slug: 'brand-strategy',       title: 'Brand Strategy System',    category: 'business',  icon: '🎨'  },
  { slug: 'promotion-protocol',   title: 'Promotion Protocol',       category: 'business',  icon: '📢'  },
  { slug: 'social-strategy',      title: 'Social Strategy System',   category: 'business',  icon: '🌐'  },
  { slug: 'spark-strategies',     title: 'Spark Strategies',         category: 'production', icon: '⚡' },
  { slug: 'arrangement-strategies', title: 'Arrangement Strategies', category: 'production', icon: '🎛️' },
  { slug: 'elevate-strategies',   title: 'Elevate Strategies',       category: 'production', icon: '🚀'  },
  { slug: 'mixing-methodology',   title: 'Mixing Methodology',       category: 'production', icon: '🎚️' },
  { slug: 'workflow-methodology', title: 'Workflow Methodology',     category: 'workflow',   icon: '⚙️' },
]
