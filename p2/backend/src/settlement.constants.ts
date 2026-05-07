/** 플랫폼 수수료율 (강사 대시보드·수익 원장과 동일) */
export const PLATFORM_FEE_RATE = 0.1;

export function splitEnrollmentRevenue(priceSnapshot: number): {
  gross: number;
  platformFee: number;
  net: number;
} {
  const gross = Math.max(0, Math.floor(Number(priceSnapshot) || 0));
  const platformFee = Math.round(gross * PLATFORM_FEE_RATE);
  const net = gross - platformFee;
  return { gross, platformFee, net };
}
