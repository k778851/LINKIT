import { useState } from 'react';
import { Button } from '../../components/common/Button';
import styles from './OnboardingStep.module.css';

const EMOJIS = ['😊', '😎', '🙌', '🔥', '🌟', '💪', '🎵', '📚', '⚽', '🍕', '📸', '🌿'];

export function ProfileStep({ onNext, onBack }) {
  const [nickname, setNickname] = useState('');
  const [emoji, setEmoji] = useState('😊');
  const [error, setError] = useState('');

  const handleNext = () => {
    if (!nickname.trim()) { setError('닉네임을 입력해 주세요.'); return; }
    if (nickname.trim().length > 10) { setError('닉네임은 최대 10자까지 입력할 수 있어요.'); return; }
    setError('');
    onNext({ nickname: nickname.trim(), emoji });
  };

  return (
    <div className={styles.step}>
      <button onClick={onBack} style={{ alignSelf: 'flex-start', padding: '8px 0', color: 'var(--ink-3)', fontSize: 14 }}>← 뒤로</button>
      <p className={styles.stepTitle}>프로필을 설정해요</p>
      <p className={styles.stepDesc}>닉네임으로 모임에서 불릴 이름을 정해요.</p>

      <div className={styles.form}>
        <div>
          <p className={styles.label} style={{ marginBottom: 10 }}>프로필 이모지</p>
          <div className={styles.emojiGrid}>
            {EMOJIS.map((e) => (
              <button key={e} type="button" className={`${styles.emojiBtn} ${emoji === e ? styles.emojiSelected : ''}`} onClick={() => setEmoji(e)}>
                {e}
              </button>
            ))}
          </div>
        </div>

        <div className={styles.field}>
          <label className={styles.label}>닉네임 <span className={styles.required}>(필수)</span></label>
          <input
            className={`${styles.input} ${error ? styles.error : ''}`}
            type="text"
            placeholder="닉네임을 입력하세요 (최대 10자)"
            maxLength={10}
            value={nickname}
            onChange={(e) => { setNickname(e.target.value); setError(''); }}
          />
          {error && <p className={styles.errorMsg}>{error}</p>}
          <p style={{ fontSize: 12, color: 'var(--ink-3)', textAlign: 'right' }}>{nickname.length}/10</p>
        </div>

        <Button onClick={handleNext} disabled={!nickname.trim()} className={styles.cta}>
          다음
        </Button>
      </div>
    </div>
  );
}
