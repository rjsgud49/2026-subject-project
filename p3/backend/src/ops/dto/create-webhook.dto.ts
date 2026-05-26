import { IsArray, IsBoolean, IsOptional, IsString, IsUrl, MaxLength } from 'class-validator';

export class CreateWebhookDto {
  @IsString()
  @MaxLength(120)
  name: string;

  @IsUrl()
  @MaxLength(500)
  url: string;

  @IsArray()
  @IsString({ each: true })
  events: string[];

  @IsOptional()
  @IsBoolean()
  enabled?: boolean;
}
