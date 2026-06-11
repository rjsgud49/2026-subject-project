const BY_STATUS = {
  401: '로그인이 만료되었습니다. 다시 로그인해 주세요.',
  403: '이 기능을 사용할 권한이 없습니다.',
  404: '요청한 내용을 찾을 수 없습니다.',
  409: '이미 처리된 요청입니다.',
  413: '파일 용량이 너무 큽니다. 더 작은 파일로 다시 시도해 주세요.',
  422: '입력 내용을 확인한 뒤 다시 시도해 주세요.',
  500: '서버에 일시적인 문제가 있습니다. 잠시 후 다시 시도해 주세요.',
  502: '서버에 연결할 수 없습니다. 잠시 후 다시 시도해 주세요.',
  503: '서버가 바쁩니다. 잠시 후 다시 시도해 주세요.',
};

const BY_TEXT = {
  unauthorized: BY_STATUS[401],
  forbidden: BY_STATUS[403],
  'not found': BY_STATUS[404],
  'internal server error': BY_STATUS[500],
  'bad gateway': BY_STATUS[502],
  'service unavailable': BY_STATUS[503],
  'failed to fetch': '네트워크 연결을 확인한 뒤 다시 시도해 주세요.',
  networkerror: '네트워크 연결을 확인한 뒤 다시 시도해 주세요.',
  'network request failed': '네트워크 연결을 확인한 뒤 다시 시도해 주세요.',
};

/** API·Redux 등에 노출되는 영문/기술 오류를 사용자용 한국어로 변환 */
export function friendlyApiError(raw, status) {
  if (!raw && status) {
    return BY_STATUS[status] || '요청에 실패했습니다. 잠시 후 다시 시도해 주세요.';
  }

  const text = String(raw || '').trim();
  if (!text) {
    return BY_STATUS[status] || '요청에 실패했습니다. 잠시 후 다시 시도해 주세요.';
  }

  if (/[가-힣]/.test(text)) return text;

  const lower = text.toLowerCase();
  for (const [key, msg] of Object.entries(BY_TEXT)) {
    if (lower === key || lower.includes(key)) return msg;
  }

  if (status && BY_STATUS[status]) return BY_STATUS[status];

  return '요청을 처리하지 못했습니다. 잠시 후 다시 시도해 주세요.';
}

export function isAuthError(message) {
  const m = String(message || '');
  if (/로그인|인증/.test(m)) return true;
  return /unauthorized/i.test(m);
}
