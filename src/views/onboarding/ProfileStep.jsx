'use client';

import { useState } from 'react';
import { ChevronRight } from 'lucide-react';
import { Button } from '../../components/common/Button';
import styles from './OnboardingStep.module.css';

export function ProfileStep({ onNext, onBack }) {
  const [nickname, setNickname] = useState('');
  const [bio,      setBio]      = useState('');
  const [error,    setError]    = useState('');

  const handleNext = () => {
    if (!nickname.trim())            { setError('닉네임을 입력해 주세요.'); return; }
    if (nickname.trim().length > 10) { setError('닉네임은 최대 10자까지 입력할 수 있어요.'); return; }
    setError('');
    onNext({ nickname: nickname.trim(), bio: bio.trim() });
  };

  return (
    <div className={styles.step}>
      <button onClick={onBack} className={styles.backBtn}>
        <ChevronRight size={18} style={{ transform: 'rotate(180deg)' }} /> 뒤로
      </button>

      <p className={styles.stepTitle}>프로필을 설정해요</p>
      <p className={styles.stepDesc}>LINKIT에서 사용할 닉네임과 이모지를 정해요.</p>

      <div className={styles.form}>
        {/* 닉네임 미리보기 */}
        <div className={styles.emojiPreview}>
          <div className={styles.emojiPreviewBubble}>
            {nickname?.[0]?.toUpperCase() ?? '?'}
          </div>
          <p className={styles.emojiPreviewName}>{nickname || '닉네임'}</p>
        </div>

        {/* 닉네임 */}
        <div className={styles.field}>
          <label className={styles.label}>
            닉네임 <span className={styles.required}>(필수)</span>
          </label>
          <input
            className={`${styles.input} ${error ? styles.error : ''}`}
            type="text"
            placeholder="최대 10자"
            maxLength={10}
            value={nickname}
            onChange={(e) => { setNickname(e.target.value); setError(''); }}
          />
          {error
            ? <p className={styles.errorMsg}>{error}</p>
            : <p className={styles.counter}>{nickname.length}/10</p>
          }
        </div>

        {/* 한 줄 소개 */}
        <div className={styles.field}>
          <label className={styles.label}>
            한 줄 소개 <span className={styles.optionalText}>(선택)</span>
          </label>
          <input
            className={styles.input}
            type="text"
            placeholder="자신을 소개해 보세요 (최대 30자)"
            maxLength={30}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
          />
          <p className={styles.counter}>{bio.length}/30</p>
        </div>

        <Button onClick={handleNext} disabled={!nickname.trim()} className={styles.cta}>
          다음
        </Button>
      </div>
    </div>
  );
}
