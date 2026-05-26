export type FeedbackPlanId = 'doc' | 'video' | 'premium';

export const FEEDBACK_PLAN_IDS: FeedbackPlanId[] = ['doc', 'video', 'premium'];

export const FEEDBACK_PLANS: Record<
  FeedbackPlanId,
  { name: string; price: number }
> = {
  doc: { name: '문서 피드백', price: 39900 },
  video: { name: '영상 피드백', price: 59900 },
  premium: { name: '심층 피드백', price: 99900 },
};

export const TICKETS_PER_PURCHASE = 3;

export function isFeedbackPlanId(v: string): v is FeedbackPlanId {
  return (FEEDBACK_PLAN_IDS as string[]).includes(v);
}
