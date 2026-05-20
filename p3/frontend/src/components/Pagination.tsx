export default function Pagination({
  page,
  totalPages,
  onPageChange,
}: {
  page: number;
  totalPages: number;
  onPageChange: (p: number) => void;
}) {
  if (totalPages <= 1) return null;

  const pages: (number | '…')[] = [];
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || (i >= page - 2 && i <= page + 2)) pages.push(i);
    else if (pages[pages.length - 1] !== '…') pages.push('…');
  }

  const btnBase = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 36,
    height: 36,
    borderRadius: 8,
    border: '1px solid var(--color-neutral-200)',
    background: 'var(--color-neutral-0)',
    color: 'var(--color-neutral-600)',
    fontSize: 14,
    fontWeight: 500,
    cursor: 'pointer',
    fontFamily: 'inherit',
    transition: 'background 100ms, color 100ms, border-color 100ms',
  } as const;

  const navBtn = (label: string, disabled: boolean, onClick: () => void) => (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      style={{
        ...btnBase,
        width: 'auto',
        padding: '0 12px',
        opacity: disabled ? 0.4 : 1,
        cursor: disabled ? 'not-allowed' : 'pointer',
      }}
    >
      {label}
    </button>
  );

  return (
    <div style={{ display: 'flex', gap: 4, justifyContent: 'center', alignItems: 'center', marginTop: 32 }}>
      {navBtn('← 이전', page <= 1, () => onPageChange(page - 1))}

      {pages.map((p, idx) =>
        p === '…' ? (
          <span key={`e-${idx}`} style={{ width: 36, textAlign: 'center', color: 'var(--color-neutral-400)', fontSize: 14 }}>
            …
          </span>
        ) : (
          <button
            key={p}
            type="button"
            onClick={() => onPageChange(p as number)}
            style={{
              ...btnBase,
              background: p === page ? 'var(--color-primary-500)' : 'var(--color-neutral-0)',
              color: p === page ? '#fff' : 'var(--color-neutral-600)',
              borderColor: p === page ? 'var(--color-primary-500)' : 'var(--color-neutral-200)',
              fontWeight: p === page ? 700 : 500,
            }}
          >
            {p}
          </button>
        )
      )}

      {navBtn('다음 →', page >= totalPages, () => onPageChange(page + 1))}
    </div>
  );
}
