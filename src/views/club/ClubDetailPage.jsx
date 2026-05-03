'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Heart, MapPin, Clock, Users, ChevronLeft, Calendar, Pencil } from 'lucide-react';
import { useClubStore } from '../../store/clubStore';
import { useAuthStore } from '../../store/authStore';
import { useToastContext } from '../../context/ToastContext';
import { EmptyState } from '../../components/common/EmptyState';
import { ClubBoardTab } from './tabs/ClubBoardTab';
import { CLUB_EMOJIS, SAMPLE_USERS } from '../../data/sampleData';
import styles from './ClubDetailPage.module.css';

export function ClubDetailPage({ clubId }) {
  const router = useRouter();
  const getClubById = useClubStore((s) => s.getClubById);
  const incrementMemberCount = useClubStore((s) => s.incrementMemberCount);
  const decrementMemberCount = useClubStore((s) => s.decrementMemberCount);
  const club = getClubById(clubId);
  const user = useAuthStore((s) => s.user);
  const toggleBookmarkWithApi = useAuthStore((s) => s.toggleBookmarkWithApi);
  const joinClubStore  = useAuthStore((s) => s.joinClub);
  const leaveClubStore = useAuthStore((s) => s.leaveClub);
  const joinClubApi    = useClubStore((s) => s.joinClubApi);
  const leaveClubApi   = useClubStore((s) => s.leaveClubApi);
  const { showToast } = useToastContext();
  const [tab, setTab] = useState('intro');

  if (!club) return <EmptyState emoji="😢" title="클럽을 찾을 수 없어요" />;
  const isBookmarked = user?.bookmarkedClubs?.includes(clubId);
  const isJoined     = user?.joinedClubs?.includes(clubId);
  const isCreator    = club.createdBy === user?.id;
  const colors = CLUB_EMOJIS[club.emoji] ?? ['#8EC6FF', '#0088FF'];
  const creator = SAMPLE_USERS[club.createdBy] ?? { emoji: club.emoji, nickname: '클럽장' };
  const gradient = `linear-gradient(135deg, ${colors[0]} 0%, ${colors[1]} 100%)`;

  return (
    <div className={styles.page}>
      {/* 히어로 */}
      <div className={styles.hero} style={{ background: gradient }}>
        <span className={styles.heroEmoji}>{club.emoji}</span>
        {/* 헤더 버튼 */}
        <div className={styles.heroNav}>
          <button className={styles.navBtn} onClick={() => router.back()} aria-label="뒤로">
            <ChevronLeft size={22} color="#fff" />
          </button>
          <div style={{ display: 'flex', gap: 8 }}>
            {isCreator && (
              <button className={styles.navBtn} onClick={() => router.push(`/clubs/${clubId}/edit`)} aria-label="클럽 수정">
                <Pencil size={18} color="#fff" />
              </button>
            )}
            <button
              className={styles.navBtn}
              onClick={() => {
                toggleBookmarkWithApi(clubId);
                showToast(isBookmarked ? '찜 목록에서 제거했어요' : '찜 목록에 추가했어요 💖', isBookmarked ? 'info' : 'success');
              }}
              aria-label={isBookmarked ? '찜 해제' : '찜하기'}
            >
              <Heart size={20} fill={isBookmarked ? '#FF668A' : 'none'} color="#fff" strokeWidth={2} />
            </button>
          </div>
        </div>
      </div>

      {/* 콘텐츠 카드 — hero와 -24px 오버랩 */}
      <div className={styles.content}>
        {/* 태그 */}
        <div className={styles.tags}>
          <span className={styles.tag}>{club.category}</span>
          {club.isPrivate && <span className={styles.tagPrivate}>비공개</span>}
          {(club.newCount ?? 0) > 0 && (
            <span className={styles.tagNew}>신규 {club.newCount}명</span>
          )}
        </div>

        <h1 className={styles.name}>{club.name}</h1>

        {/* 정보 행 */}
        <div className={styles.infoRow}>
          <InfoBox icon={<Clock size={16} color="var(--blue)" />} text={club.schedule} />
          <InfoBox icon={<MapPin size={16} color="var(--blue)" />} text={club.location} />
          <InfoBox icon={<Users size={16} color="var(--blue)" />} text={`${club.memberCount.toLocaleString()}명`} />
        </div>

        {/* 서브탭 — 소개/게시판/멤버 */}
        <div className={styles.subTabs}>
          {['intro', 'board', 'members'].map((t) => (
            <button
              key={t}
              className={`${styles.subTab} ${tab === t ? styles.subTabActive : ''}`}
              onClick={() => setTab(t)}
            >
              {{ intro: '소개', board: '게시판', members: '멤버' }[t]}
            </button>
          ))}
        </div>

        {/* 탭 콘텐츠 */}
        {tab === 'intro' && (
          <div className={styles.introBody}>
            <p className={styles.desc}>{club.description}</p>
            {club.tags && (
              <div className={styles.tagRow}>
                {club.tags.map((tag) => (
                  <span key={tag} className={styles.hashTag}>#{tag}</span>
                ))}
              </div>
            )}

            {/* 다음 일정 미니 카드 */}
            <div className={styles.scheduleMini}>
              <div className={styles.scheduleMiniLeft}>
                <Calendar size={16} color="#fff" />
                <div>
                  <p className={styles.scheduleMiniTitle}>다음 모임</p>
                  <p className={styles.scheduleMiniDate}>{club.schedule}</p>
                </div>
              </div>
              <button
                className={styles.scheduleWhiteBtn}
                onClick={() => {
                  if (!isJoined) {
                    joinClubStore(clubId, { name: club.name, emoji: club.emoji, memberCount: club.memberCount });
                    incrementMemberCount(clubId);
                    joinClubApi(clubId).catch(() => {});
                  }
                  showToast(`${club.name} 일정에 신청했어요 📅`, 'success');
                }}
              >
                신청
              </button>
            </div>
          </div>
        )}

        {tab === 'board' && (
          <ClubBoardTab clubId={clubId} />
        )}

        {tab === 'members' && (
          <div className={styles.memberList}>
            {/* 클럽장 */}
            <div className={styles.memberRow}>
              <span className={styles.memberEmoji}>{creator.emoji}</span>
              <div>
                <p className={styles.memberName}>{creator.nickname}</p>
                <p className={styles.memberMeta}>클럽 개설자 👑</p>
              </div>
            </div>

            {/* 현재 유저 (가입 시) */}
            {isJoined && user && (
              <div className={styles.memberRow}>
                <span className={styles.memberEmoji}>{user.emoji}</span>
                <div>
                  <p className={styles.memberName}>{user.nickname}</p>
                  <p className={styles.memberMeta}>참여 중</p>
                </div>
              </div>
            )}

            {/* 나머지 멤버 수 */}
            {club.memberCount > (isJoined ? 2 : 1) && (
              <p className={styles.memberMore}>
                외 {(club.memberCount - (isJoined ? 2 : 1)).toLocaleString()}명이 함께하고 있어요
              </p>
            )}
          </div>
        )}

        <div style={{ height: 100 }} />
      </div>

      {/* 하단 CTA 바 */}
      <div className={styles.ctaBar}>
        <button
          className={styles.bookmarkCta}
          onClick={() => {
            toggleBookmarkWithApi(clubId);
            showToast(isBookmarked ? '찜 목록에서 제거했어요' : '찜 목록에 추가했어요 💖', isBookmarked ? 'info' : 'success');
          }}
          aria-label={isBookmarked ? '찜 해제' : '찜하기'}
        >
          <Heart size={20} fill={isBookmarked ? '#FF668A' : 'none'} color={isBookmarked ? '#FF668A' : 'var(--ink-3)'} />
        </button>
        <button
          className={`${styles.joinBtn} ${isJoined ? styles.joinedBtn : ''}`}
          onClick={() => {
            if (isJoined) {
              leaveClubStore(clubId);
              decrementMemberCount(clubId);
              leaveClubApi(clubId).catch(() => {});
              showToast('모임 참여를 취소했어요', 'info');
            } else {
              joinClubStore(clubId, { name: club.name, emoji: club.emoji, memberCount: club.memberCount });
              incrementMemberCount(clubId);
              joinClubApi(clubId).catch(() => {});
              showToast(`${club.name}에 신청했어요 🎉`, 'success');
            }
          }}
        >
          {isJoined ? '참여 취소' : '모임 신청하기'}
        </button>
      </div>
    </div>
  );
}

function InfoBox({ icon, text }) {
  return (
    <div className={styles.infoBox}>
      <span className={styles.infoBoxIcon}>{icon}</span>
      <span className={styles.infoBoxText}>{text}</span>
    </div>
  );
}
