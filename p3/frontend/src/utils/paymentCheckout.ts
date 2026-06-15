export type PaymentPrepare = {
  free: boolean;
  clientId?: string;
  orderId?: string;
  amount: number;
  goodsName: string;
  returnUrl?: string;
  course_ids?: number[];
};

export type PaymentCheckoutBuyer = {
  name?: string;
  email?: string;
  tel?: string;
  /** 결제창이 닫히거나 취소될 때 (성공 리다이렉트 전) */
  onClosed?: () => void;
};

declare global {
  interface Window {
    AUTHNICE?: {
      requestPay: (opts: Record<string, unknown>) => void;
    };
  }
}

const PAYMENT_JS = 'https://pay.nicepay.co.kr/v1/js/';
const PAY_LAYER_H = 825;
const PAY_LAYER_W = 660;

let scriptPromise: Promise<void> | null = null;
let viewportFixStop: (() => void) | null = null;
let layerCloseWatchStop: (() => void) | null = null;

function isPaymentFrame(el: Element): el is HTMLIFrameElement {
  if (el.tagName !== 'IFRAME') return false;
  const src = el.getAttribute('src') ?? '';
  return src.includes('pay.');
}

function isPaymentLayerPresent(): boolean {
  for (const frame of document.querySelectorAll('iframe')) {
    if (isPaymentFrame(frame)) return true;
  }
  for (const el of document.querySelectorAll<HTMLElement>('div')) {
    const st = getComputedStyle(el);
    if (st.position !== 'fixed') continue;
    const w = el.offsetWidth;
    const h = el.offsetHeight;
    if (w >= 520 && w <= 760 && h >= 640) return true;
  }
  return false;
}

function fitPaymentLayerToViewport() {
  const pad = 20;
  const vh = window.innerHeight;
  const vw = window.innerWidth;
  const scale = Math.min(
    1,
    (vh - pad * 2) / PAY_LAYER_H,
    (vw - pad * 2) / PAY_LAYER_W,
  );

  const roots = new Set<HTMLElement>();

  document.querySelectorAll('iframe').forEach((frame) => {
    if (!isPaymentFrame(frame)) return;
    let root: HTMLElement = frame;
    let p = frame.parentElement;
    for (let i = 0; p && i < 8; i += 1, p = p.parentElement) {
      const st = getComputedStyle(p);
      if (st.position === 'fixed' || st.position === 'absolute') root = p;
      p.style.setProperty('overflow', 'visible', 'important');
    }
    roots.add(root);
    frame.style.setProperty('display', 'block', 'important');
  });

  document.querySelectorAll<HTMLElement>('div').forEach((el) => {
    const st = getComputedStyle(el);
    if (st.position !== 'fixed') return;
    const w = el.offsetWidth;
    const h = el.offsetHeight;
    if (w >= 520 && w <= 760 && h >= 640) roots.add(el);
  });

  for (const el of roots) {
    el.style.setProperty('overflow', 'visible', 'important');
    el.style.setProperty('top', `${pad}px`, 'important');
    el.style.setProperty('left', '50%', 'important');
    el.style.setProperty('right', 'auto', 'important');
    el.style.setProperty('bottom', 'auto', 'important');
    el.style.setProperty('margin', '0', 'important');
    el.style.setProperty('transform-origin', 'top center', 'important');
    el.style.setProperty(
      'transform',
      `translateX(-50%) scale(${scale.toFixed(4)})`,
      'important',
    );
    if (scale < 1) {
      el.style.setProperty('max-height', 'none', 'important');
      el.style.setProperty('height', 'auto', 'important');
    }
  }
}

function startPaymentViewportFix() {
  viewportFixStop?.();
  fitPaymentLayerToViewport();
  const obs = new MutationObserver(() => fitPaymentLayerToViewport());
  obs.observe(document.body, { childList: true, subtree: true, attributes: true });
  const interval = window.setInterval(fitPaymentLayerToViewport, 400);
  const stopAt = window.setTimeout(() => viewportFixStop?.(), 120_000);
  viewportFixStop = () => {
    obs.disconnect();
    window.clearInterval(interval);
    window.clearTimeout(stopAt);
    viewportFixStop = null;
  };
}

function stopPaymentViewportFix() {
  viewportFixStop?.();
  document.body.classList.remove('payment-checkout-active');
}

/** PG 결제 레이어(iframe)가 DOM에서 사라지면 onClose 호출 — X 버튼 등 */
function watchPaymentLayerClose(onClose: () => void): () => void {
  layerCloseWatchStop?.();
  let fired = false;
  let debounceTimer: number | undefined;

  const fire = () => {
    if (fired) return;
    fired = true;
    stopPaymentViewportFix();
    onClose();
    cleanup();
  };

  const scheduleCheck = () => {
    window.clearTimeout(debounceTimer);
    debounceTimer = window.setTimeout(() => {
      if (!isPaymentLayerPresent()) fire();
    }, 280);
  };

  const obs = new MutationObserver(scheduleCheck);
  obs.observe(document.body, { childList: true, subtree: true });

  const interval = window.setInterval(scheduleCheck, 600);
  const maxTimer = window.setTimeout(fire, 120_000);

  const cleanup = () => {
    obs.disconnect();
    window.clearInterval(interval);
    window.clearTimeout(maxTimer);
    window.clearTimeout(debounceTimer);
    layerCloseWatchStop = null;
  };

  layerCloseWatchStop = cleanup;
  return cleanup;
}

export function loadPaymentScript(): Promise<void> {
  if (window.AUTHNICE?.requestPay) return Promise.resolve();
  if (scriptPromise) return scriptPromise;
  scriptPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[src="${PAYMENT_JS}"]`);
    if (existing) {
      existing.addEventListener('load', () => resolve());
      existing.addEventListener('error', () => reject(new Error('결제 모듈을 불러오지 못했습니다.')));
      return;
    }
    const s = document.createElement('script');
    s.src = PAYMENT_JS;
    s.async = true;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error('결제 모듈을 불러오지 못했습니다.'));
    document.head.appendChild(s);
  });
  return scriptPromise;
}

/**
 * 결제창을 연다. Promise는 결제창이 닫히거나 취소될 때 resolve ('closed').
 * 결제 성공 시 returnUrl로 페이지가 이동하면 resolve 전에 unload 될 수 있음.
 */
export async function openPaymentCheckout(
  prep: PaymentPrepare,
  buyer?: PaymentCheckoutBuyer,
): Promise<'closed'> {
  if (prep.free) {
    throw new Error('무료 결제는 결제창을 열 수 없습니다.');
  }
  if (!prep.clientId || !prep.orderId || !prep.returnUrl) {
    throw new Error('결제 준비 정보가 올바르지 않습니다.');
  }
  await loadPaymentScript();
  if (!window.AUTHNICE?.requestPay) {
    throw new Error('결제 모듈을 불러오지 못했습니다.');
  }

  return new Promise<'closed'>((resolve) => {
    let settled = false;
    const settle = () => {
      if (settled) return;
      settled = true;
      layerCloseWatchStop?.();
      resolve('closed');
    };

    const onClosed = () => {
      buyer?.onClosed?.();
      settle();
    };

    document.body.classList.add('payment-checkout-active');
    document.body.style.overflow = '';
    startPaymentViewportFix();
    watchPaymentLayerClose(onClosed);

    const payOpts: Record<string, unknown> = {
      clientId: prep.clientId,
      method: 'card',
      orderId: prep.orderId,
      amount: Number(prep.amount),
      goodsName: prep.goodsName,
      returnUrl: prep.returnUrl,
      buyerName: buyer?.name,
      buyerEmail: buyer?.email,
      buyerTel: buyer?.tel,
      disableScroll: false,
      zIdxHigher: true,
      // 나이스페이 SDK는 arrow function 을 fnError 로 인식하지 않는 경우가 있음
      fnError: function (result: { errorMsg?: string; message?: string }) {
        const msg = `${result?.errorMsg ?? ''} ${result?.message ?? ''}`.trim();
        if (!/취소|cancel|I009/i.test(msg) && msg) {
          window.alert(msg || '결제창 호출에 실패했습니다.');
        }
        onClosed();
      },
    };

    window.AUTHNICE!.requestPay(payOpts);

    window.setTimeout(fitPaymentLayerToViewport, 100);
    window.setTimeout(fitPaymentLayerToViewport, 500);
  });
}
