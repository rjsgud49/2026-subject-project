import { BookOpen } from 'lucide-react';

const GRADIENTS = [
  ['#EFF6FF', '#BFDBFE'],
  ['#F0FDF4', '#BBF7D0'],
  ['#FFF7ED', '#FED7AA'],
  ['#FDF4FF', '#E9D5FF'],
  ['#ECFDF5', '#A7F3D0'],
  ['#EFF6FF', '#E0F2FE'],
];

const ICON_COLORS = [
  '#2563EB',
  '#16A34A',
  '#D97706',
  '#7C3AED',
  '#0891B2',
  '#059669',
];

export default function CourseThumbnail({
  src,
  id = 0,
  title = '',
  borderRadius = 0,
}: {
  src?: string | null;
  id?: number;
  title?: string;
  borderRadius?: number;
}) {
  const idx = id % GRADIENTS.length;
  const [gradStart, gradEnd] = GRADIENTS[idx];
  const iconColor = ICON_COLORS[idx];

  if (src) {
    return (
      <img
        src={src}
        alt={title || '강의 이미지'}
        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', borderRadius }}
      />
    );
  }

  const initial = title ? title.trim()[0] : null;

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        background: `linear-gradient(135deg, ${gradStart} 0%, ${gradEnd} 100%)`,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        borderRadius,
      }}
    >
      {/* 아이콘 */}
      <div
        style={{
          width: 48,
          height: 48,
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        }}
      >
        <BookOpen size={22} color={iconColor} strokeWidth={1.8} />
      </div>
      {/* 이니셜 */}
      {initial && (
        <span
          style={{
            fontSize: 11,
            fontWeight: 700,
            color: iconColor,
            opacity: 0.7,
            letterSpacing: '0.02em',
            maxWidth: '80%',
            overflow: 'hidden',
            whiteSpace: 'nowrap',
            textOverflow: 'ellipsis',
          }}
        >
          {title.length > 16 ? title.slice(0, 16) + '…' : title}
        </span>
      )}
    </div>
  );
}
