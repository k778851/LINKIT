'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useAuthStore } from '../../store/authStore';
import { assetPath } from '../../lib/assetPath';
import styles from './LoginStep.module.css';

export function LoginStep({ onNext }) {
  const loginWithApi = useAuthStore((s) => s.loginWithApi);

  const [zionId,   setZionId]   = useState('');
  const [password, setPassword] = useState('');
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState('');

  // 고유번호 자동 포맷: 숫자만 추출 후 00000000-00000 형태로
  const formatHandle = (raw) => {
    const digits = raw.replace(/\D/g, '').slice(0, 13);
    if (digits.length <= 8) return digits;
    return `${digits.slice(0, 8)}-${digits.slice(8)}`;
  };

  const handleHandleChange = (e) => {
    setZionId(formatHandle(e.target.value));
    setError('');
  };

  const isComplete = zionId.length === 14; // 00000000-00000
  const canSubmit  = isComplete && password && !loading;

  const handleLogin = async () => {
    if (!canSubmit) return;
    setError('');
    setLoading(true);
    try {
      await loginWithApi(zionId, password);
      onNext({ skipToHome: true });
    } catch (e) {
      if (e?.status === 0) {
        // 서버 미응답 → 오프라인 데모 모드
        setError('서버에 연결할 수 없어요. 네트워크를 확인해주세요.');
      } else {
        setError('고유번호 또는 비밀번호가 올바르지 않습니다.');
      }
    } finally {
      setLoading(false);
    }
  };

  /** "처음이세요?" → 약관·프로필 설정 후 계정 생성 */
  const handleFirstTime = () => {
    onNext({
      zionId,
      password,
      provider: 'zion',
    });
  };

  return (
    <div className={styles.step}>
      {/* 로고 */}
      <div className={styles.hero}>
        <Image
          src={assetPath('/logo-sig-v-color.png')}
          alt="LINKIT"
          width={160}
          height={192}
          priority
          className={styles.heroLogo}
        />
        <p className={styles.tagline}>우리 동네 소모임 커뮤니티</p>
      </div>

      {/* 시온로그인 폼 */}
      <div className={styles.formSection}>
        <div className={styles.fieldGroup}>
          <div className={styles.field}>
            <label className={styles.fieldLabel}>고유번호</label>
            <input
              className={styles.fieldInput}
              type="text"
              inputMode="numeric"
              placeholder="00000000-00000"
              value={zionId}
              onChange={handleHandleChange}
              onKeyDown={(e) => e.key === 'Enter' && document.getElementById('zion-pw').focus()}
              autoComplete="username"
              maxLength={14}
            />
          </div>

          <div className={styles.field}>
            <label className={styles.fieldLabel}>비밀번호</label>
            <input
              id="zion-pw"
              className={styles.fieldInput}
              type="password"
              placeholder="비밀번호를 입력하세요"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(''); }}
              onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
              autoComplete="current-password"
            />
          </div>

          {error && <p className={styles.errorMsg}>{error}</p>}
        </div>

        <button
          className={`${styles.loginBtn} ${canSubmit ? styles.loginBtnActive : ''}`}
          onClick={handleLogin}
          disabled={!canSubmit}
        >
          {loading ? '로그인 중...' : '로그인'}
        </button>

        <p className={styles.firstTime}>
          처음 방문이세요?{' '}
          <button className={styles.firstTimeLink} onClick={handleFirstTime}>
            프로필 설정하기
          </button>
        </p>
      </div>
    </div>
  );
}
