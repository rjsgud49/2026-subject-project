import { Type } from 'class-transformer';
import { IsBoolean, IsInt, Min } from 'class-validator';

export class UpdateVideoProgressDto {
  @Type(() => Number)
  @IsInt()
  @Min(0)
  last_second: number;

  @Type(() => Boolean)
  @IsBoolean()
  completed: boolean;
}
