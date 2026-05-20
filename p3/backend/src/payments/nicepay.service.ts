import { Injectable, Logger } from '@nestjs/common';
import {
  niceBasicAuthHeader,
  verifyNiceAuthSignature,
} from './nicepay.util';

export type NiceAuthReturnBody = {
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

export type NiceApproveResponse = {
  resultCode?: string;
  resultMsg?: string;
  tid?: string;
  orderId?: string;
  amount?: number;
  status?: string;
  paidAt?: string;
};

@Injectable()
export class NicepayService {
  private readonly logger = new Logger(NicepayService.name);

  private get clientId(): string {
    return process.env.NICEPAY_CLIENT_ID ?? '';
  }

  private get secretKey(): string {
    return process.env.NICEPAY_SECRET_KEY ?? '';
  }

  private get apiBase(): string {
    return (
      process.env.NICEPAY_API_BASE ?? 'https://sandbox-api.nicepay.co.kr'
    ).replace(/\/$/, '');
  }

  isConfigured(): boolean {
    return Boolean(this.clientId && this.secretKey);
  }

  getPublicClientId(): string {
    return this.clientId;
  }

  buildReturnUrl(): string {
    const base =
      process.env.NICEPAY_RETURN_BASE ??
      `http://127.0.0.1:${process.env.PORT ?? '3000'}`;
    return `${base.replace(/\/$/, '')}/api/v1/payments/nice/return`;
  }

  verifyAuth(body: NiceAuthReturnBody): boolean {
    const { authToken, clientId, amount, signature } = body;
    if (!authToken || !clientId || amount == null || !signature) return false;
    return verifyNiceAuthSignature(
      authToken,
      clientId,
      amount,
      this.secretKey,
      signature,
    );
  }

  async approve(tid: string, amount: number): Promise<NiceApproveResponse> {
    const url = `${this.apiBase}/v1/payments/${encodeURIComponent(tid)}`;
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: niceBasicAuthHeader(this.clientId, this.secretKey),
      },
      body: JSON.stringify({ amount }),
    });
    const data = (await res.json().catch(() => ({}))) as NiceApproveResponse;
    if (!res.ok) {
      this.logger.warn(
        `Nicepay approve HTTP ${res.status}: ${JSON.stringify(data)}`,
      );
    }
    return data;
  }
}
