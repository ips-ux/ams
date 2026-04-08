export function PlaceholderPage({ title }: { title: string }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh',
        flexDirection: 'column',
        gap: '12px',
      }}
    >
      <p style={{ fontSize: '48px' }}>🚧</p>
      <h2
        style={{
          color: 'var(--color-text-primary)',
          fontSize: '24px',
          fontWeight: 600,
        }}
      >
        {title}
      </h2>
      <p style={{ color: 'var(--color-text-muted)', fontSize: '14px' }}>
        Coming soon
      </p>
    </div>
  )
}
