'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Heart, MapPin, Clock, Users, ChevronLeft, Calendar, Pencil, Link2, Plus } from 'lucide-react';
import { useClubStore } from '../../store/clubStore';
import { useAuthStore } from '../../store/authStore';
import { calcDdayNum, getDdayLabel, formatShortDate } from '../../utils/formatDate';
import { useToastContext } from '../../context/ToastContext';
import { EmptyState } from '../../components/common/EmptyState';
import { Modal } from '../../components/common/Modal';
import { ClubBoardTab } from './tabs/ClubBoardTab';
import { CATEGORY_COLORS, SAMPLE_CLUB_IMAGES, SAMPLE_USERS } from '../../data/sampleData';
import { assetPath } from '../../lib/assetPath';
import styles from './ClubDetailPage.module.css';

export function ClubDetailPage({ clubId }) {
  const router = useRouter();
  const club = useClubStore((s) => s.clubs.find((c) => c.id === clubId));
  const incrementMemberCount = useClubStore((s) => s.incrementMemberCount);
  const decrementMemberCount = useClubStore((s) => s.decrementMemberCount);
  const getClubMembers = useClubStore((s) => s.getClubMembers);
  const setMemberRole = useClubStore((s) => s.setMemberRole);
  const removeMember = useClubStore((s) => s.removeMember);
  const schedules = useClubStore((s) => s.schedules);
  const user = useAuthStore((s) => s.user);
  const [openMenuUserId, setOpenMenuUserId] = useState(null);
  const toggleBookmarkWithApi = useAuthStore((s) => s.toggleBookmarkWithApi);
  const joinClubStore  = useAuthStore((s) => s.joinClub);
  const leaveClubStore = useAuthStore((s) => s.leaveClub);
  const joinClubApi    = useClubStore((s) => s.joinClubApi);
  const leaveClubApi   = useClubStore((s) => s.leaveClubApi);
  const { showToast } = useToastContext();
  const [tab, setTab] = useState('intro');
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);

  if (!club) return <EmptyState emoji="😢" title="클럽을 찾을 수 없어요" />;
  const isBookmarked = user?.bookmarkedClubs?.includes(clubId);
  const isJoined     = user?.joinedClubs?.includes(clubId);
  const isCreator    = club.createdBy === user?.id;
  const colors = CATEGORY_COLORS[club.category] ?? ['#8EC6FF', '#0088FF'];
  const creator = SAMPLE_USERS[club.createdBy] ?? { nickname: '클럽장' };
  const gradient = `linear-gradient(135deg, ${colors[0]} 0%, ${colors[1]} 100%)`;
  const coverImage = club.coverImage ?? club.posterImages?.[0] ?? SAMPLE_CLUB_IMAGES[club.id];
  const coverSrc = coverImage?.startsWith('/') ? assetPath(coverImage) : coverImage;
  const heroStyle = coverSrc
    ? { backgroundImage: `url("${coverSrc}")` }
    : { background: gradient };

  return (
    <div className={styles.page}>
      {/* 히어로 */}
      <div className={`${styles.hero} ${coverSrc ? styles.heroWithImage : ''}`} style={heroStyle}>
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
                const url = `${window.location.origin}/clubs/${clubId}`;
                navigator.clipboard?.writeText(url).catch(() => {});
                showToast('복사가 되었습니다.', 'success');
              }}
              aria-label="링크 복사"
            >
              <Link2 size={18} color="#fff" />
            </button>
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

        {/* 서브탭 — 소개/게시판/일정/멤버 */}
        <div className={styles.subTabs}>
          {['intro', 'board', 'schedules', 'members'].map((t) => (
            <button
              key={t}
              className={`${styles.subTab} ${tab === t ? styles.subTabActive : ''}`}
              onClick={() => setTab(t)}
            >
              {{ intro: '소개', board: '게시판', schedules: '일정', members: '멤버' }[t]}
            </button>
          ))}
        </div>

        {/* 탭 콘텐츠 */}
        {tab === 'intro' && (
          <div className={styles.introBody}>
            <p className={styles.desc}>{club.description}</p>
            {club.tags?.length > 0 && (
              <div className={styles.tagRow}>
                {club.tags.map((tag) => (
                  <span key={tag} className={styles.hashTag}>#{tag}</span>
                ))}
              </div>
            )}
          </div>
        )}

        {tab === 'schedules' && (() => {
          const clubSchedules = schedules
            .filter((s) => s.clubId === clubId)
            .map((s) => ({ ...s, dday: calcDdayNum(s.startAt) }))
            .sort((a, b) => a.dday - b.dday);
          return (
            <div className={styles.scheduleTab}>
              {/* 방장 전용: 모임 개설 버튼 */}
              {isCreator && (
                <button
                  className={styles.scheduleCreateBtn}
                  onClick={() => router.push(`/clubs/${clubId}/schedule`)}
                >
                  <Plus size={15} style={{ display: 'inline', marginRight: 4 }} />
                  새 모임 일정 추가
                </button>
              )}

              {clubSchedules.length === 0 ? (
                <div className={styles.scheduleEmpty}>
                  <p className={styles.scheduleEmptyIcon}>📅</p>
                  <p className={styles.scheduleEmptyText}>예정된 일정이 없어요</p>
                </div>
              ) : (
                <div className={styles.scheduleList}>
                  {clubSchedules.map((sch) => {
                    const isToday = sch.dday === 0;
                    const isPast  = sch.dday < 0;
                    return (
                      <div key={sch.id} className={`${styles.scheduleCard} ${isToday ? styles.scheduleCardToday : ''} ${isPast ? styles.scheduleCardPast : ''}`}>
                        <div className={`${styles.scheduleDday} ${isToday ? styles.scheduleDdayToday : isPast ? styles.scheduleDdayPast : ''}`}>
                          <span className={styles.scheduleDdayNum}>{getDdayLabel(sch.dday)}</span>
                          <span className={styles.scheduleDdayDate}>{formatShortDate(sch.startAt)}</span>
                        </div>
                        <div className={styles.scheduleInfo}>
                          <p className={styles.scheduleTitle}>{sch.title ?? club.name} 정기 모임</p>
                          <p className={styles.scheduleMeta}>🕐 {sch.time}</p>
                          <p className={styles.scheduleMeta}>📍 {sch.location}</p>
                        </div>
                        {!isPast && (
                          <button
                            className={styles.scheduleApplyBtn}
                            onClick={() => {
                              if (!isJoined) {
                                joinClubStore(clubId, { name: club.name, memberCount: club.memberCount });
                                incrementMemberCount(clubId);
                                joinClubApi(clubId).catch(() => {});
                              }
                              showToast(`${club.name} 일정에 신청했어요 📅`, 'success');
                            }}
                          >
                            신청
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })()}

        {tab === 'board' && (
          <ClubBoardTab clubId={clubId} />
        )}

        {tab === 'members' && (() => {
          const members = getClubMembers(clubId);
          const ROLE_ORDER = { owner: 0, admin: 1, member: 2 };
          const sorted = [...members].sort((a, b) => ROLE_ORDER[a.role] - ROLE_ORDER[b.role]);
          const owners = sorted.filter(m => m.role === 'owner');
          const admins = sorted.filter(m => m.role === 'admin');
          const regularMembers = sorted.filter(m => m.role === 'member');
          const isOwner = members.some(m => m.userId === user?.id && m.role === 'owner');
          const isAdminUser = members.some(m => m.userId === user?.id && m.role === 'admin');

          const renderMember = (m) => {
            const info = SAMPLE_USERS[m.userId] ?? { nickname: '알 수 없음' };
            const isSelf = m.userId === user?.id;
            const showMenu = !isSelf && isOwner;
            const menuOpen = openMenuUserId === m.userId;

            const badgeClass = m.role === 'owner'
              ? styles.badgeOwner
              : m.role === 'admin'
              ? styles.badgeAdmin
              : styles.badgeMember;
            const badgeText = m.role === 'owner' ? '👑 방장' : m.role === 'admin' ? '🛡 관리자' : '회원';

            return (
              <div key={m.userId}>
                <div className={styles.memberRow}>
                  <span className={styles.memberEmoji}>{info.nickname?.[0]?.toUpperCase() ?? '?'}</span>
                  <span className={styles.memberName}>{info.nickname}</span>
                  <div className={styles.memberRowRight}>
                    <span className={badgeClass}>{badgeText}</span>
                    {showMenu && (
                      <button
                        className={styles.menuBtn}
                        onClick={() => setOpenMenuUserId(menuOpen ? null : m.userId)}
                        aria-label="멤버 관리"
                      >
                        ⋮
                      </button>
                    )}
                  </div>
                </div>
                {showMenu && menuOpen && (
                  <div className={styles.actionRow}>
                    {m.role === 'member' && (
                      <button
                        className={styles.actionPromote}
                        onClick={() => { setMemberRole(clubId, m.userId, 'admin'); setOpenMenuUserId(null); }}
                      >
                        관리자로 승급
                      </button>
                    )}
                    {m.role === 'admin' && (
                      <button
                        className={styles.actionDemote}
                        onClick={() => { setMemberRole(clubId, m.userId, 'member'); setOpenMenuUserId(null); }}
                      >
                        회원으로 강등
                      </button>
                    )}
                    <button
                      className={styles.actionKick}
                      onClick={() => { removeMember(clubId, m.userId); setOpenMenuUserId(null); }}
                    >
                      내보내기
                    </button>
                  </div>
                )}
              </div>
            );
          };

          return (
            <div className={styles.memberList}>
              <p className={styles.memberCount}>모임멤버 ({members.length})</p>

              {owners.length > 0 && (
                <div className={styles.roleSection}>
                  <p className={styles.roleSectionTitle}>방장</p>
                  {owners.map(renderMember)}
                </div>
              )}

              {admins.length > 0 && (
                <div className={styles.roleSection}>
                  <p className={styles.roleSectionTitle}>관리자</p>
                  {admins.map(renderMember)}
                </div>
              )}

              {regularMembers.length > 0 && (
                <div className={styles.roleSection}>
                  <p className={styles.roleSectionTitle}>회원</p>
                  {regularMembers.map(renderMember)}
                </div>
              )}
            </div>
          );
        })()}

        <div style={{ height: 100 }} />
      </div>

      {showLeaveConfirm && (
        <Modal
          title="참여 취소"
          message={`'${club.name}' 모임 참여를 취소할까요?`}
          confirmLabel="참여 취소"
          cancelLabel="돌아가기"
          danger
          onConfirm={() => {
            leaveClubStore(clubId);
            decrementMemberCount(clubId);
            leaveClubApi(clubId).catch(() => {});
            showToast('모임 참여를 취소했어요', 'info');
            setShowLeaveConfirm(false);
          }}
          onCancel={() => setShowLeaveConfirm(false)}
        />
      )}

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
              setShowLeaveConfirm(true);
            } else {
              router.push(`/clubs/${clubId}/join`);
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
