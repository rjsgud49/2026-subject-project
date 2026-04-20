import { IsIn, IsOptional, IsString, MaxLength } from 'class-validator';

export class TeacherFeedbackUpdateDto {
  @IsOptional()
  @IsIn(['pending', 'in_progress', 'answered'])
  status?: 'pending' | 'in_progress' | 'answered';

  @IsOptional()
  @IsString()
  @MaxLength(8000)
  teacherQuestion?: string;

  @IsOptional()
  @IsString()
  @MaxLength(12000)
  teacherFeedback?: string;
}
