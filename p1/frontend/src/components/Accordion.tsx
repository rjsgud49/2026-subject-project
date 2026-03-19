import { useState } from 'react';
import { formatDuration } from '../utils/format';

export default function Accordion({ sections = [] }: { sections?: any[] }) {
  const [open, setOpen] = useState<any[]>(() => (sections[0]?.id != null ? [sections[0].id] : []));

  const toggle = (id: any) => {
    setOpen((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {sections.map((s) => (
        <div
          key={s.id}
          style={{
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-lg)',
            overflow: 'hidden',
            background: 'var(--color-surface)',
          }}
        >
          <button
            type="button"
            onClick={() => toggle(s.id)}
            style={{
              width: '100%',
              padding: '16px 20px',
              textAlign: 'left',
              border: 'none',
              background: open.includes(s.id) ? 'var(--color-bg)' : 'var(--color-surface)',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              fontFamily: 'inherit',
              fontSize: 15,
            }}
          >
            {s.title}
            <span>{open.includes(s.id) ? '▼' : '▶'}</span>
          </button>
          {open.includes(s.id) && (
            <ul style={{ margin: 0, padding: '0 20px 16px 36px', listStyle: 'disc' }}>
              {(s.videos || []).map((v: any) => (
                <li key={v.id} style={{ padding: '8px 0', color: 'var(--color-muted)' }}>
                  {v.title} <span style={{ fontSize: 13 }}>({formatDuration(v.duration_seconds)})</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      ))}
    </div>
  );
}

