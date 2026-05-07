import { IsInt, Min } from 'class-validator';

export class AddCartDto {
  @IsInt()
  @Min(1)
  course_id: number;
}
