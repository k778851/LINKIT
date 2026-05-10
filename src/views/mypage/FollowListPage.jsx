'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, UserPlus, UserCheck } from 'lucide-react';
import { useFollowStore } from '../../store/followStore';
import { useAuthStore } from '../../store/authStore';
import styles from './FollowListPage.module.css';

/**
 * mode: 'followers' | 'following'
 * userId: 대상 유저 ID
 */
export function FollowListPage({ userId, mode }) {
  const router     = useRouter();
  const me         = useAuthStore((s) => s.user);
  const fetchFollowers = useFollowStore((s) => s.fetchFollowers);
  const fetchFollowing = useFollowStore((s) => s.fetchFollowing);
  const toggleFollow   = useFollowStore((s) => s.toggleFollow);
  const followers  = useFollowStore((s) => s.followers[userId] ?? []);
  const following  = useFollowStore((s) => s.following[userId] ?? []);

  const list  = mode === 'followers' ? followers : following;
  const title = mode === 'followers' ? '팔로워' : '팔로잉';

  useEffect(() => {
    if (mode === 'followers') fetchFollowers(userId);
    else                      fetchFollowing(userId);
  }, [userId, mode]);

  const handleFollow = async (targetId) => {
    await toggleFollow(targetId, me?.id);
    // 목록 새로고침
    if (mode === 'followers') fetchFollowers(userId);
    else                      fetchFollowing(userId);
  };

  return (
    <div className={styles.page}>
      {/* 헤더 */}
      <header className={styles.header}>
        <button className={styles.backBtn} onClick={() => router.back()}>
          <ChevronLeft size={22} />
        </button>
        <h1 className={styles.title}>{title}</h1>
      </header>

      {list.length === 0 ? (
        <div className={styles.empty}>
          <p className={styles.emptyText}>
            {mode === 'followers' ? '아직 팔로워가 없어요.' : '아직 팔로잉하는 사람이 없어요.'}
          </p>
        </div>
      ) : (
        <ul className={styles.list}>
          {list.map((user) => (
            <li key={user.id} className={styles.row}>
              {/* 아바타 */}
              <button
                className={styles.avatarBtn}
                onClick={() => router.push(`/users?userId=${user.id}`)}
              >
                <div className={styles.avatar}>{user.nickname?.[0]?.toUpperCase() ?? '?'}</div>
              </button>

              {/* 정보 */}
              <div className={styles.info}>
                <p className={styles.nickname}>{user.nickname}</p>
              </div>

              {/* 팔로우 버튼 (본인 제외) */}
              {me && me.id !== user.id && (
                <button
                  className={`${styles.followBtn} ${user.following ? styles.followingBtn : ''}`}
                  onClick={() => handleFollow(user.id)}
                >
                  {user.following ? (
                    <><UserCheck size={14} /><span>팔로잉</span></>
                  ) : (
                    <><UserPlus size={14} /><span>팔로우</span></>
                  )}
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
