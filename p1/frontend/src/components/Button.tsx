import type { CSSProperties, ButtonHTMLAttributes, ReactNode } from 'react';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

type Props = {
  children: ReactNode;
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  style?: CSSProperties;
} & ButtonHTMLAttributes<HTMLButtonElement>;

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  type = 'button',
  disabled,
  loading,
  className = '',
  style: styleProp,
  ...rest
}: Props) {
  const base: CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 10,
    fontWeight: 600,
    cursor: disabled || loading ? 'not-allowed' : 'pointer',
    opacity: disabled || loading ? 0.55 : 1,
    border: 'none',
    fontFamily: 'inherit',
    boxSizing: 'border-box',
    transition: 'background 0.15s, box-shadow 0.15s, transform 0.1s',
  };
  const sizes: Record<Size, CSSProperties> = {
    sm: { padding: '8px 14px', fontSize: 14 },
    md: { padding: '12px 22px', fontSize: 15 },
    lg: { padding: '14px 28px', fontSize: 16 },
  };
  const variants: Record<Variant, CSSProperties> = {
    primary: {
      background: 'var(--color-brand)',
      color: '#fff',
      boxShadow: '0 2px 8px rgba(0, 199, 60, 0.35)',
    },
    secondary: {
      background: '#fff',
      color: 'var(--color-text)',
      border: '1px solid var(--color-border)',
      boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
    },
    ghost: { background: 'transparent', color: 'var(--color-muted)' },
    danger: { background: 'var(--color-error)', color: '#fff' },
  };

  const merged = { ...base, ...sizes[size], ...variants[variant], ...styleProp };

  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={className}
      style={merged}
      onMouseEnter={(e) => {
        if (disabled || loading) return;
        if (variant === 'primary') e.currentTarget.style.background = 'var(--color-brand-dark)';
        if (variant === 'secondary') e.currentTarget.style.background = 'var(--color-bg)';
      }}
      onMouseLeave={(e) => {
        if (variant === 'primary') e.currentTarget.style.background = 'var(--color-brand)';
        if (variant === 'secondary') e.currentTarget.style.background = '#fff';
      }}
      {...rest}
    >
      {loading ? '…' : children}
    </button>
  );
}

