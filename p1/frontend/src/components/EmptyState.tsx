import type { ReactNode } from 'react';

export default function EmptyState({
  title,
  description,
  action,
}: {
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div
      style={{
        textAlign: 'center',
        padding: '64px 24px',
        color: 'var(--color-muted)',
        background: 'var(--color-surface)',
        borderRadius: 'var(--radius-lg)',
        border: '1px dashed var(--color-border)',
      }}
    >
      <div style={{ fontSize: 48, marginBottom: 16 }}>📭</div>
      <h3 style={{ margin: '0 0 8px', color: 'var(--color-text)' }}>{title}</h3>
      {description && <p style={{ margin: '0 0 20px' }}>{description}</p>}
      {action}
    </div>
  );
}

