import { IsString, MinLength } from 'class-validator';

export class CreateAnswerDto {
  @IsString()
  @MinLength(2, { message: '답변 내용은 최소 2자 이상이어야 합니다.' })
  body: string;
}
