import { ArrayMinSize, IsArray, IsInt, Min } from 'class-validator';

export class PreparePaymentDto {
  @IsArray()
  @ArrayMinSize(1)
  @IsInt({ each: true })
  @Min(1, { each: true })
  course_ids: number[];
}
