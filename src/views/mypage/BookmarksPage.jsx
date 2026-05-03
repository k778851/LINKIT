'use client';

import { useRouter } from 'next/navigation';
import { Heart } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useClubStore } from '../../store/clubStore';
import { Header } from '../../components/layout/Header';
import { useToastContext } from '../../context/ToastContext';
import { CLUB_EMOJIS, SAMPLE_CLUB_IMAGES } from '../../data/sampleData';
import { assetPath } from '../../lib/assetPath';
import styles from './BookmarksPage.module.css';

export function BookmarksPage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const toggleBookmarkWithApi = useAuthStore((s) => s.toggleBookmarkWithApi);
  const clubs = useClubStore((s) => s.clubs);
  const { showToast } = useToastContext();

  const bookmarked = clubs.filter((c) => user?.bookmarkedClubs?.includes(c.id));

  return (
    <div className={styles.page}>
      <Header
        title="찜한 클럽"
        right={
          bookmarked.length > 0 && (
            <span className={styles.countBadge}>{bookmarked.length}개</span>
          )
        }
      />

      {bookmarked.length === 0 ? (
        <div className={styles.empty}>
          <p className={styles.emptyIcon}>🤍</p>
          <p className={styles.emptyTitle}>찜한 클럽이 없어요</p>
          <p className={styles.emptyDesc}>마음에 드는 클럽을 찜해보세요!</p>
          <button className={styles.exploreBtn} onClick={() => router.push('/clubs')}>
            클럽 탐색하기
          </button>
        </div>
      ) : (
        <div className={styles.grid}>
          {bookmarked.map((club) => {
            const colors = CLUB_EMOJIS[club.emoji] ?? ['#8EC6FF', '#0088FF'];
            const coverImage = club.coverImage ?? club.posterImages?.[0] ?? SAMPLE_CLUB_IMAGES[club.id];
            const coverSrc = coverImage?.startsWith('/') ? assetPath(coverImage) : coverImage;
            return (
              <div key={club.id} className={styles.card}>
                {/* 포스터 */}
                <div
                  className={styles.poster}
                  style={coverSrc
                    ? { backgroundImage: `url("${coverSrc}")`, backgroundSize: 'cover', backgroundPosition: 'center' }
                    : { background: `linear-gradient(135deg, ${colors[0]} 0%, ${colors[1]} 100%)` }
                  }
                  onClick={() => router.push(`/clubs/${club.id}`)}
                  role="button"
                  tabIndex={0}
                >
                  {!coverSrc && <span className={styles.emoji}>{club.emoji}</span>}
                  {/* 찜 해제 버튼 */}
                  <button
                    className={styles.heartBtn}
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleBookmarkWithApi(club.id);
                      showToast('찜 목록에서 제거했어요', 'info');
                    }}
                    aria-label="찜 해제"
                  >
                    <Heart size={16} fill="#FF668A" color="#FF668A" />
                  </button>
                </div>

                {/* 정보 */}
                <div className={styles.info} onClick={() => router.push(`/clubs/${club.id}`)} role="button" tabIndex={0}>
                  <span className={styles.category}>{club.category}</span>
                  <p className={styles.name}>{club.name}</p>
                  <p className={styles.meta}>{club.memberCount.toLocaleString()}명 · {club.location}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
