import { createHash } from 'crypto';

export function niceAuthSignature(
  authToken: string,
  clientId: string,
  amount: number | string,
  secretKey: string,
): string {
  return createHash('sha256')
    .update(`${authToken}${clientId}${amount}${secretKey}`)
    .digest('hex');
}

export function verifyNiceAuthSignature(
  authToken: string,
  clientId: string,
  amount: number | string,
  secretKey: string,
  signature: string,
): boolean {
  const expected = niceAuthSignature(authToken, clientId, amount, secretKey);
  return expected === signature;
}

export function niceBasicAuthHeader(clientId: string, secretKey: string): string {
  return `Basic ${Buffer.from(`${clientId}:${secretKey}`).toString('base64')}`;
}
