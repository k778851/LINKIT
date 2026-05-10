'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Heart, MessageCircle, Users } from 'lucide-react';
import { useAuthStore } from '../../../store/authStore';
import { useClubStore } from '../../../store/clubStore';
import { useCommunityStore } from '../../../store/communityStore';
import { Modal } from '../../../components/common/Modal';
import { scheduleApi } from '../../../api/scheduleApi';
import { ApiError } from '../../../api/apiClient';
import { formatRelativeTime, calcDdayNum, getDdayLabel, formatShortDate } from '../../../utils/formatDate';
import { CATEGORY_COLORS } from '../../../data/sampleData';
import styles from './ActivityTab.module.css';

export function ActivityTab() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const toggleBookmarkWithApi = useAuthStore((s) => s.toggleBookmarkWithApi);
  const leaveClub = useAuthStore((s) => s.leaveClub);
  const allSchedules = useClubStore((s) => s.schedules);
  const leaveClubApi = useClubStore((s) => s.leaveClubApi);
  const decrementMemberCount = useClubStore((s) => s.decrementMemberCount);
  const [confirmLeaveClub, setConfirmLeaveClub] = useState(null);
  const clubs = useClubStore((s) => s.clubs);
  const allPosts = useCommunityStore((s) => s.posts);
  const myPosts = allPosts.filter((p) => p.authorId === user?.id);

  const [apiSchedules, setApiSchedules] = useState(null);

  useEffect(() => {
    scheduleApi.getMine()
      .then((data) => setApiSchedules(data))
      .catch((e) => {
        if (!(e instanceof ApiError && e.status === 0)) console.warn('일정 로드 실패', e);
      });
  }, []);

  // API 성공이면 사용, 아니면 로컬 store fallback
  const rawSchedules = apiSchedules ?? allSchedules.filter(
    (s) => user?.joinedClubs?.includes(s.clubId)
  );

  const schedules = rawSchedules
    .map((s) => ({ ...s, dday: calcDdayNum(s.startAt) }))
    .sort((a, b) => a.dday - b.dday);

  const bookmarkedClubs = clubs.filter((c) => user?.bookmarkedClubs?.includes(c.id));
  const joinedClubs    = clubs.filter((c) => user?.joinedClubs?.includes(c.id));

  return (
    <div className={styles.tab}>

      {/* ── 참여 중인 클럽 ── */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>
            <Users size={14} strokeWidth={2.2} style={{ marginRight: 5, verticalAlign: 'middle', color: 'var(--blue)' }} />
            참여 중인 클럽
            {joinedClubs.length > 0 && (
              <span className={styles.countPill}>{joinedClubs.length}</span>
            )}
          </h2>
          {joinedClubs.length > 0 && (
            <button className={styles.moreBtn} onClick={() => router.push('/mypage/joined-clubs')}>전체 보기</button>
          )}
        </div>
        {joinedClubs.length === 0 ? (
          <div className={styles.emptyBox}>
            <p className={styles.empty}>아직 참여 중인 클럽이 없어요.</p>
            <button className={styles.exploreBtn} onClick={() => router.push('/clubs')}>클럽 찾기</button>
          </div>
        ) : (
          <div className={`${styles.joinedRow} hide-scrollbar`}>
            {joinedClubs.slice(0, 5).map((club) => {
              const colors = CATEGORY_COLORS[club.category] ?? ['#8EC6FF', '#0088FF'];
              const coverImage = club.coverImage ?? club.posterImages?.[0];
              const coverSrc = coverImage?.startsWith('/') ? coverImage : coverImage;
              return (
                <div key={club.id} className={styles.joinedCard}>
                  <div
                    className={styles.joinedTile}
                    style={coverSrc
                      ? { backgroundImage: `url("${coverSrc}")`, backgroundSize: 'cover', backgroundPosition: 'center' }
                      : { background: `linear-gradient(135deg, ${colors[0]} 0%, ${colors[1]} 100%)` }}
                    onClick={() => router.push(`/clubs/${club.id}`)}
                    role="button"
                    tabIndex={0}
                  >
                    {/* 탈퇴 버튼 */}
                    <span
                      className={styles.leaveOverlay}
                      onClick={(e) => { e.stopPropagation(); setConfirmLeaveClub(club); }}
                      role="button"
                      tabIndex={0}
                      aria-label="클럽 나가기"
                      title="클럽 나가기"
                    >
                      ✕
                    </span>
                  </div>
                  <p className={`${styles.joinedName} truncate-1`}>{club.name}</p>
                  <p className={styles.joinedMeta}>{club.memberCount.toLocaleString()}명</p>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* ── 내 모임 일정 ── */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>내 모임 일정</h2>
          <button className={styles.moreBtn} onClick={() => router.push('/mypage/schedules')}>전체 보기</button>
        </div>
        {schedules.length === 0
          ? <p className={styles.empty}>참여 중인 모임 일정이 없어요.</p>
          : schedules.slice(0, 3).map((sch) => (
              <div key={sch.id} className={styles.scheduleCard}>
                <div className={styles.ddayTile}>
                  <span className={styles.ddayNum}>{getDdayLabel(sch.dday)}</span>
                  <span className={styles.ddayDate}>{formatShortDate(sch.startAt)}</span>
                </div>
                <div className={styles.scheduleInfo}>
                  <p className={styles.scheduleName}>
                    {sch.clubName}
                  </p>
                  <p className={styles.scheduleMeta}>{sch.time} · {sch.location}</p>
                </div>
              </div>
            ))
        }
      </section>

      {/* ── 찜한 클럽 ── */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>찜한 클럽</h2>
          <button className={styles.moreBtn} onClick={() => router.push('/mypage/bookmarks')}>전체 보기</button>
        </div>
        {bookmarkedClubs.length === 0
          ? <p className={styles.empty}>찜한 클럽이 없어요.</p>
          : (
            <div className={`${styles.bookmarkRow} hide-scrollbar`}>
              {bookmarkedClubs.map((club) => {
                const colors = CATEGORY_COLORS[club.category] ?? ['#8EC6FF', '#0088FF'];
                const coverImage = club.coverImage ?? club.posterImages?.[0];
                return (
                  <div key={club.id} className={styles.bookmarkCard}>
                    <div
                      className={styles.bookmarkTile}
                      style={coverImage
                        ? { backgroundImage: `url("${coverImage}")`, backgroundSize: 'cover', backgroundPosition: 'center' }
                        : { background: `linear-gradient(135deg, ${colors[0]} 0%, ${colors[1]} 100%)` }}
                      onClick={() => router.push(`/clubs/${club.id}`)}
                      role="button"
                      tabIndex={0}
                    >
                      <span
                        className={styles.heartOverlay}
                        onClick={(e) => { e.stopPropagation(); toggleBookmarkWithApi(club.id); }}
                        role="button"
                        tabIndex={0}
                        aria-label="찜 해제"
                      >
                        ♥
                      </span>
                    </div>
                    <p className={`${styles.bookmarkName} truncate-1`}>{club.name}</p>
                    <p className={styles.bookmarkMeta}>{club.memberCount.toLocaleString()}명</p>
                  </div>
                );
              })}
            </div>
          )
        }
      </section>

      {/* ── 작성한 게시글 ── */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>작성한 게시글</h2>
          <button className={styles.moreBtn} onClick={() => router.push('/mypage/posts')}>전체 보기</button>
        </div>
        {myPosts.length === 0
          ? <p className={styles.empty}>작성한 게시글이 없어요.</p>
          : myPosts.slice(0, 3).map((post) => (
              <button key={post.id} className={styles.postRow} onClick={() => router.push(`/community/${post.id}`)}>
                <span className={styles.postBadge}>{post.category}</span>
                <p className={`${styles.postTitle} truncate-1`}>{post.title}</p>
                <div className={styles.postMeta}>
                  <span>{formatRelativeTime(post.createdAt)}</span>
                  <span><Heart size={11} /> {post.likeCount}</span>
                  <span><MessageCircle size={11} /> {post.commentCount}</span>
                </div>
              </button>
            ))
        }
      </section>
      {confirmLeaveClub && (
        <Modal
          title="참여 취소"
          message={`'${confirmLeaveClub.name}' 모임 참여를 취소할까요?`}
          confirmLabel="참여 취소"
          cancelLabel="돌아가기"
          danger
          onConfirm={() => {
            leaveClub(confirmLeaveClub.id);
            decrementMemberCount(confirmLeaveClub.id);
            leaveClubApi(confirmLeaveClub.id).catch(() => {});
            setConfirmLeaveClub(null);
          }}
          onCancel={() => setConfirmLeaveClub(null)}
        />
      )}
    </div>
  );
}
