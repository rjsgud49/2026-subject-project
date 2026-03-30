import { useState, useCallback } from 'react';

const SUBMISSION_KEY = 'p1_feedback_submissions';

export type SubmissionStatus = 'pending' | 'in_progress' | 'completed';
export type PlanId = 'doc' | 'video' | 'premium';

export interface FeedbackSubmission {
  id: string;
  planId: PlanId;
  planName: string;
  planIcon: string;
  jobCategory: string;
  feedbackType: string;
  note: string;
  fileNames: string[];
  status: SubmissionStatus;
  submittedAt: string;       // ISO string
  updatedAt: string;
  completedAt?: string;
  expertFeedback?: string;
}

const MOCK_SUBMISSIONS: FeedbackSubmission[] = [
  {
    id: 'mock-1',
    planId: 'video',
    planName: '영상 피드백',
    planIcon: '🎬',
    jobCategory: 'IT개발',
    feedbackType: '면접 영상',
    note: '백엔드 개발자 직무로 지원하는데 기술 면접 답변이 너무 길어지는 것 같습니다. 간결하게 답변하는 방법에 대한 피드백 부탁드립니다.',
    fileNames: ['backend_interview_practice.mp4'],
    status: 'completed',
    submittedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
    completedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
    expertFeedback:
      '전반적으로 기술 이해도는 매우 좋습니다. 다만 답변 시 핵심 키워드를 먼저 말하고 부연 설명하는 PREP 구조를 사용해보세요. 예를 들어 "Redis를 사용했습니다. 이유는 캐싱 성능 때문이며, 구체적으로는..." 과 같이 결론을 먼저 말하면 훨씬 깔끔합니다.',
  },
  {
    id: 'mock-2',
    planId: 'doc',
    planName: '문서 피드백',
    planIcon: '📄',
    jobCategory: '금융/은행',
    feedbackType: '자기소개서',
    note: '은행 신입 공채 지원 예정입니다. 자기소개서 지원동기 항목을 중심으로 봐주세요.',
    fileNames: ['자기소개서_최종.pdf'],
    status: 'in_progress',
    submittedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
  },
];

function loadSubmissions(): FeedbackSubmission[] {
  try {
    const raw = localStorage.getItem(SUBMISSION_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {}
  // 최초 접근 시 목업 데이터 시드
  localStorage.setItem(SUBMISSION_KEY, JSON.stringify(MOCK_SUBMISSIONS));
  return MOCK_SUBMISSIONS;
}

function saveSubmissions(list: FeedbackSubmission[]) {
  localStorage.setItem(SUBMISSION_KEY, JSON.stringify(list));
}

function generateId(): string {
  return `sub-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export function useFeedbackSubmissions() {
  const [submissions, setSubmissions] = useState<FeedbackSubmission[]>(loadSubmissions);

  const addSubmission = useCallback(
    (data: Omit<FeedbackSubmission, 'id' | 'status' | 'submittedAt' | 'updatedAt'>): FeedbackSubmission => {
      const now = new Date().toISOString();
      const newSub: FeedbackSubmission = {
        ...data,
        id: generateId(),
        status: 'pending',
        submittedAt: now,
        updatedAt: now,
      };
      setSubmissions((prev) => {
        const next = [newSub, ...prev];
        saveSubmissions(next);
        return next;
      });
      return newSub;
    },
    []
  );

  const refresh = useCallback(() => {
    setSubmissions(loadSubmissions());
  }, []);

  return { submissions, addSubmission, refresh };
}
