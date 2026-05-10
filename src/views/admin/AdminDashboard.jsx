'use client';

import { useEffect, useState } from 'react';
import { Users, BookOpen, FileText, MessageCircle } from 'lucide-react';
import { adminApi } from '../../api/adminApi';
import { tokenStorage } from '../../api/apiClient';
import { useClubStore } from '../../store/clubStore';
import { useCommunityStore } from '../../store/communityStore';
import { useAuthStore } from '../../store/authStore';
import { formatRelativeTime } from '../../utils/formatDate';
import s from './admin.module.css';

/* 샘플 데이터 fallback */
function buildLocalStats(clubs, posts, user) {
  return {
    totalUsers:    7,
    totalClubs:    clubs.length,
    totalPosts:    posts.length,
    totalComments: 5,
    recentPosts:   posts.slice(0, 5).map((p) => ({
      id: p.id, category: p.category, title: p.title,
      authorId: p.authorId, likeCount: p.likeCount,
      commentCount: p.commentCount, viewCount: p.viewCount,
      createdAt: p.createdAt,
    })),
    recentUsers: [
      { id: user?.id ?? 'user-me', nickname: user?.nickname ?? '링킷유저', handle: user?.handle ?? 'linkit_user', role: 'USER', joinedClubsCount: (user?.joinedClubs ?? []).length, createdAt: user?.createdAt },
    ],
  };
}

export function AdminDashboard() {
  const [stats, setStats]   = useState(null);
  const [loading, setLoading] = useState(true);
  const clubs = useClubStore((s) => s.clubs);
  const posts = useCommunityStore((s) => s.posts);
  const user  = useAuthStore((s) => s.user);

  useEffect(() => {
    if (!tokenStorage.get()) {
      setStats(buildLocalStats(clubs, posts, user));
      setLoading(false);
      return;
    }
    adminApi.getStats()
      .then(setStats)
      .catch(() => setStats(buildLocalStats(clubs, posts, user)))
      .finally(() => setLoading(false));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const CARDS = [
    { label: '전체 유저',    icon: '👥', color: '#eef2ff', num: stats?.totalUsers    ?? 0 },
    { label: '전체 클럽',    icon: '🏘️', color: '#f0fdf4', num: stats?.totalClubs    ?? 0 },
    { label: '전체 게시글',  icon: '📝', color: '#fff8e6', num: stats?.totalPosts    ?? 0 },
    { label: '전체 댓글',    icon: '💬', color: '#fff0f5', num: stats?.totalComments ?? 0 },
  ];

  return (
    <div>
      <div className={s.pageHeader}>
        <p className={s.pageTitle}>대시보드</p>
        <p className={s.pageDesc}>LINKIT 서비스 현황을 한눈에 확인하세요.</p>
      </div>

      {loading ? (
        <p className={s.loading}>불러오는 중...</p>
      ) : (
        <>
          {/* 통계 카드 */}
          <div className={s.statGrid}>
            {CARDS.map(({ label, icon, color, num }) => (
              <div key={label} className={s.statCard}>
                <div className={s.statIcon} style={{ background: color }}>{icon}</div>
                <p className={s.statNum}>{num.toLocaleString()}</p>
                <p className={s.statLabel}>{label}</p>
              </div>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
            {/* 최근 게시글 */}
            <div className={s.card}>
              <p className={s.cardTitle}>최근 게시글</p>
              {stats?.recentPosts?.length === 0
                ? <p className={s.empty}>게시글이 없어요</p>
                : <table className={s.table}>
                    <thead><tr><th>카테고리</th><th>제목</th><th>등록</th></tr></thead>
                    <tbody>
                      {stats?.recentPosts?.map((p) => (
                        <tr key={p.id}>
                          <td><span className={`${s.badge} ${s.badgeBlue}`}>{p.category}</span></td>
                          <td style={{ maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.title}</td>
                          <td style={{ color: '#aaa', fontSize: 12 }}>{p.createdAt ? formatRelativeTime(p.createdAt) : '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
              }
            </div>

            {/* 최근 가입자 */}
            <div className={s.card}>
              <p className={s.cardTitle}>최근 가입자</p>
              {stats?.recentUsers?.length === 0
                ? <p className={s.empty}>유저가 없어요</p>
                : <table className={s.table}>
                    <thead><tr><th>유저</th><th>역할</th><th>가입</th></tr></thead>
                    <tbody>
                      {stats?.recentUsers?.map((u) => (
                        <tr key={u.id}>
                          <td>{u.nickname}</td>
                          <td>
                            <span className={`${s.badge} ${u.role === 'ADMIN' ? s.badgeRed : s.badgeGray}`}>
                              {u.role === 'ADMIN' ? '관리자' : '일반'}
                            </span>
                          </td>
                          <td style={{ color: '#aaa', fontSize: 12 }}>{u.createdAt ? formatRelativeTime(u.createdAt) : '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
              }
            </div>
          </div>
        </>
      )}
    </div>
  );
}
