'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '../../store/authStore';
import { useClubStore } from '../../store/clubStore';
import { Header } from '../../components/layout/Header';
import { Modal } from '../../components/common/Modal';
import { CATEGORY_COLORS, SAMPLE_CLUB_IMAGES } from '../../data/sampleData';
import { assetPath } from '../../lib/assetPath';
import { useToastContext } from '../../context/ToastContext';
import styles from './JoinedClubsPage.module.css';

export function JoinedClubsPage() {
  const router = useRouter();
  const { showToast } = useToastContext();
  const user = useAuthStore((s) => s.user);
  const leaveClub = useAuthStore((s) => s.leaveClub);
  const clubs = useClubStore((s) => s.clubs);
  const leaveClubApi = useClubStore((s) => s.leaveClubApi);
  const decrementMemberCount = useClubStore((s) => s.decrementMemberCount);

  const [confirmClub, setConfirmClub] = useState(null); // 탈퇴 확인 대상 클럽

  const joinedClubs = clubs.filter((c) => user?.joinedClubs?.includes(c.id));

  async function handleLeaveConfirm() {
    const club = confirmClub;
    setConfirmClub(null);
    leaveClub(club.id);
    decrementMemberCount(club.id);
    showToast(`${club.name} 참여를 취소했어요`, 'success');
    leaveClubApi(club.id).catch(() => {});
  }

  return (
    <div className={styles.page}>
      <Header title="참여 중인 클럽" />

      {joinedClubs.length === 0 ? (
        <div className={styles.empty}>
          <p className={styles.emptyIcon}>🏘️</p>
          <p className={styles.emptyTitle}>참여 중인 클럽이 없어요</p>
          <p className={styles.emptyDesc}>관심 있는 클럽에 가입해보세요!</p>
          <button className={styles.exploreBtn} onClick={() => router.push('/clubs')}>
            클럽 찾기
          </button>
        </div>
      ) : (
        <div className={styles.grid}>
          {joinedClubs.map((club) => {
            const colors = CATEGORY_COLORS[club.category] ?? ['#8EC6FF', '#0088FF'];
            const coverImage = club.coverImage ?? club.posterImages?.[0] ?? SAMPLE_CLUB_IMAGES[club.id];
            const coverSrc = coverImage?.startsWith('/') ? assetPath(coverImage) : coverImage;
            return (
              <div key={club.id} className={styles.card}>
                {/* 클럽 타일 */}
                <div
                  className={styles.tile}
                  style={coverSrc
                    ? { backgroundImage: `url("${coverSrc}")`, backgroundSize: 'cover', backgroundPosition: 'center' }
                    : { background: `linear-gradient(135deg, ${colors[0]} 0%, ${colors[1]} 100%)` }
                  }
                  onClick={() => router.push(`/clubs/${club.id}`)}
                  role="button"
                  tabIndex={0}
                >
                  {/* 탈퇴 버튼 */}
                  <span
                    className={styles.leaveBtn}
                    onClick={(e) => { e.stopPropagation(); setConfirmClub(club); }}
                    role="button"
                    tabIndex={0}
                    aria-label="클럽 나가기"
                    title="클럽 나가기"
                  >
                    ✕
                  </span>
                </div>
                <p className={`${styles.name} truncate-1`}>{club.name}</p>
                <p className={styles.meta}>{club.category}</p>
                <p className={styles.members}>{club.memberCount.toLocaleString()}명</p>
              </div>
            );
          })}
        </div>
      )}

      {confirmClub && (
        <Modal
          title="참여 취소"
          message={`'${confirmClub.name}' 모임 참여를 취소할까요?`}
          confirmLabel="참여 취소"
          cancelLabel="돌아가기"
          danger
          onConfirm={handleLeaveConfirm}
          onCancel={() => setConfirmClub(null)}
        />
      )}
    </div>
  );
}
