'use client';

import { CheckCircle2, Search, Star, XCircle } from 'lucide-react';
import { useMemo, useState } from 'react';
import { adminClubs } from './adminDemoData';
import s from './admin.module.css';

const filters = ['전체', '승인대기', '중지', '공개'];

export function AdminClubsPage() {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('전체');

  const clubs = useMemo(() => {
    const q = query.trim().toLowerCase();
    return adminClubs.filter((club) => {
      const matched = !q || club.name.toLowerCase().includes(q) || club.owner.toLowerCase().includes(q);
      const statusMatched =
        filter === '전체' ||
        (filter === '승인대기' && club.status === '대기') ||
        (filter === '중지' && club.status === '중지') ||
        (filter === '공개' && club.status === '승인');
      return matched && statusMatched;
    });
  }, [query, filter]);

  return (
    <div>
      <div className={s.pageHeader}>
        <div>
          <p className={s.eyebrow}>CLUB MANAGEMENT</p>
          <h1 className={s.pageTitle}>클럽 관리</h1>
          <p className={s.pageDesc}>클럽 생성·수정 검수, 노출 상태, 추천, 중지 운영을 관리합니다.</p>
        </div>
        <div className={s.headerActions}>
          <button className={s.ghostBtn}><Star size={16} /> 추천 노출</button>
          <button className={s.primaryBtn}><CheckCircle2 size={16} /> 승인 처리</button>
        </div>
      </div>

      <div className={s.statGrid}>
        <Metric label="승인 대기" value="3건" />
        <Metric label="활성 클럽" value="234개" />
        <Metric label="추천 노출" value="12개" />
        <Metric label="중지 클럽" value="4개" />
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
                <th>성장</th>
                <th>액션</th>
              </tr>
            </thead>
            <tbody>
              {clubs.map((club) => (
                <tr key={club.id}>
                  <td>{club.id}</td>
                  <td><strong>{club.name}</strong></td>
                  <td><span className={`${s.badge} ${statusClass(club.status)}`}>{club.status}</span></td>
                  <td>{club.category}</td>
                  <td>{club.owner}</td>
                  <td>{club.members}</td>
                  <td>{club.reports}회</td>
                  <td>{club.growth}</td>
                  <td>
                    <div className={s.actionGroup}>
                      <button className={s.approveBtn}><CheckCircle2 size={13} /> 승인</button>
                      <button className={s.rejectBtn}><XCircle size={13} /> 반려</button>
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
