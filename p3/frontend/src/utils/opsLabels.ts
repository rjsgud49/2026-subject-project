export const OPS_EVENT_LABELS: Record<string, string> = {
  payment_success: '결제 완료',
  enrollment: '수강 등록',
  feedback_answered: '피드백 답변',
  qna_answer: 'Q&A 답변',
  pending_feedback_reminder: '미답변 피드백 알림',
};

export const OPS_EVENT_HINTS: Record<string, string> = {
  payment_success: '온라인 결제 승인 후',
  enrollment: '수강 등록·무료 수강 포함',
  feedback_answered: '강사가 피드백 티켓에 답변',
  qna_answer: '강사·관리자 Q&A 답변',
  pending_feedback_reminder: '매일 09:00 미답변 알림',
};

export const AUDIT_ACTION_LABELS: Record<string, string> = {
  'webhook.create': 'Webhook 등록',
  'webhook.delete': 'Webhook 삭제',
  'scheduler.run': '스케줄 실행',
  'ops.test_event': '테스트 이벤트',
};

export function eventLabel(key: string): string {
  return OPS_EVENT_LABELS[key] ?? key;
}

export function auditActionLabel(action: string): string {
  return AUDIT_ACTION_LABELS[action] ?? action;
}

export function formatUptime(sec: number): string {
  if (sec < 60) return `${sec}초`;
  if (sec < 3600) {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return s > 0 ? `${m}분 ${s}초` : `${m}분`;
  }
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  return m > 0 ? `${h}시간 ${m}분` : `${h}시간`;
}
