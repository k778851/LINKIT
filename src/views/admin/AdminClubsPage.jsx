'use client';

import { useEffect, useState, useCallback } from 'react';
import { Search, Trash2, CheckCircle, XCircle } from 'lucide-react';
import { adminApi } from '../../api/adminApi';
import { tokenStorage } from '../../api/apiClient';
import { useClubStore } from '../../store/clubStore';
import { Modal } from '../../components/common/Modal';
import { useToastContext } from '../../context/ToastContext';
import { formatRelativeTime } from '../../utils/formatDate';
import s from './admin.module.css';

export function AdminClubsPage() {
  const { showToast } = useToastContext();
  const localClubs    = useClubStore((st) => st.clubs);
  const pendingClubs  = useClubStore((st) => st.pendingClubs);
  const approveClub   = useClubStore((st) => st.approveClub);
  const rejectClub    = useClubStore((st) => st.rejectClub);

  const [tab,     setTab]     = useState('active'); // 'pending' | 'active'
  const [clubs,   setClubs]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [query,   setQuery]   = useState('');
  const [pendingDelete, setPendingDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async (q = '') => {
    setLoading(true);
    if (!tokenStorage.get()) {
      const q2 = q.toLowerCase();
      setClubs(localClubs.filter((c) =>
        !q2 || c.name.toLowerCase().includes(q2) || c.category?.toLowerCase().includes(q2)
      ));
      setLoading(false);
      return;
    }
    try {
      const data = await adminApi.getClubs(q);
      setClubs(data);
    } catch {
      const q2 = q.toLowerCase();
      setClubs(localClubs.filter((c) =>
        !q2 || c.name.toLowerCase().includes(q2) || c.category?.toLowerCase().includes(q2)
      ));
    } finally {
      setLoading(false);
    }
  }, [localClubs]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    const t = setTimeout(() => load(query), 350);
    return () => clearTimeout(t);
  }, [query, load]);

  const handleDelete = async () => {
    if (!pendingDelete || deleting) return;
    setDeleting(true);
    try {
      await adminApi.deleteClub(pendingDelete.id);
      setClubs((prev) => prev.filter((c) => c.id !== pendingDelete.id));
      showToast(`${pendingDelete.name} 클럽을 삭제했어요.`, 'success');
    } catch (e) {
      showToast(e?.message ?? '삭제에 실패했어요.', 'error');
    } finally {
      setDeleting(false);
      setPendingDelete(null);
    }
  };

  const handleApprove = (club) => {
    approveClub(club.id);
    showToast(`"${club.name}" 클럽을 승인했어요 ✅`, 'success');
  };

  const handleReject = (club) => {
    rejectClub(club.id);
    showToast(`"${club.name}" 클럽을 반려했어요`, 'info');
  };

  const CATEGORY_COLOR = {
    '운동': s.badgeGreen, '음식': s.badgeOrange, '아트': s.badgeBlue,
    '음악': s.badgeBlue, '스터디': s.badgeGray,
  };

  return (
    <div>
      {pendingDelete && (
        <Modal
          title="클럽 삭제"
          message={`"${pendingDelete.name}" 클럽을 삭제할까요? 멤버 데이터도 함께 삭제돼요.`}
          confirmLabel="삭제" cancelLabel="취소" danger
          onConfirm={handleDelete}
          onCancel={() => setPendingDelete(null)}
        />
      )}

      <div className={s.pageHeader}>
        <p className={s.pageTitle}>클럽 관리</p>
        <p className={s.pageDesc}>
          활성 {clubs.length}개
          {pendingClubs.length > 0 && (
            <span className={s.pendingBadge}> · 승인대기 {pendingClubs.length}개</span>
          )}
        </p>
      </div>

      {/* 탭 */}
      <div className={s.tabRow}>
        <button className={`${s.tabBtn} ${tab === 'active' ? s.tabActive : ''}`} onClick={() => setTab('active')}>
          활성 클럽 ({clubs.length})
        </button>
        <button className={`${s.tabBtn} ${tab === 'pending' ? s.tabActive : ''}`} onClick={() => setTab('pending')}>
          승인 대기 {pendingClubs.length > 0 && <span className={s.tabDot}>{pendingClubs.length}</span>}
        </button>
      </div>

      {/* 승인 대기 탭 */}
      {tab === 'pending' && (
        <div className={s.card}>
          {pendingClubs.length === 0 ? (
            <p className={s.empty}>승인 대기 중인 클럽이 없어요</p>
          ) : (
            <div className={s.tableWrap}>
              <table className={s.table}>
                <thead>
                  <tr>
                    <th>클럽</th><th>카테고리</th><th>신청자</th><th>공개</th><th>신청일</th><th>처리</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingClubs.map((c) => (
                    <tr key={c.id}>
                      <td>
                        <span style={{ fontSize: 18, marginRight: 6 }}>{c.emoji}</span>
                        <strong>{c.name}</strong>
                        {c.description && (
                          <p style={{ fontSize: 11, color: '#aaa', marginTop: 2 }}>
                            {c.description.slice(0, 30)}{c.description.length > 30 ? '…' : ''}
                          </p>
                        )}
                      </td>
                      <td>
                        <span className={`${s.badge} ${CATEGORY_COLOR[c.category] ?? s.badgeGray}`}>
                          {c.category || '-'}
                        </span>
                      </td>
                      <td style={{ fontSize: 12 }}>{c.createdBy ?? '-'}</td>
                      <td>
                        <span className={`${s.badge} ${c.isPrivate ? s.badgeOrange : s.badgeGreen}`}>
                          {c.isPrivate ? '승인제' : '공개'}
                        </span>
                      </td>
                      <td style={{ color: '#aaa', fontSize: 12 }}>
                        {c.appliedAt ? formatRelativeTime(c.appliedAt) : '-'}
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button className={s.approveBtn} onClick={() => handleApprove(c)}>
                            <CheckCircle size={13} /> 승인
                          </button>
                          <button className={s.rejectBtn} onClick={() => handleReject(c)}>
                            <XCircle size={13} /> 반려
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* 활성 클럽 탭 */}
      {tab === 'active' && (
        <div className={s.card}>
          <div className={s.searchBar}>
            <div className={s.searchWrap}>
              <Search size={16} className={s.searchIcon} />
              <input className={s.searchInput} placeholder="클럽명·카테고리 검색..."
                value={query} onChange={(e) => setQuery(e.target.value)} />
            </div>
          </div>

          {loading ? <p className={s.loading}>불러오는 중...</p> : (
            <div className={s.tableWrap}>
              <table className={s.table}>
                <thead>
                  <tr>
                    <th>클럽</th><th>카테고리</th><th>멤버</th>
                    <th>공개</th><th>개설일</th><th></th>
                  </tr>
                </thead>
                <tbody>
                  {clubs.length === 0 && (
                    <tr><td colSpan={6}><p className={s.empty}>검색 결과가 없어요</p></td></tr>
                  )}
                  {clubs.map((c) => (
                    <tr key={c.id}>
                      <td>
                        <span style={{ fontSize: 18, marginRight: 6 }}>{c.emoji}</span>
                        <strong>{c.name}</strong>
                      </td>
                      <td>
                        <span className={`${s.badge} ${CATEGORY_COLOR[c.category] ?? s.badgeGray}`}>
                          {c.category}
                        </span>
                      </td>
                      <td>{(c.memberCount ?? 0).toLocaleString()}명</td>
                      <td>
                        <span className={`${s.badge} ${c.isPrivate ? s.badgeOrange : s.badgeGreen}`}>
                          {c.isPrivate ? '비공개' : '공개'}
                        </span>
                      </td>
                      <td style={{ color: '#aaa', fontSize: 12 }}>
                        {c.createdAt ? formatRelativeTime(c.createdAt) : '-'}
                      </td>
                      <td>
                        <button className={s.deleteBtn} onClick={() => setPendingDelete(c)}>
                          <Trash2 size={13} /> 삭제
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
