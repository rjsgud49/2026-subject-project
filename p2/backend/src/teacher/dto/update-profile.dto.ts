import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(4000)
  bio?: string;

  @IsOptional()
  @IsString()
  @MaxLength(400000)
  profile_html?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  banner_url?: string;

  @IsOptional()
  @IsString()
  @MaxLength(60)
  settlement_bank?: string;

  @IsOptional()
  @IsString()
  @MaxLength(40)
  settlement_account_no?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  settlement_holder?: string;
}
