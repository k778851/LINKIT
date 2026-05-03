'use client';

import { useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import { defaultUser } from '../../data/sampleData';
import { Button } from '../../components/common/Button';
import styles from './OnboardingStep.module.css';

export function WelcomeStep({ onNext, data }) {
  const login           = useAuthStore((s) => s.login);
  const registerWithApi = useAuthStore((s) => s.registerWithApi);

  const { nickname = '링킷유저', emoji = '😊', zionId, password } = data;

  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');

  const handleStart = async () => {
    setError('');
    setLoading(true);

    // 고유번호/비밀번호 없음 → 오프라인 데모 처리
    if (!zionId || !password) {
      login({ ...defaultUser, nickname, emoji });
      onNext();
      return;
    }

    try {
      // 시온 고유번호를 handle로 사용해 회원 등록 후 자동 로그인
      await registerWithApi({ handle: zionId, nickname, emoji, password });
      onNext();
    } catch (e) {
      const msg = e?.message ?? '';
      if (msg.includes('이미') || msg.includes('409')) {
        setError('이미 가입된 고유번호입니다. 로그인 화면으로 돌아가 로그인해 주세요.');
      } else if (e?.status === 0) {
        // 오프라인 → 데모 로컬 처리
        login({ ...defaultUser, nickname, emoji });
        onNext();
      } else {
        setError('계정 생성에 실패했어요. 잠시 후 다시 시도해주세요.');
      }
      setLoading(false);
    }
  };

  return (
    <div className={styles.step}>
      <div className={styles.welcomeCenter}>
        <div className={styles.welcomeEmoji}>{emoji}</div>
        <h2 className={styles.welcomeTitle}>{nickname}님,<br />환영해요!</h2>
        <p className={styles.welcomeDesc}>
          LINKIT에서 취미가 같은 사람들을 만나고<br />
          우리 동네 소모임을 즐겨보세요.
        </p>
      </div>

      {error && (
        <p style={{
          fontSize: 13, color: 'var(--pink)', textAlign: 'center',
          margin: '0 0 12px', padding: '10px 16px',
          background: 'rgba(255,80,100,0.08)', borderRadius: 10,
        }}>
          {error}
        </p>
      )}

      <Button onClick={handleStart} className={styles.cta} disabled={loading}>
        {loading ? '처리 중...' : '시작하기'}
      </Button>
    </div>
  );
}
