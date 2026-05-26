import { IsArray, IsBoolean, IsIn, IsOptional, IsString, MaxLength } from 'class-validator';

export class UpsertSubscriptionDto {
  @IsIn(['email', 'discord'])
  channel: 'email' | 'discord';

  @IsString()
  @MaxLength(500)
  target: string;

  @IsArray()
  @IsString({ each: true })
  event_types: string[];

  @IsOptional()
  @IsBoolean()
  enabled?: boolean;
}
