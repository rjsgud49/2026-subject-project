import { createHash } from 'crypto';

export function pgAuthSignature(
  authToken: string,
  clientId: string,
  amount: number | string,
  secretKey: string,
): string {
  return createHash('sha256')
    .update(`${authToken}${clientId}${amount}${secretKey}`)
    .digest('hex');
}

export function verifyPgAuthSignature(
  authToken: string,
  clientId: string,
  amount: number | string,
  secretKey: string,
  signature: string,
): boolean {
  const expected = pgAuthSignature(authToken, clientId, amount, secretKey);
  return expected === signature;
}

export function pgBasicAuthHeader(clientId: string, secretKey: string): string {
  return `Basic ${Buffer.from(`${clientId}:${secretKey}`).toString('base64')}`;
}

export function readPaymentEnv(
  primary: string,
  legacy?: string,
): string {
  const p = process.env[primary]?.trim();
  if (p) return p;
  const l = legacy ? process.env[legacy]?.trim() : '';
  return l ?? '';
}
