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
import { PrepareFeedbackDto } from './dto/prepare-feedback.dto';
import { PaymentAuthReturnBody, PaymentGatewayService } from './payment-gateway.service';
import { readPaymentEnv } from './payment-gateway.util';

@Controller('payments')
export class PaymentsController {
  constructor(
    private readonly paymentsService: PaymentsService,
    private readonly paymentGateway: PaymentGatewayService,
  ) {}

  @Get('config')
  config() {
    const clientId = readPaymentEnv('PAYMENT_CLIENT_ID', 'NICEPAY_CLIENT_ID');
    const secret = readPaymentEnv('PAYMENT_SECRET_KEY', 'NICEPAY_SECRET_KEY');
    return {
      enabled: Boolean(clientId && secret),
      clientId: clientId || null,
      jsUrl: this.paymentGateway.getJsUrl(),
    };
  }

  @Post('prepare')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('student')
  prepare(@CurrentUser() user: AuthUser, @Body() dto: PreparePaymentDto) {
    return this.paymentsService.prepare(user.id, dto.course_ids);
  }

  @Post('prepare-feedback')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('student')
  prepareFeedback(
    @CurrentUser() user: AuthUser,
    @Body() dto: PrepareFeedbackDto,
  ) {
    return this.paymentsService.prepareFeedback(user.id, dto.plan_id);
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

  /** PG 인증 완료 후 form POST (브라우저 리다이렉트) */
  @Post('return')
  async paymentReturn(@Body() body: PaymentAuthReturnBody, @Res() res: Response) {
    const url = await this.paymentsService.handlePaymentReturn(body);
    return res.redirect(302, url);
  }

  /** 이전 콜백 URL 호환 */
  @Post('nice/return')
  async legacyPaymentReturn(
    @Body() body: PaymentAuthReturnBody,
    @Res() res: Response,
  ) {
    const url = await this.paymentsService.handlePaymentReturn(body);
    return res.redirect(302, url);
  }
}
