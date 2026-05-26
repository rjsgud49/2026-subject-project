import { IsIn, IsString } from 'class-validator';
import { FEEDBACK_PLAN_IDS } from '../../feedback/feedback.constants';

export class PrepareFeedbackDto {
  @IsString()
  @IsIn(FEEDBACK_PLAN_IDS)
  plan_id: (typeof FEEDBACK_PLAN_IDS)[number];
}
