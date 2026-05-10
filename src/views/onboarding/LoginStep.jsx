'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useAuthStore } from '../../store/authStore';
import { defaultUser } from '../../data/sampleData';
import { assetPath } from '../../lib/assetPath';
import styles from './LoginStep.module.css';

export function LoginStep({ onNext }) {
  const loginWithApi = useAuthStore((s) => s.loginWithApi);
  const loginLocal   = useAuthStore((s) => s.login);

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
        // 서버 미응답 → 자동으로 데모 모드로 전환
        loginLocal(defaultUser);
        onNext({ skipToHome: true });
        return;
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

      <div className={styles.formSection}>
        {/* ── 데모 모드 (최상단 CTA) ── */}
        <button
          className={styles.demoBtnPrimary}
          onClick={() => { loginLocal(defaultUser); onNext({ skipToHome: true }); }}
        >
          <span className={styles.demoBtnIcon}>🎨</span>
          <span className={styles.demoBtnText}>
            <span className={styles.demoBtnTitle}>로그인 없이 둘러보기</span>
            <span className={styles.demoBtnSub}>샘플 데이터로 모든 기능 체험</span>
          </span>
          <span className={styles.demoBtnArrow}>›</span>
        </button>

        {/* 구분선 */}
        <div className={styles.divider}>
          <span className={styles.dividerText}>시온 계정으로 로그인</span>
        </div>

        {/* 시온로그인 폼 */}
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

        {/* 테스트 계정 힌트 */}
        <div className={styles.testHint}>
          <p className={styles.testHintTitle}>🧪 테스트 계정</p>
          <div className={styles.testHintRows}>
            <button
              className={styles.testHintRow}
              onClick={() => { setZionId('20240001-00099'); setPassword('linkit1234'); setError(''); }}
            >
              <span className={styles.testHintLabel}>일반 유저</span>
              <span className={styles.testHintValue}>20240001-00099 · linkit1234</span>
            </button>
            <button
              className={styles.testHintRow}
              onClick={() => { setZionId('00000000-00000'); setPassword('admin1234'); setError(''); }}
            >
              <span className={styles.testHintLabel}>관리자</span>
              <span className={styles.testHintValue}>00000000-00000 · admin1234</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
