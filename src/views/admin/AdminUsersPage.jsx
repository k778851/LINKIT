'use client';

import { useEffect, useState, useCallback } from 'react';
import { Search, Trash2 } from 'lucide-react';
import { adminApi } from '../../api/adminApi';
import { tokenStorage } from '../../api/apiClient';
import { useAuthStore } from '../../store/authStore';
import { Modal } from '../../components/common/Modal';
import { useToastContext } from '../../context/ToastContext';
import { formatRelativeTime } from '../../utils/formatDate';
import { defaultUser, SAMPLE_USERS } from '../../data/sampleData';
import s from './admin.module.css';

/* 로컬 fallback 유저 목록 */
const LOCAL_USERS = [
  { id: 'user-me', ...defaultUser, role: 'USER', joinedClubsCount: 2 },
  ...Object.entries(SAMPLE_USERS).map(([id, u]) => ({
    id, nickname: u.nickname, handle: id, role: 'USER', joinedClubsCount: 1, createdAt: null,
  })),
];

export function AdminUsersPage() {
  const { showToast } = useToastContext();
  const currentUser   = useAuthStore((s) => s.user);

  const [users,   setUsers]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [query,   setQuery]   = useState('');
  const [pendingDelete, setPendingDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async (q = '') => {
    setLoading(true);
    if (!tokenStorage.get()) {
      const q2 = q.toLowerCase();
      setUsers(LOCAL_USERS.filter((u) =>
        !q2 || u.nickname.toLowerCase().includes(q2) || u.handle.toLowerCase().includes(q2)
      ));
      setLoading(false);
      return;
    }
    try {
      const data = await adminApi.getUsers(q);
      setUsers(data);
    } catch {
      const q2 = q.toLowerCase();
      setUsers(LOCAL_USERS.filter((u) =>
        !q2 || u.nickname.toLowerCase().includes(q2) || u.handle.toLowerCase().includes(q2)
      ));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  /* 디바운스 검색 */
  useEffect(() => {
    const t = setTimeout(() => load(query), 350);
    return () => clearTimeout(t);
  }, [query, load]);

  const handleDelete = async () => {
    if (!pendingDelete || deleting) return;
    setDeleting(true);
    try {
      await adminApi.deleteUser(pendingDelete.id);
      setUsers((prev) => prev.filter((u) => u.id !== pendingDelete.id));
      showToast(`${pendingDelete.nickname} 유저를 삭제했어요.`, 'success');
    } catch (e) {
      showToast(e?.message ?? '삭제에 실패했어요.', 'error');
    } finally {
      setDeleting(false);
      setPendingDelete(null);
    }
  };

  return (
    <div>
      {pendingDelete && (
        <Modal
          title="유저 삭제"
          message={`"${pendingDelete.nickname}" 유저를 삭제할까요? 되돌릴 수 없어요.`}
          confirmLabel="삭제" cancelLabel="취소" danger
          onConfirm={handleDelete}
          onCancel={() => setPendingDelete(null)}
        />
      )}

      <div className={s.pageHeader}>
        <p className={s.pageTitle}>유저 관리</p>
        <p className={s.pageDesc}>전체 {users.length}명</p>
      </div>

      <div className={s.card}>
        {/* 검색 */}
        <div className={s.searchBar}>
          <div className={s.searchWrap}>
            <Search size={16} className={s.searchIcon} />
            <input className={s.searchInput} placeholder="닉네임·아이디 검색..."
              value={query} onChange={(e) => setQuery(e.target.value)} />
          </div>
        </div>

        {loading ? <p className={s.loading}>불러오는 중...</p> : (
          <div className={s.tableWrap}>
            <table className={s.table}>
              <thead>
                <tr>
                  <th>유저</th><th>아이디</th><th>역할</th>
                  <th>참여 클럽</th><th>가입일</th><th></th>
                </tr>
              </thead>
              <tbody>
                {users.length === 0 && (
                  <tr><td colSpan={6}><p className={s.empty}>검색 결과가 없어요</p></td></tr>
                )}
                {users.map((u) => {
                  const isSelf = u.id === currentUser?.id;
                  return (
                    <tr key={u.id}>
                      <td>{u.nickname}</td>
                      <td style={{ color: '#888', fontSize: 13 }}>@{u.handle}</td>
                      <td>
                        <span className={`${s.badge} ${u.role === 'ADMIN' ? s.badgeRed : s.badgeGray}`}>
                          {u.role === 'ADMIN' ? '관리자' : '일반'}
                        </span>
                      </td>
                      <td>{u.joinedClubsCount ?? 0}개</td>
                      <td style={{ color: '#aaa', fontSize: 12 }}>
                        {u.createdAt ? formatRelativeTime(u.createdAt) : '-'}
                      </td>
                      <td>
                        {!isSelf && u.role !== 'ADMIN' && (
                          <button className={s.deleteBtn}
                            onClick={() => setPendingDelete(u)}>
                            <Trash2 size={13} /> 삭제
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
