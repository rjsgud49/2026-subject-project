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

  const label = (text: string) => (
    <span style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--color-neutral-500)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>
      {text}
    </span>
  );

  const pillStyle = (active: boolean, accent = false): React.CSSProperties => ({
    padding: '4px 10px',
    borderRadius: 'var(--radius-full)',
    border: `1px solid ${active ? (accent ? 'var(--color-primary-500)' : 'var(--color-primary-500)') : 'var(--color-neutral-200)'}`,
    background: active ? (accent ? 'var(--color-primary-500)' : 'var(--color-primary-500)') : 'var(--color-neutral-0)',
    color: active ? '#fff' : 'var(--color-neutral-600)',
    cursor: 'pointer',
    fontSize: 12,
    fontWeight: active ? 600 : 400,
    transition: 'background 100ms, border-color 100ms, color 100ms',
    fontFamily: 'inherit',
  });

  return (
    <aside
      style={{
        width: '100%',
        maxWidth: 256,
        minWidth: 200,
        padding: '20px',
        background: 'var(--color-neutral-0)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--color-neutral-200)',
        height: 'fit-content',
        position: 'sticky',
        top: 'calc(var(--nav-h) + 16px)',
        display: 'flex',
        flexDirection: 'column',
        gap: 20,
      }}
    >
      {/* 헤더 */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: 'var(--color-neutral-900)' }}>필터</h3>
        <button
          type="button"
          onClick={onReset}
          style={{ fontSize: 12, color: 'var(--color-neutral-500)', background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontFamily: 'inherit' }}
        >
          전체 초기화
        </button>
      </div>

      <hr style={{ margin: 0, border: 'none', borderTop: '1px solid var(--color-neutral-200)' }} />

      {/* 검색 */}
      <div>
        {label('검색')}
        <input
          type="search"
          value={filters.q}
          onChange={(e) => onFilter('q', e.target.value)}
          placeholder="강의명 검색"
          className="ui-input"
          style={{ fontSize: 13 }}
        />
      </div>

      {/* 면접 방식 */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
          {label('① 면접 방식')}
          {filters.category && (
            <button type="button" onClick={() => onFilter('category', '')}
              style={{ fontSize: 11, color: 'var(--color-neutral-400)', background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontFamily: 'inherit', marginTop: -8 }}>
              초기화
            </button>
          )}
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {INTERVIEW_TYPES.map((t: string) => (
            <button key={t} type="button"
              onClick={() => onFilter('category', filters.category === t ? '' : t)}
              style={pillStyle(filters.category === t)}>
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* 선택 화살표 */}
      {filters.category && (
        <div style={{ textAlign: 'center', fontSize: 12, color: 'var(--color-primary-600)', fontWeight: 600, margin: '-12px 0' }}>
          ↓ {filters.category}
        </div>
      )}

      {/* 직무/분야 */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
          {label('② 직무/분야')}
          {filters.jobField && (
            <button type="button" onClick={() => onFilter('jobField', '')}
              style={{ fontSize: 11, color: 'var(--color-neutral-400)', background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontFamily: 'inherit', marginTop: -8 }}>
              초기화
            </button>
          )}
        </div>

        {JOB_FIELDS.map((group: { group: string; items: string[] }) => (
          <div key={group.group} style={{ marginBottom: 8 }}>
            <button
              type="button"
              onClick={() => setJobGroupOpen(jobGroupOpen === group.group ? null : group.group)}
              style={{
                width: '100%', textAlign: 'left',
                background: 'var(--color-neutral-50)',
                border: '1px solid var(--color-neutral-200)',
                borderRadius: 6, padding: '6px 10px',
                fontSize: 12, fontWeight: 600, color: 'var(--color-neutral-600)',
                cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                marginBottom: 6, fontFamily: 'inherit',
                transition: 'background 100ms',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--color-neutral-100)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--color-neutral-50)'; }}
            >
              {group.group}
              <span style={{ fontSize: 10, color: 'var(--color-neutral-400)' }}>
                {jobGroupOpen === group.group ? '▲' : '▼'}
              </span>
            </button>
            {jobGroupOpen === group.group && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, paddingLeft: 2 }}>
                {group.items.map((item: string) => (
                  <button key={item} type="button"
                    onClick={() => onFilter('jobField', filters.jobField === item ? '' : item)}
                    style={pillStyle(filters.jobField === item, true)}>
                    {item}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* 선택 요약 */}
      {(filters.category || filters.jobField) && (
        <div style={{ padding: '10px 12px', background: 'var(--color-primary-50)', border: '1px solid var(--color-primary-200)', borderRadius: 8, fontSize: 12, lineHeight: 1.7 }}>
          <strong style={{ color: 'var(--color-primary-700)' }}>선택된 필터</strong>
          {filters.category && <div style={{ color: 'var(--color-neutral-600)' }}>방식: <strong>{filters.category}</strong></div>}
          {filters.jobField && <div style={{ color: 'var(--color-neutral-600)' }}>분야: <strong>{filters.jobField}</strong></div>}
        </div>
      )}

      <hr style={{ margin: 0, border: 'none', borderTop: '1px solid var(--color-neutral-200)' }} />

      {/* 난이도 */}
      <div>
        {label('난이도')}
        <select value={filters.difficulty} onChange={(e) => onFilter('difficulty', e.target.value)} className="ui-select" style={{ fontSize: 13 }}>
          <option value="">전체</option>
          {DIFFICULTIES.map((d: string) => <option key={d} value={d}>{d}</option>)}
        </select>
      </div>

      {/* 무료 */}
      <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 13, color: 'var(--color-neutral-700)', fontWeight: 500 }}>
        <input type="checkbox" checked={filters.freeOnly} onChange={(e) => onFilter('freeOnly', e.target.checked)}
          style={{ width: 16, height: 16, accentColor: 'var(--color-primary-500)' }} />
        무료 강의만 보기
      </label>

      {/* 가격 */}
      <div>
        {label('가격 (원)')}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 16px 1fr', gap: 8, alignItems: 'center' }}>
          <input type="number" placeholder="최소" value={filters.min_price}
            onChange={(e) => onFilter('min_price', e.target.value)}
            disabled={filters.freeOnly}
            className="ui-input" style={{ fontSize: 12, opacity: filters.freeOnly ? 0.4 : 1 }} />
          <span style={{ textAlign: 'center', color: 'var(--color-neutral-400)', fontSize: 12 }}>~</span>
          <input type="number" placeholder="최대" value={filters.max_price}
            onChange={(e) => onFilter('max_price', e.target.value)}
            disabled={filters.freeOnly}
            className="ui-input" style={{ fontSize: 12, opacity: filters.freeOnly ? 0.4 : 1 }} />
        </div>
      </div>

      {/* 정렬 */}
      <div>
        {label('정렬')}
        <select value={filters.sort} onChange={(e) => onFilter('sort', e.target.value)} className="ui-select" style={{ fontSize: 13 }}>
          {SORT_OPTIONS.map((o: { value: string; label: string }) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>

      <Button onClick={onApply} style={{ width: '100%', justifyContent: 'center' }}>
        필터 적용
      </Button>
    </aside>
  );
}
