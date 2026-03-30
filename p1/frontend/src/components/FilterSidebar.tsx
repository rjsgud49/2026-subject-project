import { useState } from 'react';
import { INTERVIEW_TYPES, JOB_FIELDS, DIFFICULTIES, SORT_OPTIONS } from '../utils/constants';
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
  const [jobGroupOpen, setJobGroupOpen] = useState<string | null>('IT개발');

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

  const pillStyle = (active: boolean, color = 'var(--color-brand)'): React.CSSProperties => ({
    padding: '5px 12px',
    borderRadius: 20,
    border: `1px solid ${active ? color : 'var(--color-border)'}`,
    background: active ? color : '#fff',
    color: active ? '#fff' : 'inherit',
    cursor: 'pointer',
    fontSize: 13,
    fontWeight: active ? 600 : 400,
    transition: 'background 0.12s, border-color 0.12s',
  });

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

      {/* 검색 */}
      <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 8 }}>검색</label>
      <input
        type="search"
        value={filters.q}
        onChange={(e) => onFilter('q', e.target.value)}
        placeholder="강의명 검색"
        style={{ ...inputBase, marginBottom: 20 }}
      />

      {/* ── 1단계: 면접 방식 ── */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
          <label style={{ fontSize: 13, fontWeight: 700 }}>① 면접 방식</label>
          {filters.category && (
            <button
              type="button"
              onClick={() => onFilter('category', '')}
              style={{ fontSize: 11, color: 'var(--color-muted)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
            >
              초기화
            </button>
          )}
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
          {INTERVIEW_TYPES.map((t: string) => (
            <button
              key={t}
              type="button"
              onClick={() => onFilter('category', filters.category === t ? '' : t)}
              style={pillStyle(filters.category === t)}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* 1단계 → 2단계 연결 안내 화살표 */}
      {filters.category && (
        <div
          style={{
            textAlign: 'center',
            fontSize: 12,
            color: 'var(--color-brand)',
            fontWeight: 600,
            marginBottom: 8,
          }}
        >
          ↓ &nbsp;{filters.category} 분야 선택
        </div>
      )}

      {/* ── 2단계: 직무/분야 ── */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
          <label style={{ fontSize: 13, fontWeight: 700 }}>② 직무/분야</label>
          {filters.jobField && (
            <button
              type="button"
              onClick={() => onFilter('jobField', '')}
              style={{ fontSize: 11, color: 'var(--color-muted)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
            >
              초기화
            </button>
          )}
        </div>

        {JOB_FIELDS.map((group: { group: string; items: string[] }) => (
          <div key={group.group} style={{ marginBottom: 10 }}>
            {/* 그룹 토글 헤더 */}
            <button
              type="button"
              onClick={() => setJobGroupOpen(jobGroupOpen === group.group ? null : group.group)}
              style={{
                width: '100%',
                textAlign: 'left',
                background: 'var(--color-bg)',
                border: '1px solid var(--color-border)',
                borderRadius: 8,
                padding: '7px 10px',
                fontSize: 12,
                fontWeight: 700,
                color: 'var(--color-muted)',
                cursor: 'pointer',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 6,
              }}
            >
              {group.group}
              <span style={{ fontSize: 10 }}>{jobGroupOpen === group.group ? '▲' : '▼'}</span>
            </button>

            {/* 그룹 아이템 */}
            {jobGroupOpen === group.group && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, paddingLeft: 4 }}>
                {group.items.map((item: string) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => onFilter('jobField', filters.jobField === item ? '' : item)}
                    style={pillStyle(filters.jobField === item, '#6366f1')}
                  >
                    {item}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* 현재 선택 요약 */}
      {(filters.category || filters.jobField) && (
        <div
          style={{
            padding: '8px 12px',
            background: '#f0f9ff',
            border: '1px solid #bae6fd',
            borderRadius: 8,
            fontSize: 12,
            marginBottom: 16,
            lineHeight: 1.6,
          }}
        >
          <strong>선택된 필터</strong>
          <br />
          {filters.category && <span>방식: <strong>{filters.category}</strong></span>}
          {filters.category && filters.jobField && ' · '}
          {filters.jobField && <span>분야: <strong>{filters.jobField}</strong></span>}
        </div>
      )}

      {/* 난이도 */}
      <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 8 }}>난이도</label>
      <select value={filters.difficulty} onChange={(e) => onFilter('difficulty', e.target.value)} style={{ ...inputBase, marginBottom: 20 }}>
        <option value="">전체</option>
        {DIFFICULTIES.map((d: string) => (
          <option key={d} value={d}>{d}</option>
        ))}
      </select>

      {/* 무료 강의 */}
      <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16, cursor: 'pointer' }}>
        <input type="checkbox" checked={filters.freeOnly} onChange={(e) => onFilter('freeOnly', e.target.checked)} />
        <span style={{ fontSize: 14 }}>무료 강의만</span>
      </label>

      {/* 가격 범위 */}
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
          style={{ ...inputBase, opacity: filters.freeOnly ? 0.5 : 1 }}
        />
        <span style={{ flexShrink: 0, color: 'var(--color-muted)', fontSize: 14 }}>~</span>
        <input
          type="number"
          placeholder="최대"
          value={filters.max_price}
          onChange={(e) => onFilter('max_price', e.target.value)}
          disabled={filters.freeOnly}
          style={{ ...inputBase, opacity: filters.freeOnly ? 0.5 : 1 }}
        />
      </div>

      {/* 정렬 */}
      <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 8 }}>정렬</label>
      <select value={filters.sort} onChange={(e) => onFilter('sort', e.target.value)} style={{ ...inputBase, marginBottom: 20 }}>
        {SORT_OPTIONS.map((o: { value: string; label: string }) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 8 }}>
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
