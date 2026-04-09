import type { ReactNode } from 'react';

export default function Tabs({
  tabs,
  active,
  onChange,
  className = '',
}: {
  tabs: { id: string; label: ReactNode }[];
  active: string;
  onChange: (id: string) => void;
  className?: string;
}) {
  return (
    <div
      className={className}
      style={{
        display: 'flex',
        borderBottom: '1px solid var(--color-neutral-200)',
        marginBottom: 24,
        gap: 0,
      }}
    >
      {tabs.map((t) => {
        const isActive = active === t.id;
        return (
          <button
            key={t.id}
            type="button"
            onClick={() => onChange(t.id)}
            style={{
              padding: '12px 16px',
              border: 'none',
              borderBottom: `2px solid ${isActive ? 'var(--color-primary-500)' : 'transparent'}`,
              background: 'none',
              cursor: 'pointer',
              fontSize: 14,
              fontWeight: isActive ? 600 : 500,
              color: isActive ? 'var(--color-primary-600)' : 'var(--color-neutral-500)',
              marginBottom: -1,
              fontFamily: 'inherit',
              transition: 'color 150ms, border-color 150ms',
            }}
            onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.color = 'var(--color-neutral-700)'; }}
            onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.color = 'var(--color-neutral-500)'; }}
          >
            {t.label}
          </button>
        );
      })}
    </div>
  );
}
