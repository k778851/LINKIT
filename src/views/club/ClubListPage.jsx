'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Plus, SlidersHorizontal } from 'lucide-react';
import { useClubStore } from '../../store/clubStore';
import { Chip } from '../../components/common/Chip';
import { ClubCard } from '../../components/club/ClubCard';
import { FAB } from '../../components/common/FAB';
import { EmptyState } from '../../components/common/EmptyState';
import styles from './ClubListPage.module.css';

const CATEGORIES = ['전체', '운동', '음식', '아트', '스터디', '음악', '기타'];
const SORTS = ['최신순', '인기순', '신규순'];

export function ClubListPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { selectedCategory, setCategory, selectedSort, setSort, getFilteredClubs } = useClubStore();
  const clubs = getFilteredClubs();

  useEffect(() => {
    const cat = searchParams.get('category');
    if (cat && CATEGORIES.includes(cat)) setCategory(cat);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>클럽</h1>
        <span className={styles.headerCount}>{clubs.length}개</span>
      </header>

      {/* 카테고리 필터 */}
      <div className={`${styles.chipRow} hide-scrollbar`}>
        {CATEGORIES.map((cat) => (
          <Chip key={cat} active={selectedCategory === cat} onClick={() => setCategory(cat)}>
            {cat}
          </Chip>
        ))}
      </div>

      {/* 정렬 바 */}
      <div className={styles.sortBar}>
        <span className={styles.sortLabel}>
          <SlidersHorizontal size={13} strokeWidth={2.2} />
          정렬
        </span>
        <div className={styles.sortBtns}>
          {SORTS.map((s) => (
            <button
              key={s}
              className={`${styles.sortBtn} ${selectedSort === s ? styles.sortBtnActive : ''}`}
              onClick={() => setSort(s)}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {clubs.length === 0 ? (
        <EmptyState
          emoji="🔍"
          title="클럽이 없어요"
          description="조건에 맞는 클럽이 없어요. 직접 만들어 보세요!"
        />
      ) : (
        <div className={styles.grid}>
          {clubs.map((club, idx) => (
            <div
              key={club.id}
              className="card-animate"
              style={{ animationDelay: `${Math.min(idx * 40, 280)}ms` }}
            >
              <ClubCard club={club} onClick={() => router.push(`/clubs/${club.id}`)} />
            </div>
          ))}
        </div>
      )}

      <FAB
        label="클럽 만들기"
        icon={<Plus size={16} />}
        onClick={() => router.push('/clubs/new')}
      />
    </div>
  );
}
