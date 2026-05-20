export default function ProgressBar({
  value = 0,
  max = 100,
  height = 6,
  className = '',
}: {
  value?: number;
  max?: number;
  height?: number;
  className?: string;
}) {
  const pct = max ? Math.min(100, Math.round((value / max) * 100)) : 0;
  const color = pct >= 100
    ? 'var(--color-success-500)'
    : pct >= 50
    ? 'var(--color-primary-500)'
    : 'var(--color-primary-300)';

  return (
    <div
      className={className}
      style={{
        height,
        background: 'var(--color-neutral-200)',
        borderRadius: 'var(--radius-full)',
        overflow: 'hidden',
      }}
      role="progressbar"
      aria-valuenow={pct}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        style={{
          height: '100%',
          width: `${pct}%`,
          background: color,
          borderRadius: 'var(--radius-full)',
          transition: 'width 500ms ease-out',
        }}
      />
    </div>
  );
}
