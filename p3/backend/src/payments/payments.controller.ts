import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Response } from 'express';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import {
  CurrentUser,
  AuthUser,
} from '../common/decorators/current-user.decorator';
import { PaymentsService } from './payments.service';
import { PreparePaymentDto } from './dto/prepare-payment.dto';
import { NiceAuthReturnBody } from './nicepay.service';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Get('config')
  config() {
    const clientId = process.env.NICEPAY_CLIENT_ID ?? '';
    return {
      enabled: Boolean(clientId && process.env.NICEPAY_SECRET_KEY),
      clientId: clientId || null,
      sandbox: true,
      jsUrl: 'https://pay.nicepay.co.kr/v1/js/',
    };
  }

  @Post('prepare')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('student')
  prepare(@CurrentUser() user: AuthUser, @Body() dto: PreparePaymentDto) {
    return this.paymentsService.prepare(user.id, dto.course_ids);
  }

  @Post('free-checkout')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('student')
  freeCheckout(@CurrentUser() user: AuthUser, @Body() dto: PreparePaymentDto) {
    return this.paymentsService.fulfillFree(user.id, dto.course_ids);
  }

  @Get('orders/:orderId')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('student')
  getOrder(
    @CurrentUser() user: AuthUser,
    @Param('orderId') orderId: string,
  ) {
    return this.paymentsService.getOrder(user.id, orderId);
  }

  /** 나이스페이 인증 완료 후 form POST (브라우저 리다이렉트) */
  @Post('nice/return')
  async niceReturn(@Body() body: NiceAuthReturnBody, @Res() res: Response) {
    const url = await this.paymentsService.handleNiceReturn(body);
    return res.redirect(302, url);
  }
}
