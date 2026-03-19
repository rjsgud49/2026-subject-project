export default function ProgressBar({
  value = 0,
  max = 100,
  height = 8,
  className = '',
}: {
  value?: number;
  max?: number;
  height?: number;
  className?: string;
}) {
  const pct = max ? Math.min(100, Math.round((value / max) * 100)) : 0;
  return (
    <div
      className={className}
      style={{
        height,
        background: 'var(--color-border)',
        borderRadius: height / 2,
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
          background: 'var(--color-success)',
          borderRadius: height / 2,
          transition: 'width 0.3s ease',
        }}
      />
    </div>
  );
}

