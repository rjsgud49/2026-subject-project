import Button from './Button';

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
    if (i === 1 || i === totalPages || (i >= page - 1 && i <= page + 1)) pages.push(i);
    else if (pages[pages.length - 1] !== '…') pages.push('…');
  }
  return (
    <div style={{ display: 'flex', gap: 8, justifyContent: 'center', alignItems: 'center', marginTop: 32 }}>
      <Button variant="secondary" size="sm" disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
        이전
      </Button>
      {pages.map((p, idx) =>
        p === '…' ? (
          <span key={`e-${idx}`}>…</span>
        ) : (
          <button
            key={p}
            type="button"
            onClick={() => onPageChange(p)}
            style={{
              minWidth: 36,
              height: 36,
              borderRadius: 8,
              border: '1px solid var(--color-border)',
              background: p === page ? 'var(--color-accent)' : '#fff',
              color: p === page ? '#fff' : 'inherit',
              cursor: 'pointer',
              fontWeight: p === page ? 700 : 400,
            }}
          >
            {p}
          </button>
        )
      )}
      <Button variant="secondary" size="sm" disabled={page >= totalPages} onClick={() => onPageChange(page + 1)}>
        다음
      </Button>
    </div>
  );
}

