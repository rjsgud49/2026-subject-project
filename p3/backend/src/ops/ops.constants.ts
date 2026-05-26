export const OPS_EVENTS = [
  'payment_success',
  'enrollment',
  'feedback_answered',
  'qna_answer',
  'pending_feedback_reminder',
] as const;

export type OpsEventType = (typeof OPS_EVENTS)[number];
