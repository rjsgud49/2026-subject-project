import { IsBoolean, IsIn, IsOptional, IsString, MaxLength } from 'class-validator';

export class TeacherFeedbackUpdateDto {
  @IsOptional()
  @IsIn(['pending', 'in_progress', 'answered'])
  status?: 'pending' | 'in_progress' | 'answered';

  /** status 를 answered 로 바꿀 때 반드시 true (실수 방지) */
  @IsOptional()
  @IsBoolean()
  confirmComplete?: boolean;

  @IsOptional()
  @IsString()
  @MaxLength(8000)
  teacherQuestion?: string;

  @IsOptional()
  @IsString()
  @MaxLength(12000)
  teacherFeedback?: string;
}
