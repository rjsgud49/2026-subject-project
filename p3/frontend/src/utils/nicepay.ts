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
const NICE_PAY_LAYER_H = 825;
const NICE_PAY_LAYER_W = 660;

let scriptPromise: Promise<void> | null = null;
let viewportFixStop: (() => void) | null = null;

function isNicePayFrame(el: Element): el is HTMLIFrameElement {
  if (el.tagName !== 'IFRAME') return false;
  const src = el.getAttribute('src') ?? '';
  return src.includes('nicepay') || src.includes('pay.nicepay');
}

/** SDK 660×825 레이어 — iframe 내부는 수정 불가 → 바깥 래퍼를 scale로 화면에 맞춤 */
function fitNicePayLayerToViewport() {
  const pad = 20;
  const vh = window.innerHeight;
  const vw = window.innerWidth;
  const scale = Math.min(
    1,
    (vh - pad * 2) / NICE_PAY_LAYER_H,
    (vw - pad * 2) / NICE_PAY_LAYER_W,
  );

  const roots = new Set<HTMLElement>();

  document.querySelectorAll('iframe').forEach((frame) => {
    if (!isNicePayFrame(frame)) return;
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

function startNicePayViewportFix() {
  viewportFixStop?.();
  fitNicePayLayerToViewport();
  const obs = new MutationObserver(() => fitNicePayLayerToViewport());
  obs.observe(document.body, { childList: true, subtree: true, attributes: true });
  const interval = window.setInterval(fitNicePayLayerToViewport, 400);
  const stopAt = window.setTimeout(() => viewportFixStop?.(), 120_000);
  viewportFixStop = () => {
    obs.disconnect();
    window.clearInterval(interval);
    window.clearTimeout(stopAt);
    viewportFixStop = null;
  };
}

function stopNicePayViewportFix() {
  viewportFixStop?.();
  document.body.classList.remove('nicepay-checkout-active');
}

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

  // Modal 등으로 body overflow:hidden 이면 결제 레이어 하단이 잘릴 수 있음
  document.body.classList.add('nicepay-checkout-active');
  document.body.style.overflow = '';
  startNicePayViewportFix();

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
    /** 기본 true면 스크롤 없음 → 작은 화면에서 하단(다음 버튼) 잘림 */
    disableScroll: false,
    /** 앱 sticky header(z-index 10) 위에 결제 레이어 표시 */
    zIdxHigher: true,
    fnError: (result: { errorMsg?: string; message?: string }) => {
      stopNicePayViewportFix();
      const msg = `${result?.errorMsg ?? ''} ${result?.message ?? ''}`;
      if (/취소|cancel|I009/i.test(msg)) return;
      window.alert(msg.trim() || '결제창 호출에 실패했습니다.');
    },
  });

  window.setTimeout(fitNicePayLayerToViewport, 100);
  window.setTimeout(fitNicePayLayerToViewport, 500);
}
