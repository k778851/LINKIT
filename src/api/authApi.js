import { api } from './apiClient';

export const authApi = {
  /** 회원가입 */
  register: (data) => api.post('/api/auth/register', data),

  /** 로그인 → { token, user } */
  login: (handle, password) => api.post('/api/auth/login', { handle, password }),
};
