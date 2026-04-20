import {
  IsEmail,
  IsIn,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

/** Public signup supports student/teacher only (no admin). */
export class SignupDto {
  @IsEmail({}, { message: '유효한 이메일을 입력하세요.' })
  email: string;

  @IsString()
  @MinLength(1)
  @MaxLength(100)
  name: string;

  @IsString()
  @MinLength(4, { message: '비밀번호는 4자 이상이어야 합니다.' })
  password: string;

  @IsOptional()
  @IsIn(['student', 'teacher'])
  role?: 'student' | 'teacher';
}
