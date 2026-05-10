'use client';

import { useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import { defaultUser } from '../../data/sampleData';
import { Button } from '../../components/common/Button';
import styles from './OnboardingStep.module.css';

const FEATURES = [
  { emoji: '🏃', title: '동네 모임',  desc: '관심사가 같은 이웃과 소모임을 만들어요' },
  { emoji: '💬', title: '커뮤니티',   desc: '일상·질문·나눔을 자유롭게 나눠요' },
  { emoji: '📅', title: '모임 일정',  desc: '참여 중인 클럽의 일정을 한눈에 관리해요' },
];

export function WelcomeStep({ onNext, data }) {
  const login           = useAuthStore((s) => s.login);
  const registerWithApi = useAuthStore((s) => s.registerWithApi);

  const { nickname = '링킷유저', bio, zionId, password } = data;

  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');

  const handleStart = async () => {
    setError('');
    setLoading(true);

    if (!zionId || !password) {
      login({ ...defaultUser, nickname, bio });
      onNext();
      return;
    }

    try {
      await registerWithApi({ handle: zionId, nickname, bio, password });
      onNext();
    } catch (e) {
      const msg = e?.message ?? '';
      if (msg.includes('이미') || msg.includes('409')) {
        setError('이미 가입된 고유번호입니다. 로그인 화면으로 돌아가 로그인해 주세요.');
      } else if (e?.status === 0) {
        login({ ...defaultUser, nickname, bio });
        onNext();
      } else {
        setError('계정 생성에 실패했어요. 잠시 후 다시 시도해주세요.');
      }
      setLoading(false);
    }
  };

  return (
    <div className={styles.step}>
      {/* 환영 헤더 */}
      <div className={styles.welcomeCenter}>
        <div className={styles.welcomeAvatarWrap}>
          <span className={styles.welcomeInitial}>{nickname?.[0]?.toUpperCase() ?? '?'}</span>
        </div>
        <h2 className={styles.welcomeTitle}>{nickname}님,<br />환영해요! 🎉</h2>
        <p className={styles.welcomeDesc}>
          LINKIT에서 취미가 같은 이웃을 만나고<br />우리 동네 소모임을 즐겨보세요.
        </p>
      </div>

      {/* 기능 미리보기 카드 */}
      <div className={styles.featureCards}>
        {FEATURES.map((f) => (
          <div key={f.title} className={styles.featureCard}>
            <span className={styles.featureEmoji}>{f.emoji}</span>
            <div>
              <p className={styles.featureTitle}>{f.title}</p>
              <p className={styles.featureDesc}>{f.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {error && (
        <p className={styles.errorBanner}>{error}</p>
      )}

      <Button onClick={handleStart} className={styles.cta} disabled={loading}>
        {loading ? '처리 중...' : 'LINKIT 시작하기'}
      </Button>
    </div>
  );
}
