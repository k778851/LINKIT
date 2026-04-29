import { api } from './apiClient';

export const searchApi = {
  /**
   * 통합 검색
   * @returns { clubs: ClubResponse[], posts: PostResponse[], total: number }
   */
  search: (query) =>
    api.get(`/api/search?q=${encodeURIComponent(query)}`),
};
