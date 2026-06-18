import { IsArray, IsIn, IsInt, IsOptional } from 'class-validator';
import { OPS_EVENTS } from '../ops.constants';

export class EmitTestEventDto {
  @IsIn([...OPS_EVENTS])
  event!: (typeof OPS_EVENTS)[number];

  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  user_ids?: number[];
}
