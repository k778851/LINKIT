'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '../../store/authStore';
import { useClubStore } from '../../store/clubStore';
import { useCommunityStore } from '../../store/communityStore';
import { ActivityTab } from './tabs/ActivityTab';
import { SettingsTab } from './tabs/SettingsTab';
import styles from './MyPage.module.css';

export function MyPage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const clubs = useClubStore((s) => s.clubs);
  const posts = useCommunityStore((s) => s.posts);
  const [tab, setTab] = useState('activity');

  if (!user) return null;

  const joinedCount = user.joinedClubs?.length ?? 0;
  const bookmarkedCount = user.bookmarkedClubs?.length ?? 0;
  const myPostsCount = posts.filter((p) => p.authorId === user.id).length;

  return (
    <div className={styles.page}>
      {/* 헤더 */}
      <header className={styles.header}>
        <h1 className={styles.title}>마이페이지</h1>
      </header>

      {/* 프로필 카드 */}
      <div className={styles.profileCard}>
        <div className={styles.avatarWrap}>
          <span className={styles.avatar}>{user.emoji}</span>
        </div>
        <div className={styles.profileInfo}>
          <p className={styles.nickname}>{user.nickname}</p>
          <p className={styles.handle}>@{user.handle}</p>
          {user.bio && <p className={styles.bio}>{user.bio}</p>}
        </div>
        <button className={styles.editBtn} onClick={() => router.push('/mypage/edit')}>
          프로필 수정
        </button>
      </div>

      {/* 통계 블록 — 3개 (클릭 시 해당 페이지 이동) */}
      <div className={styles.statRow}>
        <button className={styles.statBlock} onClick={() => router.push('/mypage/joined-clubs')}>
          <span className={styles.statNum}>{joinedCount}</span>
          <span className={styles.statLabel}>참여클럽</span>
        </button>
        <div className={styles.statDivider} />
        <button className={styles.statBlock} onClick={() => router.push('/mypage/bookmarks')}>
          <span className={styles.statNum}>{bookmarkedCount}</span>
          <span className={styles.statLabel}>찜한클럽</span>
        </button>
        <div className={styles.statDivider} />
        <button className={styles.statBlock} onClick={() => router.push('/mypage/posts')}>
          <span className={styles.statNum}>{myPostsCount}</span>
          <span className={styles.statLabel}>작성한글</span>
        </button>
      </div>

      {/* 서브탭 — pill style inside card */}
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
