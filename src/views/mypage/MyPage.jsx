'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '../../store/authStore';
import { useClubStore } from '../../store/clubStore';
import { useCommunityStore } from '../../store/communityStore';
import { useFollowStore } from '../../store/followStore';
import { ActivityTab } from './tabs/ActivityTab';
import { SettingsTab } from './tabs/SettingsTab';
import styles from './MyPage.module.css';

export function MyPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const user = useAuthStore((s) => s.user);
  const posts = useCommunityStore((s) => s.posts);

  // 탭 상태를 URL 쿼리로 관리 → 뒤로가기 시 탭 복원
  const tab = searchParams.get('tab') === 'settings' ? 'settings' : 'activity';
  const setTab = (t) => router.replace(`/mypage${t === 'settings' ? '?tab=settings' : ''}`);

  const fetchStats   = useFollowStore((s) => s.fetchStats);
  const followStats  = useFollowStore((s) => user ? s.stats[user.id] : null);

  useEffect(() => {
    if (user?.id) fetchStats(user.id);
  }, [user?.id]);

  if (!user) return null;

  const joinedCount     = user.joinedClubs?.length ?? 0;
  const bookmarkedCount = user.bookmarkedClubs?.length ?? 0;
  const myPostsCount    = posts.filter((p) => p.authorId === user.id).length;
  const followerCount   = followStats?.followerCount  ?? 0;
  const followingCount  = followStats?.followingCount ?? 0;

  return (
    <div className={styles.page}>
      {/* 헤더 */}
      <header className={styles.header}>
        <h1 className={styles.title}>마이페이지</h1>
      </header>

      {/* 프로필 카드 */}
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

      {/* 팔로워/팔로잉 행 */}
      <div className={styles.socialRow}>
        <button className={styles.socialBtn} onClick={() => router.push(`/mypage/followers?userId=${user.id}`)}>
          <span className={styles.socialNum}>{followerCount.toLocaleString()}</span>
          <span className={styles.socialLabel}>팔로워</span>
        </button>
        <div className={styles.socialDivider} />
        <button className={styles.socialBtn} onClick={() => router.push(`/mypage/following?userId=${user.id}`)}>
          <span className={styles.socialNum}>{followingCount.toLocaleString()}</span>
          <span className={styles.socialLabel}>팔로잉</span>
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
