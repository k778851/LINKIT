'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useClubStore } from '../../store/clubStore';
import { useAuthStore } from '../../store/authStore';
import { useToastContext } from '../../context/ToastContext';
import { Header } from '../../components/layout/Header';
import { CLUB_EMOJIS } from '../../data/sampleData';
import styles from './ClubJoinPage.module.css';

export function ClubJoinPage({ clubId }) {
  const router = useRouter();
  const getClubById = useClubStore((s) => s.getClubById);
  const joinClubStore  = useAuthStore((s) => s.joinClub);
  const joinClubApi    = useClubStore((s) => s.joinClubApi);
  const incrementMemberCount = useClubStore((s) => s.incrementMemberCount);
  const user = useAuthStore((s) => s.user);
  const { showToast } = useToastContext();
  const club = getClubById(clubId);

  const [answer, setAnswer] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!club) return null;

  const colors = CLUB_EMOJIS[club.emoji] ?? ['#8EC6FF', '#0088FF'];
  const hasQuestion = !!club.joinQuestion;
  const canSubmit = !submitting && (!hasQuestion || answer.trim().length > 0);

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    try {
      // 가입 처리 (승인제가 아닌 경우 즉시 가입)
      if (!club.isPrivate) {
        joinClubStore(clubId, { name: club.name, emoji: club.emoji, memberCount: club.memberCount });
        incrementMemberCount(clubId);
        joinClubApi(clubId).catch(() => {});
        showToast(`${club.name}에 신청했어요 🎉`, 'success');
      } else {
        showToast('신청이 완료됐어요. 모임장 승인 후 참여할 수 있어요 😊', 'success');
      }
      router.back();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={styles.page}>
      <Header title="모임 신청하기" />

      <div className={styles.body}>
        {/* 클럽 정보 카드 */}
        <div className={styles.clubCard}>
          <div
            className={styles.clubPoster}
            style={{ background: `linear-gradient(135deg, ${colors[0]} 0%, ${colors[1]} 100%)` }}
          >
            <span className={styles.clubEmoji}>{club.emoji}</span>
          </div>
          <div className={styles.clubInfo}>
            <span className={styles.clubCategory}>{club.category}</span>
            <p className={styles.clubName}>{club.name}</p>
            <p className={styles.clubMeta}>{club.memberCount.toLocaleString()}명 참여 중</p>
          </div>
        </div>

        {/* 승인제 안내 */}
        {club.isPrivate && (
          <div className={styles.noticeBadge}>
            🔒 이 모임은 모임장 승인 후 참여할 수 있어요
          </div>
        )}

        {/* 가입 질문 */}
        {hasQuestion ? (
          <div className={styles.section}>
            <p className={styles.questionLabel}>가입 질문</p>
            <div className={styles.questionBox}>
              <p className={styles.questionText}>{club.joinQuestion}</p>
            </div>
            <label className={styles.answerLabel}>답변 <span className={styles.req}>*</span></label>
            <textarea
              className={styles.answerInput}
              placeholder="답변을 입력해주세요"
              rows={5}
              maxLength={300}
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
            />
            <p className={styles.counter}>{answer.length}/300</p>
          </div>
        ) : (
          <div className={styles.noQuestion}>
            <p className={styles.noQuestionText}>별도의 가입 질문이 없는 모임이에요.<br />아래 버튼을 눌러 바로 신청하세요!</p>
          </div>
        )}
      </div>

      {/* 하단 신청 버튼 */}
      <div className={styles.ctaWrap}>
        <button
          className={`${styles.ctaBtn} ${canSubmit ? styles.ctaActive : ''}`}
          onClick={handleSubmit}
          disabled={!canSubmit}
        >
          {submitting ? '신청 중...' : '신청하기'}
        </button>
      </div>
    </div>
  );
}
