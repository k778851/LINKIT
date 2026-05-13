'use client';

import { CheckCircle2, Search, Star, XCircle } from 'lucide-react';
import { useMemo, useState } from 'react';
import { adminClubs } from './adminDemoData';
import s from './admin.module.css';

const filters = ['전체', '승인대기', '중지', '공개', '추천'];

export function AdminClubsPage() {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('전체');
  const [clubs, setClubs] = useState(() => adminClubs.map((club, index) => ({ ...club, recommended: index === 0 })));

  const visibleClubs = useMemo(() => {
    const q = query.trim().toLowerCase();
    return clubs.filter((club) => {
      const matched = !q || club.name.toLowerCase().includes(q) || club.owner.toLowerCase().includes(q);
      const statusMatched =
        filter === '전체' ||
        (filter === '승인대기' && club.status === '대기') ||
        (filter === '중지' && club.status === '중지') ||
        (filter === '공개' && club.status === '승인') ||
        (filter === '추천' && club.recommended);
      return matched && statusMatched;
    });
  }, [clubs, query, filter]);

  const updateClub = (id, patch) => {
    setClubs((prev) => prev.map((club) => club.id === id ? { ...club, ...patch } : club));
  };

  const pendingCount = clubs.filter((club) => club.status === '대기').length;
  const activeCount = clubs.filter((club) => club.status === '승인').length;
  const recommendCount = clubs.filter((club) => club.recommended).length;
  const stoppedCount = clubs.filter((club) => club.status === '중지').length;

  return (
    <div>
      <div className={s.pageHeader}>
        <div>
          <p className={s.eyebrow}>CLUB MANAGEMENT</p>
          <h1 className={s.pageTitle}>클럽 관리</h1>
          <p className={s.pageDesc}>클럽 생성·수정 검수, 노출 상태, 추천, 중지 운영을 관리합니다.</p>
        </div>
        <div className={s.headerActions}>
          <button className={s.ghostBtn} onClick={() => setFilter('추천')}><Star size={16} /> 추천 노출</button>
          <button className={s.primaryBtn} onClick={() => setFilter('승인대기')}><CheckCircle2 size={16} /> 승인 처리</button>
        </div>
      </div>

      <div className={s.statGrid}>
        <Metric label="승인 대기" value={`${pendingCount}건`} />
        <Metric label="활성 클럽" value={`${activeCount}개`} />
        <Metric label="추천 노출" value={`${recommendCount}개`} />
        <Metric label="중지 클럽" value={`${stoppedCount}개`} />
      </div>

      <section className={s.card}>
        <div className={s.searchBar}>
          <div className={s.searchWrap}>
            <Search size={16} className={s.searchIcon} />
            <input className={s.searchInput} placeholder="클럽명, 운영자 검색" value={query} onChange={(e) => setQuery(e.target.value)} />
          </div>
        </div>
        <div className={s.filterRow}>
          {filters.map((item) => (
            <button key={item} className={`${s.filterBtn} ${filter === item ? s.filterActive : ''}`} onClick={() => setFilter(item)}>
              {item}
            </button>
          ))}
        </div>
        <div className={s.tableWrap}>
          <table className={s.table}>
            <thead>
              <tr>
                <th>클럽ID</th>
                <th>클럽명</th>
                <th>상태</th>
                <th>카테고리</th>
                <th>운영자</th>
                <th>가입인원</th>
                <th>신고</th>
                <th>추천</th>
                <th>액션</th>
              </tr>
            </thead>
            <tbody>
              {visibleClubs.map((club) => (
                <tr key={club.id}>
                  <td>{club.id}</td>
                  <td><strong>{club.name}</strong><p className={s.itemMeta}>{club.growth}</p></td>
                  <td><span className={`${s.badge} ${statusClass(club.status)}`}>{club.status}</span></td>
                  <td>{club.category}</td>
                  <td>{club.owner}</td>
                  <td>{club.members}</td>
                  <td>{club.reports}회</td>
                  <td><span className={`${s.badge} ${club.recommended ? s.badgeBlue : s.badgeGray}`}>{club.recommended ? '추천' : '일반'}</span></td>
                  <td>
                    <div className={s.actionGroup}>
                      <button className={s.approveBtn} onClick={() => updateClub(club.id, { status: '승인' })}><CheckCircle2 size={13} /> 승인</button>
                      <button className={s.rejectBtn} onClick={() => updateClub(club.id, { status: club.status === '중지' ? '승인' : '중지' })}><XCircle size={13} /> {club.status === '중지' ? '해제' : '중지'}</button>
                      <button className={s.smallBtn} onClick={() => updateClub(club.id, { recommended: !club.recommended })}><Star size={13} /> {club.recommended ? '해제' : '추천'}</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function Metric({ label, value }) {
  return (
    <div className={s.statCard}>
      <p className={s.statNum}>{value}</p>
      <p className={s.statLabel}>{label}</p>
    </div>
  );
}

function statusClass(status) {
  if (status === '승인') return s.badgeGreen;
  if (status === '대기') return s.badgeOrange;
  if (status === '중지') return s.badgeRed;
  return s.badgeGray;
}
