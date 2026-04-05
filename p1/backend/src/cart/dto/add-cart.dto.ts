import { IsInt, IsPositive } from 'class-validator';
import { Type } from 'class-transformer';

export class AddCartDto {
  @Type(() => Number)
  @IsInt({ message: 'course_id는 정수여야 합니다.' })
  @IsPositive({ message: 'course_id는 양수여야 합니다.' })
  course_id: number;
}
