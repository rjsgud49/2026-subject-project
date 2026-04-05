import { IsString, IsOptional, MinLength, MaxLength } from 'class-validator';

export class UpdateQuestionDto {
  @IsOptional()
  @IsString()
  @MinLength(2, { message: '제목은 최소 2자 이상이어야 합니다.' })
  @MaxLength(200, { message: '제목은 최대 200자까지 입력할 수 있습니다.' })
  title?: string;

  @IsOptional()
  @IsString()
  @MinLength(5, { message: '본문은 최소 5자 이상이어야 합니다.' })
  body?: string;
}
