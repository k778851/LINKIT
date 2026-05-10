import { api } from './apiClient';

export const authApi = {
  /** 로그인 → { token, refreshToken, user, isNewUser } */
  login: (handle, password) => api.post('/api/auth/login', { handle, password }),

  /** Refresh Token → 새 Access Token { token } */
  refresh: (refreshToken) => api.post('/api/auth/refresh', { refreshToken }),

  /** 로그아웃 — Refresh Token 폐기 */
  logout: (refreshToken) => api.post('/api/auth/logout', refreshToken ? { refreshToken } : {}),
};
