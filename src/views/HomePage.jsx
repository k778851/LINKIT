'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Bell, Plus, CalendarDays } from 'lucide-react';
import { useClubStore } from '../store/clubStore';
import { useAuthStore } from '../store/authStore';
import { useNotificationStore } from '../store/notificationStore';
import { calcDdayNum, getDdayLabel } from '../utils/formatDate';
import { sampleBanners, CATEGORY_COLORS, SAMPLE_CLUB_IMAGES } from '../data/sampleData';
import { assetPath } from '../lib/assetPath';
import { LinkitWordmark } from '../components/common/LinkitWordmark';
import styles from './HomePage.module.css';


export function HomePage() {
  const router = useRouter();
  const clubs = useClubStore((s) => s.clubs);
  const schedules = useClubStore((s) => s.schedules);
  const user = useAuthStore((s) => s.user);
  const unreadCount = useNotificationStore((s) => s.notifications.filter((n) => !n.read).length);
  const timerRef = useRef(null);
  const dragStartX = useRef(null);
  const draggingRef = useRef(false);

  // 무한 루프: [마지막 클론, ...원본, 첫 번째 클론]
  const total = sampleBanners.length;
  const slides = [sampleBanners[total - 1], ...sampleBanners, sampleBanners[0]];
  // 실제 표시 인덱스 (1 ~ total, 0=마지막클론, total+1=첫번째클론)
  const [slideIdx, setSlideIdx] = useState(1);
  const [animated, setAnimated] = useState(true);
  const bannerIdx = slideIdx === 0 ? total - 1 : slideIdx === total + 1 ? 0 : slideIdx - 1; // dot용

  // 클론 끝 도달 시 트랜지션 없이 반대편으로 점프
  useEffect(() => {
    if (slideIdx === 0) {
      const t = setTimeout(() => { setAnimated(false); setSlideIdx(total); }, 500);
      return () => clearTimeout(t);
    }
    if (slideIdx === total + 1) {
      const t = setTimeout(() => { setAnimated(false); setSlideIdx(1); }, 500);
      return () => clearTimeout(t);
    }
    // 점프 후 다시 애니메이션 활성화
    if (!animated) {
      const t = setTimeout(() => setAnimated(true), 20);
      return () => clearTimeout(t);
    }
  }, [slideIdx, animated, total]);

  // 5초 자동전환
  useEffect(() => {
    timerRef.current = setInterval(() => setSlideIdx((i) => i + 1), 5000);
    return () => clearInterval(timerRef.current);
  }, []);

  const resetBannerTimer = () => {
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => setSlideIdx((i) => i + 1), 5000);
  };

  const moveSlideByDelta = (dx) => {
    if (Math.abs(dx) < 40) return;
    setAnimated(true);
    setSlideIdx((i) => dx < 0 ? i + 1 : i - 1);
    resetBannerTimer();
  };

  const goTo = (idx) => { // dot 클릭 (0-based 원본 인덱스)
    setAnimated(true);
    setSlideIdx(idx + 1);
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => setSlideIdx((i) => i + 1), 5000);
  };

  // 배너 스와이프
  const handleTouchStart = (e) => { dragStartX.current = e.touches[0].clientX; };
  const handleTouchEnd = (e) => {
    if (dragStartX.current === null) return;
    moveSlideByDelta(e.changedTouches[0].clientX - dragStartX.current);
    dragStartX.current = null;
  };
  const handlePointerDown = (e) => {
    if (e.pointerType === 'touch') return;
    draggingRef.current = true;
    dragStartX.current = e.clientX;
  };
  const handlePointerUp = (e) => {
    if (!draggingRef.current || dragStartX.current === null) return;
    moveSlideByDelta(e.clientX - dragStartX.current);
    draggingRef.current = false;
    dragStartX.current = null;
  };
  const handlePointerCancel = () => {
    draggingRef.current = false;
    dragStartX.current = null;
  };

  // 참여 중인 클럽의 가장 가까운 미래 일정
  const nextSchedule = schedules
    .filter((s) => user?.joinedClubs?.includes(s.clubId))
    .map((s) => ({ ...s, dday: calcDdayNum(s.startAt) }))
    .filter((s) => s.dday >= 0)
    .sort((a, b) => a.dday - b.dday)[0] ?? null;

  const popularClubs = clubs.slice(0, 4);
  const homeClubCategories = ['전체', ...Array.from(new Set(clubs.map((club) => club.category)))];
  const [homeClubTab, setHomeClubTab] = useState('전체');
  const homeClubList = (homeClubTab === '전체'
    ? clubs
    : clubs.filter((club) => club.category === homeClubTab)
  ).slice(0, 6);

  return (
    <div className={styles.page}>
      {/* 헤더 */}
      <header className={styles.header}>
        <LinkitWordmark size={26} />
        <div className={styles.headerRight}>
          <button className={styles.iconBtn} aria-label="검색" onClick={() => router.push('/search')}>
            <Search size={21} strokeWidth={2} color="var(--ink-2)" />
          </button>
          <button className={styles.iconBtn} aria-label="알림" style={{ position: 'relative' }} onClick={() => router.push('/notifications')}>
            <Bell size={21} strokeWidth={2} color="var(--ink-2)" />
            {unreadCount > 0 && <span className={styles.bellDot} />}
          </button>
        </div>
      </header>

      {/* 배너 캐러셀 — 무한 루프 */}
      <div
        className={styles.bannerWrap}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerCancel}
        onPointerLeave={handlePointerCancel}
      >
        <div
          style={{
            display: 'flex',
            width: `${slides.length * 100}%`,
            transform: `translateX(${(-slideIdx * 100) / slides.length}%)`,
            transition: animated ? 'transform 0.4s cubic-bezier(0.25,0.46,0.45,0.94)' : 'none',
            height: '100%',
          }}
        >
          {slides.map((b, i) => (
            <div
              key={i}
              className={styles.banner}
              style={{
                background: b.gradient,
                width: `${100 / slides.length}%`,
                flexShrink: 0,
                position: 'relative',
              }}
            >
              <span className={styles.bannerTag}>{b.tag}</span>
              <p className={styles.bannerTitle}>{b.title}</p>
              <p className={styles.bannerSubtitle}>{b.subtitle}</p>
            </div>
          ))}
        </div>
        {/* Dot indicators */}
        <div className={styles.dots}>
          {sampleBanners.map((_, i) => (
            <button
              key={i}
              className={`${styles.dotBtn} ${i === bannerIdx ? styles.dotActive : ''}`}
              onClick={() => goTo(i)}
              aria-label={`배너 ${i + 1}`}
            />
          ))}
        </div>
      </div>

      {/* 내 다음 일정 */}
      {user && nextSchedule && (
        <button className={styles.scheduleCard} onClick={() => router.push('/mypage/schedules')}>
          <div className={styles.scheduleLeft}>
            <CalendarDays size={16} color="var(--blue)" strokeWidth={2.2} />
            <span className={styles.scheduleLabel}>내 다음 일정</span>
          </div>
          <div className={styles.scheduleMiddle}>
            <span className={styles.scheduleName}>{nextSchedule.clubName}</span>
            <span className={styles.scheduleMeta}>{nextSchedule.time} · {nextSchedule.location}</span>
          </div>
          <div className={styles.scheduleDday}>
            {getDdayLabel(nextSchedule.dday)}
          </div>
        </button>
      )}

      {/* 모임 탐색 바로가기 */}
      <div className={styles.statRow}>
        <span className={styles.statText}>
          지금 함께할 모임을 찾아보세요
        </span>
        <button className={styles.exploreBtn} onClick={() => router.push('/clubs')}>
          탐색하기
        </button>
      </div>

      {/* 추천 클럽 — 가로 스크롤 */}
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>추천 모임</h2>
          <button className={styles.moreBtn} onClick={() => router.push('/clubs')}>전체 보기</button>
        </div>
        <div className={`${styles.hScroll} hide-scrollbar`}>
          {clubs.map((club) => (
            <HomeClubCard key={club.id} club={club} onClick={() => router.push(`/clubs/${club.id}`)} />
          ))}
        </div>
      </div>

      {/* 인기 클럽 — 세로 리스트 */}
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>인기 모임</h2>
          <button className={styles.moreBtn} onClick={() => router.push('/clubs')}>전체 보기</button>
        </div>
        <div className={styles.clubTabsBlock}>
          <div className={`${styles.clubTabs} hide-scrollbar`}>
            {homeClubCategories.map((category) => (
              <button
                key={category}
                className={`${styles.clubTab} ${homeClubTab === category ? styles.clubTabActive : ''}`}
                onClick={() => setHomeClubTab(category)}
              >
                {category}
              </button>
            ))}
          </div>
          <div className={styles.clubTabList}>
            {homeClubList.map((club) => (
              <button key={club.id} className={styles.clubTabItem} onClick={() => router.push(`/clubs/${club.id}`)}>
                <span className={styles.clubTabName}>{club.name}</span>
                <span className={styles.clubTabMeta}>{club.category} · {club.memberCount.toLocaleString()}명</span>
              </button>
            ))}
          </div>
        </div>
        <div className={styles.popularList}>
          {popularClubs.map((club, idx) => (
            <PopularRow key={club.id} club={club} rank={idx + 1} onClick={() => router.push(`/clubs/${club.id}`)} />
          ))}
        </div>
      </div>

      <div style={{ height: 24 }} />
    </div>
  );
}

function HomeClubCard({ club, onClick }) {
  const colors = CATEGORY_COLORS[club.category] ?? ['#8EC6FF', '#0088FF'];
  const coverImage = club.coverImage ?? club.posterImages?.[0] ?? SAMPLE_CLUB_IMAGES[club.id];
  const coverSrc = coverImage?.startsWith('/') ? assetPath(coverImage) : coverImage;
  return (
    <button className={styles.clubCard} onClick={onClick}>
      <div
        className={styles.clubPoster}
        style={coverSrc
          ? { backgroundImage: `url("${coverSrc}")`, backgroundSize: 'cover', backgroundPosition: 'center' }
          : { background: `linear-gradient(135deg, ${colors[0]} 0%, ${colors[1]} 100%)` }
        }
      />
      <p className={styles.clubName}>{club.name}</p>
      <p className={styles.clubMeta}>{club.memberCount.toLocaleString()}명</p>
    </button>
  );
}

function PopularRow({ club, rank, onClick }) {
  const colors = CATEGORY_COLORS[club.category] ?? ['#8EC6FF', '#0088FF'];
  const coverImage = club.coverImage ?? club.posterImages?.[0] ?? SAMPLE_CLUB_IMAGES[club.id];
  const coverSrc = coverImage?.startsWith('/') ? assetPath(coverImage) : coverImage;
  return (
    <button className={styles.popularRow} onClick={onClick}>
      <span className={styles.popularRank}>{rank}</span>
      <div
        className={styles.popularEmoji}
        style={coverSrc
          ? { backgroundImage: `url("${coverSrc}")`, backgroundSize: 'cover', backgroundPosition: 'center' }
          : { background: `linear-gradient(135deg, ${colors[0]} 0%, ${colors[1]} 100%)` }
        }
      />
      <div className={styles.popularInfo}>
        <p className={styles.popularName}>{club.name}</p>
        <p className={styles.popularMeta}>{club.category} · {club.memberCount.toLocaleString()}명</p>
      </div>
      <Plus size={16} color="var(--ink-4)" />
    </button>
  );
}
