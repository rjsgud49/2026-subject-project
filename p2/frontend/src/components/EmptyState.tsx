import type { ReactNode } from 'react';
import { Inbox } from 'lucide-react';

export default function EmptyState({
  title,
  description,
  action,
  icon,
}: {
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  icon?: ReactNode;
}) {
  return (
    <div
      style={{
        textAlign: 'center',
        padding: '64px 24px',
        background: 'var(--color-neutral-0)',
        borderRadius: 'var(--radius-lg)',
        border: '1px dashed var(--color-neutral-300)',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16, color: 'var(--color-neutral-300)' }}>
        {icon ?? <Inbox size={48} strokeWidth={1.2} />}
      </div>
      <h3 style={{ margin: '0 0 8px', fontSize: 16, fontWeight: 600, color: 'var(--color-neutral-700)' }}>{title}</h3>
      {description && (
        <p style={{ margin: '0 0 24px', fontSize: 14, color: 'var(--color-neutral-500)', lineHeight: 1.6 }}>
          {description}
        </p>
      )}
      {action}
    </div>
  );
}
