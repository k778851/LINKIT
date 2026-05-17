'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Heart, Clock, Users, ChevronLeft, Pencil, Link2, Plus, MoreHorizontal, UserCheck, UserX } from 'lucide-react';
import { useClubStore } from '../../store/clubStore';
import { useAuthStore } from '../../store/authStore';
import { calcDdayNum, getDdayLabel, formatShortDate } from '../../utils/formatDate';
import { useToastContext } from '../../context/ToastContext';
import { EmptyState } from '../../components/common/EmptyState';
import { Modal } from '../../components/common/Modal';
import { ClubBoardTab } from './tabs/ClubBoardTab';
import { CATEGORY_COLORS, SAMPLE_CLUB_IMAGES, SAMPLE_USERS } from '../../data/sampleData';
import { assetPath } from '../../lib/assetPath';
import { clubApi } from '../../api/clubApi';
import styles from './ClubDetailPage.module.css';

const TAB_LABELS = {
  intro: '소개',
  board: '게시판',
  schedules: '일정',
  members: '멤버',
};

export function ClubDetailPage({ clubId }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const club = useClubStore((s) => s.clubs.find((c) => c.id === clubId));
  const incrementMemberCount = useClubStore((s) => s.incrementMemberCount);
  const decrementMemberCount = useClubStore((s) => s.decrementMemberCount);
  const getClubMembers = useClubStore((s) => s.getClubMembers);
  const setMemberRole = useClubStore((s) => s.setMemberRole);
  const removeMember = useClubStore((s) => s.removeMember);
  const schedules = useClubStore((s) => s.schedules);
  const user = useAuthStore((s) => s.user);
  const toggleBookmarkWithApi = useAuthStore((s) => s.toggleBookmarkWithApi);
  const joinClubStore = useAuthStore((s) => s.joinClub);
  const leaveClubStore = useAuthStore((s) => s.leaveClub);
  const joinClubApi = useClubStore((s) => s.joinClubApi);
  const leaveClubApi = useClubStore((s) => s.leaveClubApi);
  const appliedScheduleIds = useClubStore((s) => s.appliedScheduleIds);
  const applySchedule = useClubStore((s) => s.applySchedule);
  const cancelSchedule = useClubStore((s) => s.cancelSchedule);
  const { showToast } = useToastContext();

  const [tab, setTab] = useState('intro');
  const [openMenuUserId, setOpenMenuUserId] = useState(null);

  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam && TAB_LABELS[tabParam]) setTab(tabParam);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);

  if (!club) return <EmptyState emoji="😢" title="클럽을 찾을 수 없어요" />;

  const isBookmarked = user?.bookmarkedClubs?.includes(clubId);
  const isJoined = user?.joinedClubs?.includes(clubId);
  const isCreator = club.createdBy === user?.id || user?.ownedClubs?.includes(clubId);
  // 멤버 배열에서 현재 유저의 클럽 내 역할 확인
  const myClubRole = getClubMembers(clubId).find((m) => m.userId === user?.id)?.role;
  const isOwnerRole = myClubRole === 'owner' || isCreator;
  const isAdminRole = myClubRole === 'admin';
  const canManage = isOwnerRole || isAdminRole; // 방장 또는 관리자
  const colors = CATEGORY_COLORS[club.category] ?? ['#8EC6FF', '#0088FF'];
  const coverImage = club.coverImage ?? club.posterImages?.[0] ?? SAMPLE_CLUB_IMAGES[club.id];
  const coverSrc = coverImage?.startsWith('/') ? assetPath(coverImage) : coverImage;
  const heroStyle = coverSrc
    ? { backgroundImage: `url("${coverSrc}")` }
    : { background: `linear-gradient(135deg, ${colors[0]} 0%, ${colors[1]} 100%)` };

  const copyClubLink = async () => {
    const url = window.location.href;
    try {
      if (!navigator.clipboard?.writeText) throw new Error('Clipboard API unavailable');
      await navigator.clipboard.writeText(url);
      showToast('복사가 되었습니다.', 'success');
    } catch {
      const textarea = document.createElement('textarea');
      textarea.value = url;
      textarea.setAttribute('readonly', '');
      textarea.style.position = 'fixed';
      textarea.style.top = '-9999px';
      document.body.appendChild(textarea);
      textarea.select();
      const copied = document.execCommand('copy');
      document.body.removeChild(textarea);
      showToast(copied ? '복사가 되었습니다.' : '복사에 실패했어요.', copied ? 'success' : 'error');
    }
  };

  const toggleBookmark = () => {
    toggleBookmarkWithApi(clubId);
    showToast(isBookmarked ? '찜 목록에서 제거했어요.' : '찜 목록에 추가했어요.', isBookmarked ? 'info' : 'success');
  };

  const joinForSchedule = async (scheduleId) => {
    const isApplied = appliedScheduleIds.includes(scheduleId);
    if (isApplied) {
      await cancelSchedule(scheduleId);
      showToast('일정 신청을 취소했어요.', 'info');
      return;
    }
    if (!isJoined) {
      joinClubStore(clubId, { name: club.name, memberCount: club.memberCount });
      incrementMemberCount(clubId);
      await joinClubApi(clubId);
    }
    await applySchedule(scheduleId);
    showToast(`${club.name} 일정에 신청했어요.`, 'success');
  };

  return (
    <div className={styles.page}>
      <div className={`${styles.hero} ${coverSrc ? styles.heroWithImage : ''}`} style={heroStyle}>
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
            <button className={styles.navBtn} onClick={copyClubLink} aria-label="링크 복사">
              <Link2 size={18} color="#fff" />
            </button>
            <button className={styles.navBtn} onClick={toggleBookmark} aria-label={isBookmarked ? '찜 해제' : '찜하기'}>
              <Heart size={20} fill={isBookmarked ? '#FF668A' : 'none'} color="#fff" strokeWidth={2} />
            </button>
          </div>
        </div>
      </div>

      <div className={styles.content}>
        <div className={styles.tags}>
          <span className={styles.tag}>{club.category}</span>
          {club.isPrivate && <span className={styles.tagPrivate}>승인제</span>}
        </div>

        <h1 className={styles.name}>{club.name}</h1>

        {club.tags?.length > 0 && (
          <div className={styles.tagRow}>
            {club.tags.map((tag) => (
              <span key={tag} className={styles.hashTag}>#{tag}</span>
            ))}
          </div>
        )}

        <div className={styles.infoRow}>
          <InfoBox icon={<Clock size={16} color="var(--blue)" />} text={club.schedule} />
          <InfoBox icon={<Users size={16} color="var(--blue)" />} text={`${club.memberCount.toLocaleString()}명`} />
        </div>

        <div className={styles.subTabs}>
          {Object.entries(TAB_LABELS).map(([key, label]) => (
            <button
              key={key}
              className={`${styles.subTab} ${tab === key ? styles.subTabActive : ''}`}
              onClick={() => setTab(key)}
            >
              {label}
            </button>
          ))}
          {/* 방장/관리자에게만 가입신청 탭 표시 */}
          {canManage && club.isPrivate && (
            <button
              className={`${styles.subTab} ${tab === 'requests' ? styles.subTabActive : ''}`}
              onClick={() => setTab('requests')}
            >
              가입신청
            </button>
          )}
        </div>

        {tab === 'intro' && (
          <div className={styles.introBody}>
            <p className={styles.desc}>{club.description}</p>
          </div>
        )}

        {tab === 'board' && <ClubBoardTab clubId={clubId} />}

        {tab === 'schedules' && (
          <ScheduleTab
            club={club}
            clubId={clubId}
            schedules={schedules}
            canManage={canManage}
            appliedScheduleIds={appliedScheduleIds}
            onCreate={() => router.push(`/clubs/${clubId}/schedule`)}
            onApply={joinForSchedule}
          />
        )}

        {tab === 'members' && (
          <MembersTab
            clubId={clubId}
            user={user}
            members={getClubMembers(clubId)}
            openMenuUserId={openMenuUserId}
            setOpenMenuUserId={setOpenMenuUserId}
            setMemberRole={setMemberRole}
            removeMember={removeMember}
            isOwnerRole={isOwnerRole}
            isAdminRole={isAdminRole}
          />
        )}

        {tab === 'requests' && canManage && (
          <JoinRequestsTab clubId={clubId} showToast={showToast} />
        )}

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
            showToast('모임 참여를 취소했어요.', 'info');
            setShowLeaveConfirm(false);
          }}
          onCancel={() => setShowLeaveConfirm(false)}
        />
      )}

      <div className={styles.ctaBar}>
        <button className={styles.bookmarkCta} onClick={toggleBookmark} aria-label={isBookmarked ? '찜 해제' : '찜하기'}>
          <Heart size={20} fill={isBookmarked ? '#FF668A' : 'none'} color={isBookmarked ? '#FF668A' : 'var(--ink-3)'} />
        </button>
        {isOwnerRole ? (
          /* 방장은 탈퇴 불가 — 운영자 표시 */
          <button className={`${styles.joinBtn} ${styles.joinedBtn}`} disabled style={{ opacity: 0.6 }}>
            방장
          </button>
        ) : (
          <button
            className={`${styles.joinBtn} ${isJoined ? styles.joinedBtn : ''}`}
            onClick={() => {
              if (isJoined) setShowLeaveConfirm(true);
              else router.push(`/clubs/${clubId}/join`);
            }}
          >
            {isJoined ? (isAdminRole ? '관리자' : '참여 취소') : '모임 신청하기'}
          </button>
        )}
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

function ScheduleTab({ club, clubId, schedules, canManage, appliedScheduleIds, onCreate, onApply }) {
  const clubSchedules = schedules
    .filter((schedule) => schedule.clubId === clubId)
    .map((schedule) => ({ ...schedule, dday: calcDdayNum(schedule.startAt) }))
    .sort((a, b) => a.dday - b.dday);

  return (
    <div className={styles.scheduleTab}>
      {canManage && (
        <button className={styles.scheduleCreateBtn} onClick={onCreate}>
          <Plus size={15} style={{ display: 'inline', marginRight: 4 }} />
          모임 일정 추가
        </button>
      )}

      {clubSchedules.length === 0 ? (
        <div className={styles.scheduleEmpty}>
          <p className={styles.scheduleEmptyText}>예정된 일정이 없어요</p>
        </div>
      ) : (
        <div className={styles.scheduleList}>
          {clubSchedules.map((schedule) => {
            const isToday = schedule.dday === 0;
            const isPast = schedule.dday < 0;
            const isApplied = appliedScheduleIds.includes(schedule.id);
            return (
              <div key={schedule.id} className={`${styles.scheduleCard} ${isToday ? styles.scheduleCardToday : ''} ${isPast ? styles.scheduleCardPast : ''}`}>
                <div className={`${styles.scheduleDday} ${isToday ? styles.scheduleDdayToday : isPast ? styles.scheduleDdayPast : ''}`}>
                  <span className={styles.scheduleDdayNum}>{getDdayLabel(schedule.dday)}</span>
                  <span className={styles.scheduleDdayDate}>{formatShortDate(schedule.startAt)}</span>
                </div>
                <div className={styles.scheduleInfo}>
                  <p className={styles.scheduleTitle}>{schedule.title ?? `${club.name} 정기 모임`}</p>
                  <p className={styles.scheduleMeta}>시간 {schedule.time}</p>
                  <p className={styles.scheduleMeta}>장소 {schedule.location}</p>
                </div>
                {!isPast && (
                  <button
                    className={`${styles.scheduleApplyBtn} ${isApplied ? styles.scheduleAppliedBtn : ''}`}
                    onClick={() => onApply(schedule.id)}
                  >
                    {isApplied ? '신청 완료' : '신청'}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function MembersTab({ clubId, user, members, openMenuUserId, setOpenMenuUserId, setMemberRole, removeMember, isOwnerRole, isAdminRole }) {
  const [kickTarget, setKickTarget] = useState(null);
  const roleOrder = { owner: 0, admin: 1, member: 2 };
  const sorted = [...members].sort((a, b) => roleOrder[a.role] - roleOrder[b.role]);
  const owners = sorted.filter((member) => member.role === 'owner');
  const admins = sorted.filter((member) => member.role === 'admin');
  const regularMembers = sorted.filter((member) => member.role === 'member');
  // 방장 또는 관리자 여부 (props 우선, fallback: 배열 검사)
  const iAmOwner = isOwnerRole ?? members.some((m) => m.userId === user?.id && m.role === 'owner');
  const iAmAdmin = isAdminRole ?? members.some((m) => m.userId === user?.id && m.role === 'admin');
  const canManageMembers = iAmOwner || iAmAdmin;

  const renderMember = (member) => {
    const info = SAMPLE_USERS[member.userId] ?? { nickname: '알 수 없음' };
    const isSelf = member.userId === user?.id;
    // 방장은 모든 멤버 관리 가능, 관리자는 일반 회원만 내보내기 가능
    const showMenu = !isSelf && canManageMembers && member.role !== 'owner';
    const menuOpen = openMenuUserId === member.userId;
    const badgeClass = member.role === 'owner'
      ? styles.badgeOwner
      : member.role === 'admin'
      ? styles.badgeAdmin
      : styles.badgeMember;
    const badgeText = member.role === 'owner' ? '방장' : member.role === 'admin' ? '관리자' : '회원';

    return (
      <div key={member.userId}>
        <div className={styles.memberRow}>
          <span className={styles.memberEmoji}>{info.nickname?.[0]?.toUpperCase() ?? '?'}</span>
          <span className={styles.memberName}>{info.nickname}</span>
          <div className={styles.memberRowRight}>
            <span className={badgeClass}>{badgeText}</span>
            {showMenu && (
              <button
                className={styles.menuBtn}
                onClick={() => setOpenMenuUserId(menuOpen ? null : member.userId)}
                aria-label="멤버 관리"
              >
                <MoreHorizontal size={16} />
              </button>
            )}
          </div>
        </div>
        {showMenu && menuOpen && (
          <div className={styles.actionRow}>
            {/* 역할 변경은 방장만 가능 */}
            {iAmOwner && member.role === 'member' && (
              <button
                className={styles.actionPromote}
                onClick={() => {
                  setMemberRole(clubId, member.userId, 'admin');
                  setOpenMenuUserId(null);
                }}
              >
                관리자로 승급
              </button>
            )}
            {iAmOwner && member.role === 'admin' && (
              <button
                className={styles.actionDemote}
                onClick={() => {
                  setMemberRole(clubId, member.userId, 'member');
                  setOpenMenuUserId(null);
                }}
              >
                회원으로 변경
              </button>
            )}
            {/* 내보내기는 방장/관리자 모두 가능 */}
            <button
              className={styles.actionKick}
              onClick={() => setKickTarget(member.userId)}
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
      <p className={styles.memberCount}>모임 멤버 ({members.length})</p>
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
      {kickTarget && (
        <Modal
          title="멤버 내보내기"
          message={`이 멤버를 클럽에서 내보낼까요?`}
          confirmLabel="내보내기"
          cancelLabel="취소"
          danger
          onConfirm={() => {
            removeMember(clubId, kickTarget);
            setOpenMenuUserId(null);
            setKickTarget(null);
          }}
          onCancel={() => setKickTarget(null)}
        />
      )}
    </div>
  );
}

/** 가입 신청 목록 탭 (방장/관리자 전용) */
function JoinRequestsTab({ clubId, showToast }) {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    clubApi.listJoinRequests(clubId)
      .then((data) => setRequests(data ?? []))
      .catch(() => setRequests([]))
      .finally(() => setLoading(false));
  }, [clubId]);

  const handleApprove = async (req) => {
    try {
      await clubApi.approveJoinRequest(clubId, req.id);
      setRequests((prev) => prev.filter((r) => r.id !== req.id));
      showToast(`${req.nickname ?? '신청자'}님의 가입을 승인했어요.`, 'success');
    } catch {
      showToast('승인에 실패했어요.', 'error');
    }
  };

  const handleReject = async (req) => {
    try {
      await clubApi.rejectJoinRequest(clubId, req.id);
      setRequests((prev) => prev.filter((r) => r.id !== req.id));
      showToast(`${req.nickname ?? '신청자'}님의 가입을 거절했어요.`, 'info');
    } catch {
      showToast('거절에 실패했어요.', 'error');
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '32px 0', textAlign: 'center', color: 'var(--ink-4)', fontSize: 14 }}>
        불러오는 중...
      </div>
    );
  }

  if (requests.length === 0) {
    return (
      <div style={{ padding: '48px 0', textAlign: 'center' }}>
        <p style={{ fontSize: 28, marginBottom: 8 }}>🙌</p>
        <p style={{ fontSize: 14, color: 'var(--ink-3)', fontWeight: 600 }}>대기 중인 가입 신청이 없어요</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, padding: '12px 0' }}>
      <p style={{ fontSize: 13, color: 'var(--ink-3)', marginBottom: 4 }}>
        가입 신청 {requests.length}건
      </p>
      {requests.map((req) => (
        <div
          key={req.id}
          style={{
            background: 'var(--base-white)',
            border: '1px solid var(--base-border)',
            borderRadius: 14,
            padding: '14px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: 12,
          }}
        >
          <span style={{
            width: 40, height: 40, borderRadius: '50%',
            background: 'var(--blue-soft)', color: 'var(--blue)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 700, fontSize: 16, flexShrink: 0,
          }}>
            {req.nickname?.[0]?.toUpperCase() ?? '?'}
          </span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink)' }}>
              {req.nickname ?? '알 수 없음'}
            </p>
            {req.answer && (
              <p style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                "{req.answer}"
              </p>
            )}
            <p style={{ fontSize: 11, color: 'var(--ink-4)', marginTop: 2 }}>
              {req.requestedAt ? new Date(req.requestedAt).toLocaleDateString('ko-KR') : ''}
            </p>
          </div>
          <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
            <button
              onClick={() => handleReject(req)}
              style={{
                padding: '7px 12px', borderRadius: 8, fontSize: 12, fontWeight: 600,
                background: 'var(--base)', color: 'var(--ink-3)',
                border: '1px solid var(--base-border)', cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 4,
              }}
            >
              <UserX size={13} /> 거절
            </button>
            <button
              onClick={() => handleApprove(req)}
              style={{
                padding: '7px 12px', borderRadius: 8, fontSize: 12, fontWeight: 600,
                background: 'var(--blue)', color: '#fff',
                border: 'none', cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 4,
              }}
            >
              <UserCheck size={13} /> 승인
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
