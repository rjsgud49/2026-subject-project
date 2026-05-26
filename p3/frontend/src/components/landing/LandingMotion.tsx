import { useEffect, useRef, useState, type ReactNode } from 'react';

const DEFAULT_CYCLE = ['전략적으로', '체계적으로', '효율적으로', '실전적으로'] as const;

/** 히어로 제목 — 강조 단어 순환 */
export function AnimatedWordCycle({
  words = DEFAULT_CYCLE,
  intervalMs = 2600,
  className = '',
}: {
  words?: readonly string[];
  intervalMs?: number;
  className?: string;
}) {
  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState<'in' | 'out'>('in');

  useEffect(() => {
    if (words.length <= 1) return undefined;
    const tick = window.setInterval(() => {
      setPhase('out');
      window.setTimeout(() => {
        setIndex((i) => (i + 1) % words.length);
        setPhase('in');
      }, 380);
    }, intervalMs);
    return () => window.clearInterval(tick);
  }, [words, intervalMs]);

  return (
    <span
      className={`landing-word-cycle ${className}`.trim()}
      aria-live="polite"
      aria-atomic="true"
    >
      <span
        key={`${index}-${words[index]}`}
        className={`landing-word-cycle__word landing-word-cycle__word--${phase}`}
      >
        {words[index]}
      </span>
    </span>
  );
}

/** 진입 시 페이드업 (히어로: 즉시, 하단 섹션: 스크롤 시) */
export function LandingReveal({
  children,
  delayMs = 0,
  as: Tag = 'span',
  className = '',
  style,
  whenVisible = false,
}: {
  children: ReactNode;
  delayMs?: number;
  as?: 'span' | 'div' | 'p' | 'h1' | 'h2' | 'h3';
  className?: string;
  style?: React.CSSProperties;
  /** false면 마운트 직후 표시, true면 뷰포트 진입 시 */
  whenVisible?: boolean;
}) {
  const ref = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(!whenVisible);

  useEffect(() => {
    if (!whenVisible) {
      const t = window.setTimeout(() => setVisible(true), 50);
      return () => window.clearTimeout(t);
    }
    const el = ref.current;
    if (!el) return undefined;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          obs.disconnect();
        }
      },
      { threshold: 0.15, rootMargin: '0px 0px -32px 0px' },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [whenVisible]);

  return (
    <Tag
      ref={ref as never}
      className={`landing-reveal ${visible ? 'landing-reveal--visible' : ''} ${className}`.trim()}
      style={{ ...style, transitionDelay: `${delayMs}ms` }}
    >
      {children}
    </Tag>
  );
}

const HIGHLIGHT_PATTERNS: { pattern: RegExp; className?: string }[] = [
  { pattern: /(체계적(?:으로|이고)?)/g, className: 'landing-kw landing-kw--blue' },
  { pattern: /(전략적(?:으로)?)/g, className: 'landing-kw landing-kw--blue' },
  { pattern: /(실전(?:적으로| 질문)?)/g, className: 'landing-kw landing-kw--green' },
  { pattern: /(맞춤형)/g, className: 'landing-kw landing-kw--violet' },
  { pattern: /(빠르게|효율적(?:으로)?)/g, className: 'landing-kw landing-kw--amber' },
  { pattern: /(자신감|합격|해결)/g, className: 'landing-kw landing-kw--rose' },
];

/** 본문·후기 속 키워드 하이라이트 */
export function KeywordHighlight({ text }: { text: string }) {
  const parts: ReactNode[] = [];
  let remaining = text;
  let key = 0;

  while (remaining.length > 0) {
    let earliest: { index: number; len: number; cls: string; word: string } | null = null;

    for (const { pattern, className } of HIGHLIGHT_PATTERNS) {
      pattern.lastIndex = 0;
      const m = pattern.exec(remaining);
      if (m && m.index !== undefined && (earliest === null || m.index < earliest.index)) {
        earliest = {
          index: m.index,
          len: m[0].length,
          cls: className ?? 'landing-kw',
          word: m[0],
        };
      }
    }

    if (!earliest) {
      parts.push(remaining);
      break;
    }

    if (earliest.index > 0) {
      parts.push(remaining.slice(0, earliest.index));
    }
    parts.push(
      <span key={key++} className={earliest.cls}>
        {earliest.word}
      </span>,
    );
    remaining = remaining.slice(earliest.index + earliest.len);
  }

  return <>{parts}</>;
}
