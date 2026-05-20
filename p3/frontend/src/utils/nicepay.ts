export type NicePayPrepare = {
  free: boolean;
  clientId?: string;
  orderId?: string;
  amount: number;
  goodsName: string;
  returnUrl?: string;
  sandbox?: boolean;
  course_ids?: number[];
};

declare global {
  interface Window {
    AUTHNICE?: {
      requestPay: (opts: Record<string, unknown>) => void;
    };
  }
}

const NICE_JS = 'https://pay.nicepay.co.kr/v1/js/';

let scriptPromise: Promise<void> | null = null;

export function loadNicePayScript(): Promise<void> {
  if (window.AUTHNICE?.requestPay) return Promise.resolve();
  if (scriptPromise) return scriptPromise;
  scriptPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[src="${NICE_JS}"]`);
    if (existing) {
      existing.addEventListener('load', () => resolve());
      existing.addEventListener('error', () => reject(new Error('나이스페이 SDK 로드 실패')));
      return;
    }
    const s = document.createElement('script');
    s.src = NICE_JS;
    s.async = true;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error('나이스페이 SDK 로드 실패'));
    document.head.appendChild(s);
  });
  return scriptPromise;
}

export async function openNicePayCheckout(
  prep: NicePayPrepare,
  buyer?: { name?: string; email?: string; tel?: string },
): Promise<void> {
  if (prep.free) {
    throw new Error('무료 결제는 결제창을 열 수 없습니다.');
  }
  if (!prep.clientId || !prep.orderId || !prep.returnUrl) {
    throw new Error('결제 준비 정보가 올바르지 않습니다.');
  }
  await loadNicePayScript();
  if (!window.AUTHNICE?.requestPay) {
    throw new Error('나이스페이 결제 모듈을 불러오지 못했습니다.');
  }
  window.AUTHNICE.requestPay({
    clientId: prep.clientId,
    method: 'card',
    orderId: prep.orderId,
    amount: prep.amount,
    goodsName: prep.goodsName,
    returnUrl: prep.returnUrl,
    buyerName: buyer?.name,
    buyerEmail: buyer?.email,
    buyerTel: buyer?.tel,
  });
}
