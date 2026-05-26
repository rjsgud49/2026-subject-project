import { IsString, MaxLength } from 'class-validator';

export class UpsertStudyNoteDto {
  @IsString()
  @MaxLength(20000)
  text: string;
}
