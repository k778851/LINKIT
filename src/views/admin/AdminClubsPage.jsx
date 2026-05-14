'use client';

import { CheckCircle2, Search } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { adminApi } from '../../api/adminApi';
import { REGION_OPTIONS, matchesRegion } from '../../data/regions';
import { adminClubs } from './adminDemoData';
import s from './admin.module.css';

const filters = ['전체', '승인', '대기', '중지'];
const statusToApi = { 승인: 'ACTIVE', 대기: 'PENDING', 중지: 'CLOSED', 해제: 'ACTIVE' };

function mapApiClub(club) {
  return {
    id: club.id,
    name: club.name,
    status: club.status === 'PENDING' ? '대기' : club.status === 'CLOSED' ? '중지' : '승인',
    category: club.category,
    owner: club.ownerNickname ?? club.createdBy ?? '운영자',
    ownerId: club.createdBy ?? '-',
    ownerRegion: club.ownerRegion ?? club.location ?? '미등록',
    serviceRegion: club.serviceRegion,
    ownerUniqueNo: club.createdBy ?? '-',
    ownerPhone: '미등록',
    memberCurrent: club.memberCount ?? 0,
    memberLimit: club.memberLimit ?? 100,
    memberActive: club.memberCount ?? 0,
    memberPending: 0,
    reports: club.reports ?? 0,
    createdAt: String(club.createdAt ?? '').slice(0, 10) || '-',
  };
}

export function AdminClubsPage() {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('전체');
  const [regionFilter, setRegionFilter] = useState('전체');
  const [clubs, setClubs] = useState(adminClubs);
  const [modal, setModal] = useState(null);

  useEffect(() => {
    adminApi.getClubs().then((list) => {
      if (Array.isArray(list) && list.length > 0) setClubs(list.map(mapApiClub));
    }).catch(() => {});
  }, []);

  const visibleClubs = useMemo(() => {
    const q = query.trim().toLowerCase();
    return clubs.filter((club) => {
      const matched = !q || club.name.toLowerCase().includes(q) || club.owner.toLowerCase().includes(q) || club.id.toLowerCase().includes(q);
      const statusMatched = filter === '전체' || club.status === filter;
      const regionMatched = matchesRegion(club, regionFilter);
      return matched && statusMatched && regionMatched;
    });
  }, [clubs, query, filter, regionFilter]);

  const requestClubStatus = (club, nextStatus) => {
    const label = nextStatus === '승인' ? '승인 확인' : '해제';
    setModal({
      type: 'confirm',
      title: `클럽 ${label}`,
      message: `'${club.name}' 클럽을 ${label} 처리할까요?`,
      confirmLabel: label,
      onConfirm: async () => {
        setClubs((prev) => prev.map((item) => item.id === club.id ? { ...item, status: '승인' } : item));
        await adminApi.updateClubStatus(club.id, statusToApi[nextStatus]).catch(() => {});
      },
    });
  };

  const scopedClubs = clubs.filter((club) => matchesRegion(club, regionFilter));
  const pendingCount = scopedClubs.filter((club) => club.status === '대기').length;
  const activeCount = scopedClubs.filter((club) => club.status === '승인').length;
  const stoppedCount = scopedClubs.filter((club) => club.status === '중지').length;
  const memberCount = scopedClubs.reduce((sum, club) => sum + club.memberCurrent, 0);

  return (
    <div>
      <div className={s.pageHeader}>
        <div>
          <p className={s.eyebrow}>CLUB MANAGEMENT</p>
          <h1 className={s.pageTitle}>클럽 관리</h1>
          <p className={s.pageDesc}>운영 지역별 클럽 상태, 운영자 상세, 가입 인원 정보를 확인하고 승인 처리를 진행합니다.</p>
        </div>
        <button className={s.primaryBtn} onClick={() => setFilter('대기')}><CheckCircle2 size={16} /> 승인 대기 보기</button>
      </div>

      <div className={s.filterRow} style={{ marginBottom: 14 }}>
        {REGION_OPTIONS.map((item) => (
          <button key={item} className={`${s.filterBtn} ${regionFilter === item ? s.filterActive : ''}`} onClick={() => setRegionFilter(item)}>{item}</button>
        ))}
      </div>

      <div className={s.statGrid}>
        <Metric label="승인 대기" value={`${pendingCount}건`} />
        <Metric label="활성 클럽" value={`${activeCount}개`} />
        <Metric label="중지 클럽" value={`${stoppedCount}개`} />
        <Metric label="전체 가입 인원" value={`${memberCount.toLocaleString()}명`} />
      </div>

      <section className={s.card}>
        <div className={s.searchBar}><div className={s.searchWrap}><Search size={16} className={s.searchIcon} /><input className={s.searchInput} placeholder="클럽ID, 클럽명, 운영자 검색" value={query} onChange={(e) => setQuery(e.target.value)} /></div></div>
        <div className={s.filterRow}>{filters.map((item) => <button key={item} className={`${s.filterBtn} ${filter === item ? s.filterActive : ''}`} onClick={() => setFilter(item)}>{item}</button>)}</div>
        <div className={s.tableWrap}>
          <table className={s.table}>
            <thead><tr><th>클럽ID</th><th>클럽명</th><th>상태</th><th>카테고리</th><th>운영자</th><th>상세</th><th>가입인원</th><th>신고</th><th>액션</th></tr></thead>
            <tbody>
              {visibleClubs.map((club) => (
                <tr key={club.id}>
                  <td>{club.id}</td>
                  <td><strong>{club.name}</strong><p className={s.itemMeta}>{club.createdAt} 개설</p></td>
                  <td><span className={`${s.badge} ${statusClass(club.status)}`}>{club.status}</span></td>
                  <td>{club.category}</td>
                  <td><strong>{club.owner}</strong><button className={s.inlineLink} onClick={() => setModal({ type: 'owner', club })}>상세</button></td>
                  <td><button className={s.smallBtn} onClick={() => setModal({ type: 'club', club })}>상세</button></td>
                  <td><strong>{club.memberCurrent}/{club.memberLimit}명</strong><button className={s.inlineLink} onClick={() => setModal({ type: 'members', club })}>정보</button></td>
                  <td>{club.reports}건</td>
                  <td>
                    {club.status === '대기' && <button className={s.approveBtn} onClick={() => requestClubStatus(club, '승인')}>승인 확인</button>}
                    {club.status === '중지' && <button className={s.approveBtn} onClick={() => requestClubStatus(club, '해제')}>해제</button>}
                    {club.status === '승인' && <span className={`${s.badge} ${s.badgeGray}`}>처리 완료</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {modal?.type === 'confirm' && <InfoModal title={modal.title} onClose={() => setModal(null)}><p className={s.itemMeta}>{modal.message}</p><div className={s.modalFooter}><button className={s.ghostBtn} onClick={() => setModal(null)}>취소</button><button className={s.primaryBtn} onClick={async () => { await modal.onConfirm(); setModal(null); }}>{modal.confirmLabel}</button></div></InfoModal>}
      {modal?.type === 'owner' && <InfoModal title="운영자 상세" onClose={() => setModal(null)}><div className={s.detailGrid}><Detail label="운영자" value={modal.club.owner} /><Detail label="회원ID" value={modal.club.ownerId} /><Detail label="고유번호" value={modal.club.ownerUniqueNo} /><Detail label="운영 지역" value={modal.club.serviceRegion ?? '미등록'} /><Detail label="상세 지역" value={modal.club.ownerRegion} /><Detail label="연락처" value={modal.club.ownerPhone} /></div></InfoModal>}
      {modal?.type === 'club' && <InfoModal title="클럽 상세" onClose={() => setModal(null)}><div className={s.detailGrid}><Detail label="클럽ID" value={modal.club.id} /><Detail label="클럽명" value={modal.club.name} /><Detail label="상태" value={modal.club.status} /><Detail label="카테고리" value={modal.club.category} /><Detail label="개설일" value={modal.club.createdAt} /><Detail label="신고" value={`${modal.club.reports}건`} /></div></InfoModal>}
      {modal?.type === 'members' && <InfoModal title="가입 인원 정보" onClose={() => setModal(null)}><div className={s.detailGrid}><Detail label="정원" value={`${modal.club.memberLimit}명`} /><Detail label="현재 가입" value={`${modal.club.memberCurrent}명`} /><Detail label="활성 회원" value={`${modal.club.memberActive}명`} /><Detail label="가입 대기" value={`${modal.club.memberPending}명`} /></div></InfoModal>}
    </div>
  );
}

function Metric({ label, value }) {
  return <div className={s.statCard}><p className={s.statNum}>{value}</p><p className={s.statLabel}>{label}</p></div>;
}

function Detail({ label, value }) {
  return <div className={s.detailItem}><span>{label}</span><strong>{value}</strong></div>;
}

function InfoModal({ title, children, onClose }) {
  return <div className={s.modalBackdrop} role="presentation"><div className={s.modal} role="dialog" aria-modal="true"><div className={s.modalHeader}><h2 className={s.modalTitle}>{title}</h2><button className={s.iconBtn} onClick={onClose} aria-label="닫기">×</button></div><div className={s.modalBody}>{children}</div></div></div>;
}

function statusClass(status) {
  if (status === '승인') return s.badgeGreen;
  if (status === '대기') return s.badgeOrange;
  if (status === '중지') return s.badgeRed;
  return s.badgeGray;
}
