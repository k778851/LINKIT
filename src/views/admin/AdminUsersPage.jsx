'use client';

import { Search } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { adminApi } from '../../api/adminApi';
import { REGION_OPTIONS, matchesRegion } from '../../data/regions';
import { adminUsers } from './adminDemoData';
import s from './admin.module.css';

const filters = ['전체', '정상', '경고', '정지'];
const statusToApi = { 정상: 'ACTIVE', 경고: 'ACTIVE', 정지: 'SUSPENDED' };

function mapApiUser(user) {
  return {
    id: user.id,
    name: user.nickname ?? user.name ?? user.handle,
    handle: user.handle ?? user.id,
    status: user.status === 'SUSPENDED' ? '정지' : '정상',
    region: user.region ?? '미등록',
    serviceRegion: user.serviceRegion,
    uniqueNo: user.uniqueNo ?? user.id,
    phone: user.phone ?? '미등록',
    joined: user.joined ?? 0,
    reports: user.reports ?? 0,
    joinedAt: String(user.createdAt ?? '').slice(0, 10) || '-',
    lastLogin: user.lastLogin ?? '-',
    memo: user.memo ?? '서버에서 불러온 회원입니다.',
  };
}

export function AdminUsersPage() {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('전체');
  const [regionFilter, setRegionFilter] = useState('전체');
  const [users, setUsers] = useState(adminUsers);
  const [selectedUserId, setSelectedUserId] = useState(adminUsers[0]?.id ?? null);
  const [confirmAction, setConfirmAction] = useState(null);

  useEffect(() => {
    adminApi.getUsers().then((list) => {
      if (Array.isArray(list) && list.length > 0) {
        const mapped = list.map(mapApiUser);
        setUsers(mapped);
        setSelectedUserId(mapped[0]?.id ?? null);
      }
    }).catch(() => {});
  }, []);

  const visibleUsers = useMemo(() => {
    const q = query.trim().toLowerCase();
    return users.filter((user) => {
      const matched = !q ||
        user.name.toLowerCase().includes(q) ||
        user.id.toLowerCase().includes(q) ||
        user.handle.toLowerCase().includes(q) ||
        user.phone.includes(q);
      const statusMatched = filter === '전체' || user.status === filter;
      const regionMatched = matchesRegion(user, regionFilter);
      return matched && statusMatched && regionMatched;
    });
  }, [users, query, filter, regionFilter]);

  const selectedUser = users.find((user) => user.id === selectedUserId) ?? visibleUsers[0] ?? users[0];

  const requestStatus = (user, status) => {
    const actionLabel = status === '정상' ? '정지 해제' : status;
    setConfirmAction({
      title: `회원 ${actionLabel}`,
      message: `'${user.name}' 회원을 ${actionLabel} 처리할까요?`,
      confirmLabel: actionLabel,
      run: async () => {
        setUsers((prev) => prev.map((item) => item.id === user.id ? { ...item, status } : item));
        setSelectedUserId(user.id);
        await adminApi.updateUserStatus(user.id, statusToApi[status]).catch(() => {});
      },
    });
  };

  const applyConfirm = async () => {
    await confirmAction?.run();
    setConfirmAction(null);
  };

  return (
    <div>
      <div className={s.pageHeader}>
        <div>
          <p className={s.eyebrow}>USER MANAGEMENT</p>
          <h1 className={s.pageTitle}>회원 관리</h1>
          <p className={s.pageDesc}>지역별 회원 현황을 나눠 보고 상세 정보에서 경고, 정지, 해제를 처리합니다.</p>
        </div>
      </div>

      <div className={s.grid2}>
        <section className={s.card}>
          <div className={s.searchBar}>
            <div className={s.searchWrap}>
              <Search size={16} className={s.searchIcon} />
              <input className={s.searchInput} placeholder="회원 ID, 이름, 연락처 검색" value={query} onChange={(event) => setQuery(event.target.value)} />
            </div>
          </div>
          <div className={s.filterRow}>
            {REGION_OPTIONS.map((item) => (
              <button key={item} className={`${s.filterBtn} ${regionFilter === item ? s.filterActive : ''}`} onClick={() => setRegionFilter(item)}>{item}</button>
            ))}
          </div>
          <div className={s.filterRow}>
            {filters.map((item) => (
              <button key={item} className={`${s.filterBtn} ${filter === item ? s.filterActive : ''}`} onClick={() => setFilter(item)}>{item}</button>
            ))}
          </div>

          <div className={s.tableWrap}>
            <table className={s.table}>
              <thead><tr><th>회원ID</th><th>이름</th><th>상태</th><th>지역</th><th>가입일</th><th>신고</th><th>참여 클럽</th><th>액션</th></tr></thead>
              <tbody>
                {visibleUsers.map((user) => (
                  <tr key={user.id}>
                    <td>{user.id}</td>
                    <td><strong>{user.name}</strong><p className={s.itemMeta}>@{user.handle}</p></td>
                    <td><span className={`${s.badge} ${statusClass(user.status)}`}>{user.status}</span></td>
                    <td>{user.serviceRegion ?? user.region}</td>
                    <td>{user.joinedAt}</td>
                    <td>{user.reports}</td>
                    <td>{user.joined}</td>
                    <td><button className={s.smallBtn} onClick={() => setSelectedUserId(user.id)}>상세</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <aside className={s.card}>
          <p className={s.cardTitle}>회원 상세 정보</p>
          {selectedUser && (
            <div className={s.queueList}>
              <div className={s.detailGrid}>
                <Detail label="회원ID" value={selectedUser.id} />
                <Detail label="고유번호" value={selectedUser.uniqueNo} />
                <Detail label="이름" value={`${selectedUser.name} (@${selectedUser.handle})`} />
                <Detail label="연락처" value={selectedUser.phone} />
                <Detail label="운영 지역" value={selectedUser.serviceRegion ?? '미등록'} />
                <Detail label="상세 지역" value={selectedUser.region} />
                <Detail label="마지막 로그인" value={selectedUser.lastLogin} />
              </div>
              <div className={s.queueItem}><span className={s.itemMeta}>현재 상태</span><span className={`${s.badge} ${statusClass(selectedUser.status)}`}>{selectedUser.status}</span></div>
              <div className={s.queueItem}><div><p className={s.itemTitle}>운영 메모</p><p className={s.itemMeta}>{selectedUser.memo}</p></div></div>
              <div className={s.actionGroup}>
                <button className={s.smallBtn} onClick={() => requestStatus(selectedUser, '경고')}>경고</button>
                {selectedUser.status === '정지'
                  ? <button className={s.approveBtn} onClick={() => requestStatus(selectedUser, '정상')}>정지 해제</button>
                  : <button className={s.rejectBtn} onClick={() => requestStatus(selectedUser, '정지')}>정지</button>}
              </div>
            </div>
          )}
        </aside>
      </div>

      {confirmAction && <ConfirmModal {...confirmAction} onCancel={() => setConfirmAction(null)} onConfirm={applyConfirm} />}
    </div>
  );
}

function Detail({ label, value }) {
  return <div className={s.detailItem}><span>{label}</span><strong>{value}</strong></div>;
}

function ConfirmModal({ title, message, confirmLabel, onCancel, onConfirm }) {
  return (
    <div className={s.modalBackdrop} role="presentation">
      <div className={s.modal} role="dialog" aria-modal="true">
        <div className={s.modalHeader}><h2 className={s.modalTitle}>{title}</h2></div>
        <p className={s.itemMeta}>{message}</p>
        <div className={s.modalFooter}><button className={s.ghostBtn} onClick={onCancel}>취소</button><button className={s.primaryBtn} onClick={onConfirm}>{confirmLabel}</button></div>
      </div>
    </div>
  );
}

function statusClass(status) {
  if (status === '정상') return s.badgeGreen;
  if (status === '경고') return s.badgeOrange;
  if (status === '정지') return s.badgeRed;
  return s.badgeGray;
}
