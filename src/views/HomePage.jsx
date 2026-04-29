'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Bell, Plus, CalendarDays } from 'lucide-react';
import { useClubStore } from '../store/clubStore';
import { useAuthStore } from '../store/authStore';
import { useNotificationStore } from '../store/notificationStore';
import { calcDdayNum, getDdayLabel } from '../utils/formatDate';
import { sampleBanners, CLUB_EMOJIS } from '../data/sampleData';
import { LinkitWordmark } from '../components/common/LinkitWordmark';
import styles from './HomePage.module.css';

const CLUB_COUNT = 38;

export function HomePage() {
  const [bannerIdx, setBannerIdx] = useState(0);
  const router = useRouter();
  const clubs = useClubStore((s) => s.clubs);
  const schedules = useClubStore((s) => s.schedules);
  const user = useAuthStore((s) => s.user);
  const unreadCount = useNotificationStore((s) => s.notifications.filter((n) => !n.read).length);
  const timerRef = useRef(null);

  // 참여 중인 클럽의 가장 가까운 미래 일정
  const nextSchedule = schedules
    .filter((s) => user?.joinedClubs?.includes(s.clubId))
    .map((s) => ({ ...s, dday: calcDdayNum(s.startAt) }))
    .filter((s) => s.dday >= 0)
    .sort((a, b) => a.dday - b.dday)[0] ?? null;

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setBannerIdx((i) => (i + 1) % sampleBanners.length);
    }, 4000);
    return () => clearInterval(timerRef.current);
  }, []);

  const popularClubs = clubs.slice(0, 4);

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

      {/* 배너 캐러셀 */}
      <div className={styles.bannerWrap}>
        {sampleBanners.map((b, i) => (
          <div
            key={b.id}
            className={styles.banner}
            style={{
              background: b.gradient,
              opacity: i === bannerIdx ? 1 : 0,
              transform: `translateX(${(i - bannerIdx) * 100}%)`,
              transition: 'opacity 0.5s, transform 0.5s',
              position: i === 0 ? 'relative' : 'absolute',
              top: 0, left: 0, right: 0, bottom: 0,
            }}
          >
            <span className={styles.bannerTag}>{b.tag}</span>
            <p className={styles.bannerTitle}>{b.title}</p>
            <p className={styles.bannerSubtitle}>{b.subtitle}</p>
          </div>
        ))}
        {/* Dot indicators */}
        <div className={styles.dots}>
          {sampleBanners.map((_, i) => (
            <button
              key={i}
              className={`${styles.dotBtn} ${i === bannerIdx ? styles.dotActive : ''}`}
              onClick={() => setBannerIdx(i)}
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
            <span className={styles.scheduleEmoji}>{nextSchedule.clubEmoji}</span>
            <span className={styles.scheduleName}>{nextSchedule.clubName}</span>
            <span className={styles.scheduleMeta}>{nextSchedule.time} · {nextSchedule.location}</span>
          </div>
          <div className={styles.scheduleDday}>
            {getDdayLabel(nextSchedule.dday)}
          </div>
        </button>
      )}

      {/* 통계 */}
      <div className={styles.statRow}>
        <span className={styles.statText}>
          내 동네에{' '}
          <span className={styles.statGrad}>{CLUB_COUNT}개</span>의 모임
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
  const colors = CLUB_EMOJIS[club.emoji] ?? ['#8EC6FF', '#0088FF'];
  return (
    <button className={styles.clubCard} onClick={onClick}>
      <div
        className={styles.clubPoster}
        style={{ background: `linear-gradient(135deg, ${colors[0]} 0%, ${colors[1]} 100%)` }}
      >
        <span className={styles.clubEmoji}>{club.emoji}</span>
      </div>
      <p className={styles.clubName}>{club.name}</p>
      <p className={styles.clubMeta}>{club.memberCount.toLocaleString()}명</p>
    </button>
  );
}

function PopularRow({ club, rank, onClick }) {
  const colors = CLUB_EMOJIS[club.emoji] ?? ['#8EC6FF', '#0088FF'];
  return (
    <button className={styles.popularRow} onClick={onClick}>
      <span className={styles.popularRank}>{rank}</span>
      <div
        className={styles.popularEmoji}
        style={{ background: `linear-gradient(135deg, ${colors[0]} 0%, ${colors[1]} 100%)` }}
      >
        {club.emoji}
      </div>
      <div className={styles.popularInfo}>
        <p className={styles.popularName}>{club.name}</p>
        <p className={styles.popularMeta}>{club.category} · {club.memberCount.toLocaleString()}명</p>
      </div>
      <Plus size={16} color="var(--ink-4)" />
    </button>
  );
}
