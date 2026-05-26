import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsIn,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { FEEDBACK_PLAN_IDS } from '../feedback.constants';
import { FeedbackAttachmentRefDto } from './feedback-attachment-ref.dto';

export class CreateFeedbackDto {
  @IsOptional()
  @IsString()
  @IsIn(FEEDBACK_PLAN_IDS)
  plan_id?: (typeof FEEDBACK_PLAN_IDS)[number];

  @IsString()
  @MinLength(2)
  @MaxLength(200)
  title: string;

  @IsString()
  @MinLength(5)
  @MaxLength(8000)
  question: string;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(8)
  @ValidateNested({ each: true })
  @Type(() => FeedbackAttachmentRefDto)
  attachments?: FeedbackAttachmentRefDto[];
}
