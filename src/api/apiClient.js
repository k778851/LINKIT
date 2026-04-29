/**
 * LINKIT API 클라이언트
 * - 모든 HTTP 요청의 기반
 * - JWT 토큰 자동 주입
 * - 에러 표준화
 * - 백엔드 미연결 시 로컬 모드 자동 fallback
 */

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080';

const TOKEN_KEY = 'linkit_token';

/* ── 토큰 관리 ──────────────────────────────────────── */
export const tokenStorage = {
  get:    ()    => (typeof window !== 'undefined' ? localStorage.getItem(TOKEN_KEY) : null),
  set:    (t)   => localStorage.setItem(TOKEN_KEY, t),
  remove: ()    => localStorage.removeItem(TOKEN_KEY),
};

/* ── 표준 에러 클래스 ────────────────────────────────── */
export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

/* ── 핵심 fetch 래퍼 ─────────────────────────────────── */
async function request(method, path, body, options = {}) {
  const headers = { 'Content-Type': 'application/json' };
  const token = tokenStorage.get();
  if (token) headers['Authorization'] = `Bearer ${token}`;

  let res;
  try {
    res = await fetch(`${BASE_URL}${path}`, {
      method,
      headers,
      body: body != null ? JSON.stringify(body) : undefined,
      signal: options.signal,
    });
  } catch (networkError) {
    // 백엔드 미실행 시 네트워크 에러 → 호출부에서 fallback 처리
    throw new ApiError('서버에 연결할 수 없습니다.', 0);
  }

  const json = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new ApiError(json.message ?? '요청에 실패했어요.', res.status);
  }

  return json.data ?? json;
}

export const api = {
  get:    (path, opts)       => request('GET',    path, null, opts),
  post:   (path, body, opts) => request('POST',   path, body, opts),
  put:    (path, body, opts) => request('PUT',    path, body, opts),
  patch:  (path, body, opts) => request('PATCH',  path, body, opts),
  delete: (path, opts)       => request('DELETE', path, null, opts),
};
