import { api } from './apiClient';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080';

/**
 * 이미지 파일을 서버에 업로드하고 절대 URL을 반환합니다.
 * @param {File} file - 업로드할 이미지 파일
 * @returns {Promise<string>} 업로드된 이미지 절대 URL (http://localhost:8080/uploads/xxx.jpg)
 */
export async function uploadImage(file) {
  const formData = new FormData();
  formData.append('file', file);
  const result = await api.upload('/api/upload', formData);
  // 상대 경로면 백엔드 BASE_URL 붙여서 절대 URL로 반환
  const url = result.url ?? result;
  return url.startsWith('http') ? url : `${BASE_URL}${url}`;
}
