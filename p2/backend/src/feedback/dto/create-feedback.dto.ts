import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { FeedbackAttachmentRefDto } from './feedback-attachment-ref.dto';

export class CreateFeedbackDto {
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
