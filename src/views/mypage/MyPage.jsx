'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '../../store/authStore';
import { useCommunityStore } from '../../store/communityStore';
import { ActivityTab } from './tabs/ActivityTab';
import { SettingsTab } from './tabs/SettingsTab';
import styles from './MyPage.module.css';

export function MyPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const user = useAuthStore((s) => s.user);
  const posts = useCommunityStore((s) => s.posts);

  const tab = searchParams.get('tab') === 'settings' ? 'settings' : 'activity';
  const setTab = (t) => router.replace(`/mypage${t === 'settings' ? '?tab=settings' : ''}`);

  if (!user) return null;

  const joinedCount = user.joinedClubs?.length ?? 0;
  const myPostsCount = posts.filter((p) => p.authorId === user.id).length;

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>마이페이지</h1>
      </header>

      <div className={styles.profileCard}>
        <div className={styles.avatarWrap}>
          {user.profileImage
            ? <img src={user.profileImage} alt={user.nickname} className={styles.avatarImg} />
            : <span className={styles.avatar}>{user.nickname?.[0]?.toUpperCase() ?? '?'}</span>
          }
        </div>
        <div className={styles.profileInfo}>
          <p className={styles.nickname}>{user.nickname}</p>
          {user.bio && <p className={styles.bio}>{user.bio}</p>}
        </div>
        <button className={styles.editBtn} onClick={() => router.push('/mypage/edit')}>
          프로필 수정
        </button>
      </div>

      <div className={styles.statRow}>
        <button className={styles.statBlock} onClick={() => router.push('/mypage/joined-clubs')}>
          <span className={styles.statNum}>{joinedCount}</span>
          <span className={styles.statLabel}>참여클럽</span>
        </button>
        <div className={styles.statDivider} />
        <button className={styles.statBlock} onClick={() => router.push('/mypage/posts')}>
          <span className={styles.statNum}>{myPostsCount}</span>
          <span className={styles.statLabel}>작성글</span>
        </button>
      </div>

      <div className={styles.subTabsCard}>
        <div className={styles.subTabs}>
          <button
            className={`${styles.subTab} ${tab === 'activity' ? styles.subTabActive : ''}`}
            onClick={() => setTab('activity')}
          >
            활동
          </button>
          <button
            className={`${styles.subTab} ${tab === 'settings' ? styles.subTabActive : ''}`}
            onClick={() => setTab('settings')}
          >
            설정
          </button>
        </div>
      </div>

      {tab === 'activity' && <ActivityTab />}
      {tab === 'settings' && <SettingsTab />}
    </div>
  );
}
