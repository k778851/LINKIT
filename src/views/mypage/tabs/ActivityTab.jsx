'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Heart, MessageCircle, Users } from 'lucide-react';
import { useAuthStore } from '../../../store/authStore';
import { useClubStore } from '../../../store/clubStore';
import { useCommunityStore } from '../../../store/communityStore';
import { scheduleApi } from '../../../api/scheduleApi';
import { ApiError } from '../../../api/apiClient';
import { formatRelativeTime, calcDdayNum, getDdayLabel, formatShortDate } from '../../../utils/formatDate';
import { CATEGORY_COLORS } from '../../../data/sampleData';
import { getPostDetailPath } from '../../../lib/communityRoutes';
import styles from './ActivityTab.module.css';

export function ActivityTab() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const toggleBookmarkWithApi = useAuthStore((s) => s.toggleBookmarkWithApi);
  const allSchedules = useClubStore((s) => s.schedules);
  const clubs = useClubStore((s) => s.clubs);
  const allPosts = useCommunityStore((s) => s.posts);
  const myPosts = allPosts.filter((post) => post.authorId === user?.id);
  const [apiSchedules, setApiSchedules] = useState(null);
  const [pendingRequests, setPendingRequests] = useState({
    'club-6': [
      { id: 'request-1', nickname: '풋살초보', answer: '주말마다 꾸준히 참여하고 싶어요.' },
      { id: 'request-2', nickname: '오치동러너', answer: '친구와 함께 풋살 모임을 찾고 있어요.' },
    ],
  });

  useEffect(() => {
    scheduleApi.getMine()
      .then((data) => setApiSchedules(data))
      .catch((error) => {
        if (!(error instanceof ApiError && error.status === 0)) {
          console.warn('일정 로드 실패', error);
        }
      });
  }, []);

  const rawSchedules = apiSchedules ?? allSchedules.filter(
    (schedule) => user?.joinedClubs?.includes(schedule.clubId)
  );

  const schedules = rawSchedules
    .map((schedule) => ({ ...schedule, dday: calcDdayNum(schedule.startAt) }))
    .sort((a, b) => a.dday - b.dday);

  const bookmarkedClubs = clubs.filter((club) => user?.bookmarkedClubs?.includes(club.id));
  const joinedClubs = clubs.filter((club) => user?.joinedClubs?.includes(club.id));
  const managedClubs = clubs.filter((club) =>
    club.createdBy === user?.id ||
    user?.ownedClubs?.includes(club.id) ||
    club.members?.some((member) =>
      member.userId === user?.id && ['owner', 'admin'].includes(member.role)
    )
  );

  return (
    <div className={styles.tab}>
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>
            <Users size={14} strokeWidth={2.2} style={{ marginRight: 5, verticalAlign: 'middle', color: 'var(--blue)' }} />
            참여 중인 클럽
            {joinedClubs.length > 0 && <span className={styles.countPill}>{joinedClubs.length}</span>}
          </h2>
          {joinedClubs.length > 0 && (
            <button className={styles.moreBtn} onClick={() => router.push('/mypage/joined-clubs')}>전체 보기</button>
          )}
        </div>
        {joinedClubs.length === 0 ? (
          <div className={styles.emptyBox}>
            <p className={styles.empty}>아직 참여 중인 클럽이 없어요</p>
            <button className={styles.exploreBtn} onClick={() => router.push('/clubs')}>클럽 찾기</button>
          </div>
        ) : (
          <div className={`${styles.joinedRow} hide-scrollbar`}>
            {joinedClubs.slice(0, 5).map((club) => (
              <ClubThumb key={club.id} club={club} onClick={() => router.push(`/clubs/${club.id}`)} type="joined" />
            ))}
          </div>
        )}
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>
            운영 중인 클럽
            {managedClubs.length > 0 && <span className={styles.countPill}>{managedClubs.length}</span>}
          </h2>
        </div>
        {managedClubs.length === 0 ? (
          <div className={styles.emptyBox}>
            <p className={styles.empty}>운영 중인 클럽이 없어요</p>
            <button className={styles.exploreBtn} onClick={() => router.push('/clubs/new')}>클럽 개설하기</button>
          </div>
        ) : (
          <div className={styles.manageList}>
            {managedClubs.slice(0, 3).map((club) => {
              const requests = pendingRequests[club.id] ?? [];
              const pendingCount = requests.length;
              return (
                <div key={club.id} className={styles.manageCard}>
                  <div className={styles.manageTop}>
                    <div>
                      <p className={styles.manageName}>{club.name}</p>
                      <p className={styles.manageMeta}>
                        {club.status === 'pending' ? '승인 대기' : '운영 중'} · {club.memberCount.toLocaleString()}명
                      </p>
                    </div>
                    <span className={styles.manageBadge}>{pendingCount}건 대기</span>
                  </div>
                  <div className={styles.manageStats}>
                    <span>신규 {club.newCount ?? 0}</span>
                    <span>게시판 {club.postCount ?? 0}</span>
                    <span>{club.isPrivate ? '승인제' : '전체공개'}</span>
                  </div>
                  <div className={styles.manageActions}>
                    <button onClick={() => router.push(`/clubs/${club.id}`)}>상태 보기</button>
                    <button onClick={() => router.push(`/clubs/${club.id}/edit`)}>관리하기</button>
                  </div>
                  {requests.length > 0 && (
                    <div className={styles.requestList}>
                      <p className={styles.requestTitle}>가입 승인 대기</p>
                      {requests.map((request) => (
                        <div key={request.id} className={styles.requestItem}>
                          <div className={styles.requestInfo}>
                            <span className={styles.requestAvatar}>{request.nickname[0]}</span>
                            <div>
                              <p className={styles.requestName}>{request.nickname}</p>
                              <p className={styles.requestAnswer}>{request.answer}</p>
                            </div>
                          </div>
                          <div className={styles.requestActions}>
                            <button
                              className={styles.approveBtn}
                              onClick={() => setPendingRequests((prev) => ({
                                ...prev,
                                [club.id]: (prev[club.id] ?? []).filter((item) => item.id !== request.id),
                              }))}
                            >
                              승인
                            </button>
                            <button
                              className={styles.rejectBtn}
                              onClick={() => setPendingRequests((prev) => ({
                                ...prev,
                                [club.id]: (prev[club.id] ?? []).filter((item) => item.id !== request.id),
                              }))}
                            >
                              거절
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>내 모임 일정</h2>
          <button className={styles.moreBtn} onClick={() => router.push('/mypage/schedules')}>전체 보기</button>
        </div>
        {schedules.length === 0 ? (
          <p className={styles.empty}>참여 중인 모임 일정이 없어요</p>
        ) : (
          schedules.slice(0, 3).map((schedule) => (
            <div key={schedule.id} className={styles.scheduleCard}>
              <div className={styles.ddayTile}>
                <span className={styles.ddayNum}>{getDdayLabel(schedule.dday)}</span>
                <span className={styles.ddayDate}>{formatShortDate(schedule.startAt)}</span>
              </div>
              <div className={styles.scheduleInfo}>
                <p className={styles.scheduleName}>{schedule.clubName}</p>
                <p className={styles.scheduleMeta}>{schedule.time} · {schedule.location}</p>
              </div>
            </div>
          ))
        )}
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>찜한 클럽</h2>
          <button className={styles.moreBtn} onClick={() => router.push('/mypage/bookmarks')}>전체 보기</button>
        </div>
        {bookmarkedClubs.length === 0 ? (
          <p className={styles.empty}>찜한 클럽이 없어요</p>
        ) : (
          <div className={`${styles.bookmarkRow} hide-scrollbar`}>
            {bookmarkedClubs.map((club) => (
              <ClubThumb
                key={club.id}
                club={club}
                onClick={() => router.push(`/clubs/${club.id}`)}
                onAction={() => toggleBookmarkWithApi(club.id)}
                type="bookmark"
              />
            ))}
          </div>
        )}
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>작성한 게시글</h2>
          <button className={styles.moreBtn} onClick={() => router.push('/mypage/posts')}>전체 보기</button>
        </div>
        {myPosts.length === 0 ? (
          <p className={styles.empty}>작성한 게시글이 없어요</p>
        ) : (
          myPosts.slice(0, 3).map((post) => (
            <button key={post.id} className={styles.postRow} onClick={() => router.push(getPostDetailPath(post.id))}>
              <span className={styles.postBadge}>{post.category}</span>
              <p className={`${styles.postTitle} truncate-1`}>{post.title}</p>
              <div className={styles.postMeta}>
                <span>{formatRelativeTime(post.createdAt)}</span>
                <span><Heart size={11} /> {post.likeCount}</span>
                <span><MessageCircle size={11} /> {post.commentCount}</span>
              </div>
            </button>
          ))
        )}
      </section>
    </div>
  );
}

function ClubThumb({ club, onClick, onAction, type }) {
  const colors = CATEGORY_COLORS[club.category] ?? ['#8EC6FF', '#0088FF'];
  const coverImage = club.coverImage ?? club.posterImages?.[0];
  const cardClass = type === 'bookmark' ? styles.bookmarkCard : styles.joinedCard;
  const tileClass = type === 'bookmark' ? styles.bookmarkTile : styles.joinedTile;
  const nameClass = type === 'bookmark' ? styles.bookmarkName : styles.joinedName;
  const metaClass = type === 'bookmark' ? styles.bookmarkMeta : styles.joinedMeta;

  return (
    <div className={cardClass}>
      <div
        className={tileClass}
        style={coverImage
          ? { backgroundImage: `url("${coverImage}")`, backgroundSize: 'cover', backgroundPosition: 'center' }
          : { background: `linear-gradient(135deg, ${colors[0]} 0%, ${colors[1]} 100%)` }}
        onClick={onClick}
        role="button"
        tabIndex={0}
      >
        {type === 'bookmark' && (
          <span
            className={styles.heartOverlay}
            onClick={(event) => {
              event.stopPropagation();
              onAction?.();
            }}
            role="button"
            tabIndex={0}
            aria-label="찜 해제"
          >
            ♥
          </span>
        )}
      </div>
      <p className={`${nameClass} truncate-1`}>{club.name}</p>
      <p className={metaClass}>{club.memberCount.toLocaleString()}명</p>
    </div>
  );
}
