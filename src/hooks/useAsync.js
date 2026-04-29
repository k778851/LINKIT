'use client';
import { useState, useCallback } from 'react';
import { ApiError } from '../api/apiClient';

/**
 * 비동기 작업 상태 관리 훅
 * @param {Function} asyncFn  - API 호출 함수
 * @param {Object}   options
 *   onSuccess(data)   - 성공 콜백
 *   onError(message)  - 에러 콜백 (기본: console.error)
 *   fallback          - 네트워크 오류 시 반환할 기본값
 */
export function useAsync(asyncFn, options = {}) {
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);

  const execute = useCallback(async (...args) => {
    setLoading(true);
    setError(null);
    try {
      const data = await asyncFn(...args);
      options.onSuccess?.(data);
      return data;
    } catch (err) {
      const message = err instanceof ApiError ? err.message : '오류가 발생했어요.';
      setError(message);
      options.onError?.(message, err);
      // 네트워크 오류(백엔드 미실행)이면 fallback 반환
      if (err instanceof ApiError && err.status === 0 && options.fallback !== undefined) {
        return options.fallback;
      }
      return null;
    } finally {
      setLoading(false);
    }
  }, [asyncFn]); // eslint-disable-line react-hooks/exhaustive-deps

  return { execute, loading, error };
}
