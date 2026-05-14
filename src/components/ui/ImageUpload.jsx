'use client';

import { useRef, useState } from 'react';
import { Camera, X, Loader } from 'lucide-react';
import { uploadImage } from '../../api/uploadApi';
import styles from './ImageUpload.module.css';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080';

const readAsDataUrl = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

/**
 * 이미지 업로드 컴포넌트
 *
 * @param {string}   value       - 현재 이미지 URL (없으면 null/undefined)
 * @param {Function} onChange    - 새 URL이 결정됐을 때 호출 (url: string) => void
 * @param {string}   shape       - 'circle' | 'square' (기본: 'square')
 * @param {string}   placeholder - 이미지 없을 때 표시할 이모지 또는 텍스트
 * @param {string}   className   - 추가 클래스
 */
export function ImageUpload({ value, onChange, shape = 'square', placeholder = '📷', className = '' }) {
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(null); // 로컬 Object URL (업로드 전 즉시 미리보기)
  const [error, setError] = useState(null);

  // 서버 URL이면 BASE_URL 접두어 붙이기
  const displayUrl = preview ?? (value ? (value.startsWith('http') || value.startsWith('data:') ? value : `${BASE_URL}${value}`) : null);

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 유효성 검사
    if (!file.type.startsWith('image/')) {
      setError('이미지 파일만 선택할 수 있어요.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('5MB 이하 파일만 업로드할 수 있어요.');
      return;
    }

    setError(null);

    // 즉시 로컬 미리보기
    const localUrl = URL.createObjectURL(file);
    const localDataUrl = await readAsDataUrl(file);
    setPreview(localUrl);

    // 서버 업로드
    setUploading(true);
    try {
      const serverUrl = await uploadImage(file);
      setPreview(null); // 로컬 URL 해제
      onChange(serverUrl);
      URL.revokeObjectURL(localUrl);
    } catch {
      // 오프라인 or 서버 오류 → 새로고침 후에도 유지되는 data URL로 데모를 계속 진행
      onChange(localDataUrl);
      setPreview(null);
      URL.revokeObjectURL(localUrl);
    } finally {
      setUploading(false);
      // input 초기화 (같은 파일 재선택 가능하게)
      e.target.value = '';
    }
  };

  const handleRemove = (e) => {
    e.stopPropagation();
    setPreview(null);
    setError(null);
    onChange(null);
  };

  return (
    <div className={`${styles.wrapper} ${shape === 'circle' ? styles.circle : styles.square} ${className}`}>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className={styles.hiddenInput}
        onChange={handleFileChange}
      />

      <button
        type="button"
        className={styles.area}
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        aria-label="이미지 업로드"
      >
        {displayUrl ? (
          /* 이미지 미리보기 */
          <img src={displayUrl} alt="업로드 이미지" className={styles.preview} />
        ) : (
          /* 빈 상태 */
          <div className={styles.empty}>
            <span className={styles.placeholderEmoji}>{placeholder}</span>
            <span className={styles.hint}>탭하여 업로드</span>
          </div>
        )}

        {/* 업로딩 오버레이 */}
        {uploading && (
          <div className={styles.overlay}>
            <Loader size={20} className={styles.spinner} />
          </div>
        )}

        {/* 카메라 버튼 (이미지 있을 때) */}
        {!uploading && (
          <div className={styles.cameraBtn}>
            <Camera size={14} />
          </div>
        )}
      </button>

      {/* 삭제 버튼 */}
      {displayUrl && !uploading && (
        <button
          type="button"
          className={styles.removeBtn}
          onClick={handleRemove}
          aria-label="이미지 삭제"
        >
          <X size={12} />
        </button>
      )}

      {/* 에러 메시지 */}
      {error && <p className={styles.error}>{error}</p>}
    </div>
  );
}
