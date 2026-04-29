'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '../../store/authStore';
import { useToastContext } from '../../context/ToastContext';
import { Header } from '../../components/layout/Header';
import styles from './ProfileEditPage.module.css';

const EMOJIS = ['😊', '😎', '🙌', '🔥', '🌟', '💪', '🎵', '📚', '⚽', '🍕', '📸', '🌿', '💃', '🎨', '🧗', '🏊'];

export function ProfileEditPage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const updateProfile = useAuthStore((s) => s.updateProfile);
  const { showToast } = useToastContext();

  const [form, setForm] = useState({
    emoji: user?.emoji ?? '😊',
    nickname: user?.nickname ?? '',
    handle: user?.handle ?? '',
    bio: user?.bio ?? '',
  });
  const [errors, setErrors] = useState({});

  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }));

  const validate = () => {
    const e = {};
    if (!form.nickname.trim()) e.nickname = '닉네임을 입력하세요.';
    if (form.nickname.length > 10) e.nickname = '최대 10자까지 입력 가능해요.';
    if (form.handle && !/^[a-zA-Z0-9_]+$/.test(form.handle)) e.handle = '영문, 숫자, 언더바(_)만 사용할 수 있어요.';
    if (form.handle.length > 20) e.handle = '최대 20자까지 입력 가능해요.';
    if (form.bio.length > 50) e.bio = '최대 50자까지 입력 가능해요.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    updateProfile(form);
    showToast('프로필을 저장했어요 ✨', 'success');
    router.back();
  };

  const isValid = form.nickname.trim().length > 0;

  return (
    <div className={styles.page}>
      <Header
        title="프로필 수정"
        right={
          <button
            className={`${styles.saveBtn} ${isValid ? styles.saveBtnActive : ''}`}
            onClick={handleSave}
          >
            저장
          </button>
        }
      />

      <div className={styles.body}>
        {/* 아바타 미리보기 */}
        <div className={styles.avatarSection}>
          <div className={styles.avatarPreview}>
            <span className={styles.avatarEmoji}>{form.emoji}</span>
          </div>
          <p className={styles.avatarName}>{form.nickname || '닉네임'}</p>
          {form.handle ? <p className={styles.avatarHandle}>@{form.handle}</p> : null}
        </div>

        {/* 이모지 선택 */}
        <div className={styles.section}>
          <p className={styles.label}>프로필 이모지</p>
          <div className={styles.emojiGrid}>
            {EMOJIS.map((e) => (
              <button
                key={e}
                type="button"
                className={`${styles.emojiBtn} ${form.emoji === e ? styles.emojiSelected : ''}`}
                onClick={() => set('emoji', e)}
              >
                {e}
              </button>
            ))}
          </div>
        </div>

        {/* 닉네임 */}
        <div className={styles.section}>
          <label className={styles.label}>닉네임 <span className={styles.req}>*</span></label>
          <input
            className={`${styles.input} ${errors.nickname ? styles.inputErr : ''}`}
            placeholder="최대 10자"
            maxLength={10}
            value={form.nickname}
            onChange={(e) => set('nickname', e.target.value)}
          />
          {errors.nickname && <p className={styles.errMsg}>{errors.nickname}</p>}
          <p className={styles.counter}>{form.nickname.length}/10</p>
        </div>

        {/* Handle */}
        <div className={styles.section}>
          <label className={styles.label}>@handle <span className={styles.optional}>(선택)</span></label>
          <div className={styles.handleWrap}>
            <span className={styles.handleAt}>@</span>
            <input
              className={`${styles.handleInput} ${errors.handle ? styles.inputErr : ''}`}
              placeholder="영문·숫자·언더바"
              maxLength={20}
              value={form.handle}
              onChange={(e) => set('handle', e.target.value)}
            />
          </div>
          {errors.handle && <p className={styles.errMsg}>{errors.handle}</p>}
        </div>

        {/* 한 줄 소개 */}
        <div className={styles.section}>
          <label className={styles.label}>한 줄 소개 <span className={styles.optional}>(선택)</span></label>
          <input
            className={styles.input}
            placeholder="자신을 소개해 보세요 (최대 50자)"
            maxLength={50}
            value={form.bio}
            onChange={(e) => set('bio', e.target.value)}
          />
          <p className={styles.counter}>{form.bio.length}/50</p>
        </div>

        <button
          className={`${styles.ctaBtn} ${isValid ? styles.ctaActive : styles.ctaDisabled}`}
          onClick={handleSave}
        >
          저장하기
        </button>
      </div>
    </div>
  );
}
