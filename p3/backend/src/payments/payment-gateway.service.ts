import { Injectable, Logger } from '@nestjs/common';
import {
  pgBasicAuthHeader,
  readPaymentEnv,
  verifyPgAuthSignature,
} from './payment-gateway.util';

export type PaymentAuthReturnBody = {
  authResultCode?: string;
  authResultMsg?: string;
  tid?: string;
  clientId?: string;
  orderId?: string;
  amount?: string | number;
  authToken?: string;
  signature?: string;
  mallReserved?: string;
};

export type PaymentApproveResponse = {
  resultCode?: string;
  resultMsg?: string;
  tid?: string;
  orderId?: string;
  amount?: number;
  status?: string;
  paidAt?: string;
};

@Injectable()
export class PaymentGatewayService {
  private readonly logger = new Logger(PaymentGatewayService.name);

  private get clientId(): string {
    return readPaymentEnv('PAYMENT_CLIENT_ID', 'NICEPAY_CLIENT_ID');
  }

  private get secretKey(): string {
    return readPaymentEnv('PAYMENT_SECRET_KEY', 'NICEPAY_SECRET_KEY');
  }

  private get apiBase(): string {
    const fromEnv = readPaymentEnv('PAYMENT_API_BASE', 'NICEPAY_API_BASE');
    if (fromEnv) return fromEnv.replace(/\/$/, '');
    return process.env.NODE_ENV === 'production'
      ? 'https://api.nicepay.co.kr'
      : 'https://sandbox-api.nicepay.co.kr';
  }

  private get jsUrl(): string {
    const fromEnv = readPaymentEnv('PAYMENT_JS_URL');
    return fromEnv || 'https://pay.nicepay.co.kr/v1/js/';
  }

  isConfigured(): boolean {
    return Boolean(this.clientId && this.secretKey);
  }

  getPublicClientId(): string {
    return this.clientId;
  }

  getJsUrl(): string {
    return this.jsUrl;
  }

  buildReturnUrl(): string {
    const base =
      readPaymentEnv('PAYMENT_RETURN_BASE', 'NICEPAY_RETURN_BASE') ||
      `http://127.0.0.1:${process.env.PORT ?? '3000'}`;
    return `${base.replace(/\/$/, '')}/api/v1/payments/return`;
  }

  verifyAuth(body: PaymentAuthReturnBody): boolean {
    const { authToken, clientId, amount, signature } = body;
    if (!authToken || !clientId || amount == null || !signature) return false;
    return verifyPgAuthSignature(
      authToken,
      clientId,
      amount,
      this.secretKey,
      signature,
    );
  }

  async approve(tid: string, amount: number): Promise<PaymentApproveResponse> {
    const url = `${this.apiBase}/v1/payments/${encodeURIComponent(tid)}`;
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: pgBasicAuthHeader(this.clientId, this.secretKey),
      },
      body: JSON.stringify({ amount }),
    });
    const data = (await res.json().catch(() => ({}))) as PaymentApproveResponse;
    if (!res.ok) {
      this.logger.warn(
        `Payment approve HTTP ${res.status}: ${JSON.stringify(data)}`,
      );
    }
    return data;
  }
}
