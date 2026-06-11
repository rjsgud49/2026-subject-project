import { SESSION_KEY } from './constants';

const TOKEN_KEY = 'p3_access_token';
export const UNAUTHORIZED_EVENT = 'p3:unauthorized';

/** JWT 만료·401 시 토큰·세션 제거 후 앱 전역에 알림 */
export function handleUnauthorized() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(SESSION_KEY);
  window.dispatchEvent(new CustomEvent(UNAUTHORIZED_EVENT));
}
