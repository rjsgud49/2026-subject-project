import { IsBoolean, IsOptional } from 'class-validator';

export class RunSchedulerDto {
  /** 시연용: 24시간 미만 pending 주문도 만료 처리 */
  @IsOptional()
  @IsBoolean()
  force_expire_pending?: boolean;
}
