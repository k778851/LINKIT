'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, UserPlus, UserCheck } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useFollowStore } from '../../store/followStore';
import { userApi } from '../../api/userApi';
import styles from './UserProfilePage.module.css';

export function UserProfilePage({ userId }) {
  const router       = useRouter();
  const me           = useAuthStore((s) => s.user);
  const fetchStats   = useFollowStore((s) => s.fetchStats);
  const toggleFollow = useFollowStore((s) => s.toggleFollow);
  const followStats  = useFollowStore((s) => s.stats[userId]);

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const isMe = me?.id === userId;

  useEffect(() => {
    setLoading(true);
    userApi.getUser(userId)
      .then((data) => setProfile(data))
      .catch(() => {})
      .finally(() => setLoading(false));
    fetchStats(userId);
  }, [userId]);

  const handleFollow = async () => {
    if (!me) return;
    await toggleFollow(userId, me.id);
  };

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

  const isFollowing  = followStats?.isFollowing  ?? profile.following ?? false;
  const followerCount  = followStats?.followerCount  ?? profile.followerCount  ?? 0;
  const followingCount = followStats?.followingCount ?? profile.followingCount ?? 0;

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
            : <span className={styles.avatar}>{profile.emoji ?? '😊'}</span>
          }
        </div>
        <div className={styles.info}>
          <p className={styles.nickname}>{profile.nickname}</p>
          <p className={styles.handle}>고유번호 {profile.handle}</p>
          {profile.bio && <p className={styles.bio}>{profile.bio}</p>}
        </div>

        {/* 팔로우 버튼 (본인 제외) */}
        {!isMe && me && (
          <button
            className={`${styles.followBtn} ${isFollowing ? styles.followingBtn : ''}`}
            onClick={handleFollow}
          >
            {isFollowing ? (
              <><UserCheck size={16} /><span>팔로잉</span></>
            ) : (
              <><UserPlus size={16} /><span>팔로우</span></>
            )}
          </button>
        )}
      </div>

      {/* 팔로워/팔로잉 통계 */}
      <div className={styles.socialRow}>
        <button
          className={styles.socialBtn}
          onClick={() => router.push(`/mypage/followers?userId=${userId}`)}
        >
          <span className={styles.socialNum}>{followerCount.toLocaleString()}</span>
          <span className={styles.socialLabel}>팔로워</span>
        </button>
        <div className={styles.socialDivider} />
        <button
          className={styles.socialBtn}
          onClick={() => router.push(`/mypage/following?userId=${userId}`)}
        >
          <span className={styles.socialNum}>{followingCount.toLocaleString()}</span>
          <span className={styles.socialLabel}>팔로잉</span>
        </button>
      </div>

      {/* 참여 클럽 수 */}
      <div className={styles.statCard}>
        <span className={styles.statNum}>{profile.joinedClubs?.length ?? 0}</span>
        <span className={styles.statLabel}>참여 중인 클럽</span>
      </div>
    </div>
  );
}
