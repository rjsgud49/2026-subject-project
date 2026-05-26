import {
  Equals,
  IsBoolean,
  IsEmail,
  IsIn,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
  ValidateIf,
} from 'class-validator';

/** Public signup supports student/teacher only (no admin). */
export class SignupDto {
  @IsEmail({}, { message: '유효한 이메일을 입력하세요.' })
  email: string;

  @IsString()
  @MinLength(2, { message: '이름은 2자 이상이어야 합니다.' })
  @MaxLength(100)
  name: string;

  @IsString()
  @MinLength(4, { message: '비밀번호는 4자 이상이어야 합니다.' })
  @MaxLength(128)
  password: string;

  @IsOptional()
  @IsIn(['student', 'teacher'])
  role?: 'student' | 'teacher';

  @ValidateIf((o: SignupDto) => o.role === 'teacher')
  @IsString()
  @Matches(/^01[0-9]-?[0-9]{3,4}-?[0-9]{4}$/, {
    message: '휴대폰 번호 형식이 올바르지 않습니다. (예: 010-1234-5678)',
  })
  phone?: string;

  @ValidateIf((o: SignupDto) => o.role === 'teacher')
  @IsString()
  @MinLength(2, { message: '주요 강의 분야를 선택하세요.' })
  @MaxLength(120)
  teacher_expertise?: string;

  @ValidateIf((o: SignupDto) => o.role === 'teacher')
  @IsString()
  @MinLength(30, { message: '강사 소개는 30자 이상 작성해 주세요.' })
  @MaxLength(2000)
  bio?: string;

  @ValidateIf((o: SignupDto) => o.role === 'teacher')
  @IsString()
  @MinLength(2, { message: '은행명을 입력하세요.' })
  @MaxLength(60)
  settlement_bank?: string;

  @ValidateIf((o: SignupDto) => o.role === 'teacher')
  @IsString()
  @Matches(/^[0-9-]{8,24}$/, { message: '계좌번호는 숫자와 하이픈만 입력할 수 있습니다.' })
  settlement_account_no?: string;

  @ValidateIf((o: SignupDto) => o.role === 'teacher')
  @IsString()
  @MinLength(2, { message: '예금주명을 입력하세요.' })
  @MaxLength(100)
  settlement_holder?: string;

  @ValidateIf((o: SignupDto) => o.role === 'teacher')
  @IsBoolean()
  @Equals(true, { message: '강사 이용약관에 동의해야 합니다.' })
  agree_terms?: boolean;

  @ValidateIf((o: SignupDto) => o.role === 'teacher')
  @IsBoolean()
  @Equals(true, { message: '개인정보 수집·이용에 동의해야 합니다.' })
  agree_privacy?: boolean;

  @ValidateIf((o: SignupDto) => o.role === 'teacher')
  @IsBoolean()
  @Equals(true, { message: '정산·세금 관련 안내에 동의해야 합니다.' })
  agree_settlement?: boolean;
}
