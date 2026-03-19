import { CATEGORIES, DIFFICULTIES, SORT_OPTIONS } from '../utils/constants';
import Button from './Button';

export default function FilterSidebar({
  filters,
  onFilter,
  onReset,
  onApply,
}: {
  filters: any;
  onFilter: (key: string, value: any) => void;
  onReset: () => void;
  onApply: () => void;
}) {
  const inputBase: React.CSSProperties = {
    width: '100%',
    maxWidth: '100%',
    padding: '10px 10px',
    borderRadius: 8,
    border: '1px solid var(--color-border)',
    fontSize: 14,
    minWidth: 0,
    boxSizing: 'border-box',
  };

  return (
    <aside
      style={{
        width: '100%',
        maxWidth: 280,
        minWidth: 0,
        padding: 24,
        background: 'var(--color-surface)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--color-border)',
        height: 'fit-content',
        position: 'sticky',
        top: 88,
        overflow: 'hidden',
      }}
    >
      <h3 style={{ margin: '0 0 16px', fontSize: 16 }}>필터</h3>

      <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 8 }}>검색</label>
      <input
        type="search"
        value={filters.q}
        onChange={(e) => onFilter('q', e.target.value)}
        placeholder="강의명 검색"
        style={{ ...inputBase, marginBottom: 20 }}
      />

      <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 8 }}>카테고리</label>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 20 }}>
        <button
          type="button"
          onClick={() => onFilter('category', '')}
          style={{
            padding: '6px 12px',
            borderRadius: 20,
            border: '1px solid var(--color-border)',
            background: !filters.category ? 'var(--color-brand)' : '#fff',
            color: !filters.category ? '#fff' : 'inherit',
            cursor: 'pointer',
            fontSize: 13,
          }}
        >
          전체
        </button>
        {CATEGORIES.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => onFilter('category', c)}
            style={{
              padding: '6px 12px',
              borderRadius: 20,
              border: '1px solid var(--color-border)',
              background: filters.category === c ? 'var(--color-brand)' : '#fff',
              color: filters.category === c ? '#fff' : 'inherit',
              cursor: 'pointer',
              fontSize: 13,
            }}
          >
            {c}
          </button>
        ))}
      </div>

      <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 8 }}>난이도</label>
      <select value={filters.difficulty} onChange={(e) => onFilter('difficulty', e.target.value)} style={{ ...inputBase, marginBottom: 20 }}>
        <option value="">전체</option>
        {DIFFICULTIES.map((d) => (
          <option key={d} value={d}>
            {d}
          </option>
        ))}
      </select>

      <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16, cursor: 'pointer' }}>
        <input type="checkbox" checked={filters.freeOnly} onChange={(e) => onFilter('freeOnly', e.target.checked)} />
        <span style={{ fontSize: 14 }}>무료 강의만</span>
      </label>

      <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 8 }}>가격 (원)</label>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr auto 1fr',
          gap: 8,
          alignItems: 'center',
          marginBottom: 20,
          width: '100%',
          maxWidth: '100%',
        }}
      >
        <input
          type="number"
          placeholder="최소"
          value={filters.min_price}
          onChange={(e) => onFilter('min_price', e.target.value)}
          disabled={filters.freeOnly}
          style={{
            ...inputBase,
            opacity: filters.freeOnly ? 0.5 : 1,
          }}
        />
        <span style={{ flexShrink: 0, color: 'var(--color-muted)', fontSize: 14 }}>~</span>
        <input
          type="number"
          placeholder="최대"
          value={filters.max_price}
          onChange={(e) => onFilter('max_price', e.target.value)}
          disabled={filters.freeOnly}
          style={{
            ...inputBase,
            opacity: filters.freeOnly ? 0.5 : 1,
          }}
        />
      </div>

      <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 8 }}>정렬</label>
      <select value={filters.sort} onChange={(e) => onFilter('sort', e.target.value)} style={{ ...inputBase, marginBottom: 20 }}>
        {SORT_OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 10,
          marginTop: 8,
        }}
      >
        <Button variant="secondary" size="sm" onClick={onReset} style={{ width: '100%', justifyContent: 'center' }}>
          초기화
        </Button>
        <Button size="sm" onClick={onApply} style={{ width: '100%', justifyContent: 'center' }}>
          필터 적용
        </Button>
      </div>
    </aside>
  );
}

