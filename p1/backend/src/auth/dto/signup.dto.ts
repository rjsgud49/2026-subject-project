import { IsEmail, IsString, MinLength, MaxLength } from 'class-validator';

export class SignupDto {
  @IsEmail({}, { message: '유효한 이메일 형식을 입력해 주세요.' })
  email: string;

  @IsString()
  @MinLength(2, { message: '이름은 최소 2자 이상이어야 합니다.' })
  @MaxLength(50, { message: '이름은 최대 50자까지 입력할 수 있습니다.' })
  name: string;

  @IsString()
  @MinLength(4, { message: '비밀번호는 최소 4자 이상이어야 합니다.' })
  @MaxLength(100, { message: '비밀번호는 최대 100자까지 입력할 수 있습니다.' })
  password: string;
}
