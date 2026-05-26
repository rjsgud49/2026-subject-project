import { IsInt, IsOptional, IsString, Max, MaxLength, Min, MinLength } from 'class-validator';

export class CreateReviewDto {
  @IsString()
  @MinLength(1)
  @MaxLength(30)
  display_name: string;

  @IsOptional()
  @IsString()
  @MaxLength(40)
  tagline?: string;

  @IsInt()
  @Min(1)
  @Max(5)
  rating: number;

  @IsString()
  @MinLength(5)
  @MaxLength(240)
  text: string;
}

