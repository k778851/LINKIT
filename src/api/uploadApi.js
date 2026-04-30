import { api } from './apiClient';

/**
 * 이미지 파일을 서버에 업로드하고 URL을 반환합니다.
 * @param {File} file - 업로드할 이미지 파일
 * @returns {Promise<string>} 업로드된 이미지 URL (/uploads/xxx.jpg)
 */
export async function uploadImage(file) {
  const formData = new FormData();
  formData.append('file', file);
  const result = await api.upload('/api/upload', formData);
  return result.url;
}
