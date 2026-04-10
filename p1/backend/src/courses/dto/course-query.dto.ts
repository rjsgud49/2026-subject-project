import { IsOptional, IsString, IsNumberString, IsIn } from 'class-validator';

export class CourseQueryDto {
  @IsOptional()
  @IsString()
  q?: string;

  @IsOptional()
  @IsString()
  instructor_name?: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsString()
  interviewType?: string;

  @IsOptional()
  @IsIn(['beginner', 'intermediate', 'advanced'], {
    message: 'difficulty는 beginner, intermediate, advanced 중 하나여야 합니다.',
  })
  difficulty?: string;

  @IsOptional()
  @IsNumberString({}, { message: 'min_price는 숫자여야 합니다.' })
  min_price?: string;

  @IsOptional()
  @IsNumberString({}, { message: 'max_price는 숫자여야 합니다.' })
  max_price?: string;

  @IsOptional()
  @IsIn(['latest', 'popular', 'price_asc', 'price_desc'], {
    message: 'sort는 latest, popular, price_asc, price_desc 중 하나여야 합니다.',
  })
  sort?: string;

  @IsOptional()
  @IsNumberString({}, { message: 'page는 숫자여야 합니다.' })
  page?: string;

  @IsOptional()
  @IsNumberString({}, { message: 'size는 숫자여야 합니다.' })
  size?: string;
}
