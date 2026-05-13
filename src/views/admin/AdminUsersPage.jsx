'use client';

import { Search, ShieldAlert, UserRoundCheck } from 'lucide-react';
import { useMemo, useState } from 'react';
import { adminUsers } from './adminDemoData';
import s from './admin.module.css';

const filters = ['전체', '정상', '경고', '정지'];

export function AdminUsersPage() {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('전체');

  const users = useMemo(() => {
    const q = query.trim().toLowerCase();
    return adminUsers.filter((user) => {
      const matched = !q || user.name.toLowerCase().includes(q) || user.id.toLowerCase().includes(q) || user.handle.includes(q);
      const statusMatched = filter === '전체' || user.status === filter;
      return matched && statusMatched;
    });
  }, [query, filter]);

  return (
    <div>
      <div className={s.pageHeader}>
        <div>
          <p className={s.eyebrow}>USER MANAGEMENT</p>
          <h1 className={s.pageTitle}>회원 관리</h1>
          <p className={s.pageDesc}>회원 검색, 상세 열람, 상태 변경, 제재 및 내부 메모를 관리합니다.</p>
        </div>
        <div className={s.headerActions}>
          <button className={s.ghostBtn}><ShieldAlert size={16} /> 일괄 경고</button>
          <button className={s.primaryBtn}><UserRoundCheck size={16} /> 정지 해제</button>
        </div>
      </div>

      <section className={s.card}>
        <div className={s.searchBar}>
          <div className={s.searchWrap}>
            <Search size={16} className={s.searchIcon} />
            <input
              className={s.searchInput}
              placeholder="회원 ID, 이름, 연락처 검색"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </div>
        </div>
        <div className={s.filterRow}>
          {filters.map((item) => (
            <button
              key={item}
              className={`${s.filterBtn} ${filter === item ? s.filterActive : ''}`}
              onClick={() => setFilter(item)}
            >
              {item}
            </button>
          ))}
        </div>

        <div className={s.tableWrap}>
          <table className={s.table}>
            <thead>
              <tr>
                <th>회원ID</th>
                <th>이름</th>
                <th>상태</th>
                <th>가입일</th>
                <th>신고</th>
                <th>클럽수</th>
                <th>마지막 로그인</th>
                <th>액션</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td>{user.id}</td>
                  <td><strong>{user.name}</strong><p className={s.itemMeta}>@{user.handle}</p></td>
                  <td><span className={`${s.badge} ${statusClass(user.status)}`}>{user.status}</span></td>
                  <td>{user.joinedAt}</td>
                  <td>{user.reports}</td>
                  <td>{user.joined}</td>
                  <td>{user.lastLogin}</td>
                  <td>
                    <div className={s.actionGroup}>
                      <button className={s.smallBtn}>상세</button>
                      <button className={s.rejectBtn}>제재</button>
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

function statusClass(status) {
  if (status === '정상') return s.badgeGreen;
  if (status === '경고') return s.badgeOrange;
  if (status === '정지') return s.badgeRed;
  return s.badgeGray;
}
