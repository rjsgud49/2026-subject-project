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
        gap: 0,
        borderBottom: '1px solid var(--color-border)',
        marginBottom: 24,
      }}
    >
      {tabs.map((t) => (
        <button
          key={t.id}
          type="button"
          onClick={() => onChange(t.id)}
          style={{
            padding: '12px 20px',
            border: 'none',
            background: 'none',
            cursor: 'pointer',
            fontSize: 15,
            fontWeight: active === t.id ? 600 : 500,
            color: active === t.id ? 'var(--color-accent)' : 'var(--color-muted)',
            borderBottom: active === t.id ? '2px solid var(--color-accent)' : '2px solid transparent',
            marginBottom: -1,
            fontFamily: 'inherit',
          }}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}

