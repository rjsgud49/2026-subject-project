import type { CSSProperties, ButtonHTMLAttributes, ReactNode } from 'react';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
type Size = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

type Props = {
  children?: ReactNode;
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  style?: CSSProperties;
} & ButtonHTMLAttributes<HTMLButtonElement>;

const SIZE_STYLES: Record<Size, CSSProperties> = {
  xs: { height: 28, padding: '0 10px', fontSize: 12, borderRadius: 6, gap: 4 },
  sm: { height: 32, padding: '0 12px', fontSize: 14, borderRadius: 6, gap: 6 },
  md: { height: 40, padding: '0 16px', fontSize: 14, borderRadius: 8, gap: 8 },
  lg: { height: 48, padding: '0 24px', fontSize: 16, borderRadius: 8, gap: 8 },
  xl: { height: 56, padding: '0 32px', fontSize: 16, borderRadius: 12, gap: 12 },
};

const VARIANT_STYLES: Record<Variant, CSSProperties> = {
  primary: {
    background: 'var(--color-primary-500)',
    color: '#ffffff',
    border: 'none',
    boxShadow: 'var(--shadow-xs)',
  },
  secondary: {
    background: 'var(--color-neutral-0)',
    color: 'var(--color-neutral-700)',
    border: '1px solid var(--color-neutral-200)',
    boxShadow: 'var(--shadow-xs)',
  },
  ghost: {
    background: 'transparent',
    color: 'var(--color-neutral-600)',
    border: 'none',
    boxShadow: 'none',
  },
  danger: {
    background: 'var(--color-error-600)',
    color: '#ffffff',
    border: 'none',
    boxShadow: 'var(--shadow-xs)',
  },
};

const VARIANT_HOVER: Record<Variant, Partial<CSSProperties>> = {
  primary:   { background: 'var(--color-primary-600)' },
  secondary: { background: 'var(--color-neutral-50)', borderColor: 'var(--color-neutral-300)' },
  ghost:     { background: 'var(--color-neutral-100)' },
  danger:    { background: 'var(--color-error-700)' },
};

const VARIANT_LEAVE: Record<Variant, Partial<CSSProperties>> = {
  primary:   { background: 'var(--color-primary-500)' },
  secondary: { background: 'var(--color-neutral-0)', borderColor: 'var(--color-neutral-200)' },
  ghost:     { background: 'transparent' },
  danger:    { background: 'var(--color-error-600)' },
};

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
  const isDisabled = disabled || loading;

  const base: CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 500,
    fontFamily: 'inherit',
    cursor: isDisabled ? 'not-allowed' : 'pointer',
    opacity: isDisabled ? 0.5 : 1,
    boxSizing: 'border-box',
    transition: `background ${150}ms ease, border-color ${150}ms ease, box-shadow ${150}ms ease, transform ${75}ms ease`,
    userSelect: 'none',
    whiteSpace: 'nowrap',
    textDecoration: 'none',
  };

  const merged: CSSProperties = {
    ...base,
    ...SIZE_STYLES[size],
    ...VARIANT_STYLES[variant],
    ...styleProp,
  };

  const applyStyles = (el: HTMLButtonElement, styles: Partial<CSSProperties>) => {
    Object.entries(styles).forEach(([k, v]) => {
      (el.style as any)[k] = v;
    });
  };

  return (
    <button
      type={type}
      disabled={isDisabled}
      className={className}
      style={merged}
      onMouseEnter={(e) => {
        if (isDisabled) return;
        applyStyles(e.currentTarget, VARIANT_HOVER[variant]);
      }}
      onMouseLeave={(e) => {
        applyStyles(e.currentTarget, VARIANT_LEAVE[variant]);
        e.currentTarget.style.transform = '';
      }}
      onMouseDown={(e) => {
        if (isDisabled) return;
        e.currentTarget.style.transform = 'scale(0.98)';
      }}
      onMouseUp={(e) => {
        e.currentTarget.style.transform = '';
      }}
      {...rest}
    >
      {loading ? (
        <>
          <span
            style={{
              display: 'inline-block',
              width: 14,
              height: 14,
              border: '2px solid currentColor',
              borderTopColor: 'transparent',
              borderRadius: '50%',
              animation: 'spin 0.6s linear infinite',
            }}
          />
          처리 중...
        </>
      ) : children}
    </button>
  );
}
