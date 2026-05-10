/**
 * LINKIT API 클라이언트
 * - 모든 HTTP 요청의 기반
 * - JWT 토큰 자동 주입
 * - 에러 표준화
 * - 백엔드 미연결 시 로컬 모드 자동 fallback
 * - Access Token 만료(401) 시 Refresh Token으로 자동 갱신 후 재시도
 */

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080';

const TOKEN_KEY         = 'linkit_token';
const REFRESH_TOKEN_KEY = 'linkit_refresh_token';

/* ── 토큰 관리 ──────────────────────────────────────── */
export const tokenStorage = {
  get:    ()    => (typeof window !== 'undefined' ? localStorage.getItem(TOKEN_KEY) : null),
  set:    (t)   => localStorage.setItem(TOKEN_KEY, t),
  remove: ()    => localStorage.removeItem(TOKEN_KEY),
};

export const refreshTokenStorage = {
  get:    ()    => (typeof window !== 'undefined' ? localStorage.getItem(REFRESH_TOKEN_KEY) : null),
  set:    (t)   => localStorage.setItem(REFRESH_TOKEN_KEY, t),
  remove: ()    => localStorage.removeItem(REFRESH_TOKEN_KEY),
};

/* ── 표준 에러 클래스 ────────────────────────────────── */
export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

/* ── Access Token 갱신 (내부용) ──────────────────────── */
let isRefreshing = false;
let refreshQueue = []; // [{ resolve, reject }]

async function doRefresh() {
  const refreshToken = refreshTokenStorage.get();
  if (!refreshToken) throw new ApiError('로그인이 필요합니다.', 401);

  const res = await fetch(`${BASE_URL}/api/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken }),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    // Refresh Token 자체가 만료 / 폐기됨 → 강제 로그아웃
    tokenStorage.remove();
    refreshTokenStorage.remove();
    throw new ApiError(json.message ?? '세션이 만료됐어요. 다시 로그인해 주세요.', 401);
  }
  const newToken = json.data?.token ?? json.token;
  tokenStorage.set(newToken);
  return newToken;
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

  // ── 401: Access Token 만료 → 자동 갱신 후 1회 재시도 ──
  if (res.status === 401 && !options._retry) {
    if (isRefreshing) {
      // 갱신 중이면 대기열에 넣고 완료되면 재시도
      return new Promise((resolve, reject) => {
        refreshQueue.push({ resolve, reject });
      }).then((newToken) => request(method, path, body, { ...options, _retry: true }));
    }

    isRefreshing = true;
    try {
      await doRefresh();
      // 대기 중이던 요청들에게 신호
      refreshQueue.forEach(({ resolve }) => resolve());
      refreshQueue = [];
      // 원래 요청 재시도
      return request(method, path, body, { ...options, _retry: true });
    } catch (refreshError) {
      refreshQueue.forEach(({ reject }) => reject(refreshError));
      refreshQueue = [];
      throw refreshError;
    } finally {
      isRefreshing = false;
    }
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

  /** 파일 업로드 전용 — Content-Type을 브라우저가 자동 설정 (multipart boundary 포함) */
  upload: async (path, formData) => {
    const headers = {};
    const token = tokenStorage.get();
    if (token) headers['Authorization'] = `Bearer ${token}`;
    let res;
    try {
      res = await fetch(`${BASE_URL}${path}`, { method: 'POST', headers, body: formData });
    } catch {
      throw new ApiError('서버에 연결할 수 없습니다.', 0);
    }
    const json = await res.json().catch(() => ({}));
    if (!res.ok) throw new ApiError(json.message ?? '업로드에 실패했어요.', res.status);
    return json.data ?? json;
  },
};
