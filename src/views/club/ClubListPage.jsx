'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Plus, SlidersHorizontal, X } from 'lucide-react';
import { useClubStore } from '../../store/clubStore';
import { REGION_OPTIONS, matchesRegion } from '../../data/regions';
import { Chip } from '../../components/common/Chip';
import { ClubCard } from '../../components/club/ClubCard';
import { FAB } from '../../components/common/FAB';
import { EmptyState } from '../../components/common/EmptyState';
import { ClubCardSkeleton } from '../../components/common/SkeletonList';
import styles from './ClubListPage.module.css';

const CATEGORIES = ['전체', '운동', '음식', '아트', '스터디', '음악', '기타'];
const SORTS = ['최신순', '인기순'];

export function ClubListPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const {
    selectedCategory, setCategory,
    selectedSort, setSort,
    selectedRegion, setRegion,
    getFilteredClubs,
    clubs: allClubs,
    loaded, fetchClubs,
  } = useClubStore();

  const clubs = getFilteredClubs();
  const regionClubCount = allClubs.filter((club) => matchesRegion(club, selectedRegion)).length;
  const isFiltered = selectedCategory !== '전체' || selectedSort !== '최신순' || selectedRegion !== '전체';

  const resetFilter = () => {
    setCategory('전체');
    setSort('최신순');
    setRegion('전체');
  };

  useEffect(() => {
    const cat = searchParams.get('category');
    if (cat && CATEGORIES.includes(cat)) setCategory(cat);
  }, [searchParams, setCategory]);

  useEffect(() => {
    if (!CATEGORIES.includes(selectedCategory)) setCategory('전체');
    if (!SORTS.includes(selectedSort)) setSort('최신순');
    if (!REGION_OPTIONS.includes(selectedRegion)) setRegion('전체');
  }, [selectedCategory, selectedRegion, selectedSort, setCategory, setRegion, setSort]);

  useEffect(() => {
    if (!loaded) fetchClubs();
  }, [loaded, fetchClubs]);

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>클럽</h1>
        <span className={styles.headerCount}>{regionClubCount}개</span>
      </header>

      <div className={`${styles.chipRow} hide-scrollbar`} aria-label="운영 지역">
        {REGION_OPTIONS.map((region) => (
          <Chip key={region} active={selectedRegion === region} onClick={() => setRegion(region)}>
            {region}
          </Chip>
        ))}
      </div>

      <div className={`${styles.chipRow} hide-scrollbar`} aria-label="카테고리">
        {CATEGORIES.map((cat) => (
          <Chip key={cat} active={selectedCategory === cat} onClick={() => setCategory(cat)}>
            {cat}
          </Chip>
        ))}
      </div>

      <div className={styles.sortBar}>
        <span className={styles.resultCount}>
          {isFiltered
            ? <><span className={styles.resultNum}>{clubs.length}</span>개 결과</>
            : <><span className={styles.resultNum}>{allClubs.length}</span>개 모임</>
          }
          {isFiltered && (
            <button className={styles.resetBtn} onClick={resetFilter}>
              <X size={11} strokeWidth={2.5} /> 초기화
            </button>
          )}
        </span>
        <div className={styles.sortBtns}>
          <SlidersHorizontal size={13} strokeWidth={2.2} color="var(--ink-3)" />
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

      {!loaded ? (
        <div className={styles.grid}>
          {Array.from({ length: 6 }).map((_, i) => <ClubCardSkeleton key={i} />)}
        </div>
      ) : clubs.length === 0 ? (
        <EmptyState
          emoji="🔎"
          title="클럽이 없어요"
          description="선택한 지역과 조건에 맞는 클럽이 없어요. 다른 조건으로 확인해보세요."
          action={
            <button
              onClick={resetFilter}
              style={{
                marginTop: 4, padding: '10px 24px', borderRadius: 999,
                background: 'var(--blue-soft)', color: 'var(--blue)',
                fontSize: 14, fontWeight: 700,
              }}
            >
              필터 초기화
            </button>
          }
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

      <div style={{ height: 88 }} />
      <FAB
        label="클럽 만들기"
        icon={<Plus size={16} />}
        onClick={() => router.push('/clubs/new')}
      />
    </div>
  );
}
