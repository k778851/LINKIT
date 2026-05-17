'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { userApi } from '../../api/userApi';
import { SAMPLE_USERS } from '../../data/sampleData';
import styles from './UserProfilePage.module.css';

export function UserProfilePage({ userId }) {
  const router = useRouter();
  const me     = useAuthStore((s) => s.user);

  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);

  const isMe = me?.id === userId;
  const profile = isMe ? me : profileData;

  useEffect(() => {
    setLoading(true);
    // 본인이면 스토어 user 바로 사용
    if (userId === me?.id) {
      setLoading(false);
      return;
    }
    userApi.getUser(userId)
      .then((data) => setProfileData(data))
      .catch(() => {
        // 오프라인/데모 — SAMPLE_USERS 혹은 간이 프로필로 fallback
        const sample = SAMPLE_USERS[userId];
        if (sample) {
          setProfileData({ id: userId, ...sample });
        }
      })
      .finally(() => setLoading(false));
  }, [userId]); // eslint-disable-line react-hooks/exhaustive-deps

  if (loading) {
    return (
      <div className={styles.page}>
        <header className={styles.header}>
          <button className={styles.backBtn} onClick={() => router.back()}>
            <ChevronLeft size={22} />
          </button>
        </header>
        <div className={styles.skeleton} />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className={styles.page}>
        <header className={styles.header}>
          <button className={styles.backBtn} onClick={() => router.back()}>
            <ChevronLeft size={22} />
          </button>
          <h1 className={styles.title}>프로필</h1>
        </header>
        <div className={styles.empty}><p>유저를 찾을 수 없어요.</p></div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      {/* 헤더 */}
      <header className={styles.header}>
        <button className={styles.backBtn} onClick={() => router.back()}>
          <ChevronLeft size={22} />
        </button>
        <h1 className={styles.title}>{profile.nickname}</h1>
      </header>

      {/* 프로필 카드 */}
      <div className={styles.profileCard}>
        <div className={styles.avatarWrap}>
          {profile.profileImage
            ? <img src={profile.profileImage} alt={profile.nickname} className={styles.avatarImg} />
            : <span className={styles.avatar}>{profile.nickname?.[0]?.toUpperCase() ?? '?'}</span>
          }
        </div>
        <div className={styles.info}>
          <p className={styles.nickname}>{profile.nickname}</p>
          {profile.bio && <p className={styles.bio}>{profile.bio}</p>}
        </div>
      </div>

      {/* 참여 클럽 수 */}
      <div className={styles.statCard}>
        <span className={styles.statNum}>{profile.joinedClubs?.length ?? 0}</span>
        <span className={styles.statLabel}>참여 중인 클럽</span>
      </div>
    </div>
  );
}
