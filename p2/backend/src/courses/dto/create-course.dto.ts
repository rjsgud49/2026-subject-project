import {
  IsBoolean,
  IsInt,
  IsObject,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

export class CreateCourseDto {
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  title: string;

  @IsOptional()
  @IsString()
  @MaxLength(8000)
  description?: string;

  @IsInt()
  @Min(0)
  price: number;

  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;

  /** 커리큘럼 객체 { sections: [...] } */
  @IsOptional()
  @IsObject()
  curriculum?: Record<string, unknown>;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  thumbnail_url?: string;
}
