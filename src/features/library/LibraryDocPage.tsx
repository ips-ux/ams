// =============================================================================
// Aspire AMS — LibraryDocPage
// Full-page reader for a single methodology document.
// Two-column layout: sticky sidebar nav + scrollable prose content.
// Content fetched from Firestore via useLibraryDoc (version-cached).
// =============================================================================

import { useParams, Link } from 'react-router-dom'
import { useMemo } from 'react'
import { marked } from 'marked'
import { LIBRARY_DOCS } from './libraryDocs'
import { useLibraryDoc } from '@/hooks/useLibraryDoc'

// ---------------------------------------------------------------------------
// LibraryDocPage
// ---------------------------------------------------------------------------

export function LibraryDocPage() {
  const { slug } = useParams<{ slug: string }>()
  const { doc, loading, error } = useLibraryDoc(slug)

  const html = useMemo(() => {
    if (!doc?.content) return ''
    const result = marked.parse(doc.content)
    return typeof result === 'string' ? result : ''
  }, [doc])

  // Loading state
  if (loading) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 64,
          color: 'var(--color-text-secondary)',
          fontSize: 14,
        }}
      >
        Loading guide…
      </div>
    )
  }

  // Error / not found state
  if (error || !doc) {
    return (
      <div style={{ padding: 32 }}>
        <p style={{ color: 'var(--color-text-primary)', marginBottom: 16 }}>
          {error ?? 'Guide not found.'}
        </p>
        <Link
          to="/library"
          style={{ color: 'var(--color-primary)', fontSize: 14 }}
        >
          ← Back to Library
        </Link>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Prose styles injected globally within this component's scope */}
      <style>{`
        .ams-prose h1,.ams-prose h2,.ams-prose h3 {
          color: var(--color-text-primary); font-weight: 700;
          margin: 1.5em 0 0.5em; border-bottom: 1px solid var(--color-border); padding-bottom: 4px;
        }
        .ams-prose h1 { font-size: 1.5em; }
        .ams-prose h2 { font-size: 1.2em; }
        .ams-prose h3 { font-size: 1em; }
        .ams-prose p { margin: 0.75em 0; color: var(--color-text-primary); }
        .ams-prose ul,.ams-prose ol { padding-left: 1.5em; margin: 0.75em 0; }
        .ams-prose li { margin: 0.3em 0; color: var(--color-text-primary); }
        .ams-prose code {
          font-family: var(--font-mono); font-size: 0.85em;
          background: var(--color-surface-elevated); border: 1px solid var(--color-border);
          padding: 1px 5px; border-radius: var(--radius-sm);
        }
        .ams-prose blockquote {
          border-left: 2px solid var(--color-primary); padding-left: 1em;
          margin: 1em 0; color: var(--color-text-secondary);
        }
        .ams-prose strong { font-weight: 700; }
        .ams-prose a { color: var(--color-primary); }
        .ams-prose hr { border: none; border-top: 1px solid var(--color-border); margin: 1.5em 0; }
      `}</style>

      {/* Left nav sidebar — static skeleton for instant render */}
      <nav
        style={{
          width: 220,
          position: 'sticky',
          top: 0,
          height: '100vh',
          overflowY: 'auto',
          borderRight: '1px solid var(--color-border)',
          padding: 16,
          flexShrink: 0,
        }}
      >
        <div
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 11,
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            color: 'var(--color-text-secondary)',
            marginBottom: 12,
          }}
        >
          Library
        </div>

        <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
          {LIBRARY_DOCS.map((d) => {
            const isActive = d.slug === slug
            return (
              <li key={d.slug} style={{ marginBottom: 2 }}>
                <Link
                  to={`/library/${d.slug}`}
                  style={{
                    display: 'block',
                    fontSize: 13,
                    color: isActive
                      ? 'var(--color-primary)'
                      : 'var(--color-text-secondary)',
                    textDecoration: 'none',
                    padding: '5px 0',
                    paddingLeft: isActive ? 10 : 12,
                    borderLeft: isActive
                      ? '2px solid var(--color-primary)'
                      : '2px solid transparent',
                    fontWeight: isActive ? 600 : 400,
                    lineHeight: 1.4,
                    transition: 'color var(--transition-fast)',
                  }}
                >
                  {d.title}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* Right content area */}
      <div
        style={{
          flex: 1,
          padding: 32,
          maxWidth: 800,
          overflowY: 'auto',
        }}
      >
        {/* Back link */}
        <Link
          to="/library"
          style={{
            display: 'inline-block',
            fontSize: 13,
            color: 'var(--color-text-secondary)',
            textDecoration: 'none',
            marginBottom: 24,
          }}
        >
          ← Back to Library
        </Link>

        {/* Category + icon */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            marginBottom: 8,
          }}
        >
          <span style={{ fontSize: 20 }}>{doc.icon}</span>
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 10,
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-sm)',
              padding: '2px 6px',
              color: 'var(--color-text-secondary)',
            }}
          >
            {doc.category}
          </span>
        </div>

        {/* Doc title */}
        <h1
          style={{
            fontSize: 28,
            fontWeight: 700,
            color: 'var(--color-text-primary)',
            margin: '0 0 24px',
            lineHeight: 1.2,
          }}
        >
          {doc.title}
        </h1>

        {/* Rendered markdown content */}
        <div
          className="ams-prose"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </div>
    </div>
  )
}
