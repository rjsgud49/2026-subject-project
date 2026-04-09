import { IsString, IsIn, IsOptional, MaxLength } from 'class-validator';

export class CreateFeedbackDto {
  @IsString()
  @IsIn(['doc', 'video', 'premium'], { message: 'planId는 doc, video, premium 중 하나여야 합니다.' })
  planId: string;

  @IsString()
  @MaxLength(50)
  jobCategory: string;

  @IsString()
  @MaxLength(50)
  feedbackType: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  note?: string;
}
