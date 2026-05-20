import { IsString, Matches, MaxLength } from 'class-validator';

export class FeedbackAttachmentRefDto {
  @IsString()
  @Matches(/^\/api\/v1\/files\/[\w.-]+$/, {
    message: '첨부 URL 형식이 올바르지 않습니다.',
  })
  url: string;

  @IsString()
  @MaxLength(255)
  filename: string;
}
