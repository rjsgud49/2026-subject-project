import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { formatPrice } from '../utils/format';
import CourseThumbnail from '../components/CourseThumbnail';
import {
  Globe, Server, Code2, Database, Cloud, Smartphone, Shield, BookOpen,
  Users, BarChart2, MessageCircle, Users2, Landmark, Megaphone,
  Building2, Briefcase, HeartPulse, BrainCircuit,
  Target, Wifi, Award, GraduationCap, type LucideIcon,
} from 'lucide-react';

const CATEGORIES: { label: string; Icon: LucideIcon; group: string }[] = [
  { label: '웹/프론트엔드',    Icon: Globe,          group: '기술면접' },
  { label: '백엔드/서버',      Icon: Server,         group: '기술면접' },
  { label: '알고리즘/자료구조', Icon: Code2,          group: '기술면접' },
  { label: '데이터베이스',     Icon: Database,       group: '기술면접' },
  { label: '시스템설계',       Icon: Cloud,          group: '기술면접' },
  { label: 'DevOps/클라우드',  Icon: Cloud,          group: '기술면접' },
  { label: '데이터/AI',        Icon: BrainCircuit,   group: '기술면접' },
  { label: '모바일',           Icon: Smartphone,     group: '기술면접' },
  { label: '보안/네트워크',    Icon: Shield,         group: '기술면접' },
  { label: 'CS기초',           Icon: BookOpen,       group: '기술면접' },
  { label: '인성면접',         Icon: Users,          group: '면접 유형' },
  { label: 'PT면접',           Icon: BarChart2,      group: '면접 유형' },
  { label: '영어면접',         Icon: MessageCircle,  group: '면접 유형' },
  { label: '그룹면접',         Icon: Users2,         group: '면접 유형' },
  { label: '금융/은행',        Icon: Landmark,       group: '직무별' },
  { label: '마케팅/광고',      Icon: Megaphone,      group: '직무별' },
  { label: '공무원/공기업',    Icon: Building2,      group: '직무별' },
  { label: '경영/기획',        Icon: Briefcase,      group: '직무별' },
  { label: '의료/간호',        Icon: HeartPulse,     group: '직무별' },
];

const FEATURES: { Icon: LucideIcon; title: string; desc: string }[] = [
  { Icon: Target,        title: '맞춤형 커리큘럼',  desc: '직무·레벨별로 설계된 강의로 꼭 필요한 내용만 효율적으로 학습하세요.' },
  { Icon: Wifi,          title: '언제 어디서나',     desc: 'PC·모바일 어디서든 끊김 없이 수강하고 진도를 이어갈 수 있습니다.' },
  { Icon: Award,         title: '현직자 강사진',     desc: '실제 면접 경험이 풍부한 현직 엔지니어·HR 전문가들이 강의합니다.' },
  { Icon: MessageCircle, title: 'Q&A 질문 답변',     desc: '강의 내 Q&A로 궁금한 점을 즉시 해결하고 학습 효율을 높이세요.' },
];

const REVIEWS = [
  { name: '김○○', role: '카카오 합격',     rating: 5, text: '기술면접 준비를 1달 만에 끝냈어요. 강의 구성이 체계적이고 실전 질문 위주라 정말 도움이 됐습니다.' },
  { name: '이○○', role: '삼성 SDS 합격',   rating: 5, text: 'CS 기초부터 시스템 설계까지 빠짐없이 커버됩니다. 덕분에 최종 합격했어요!' },
  { name: '박○○', role: '네이버 합격',     rating: 5, text: '영어면접이 걱정이었는데 영어면접 강의 덕에 자신감을 얻었습니다. 강추!' },
  { name: '최○○', role: '현대자동차 합격', rating: 5, text: '인성면접 준비를 어디서 해야 할지 몰랐는데 이 강의 하나로 해결했습니다.' },
];

const STATS = [
  { value: '309+', label: '전체 강의 수' },
  { value: '12K+', label: '누적 수강생' },
  { value: '4.8',  label: '평균 평점' },
  { value: '95%',  label: '취업 성공률' },
];

const GROUPS = ['기술면접', '면접 유형', '직무별'] as const;

export default function Landing() {
  const [featured, setFeatured] = useState<any[]>([]);

  useEffect(() => {
    (api as any).courses.list({ page: 1, size: 8, sort: 'popular' })
      .then((res: any) => setFeatured(res?.items ?? []))
      .catch(() => {});
  }, []);

  return (
    <div style={{ background: 'var(--color-neutral-50)' }}>

      {/* ── Hero ── */}
      <section
        style={{
          background: 'var(--color-neutral-0)',
          borderBottom: '1px solid var(--color-neutral-200)',
          padding: '80px 24px 72px',
        }}
      >
        <div style={{ maxWidth: 720, margin: '0 auto', textAlign: 'center' }}>
          <span
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '4px 12px',
              background: 'var(--color-primary-50)',
              color: 'var(--color-primary-700)',
              borderRadius: 'var(--radius-full)',
              fontSize: 13, fontWeight: 600, marginBottom: 24,
            }}
          >
            <GraduationCap size={14} />
            면접 준비의 새로운 기준
          </span>
          <h1
            style={{
              fontSize: 'clamp(32px, 5vw, 56px)', fontWeight: 800,
              color: 'var(--color-neutral-900)', lineHeight: 1.2,
              letterSpacing: '-0.03em', marginBottom: 20,
            }}
          >
            취업 면접,<br />
            <span style={{ color: 'var(--color-primary-500)' }}>전략적으로</span> 준비하세요
          </h1>
          <p
            style={{
              fontSize: 18, color: 'var(--color-neutral-500)',
              lineHeight: 1.7, maxWidth: 540, margin: '0 auto 36px',
            }}
          >
            현직 전문가의 강의로 기술면접부터 인성면접까지,<br />
            맞춤형 커리큘럼으로 빠르게 합격을 경험하세요.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/courses" className="btn-cta-primary">강의 둘러보기</Link>
            <Link to="/signup" className="btn-cta-secondary">무료로 시작하기</Link>
          </div>
        </div>
      </section>

      {/* ── Stats ── */}
      <section style={{ background: 'var(--color-neutral-0)', borderBottom: '1px solid var(--color-neutral-200)' }}>
        <div
          style={{
            maxWidth: 'var(--max-w)', margin: '0 auto', padding: '0 24px',
            display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
          }}
        >
          {STATS.map((s, i) => (
            <div
              key={s.label}
              style={{
                padding: '28px 20px', textAlign: 'center',
                borderLeft: i > 0 ? '1px solid var(--color-neutral-200)' : undefined,
              }}
            >
              <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--color-primary-600)', letterSpacing: '-0.02em' }}>{s.value}</div>
              <div style={{ fontSize: 13, color: 'var(--color-neutral-500)', marginTop: 4 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── 카테고리 ── */}
      <section style={{ padding: '64px 24px' }}>
        <div style={{ maxWidth: 'var(--max-w)', margin: '0 auto' }}>
          <div style={{ marginBottom: 40 }}>
            <h2 style={{ fontSize: 28, fontWeight: 700, color: 'var(--color-neutral-900)', marginBottom: 8 }}>카테고리별 강의</h2>
            <p style={{ fontSize: 15, color: 'var(--color-neutral-500)', margin: 0 }}>분야와 면접 유형에 맞는 강의를 골라보세요.</p>
          </div>

          {GROUPS.map((group) => {
            const items = CATEGORIES.filter((c) => c.group === group);
            return (
              <div key={group} style={{ marginBottom: 40 }}>
                <h3 style={{
                  fontSize: 13, fontWeight: 600,
                  color: 'var(--color-neutral-500)',
                  textTransform: 'uppercase', letterSpacing: '0.08em',
                  marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8,
                }}>
                  <span style={{ display: 'inline-block', width: 20, height: 2, background: 'var(--color-primary-500)', borderRadius: 2 }} />
                  {group}
                </h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {items.map((cat) => (
                    <Link
                      key={cat.label}
                      to={`/courses?category=${encodeURIComponent(cat.label)}`}
                      style={{
                        display: 'inline-flex', alignItems: 'center', gap: 6,
                        padding: '8px 16px',
                        background: 'var(--color-neutral-0)',
                        border: '1px solid var(--color-neutral-200)',
                        borderRadius: 'var(--radius-full)',
                        fontSize: 14, fontWeight: 500,
                        color: 'var(--color-neutral-700)',
                        textDecoration: 'none',
                        transition: 'border-color 150ms, background 150ms, color 150ms',
                        boxShadow: 'var(--shadow-xs)',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = 'var(--color-primary-300)';
                        e.currentTarget.style.background = 'var(--color-primary-50)';
                        e.currentTarget.style.color = 'var(--color-primary-700)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = 'var(--color-neutral-200)';
                        e.currentTarget.style.background = 'var(--color-neutral-0)';
                        e.currentTarget.style.color = 'var(--color-neutral-700)';
                      }}
                    >
                      <cat.Icon size={14} />
                      {cat.label}
                    </Link>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── 추천 강의 ── */}
      {featured.length > 0 && (
        <section style={{ padding: '0 24px 64px', background: 'var(--color-neutral-50)' }}>
          <div style={{ maxWidth: 'var(--max-w)', margin: '0 auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 }}>
              <div>
                <h2 style={{ fontSize: 26, fontWeight: 700, margin: '0 0 4px', color: 'var(--color-neutral-900)' }}>인기 강의</h2>
                <p style={{ fontSize: 14, color: 'var(--color-neutral-500)', margin: 0 }}>수강생들이 많이 선택한 강의입니다.</p>
              </div>
              <Link
                to="/courses"
                style={{
                  fontSize: 14, fontWeight: 500, color: 'var(--color-primary-600)',
                  textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4,
                }}
              >
                전체 보기
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </Link>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 20 }}>
              {featured.slice(0, 8).map((c: any) => (
                <Link
                  key={c.id}
                  to={`/courses/${c.id}`}
                  style={{
                    display: 'flex', flexDirection: 'column',
                    background: 'var(--color-neutral-0)',
                    borderRadius: 'var(--radius-lg)',
                    border: '1px solid var(--color-neutral-200)',
                    overflow: 'hidden', textDecoration: 'none',
                    boxShadow: 'var(--shadow-sm)',
                    transition: 'box-shadow 200ms, transform 200ms',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
                    e.currentTarget.style.transform = 'none';
                  }}
                >
                  <div style={{ aspectRatio: '16/9', overflow: 'hidden' }}>
                    <CourseThumbnail src={c.thumbnail_url} id={c.id} title={c.title} />
                  </div>
                  <div style={{ padding: '14px 16px' }}>
                    {c.category && (
                      <span style={{ fontSize: 11, fontWeight: 500, color: 'var(--color-primary-700)', background: 'var(--color-primary-50)', padding: '2px 8px', borderRadius: 'var(--radius-full)', display: 'inline-block', marginBottom: 8 }}>
                        {c.category}
                      </span>
                    )}
                    <p style={{ margin: '0 0 6px', fontSize: 14, fontWeight: 600, color: 'var(--color-neutral-800)', lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {c.title}
                    </p>
                    <p style={{ margin: '0 0 8px', fontSize: 12, color: 'var(--color-neutral-500)' }}>{c.instructor_name}</p>
                    <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: 'var(--color-neutral-900)' }}>
                      {c.price === 0 || c.price === '0'
                        ? <span style={{ color: 'var(--color-success-600)' }}>무료</span>
                        : formatPrice(c.price)
                      }
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── 플랫폼 특징 ── */}
      <section style={{ padding: '64px 24px', background: 'var(--color-neutral-0)', borderTop: '1px solid var(--color-neutral-200)' }}>
        <div style={{ maxWidth: 'var(--max-w)', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <h2 style={{ fontSize: 26, fontWeight: 700, margin: '0 0 8px' }}>왜 면접인강인가요?</h2>
            <p style={{ fontSize: 15, color: 'var(--color-neutral-500)', margin: 0 }}>취업 준비에 꼭 필요한 것만 담았습니다.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 24 }}>
            {FEATURES.map((f) => (
              <div
                key={f.title}
                style={{
                  padding: '28px 24px',
                  background: 'var(--color-neutral-50)',
                  borderRadius: 'var(--radius-lg)',
                  border: '1px solid var(--color-neutral-200)',
                }}
              >
                <div
                  style={{
                    width: 52, height: 52, borderRadius: 14,
                    background: 'var(--color-primary-50)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    marginBottom: 16,
                  }}
                >
                  <f.Icon size={24} color="var(--color-primary-600)" />
                </div>
                <h3 style={{ fontSize: 16, fontWeight: 700, margin: '0 0 8px', color: 'var(--color-neutral-900)' }}>{f.title}</h3>
                <p style={{ fontSize: 14, color: 'var(--color-neutral-500)', margin: 0, lineHeight: 1.6 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 수강 후기 ── */}
      <section style={{ padding: '64px 24px' }}>
        <div style={{ maxWidth: 'var(--max-w)', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <h2 style={{ fontSize: 26, fontWeight: 700, margin: '0 0 8px' }}>수강생 후기</h2>
            <p style={{ fontSize: 15, color: 'var(--color-neutral-500)', margin: 0 }}>합격한 선배들의 이야기를 들어보세요.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 20 }}>
            {REVIEWS.map((r) => (
              <div
                key={r.name}
                style={{
                  padding: '24px',
                  background: 'var(--color-neutral-0)',
                  borderRadius: 'var(--radius-lg)',
                  border: '1px solid var(--color-neutral-200)',
                  boxShadow: 'var(--shadow-sm)',
                }}
              >
                <div style={{ display: 'flex', gap: 2, marginBottom: 12 }}>
                  {[...Array(r.rating)].map((_, i) => (
                    <svg key={i} width="16" height="16" viewBox="0 0 24 24" fill="#F59E0B" stroke="none">
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                    </svg>
                  ))}
                </div>
                <p style={{ fontSize: 14, color: 'var(--color-neutral-700)', lineHeight: 1.7, margin: '0 0 16px' }}>
                  "{r.text}"
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: '50%',
                    background: 'var(--color-primary-100)',
                    color: 'var(--color-primary-700)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 14, fontWeight: 700,
                  }}>
                    {r.name[0]}
                  </div>
                  <div>
                    <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: 'var(--color-neutral-800)' }}>{r.name}</p>
                    <p style={{ margin: 0, fontSize: 12, color: 'var(--color-success-600)', fontWeight: 500 }}>{r.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA 배너 ── */}
      <section style={{ padding: '64px 24px', background: 'var(--color-primary-600)', textAlign: 'center' }}>
        <div style={{ maxWidth: 560, margin: '0 auto' }}>
          <h2 style={{ fontSize: 30, fontWeight: 800, color: '#fff', marginBottom: 12, letterSpacing: '-0.02em' }}>
            지금 바로 시작하세요
          </h2>
          <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.8)', marginBottom: 32 }}>
            가입 후 무료 강의를 먼저 경험해보세요.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link
              to="/signup"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                padding: '13px 28px', fontSize: 15, fontWeight: 700,
                background: '#fff', color: 'var(--color-primary-600)',
                borderRadius: 8, textDecoration: 'none',
                boxShadow: 'var(--shadow-md)', transition: 'transform 150ms',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-1px)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = 'none'; }}
            >
              무료로 시작하기
            </Link>
            <Link
              to="/courses"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                padding: '13px 28px', fontSize: 15, fontWeight: 600,
                background: 'rgba(255,255,255,0.15)', color: '#fff',
                border: '1px solid rgba(255,255,255,0.3)',
                borderRadius: 8, textDecoration: 'none', transition: 'background 150ms',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.25)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.15)'; }}
            >
              강의 목록 보기
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
