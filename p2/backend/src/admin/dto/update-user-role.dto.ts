import { IsIn } from 'class-validator';

export class UpdateUserRoleDto {
  @IsIn(['admin', 'teacher', 'student'], {
    message: 'role은 admin, teacher, student 중 하나여야 합니다.',
  })
  role: 'admin' | 'teacher' | 'student';
}
