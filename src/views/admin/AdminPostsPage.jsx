'use client';

import { useEffect, useState, useCallback } from 'react';
import { Search, Trash2, Eye, Heart, MessageCircle } from 'lucide-react';
import { adminApi } from '../../api/adminApi';
import { tokenStorage } from '../../api/apiClient';
import { useCommunityStore } from '../../store/communityStore';
import { Modal } from '../../components/common/Modal';
import { useToastContext } from '../../context/ToastContext';
import { formatRelativeTime } from '../../utils/formatDate';
import s from './admin.module.css';

export function AdminPostsPage() {
  const { showToast } = useToastContext();
  const localPosts    = useCommunityStore((st) => st.posts);
  const deleteLocal   = useCommunityStore((st) => st.deletePost);

  const [posts,   setPosts]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [query,   setQuery]   = useState('');
  const [pendingDelete, setPendingDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async (q = '') => {
    setLoading(true);
    if (!tokenStorage.get()) {
      const q2 = q.toLowerCase();
      setPosts(localPosts
        .filter((p) => !q2 || p.title.toLowerCase().includes(q2) || p.content.toLowerCase().includes(q2))
        .map((p) => ({ id: p.id, category: p.category, title: p.title, authorId: p.authorId, likeCount: p.likeCount, commentCount: p.commentCount, viewCount: p.viewCount, createdAt: p.createdAt }))
      );
      setLoading(false);
      return;
    }
    try {
      const data = await adminApi.getPosts(q);
      setPosts(data);
    } catch {
      const q2 = q.toLowerCase();
      setPosts(localPosts
        .filter((p) => !q2 || p.title.toLowerCase().includes(q2) || p.content.toLowerCase().includes(q2))
        .map((p) => ({ id: p.id, category: p.category, title: p.title, authorId: p.authorId, likeCount: p.likeCount, commentCount: p.commentCount, viewCount: p.viewCount, createdAt: p.createdAt }))
      );
    } finally {
      setLoading(false);
    }
  }, [localPosts]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    const t = setTimeout(() => load(query), 350);
    return () => clearTimeout(t);
  }, [query, load]);

  const handleDelete = async () => {
    if (!pendingDelete || deleting) return;
    setDeleting(true);
    try {
      await adminApi.deletePost(pendingDelete.id);
      setPosts((prev) => prev.filter((p) => p.id !== pendingDelete.id));
      await deleteLocal(pendingDelete.id); // 로컬 스토어도 동기화
      showToast('게시글을 삭제했어요.', 'success');
    } catch (e) {
      showToast(e?.message ?? '삭제에 실패했어요.', 'error');
    } finally {
      setDeleting(false);
      setPendingDelete(null);
    }
  };

  const BADGE_COLOR = {
    '일상': s.badgeGray, '질문': s.badgeBlue, '모임': s.badgeGreen,
    '나눔': s.badgeOrange, '생활정보': s.badgeBlue,
  };

  return (
    <div>
      {pendingDelete && (
        <Modal
          title="게시글 삭제"
          message={`"${pendingDelete.title}" 게시글을 삭제할까요? 댓글도 함께 삭제돼요.`}
          confirmLabel="삭제" cancelLabel="취소" danger
          onConfirm={handleDelete}
          onCancel={() => setPendingDelete(null)}
        />
      )}

      <div className={s.pageHeader}>
        <p className={s.pageTitle}>게시글 관리</p>
        <p className={s.pageDesc}>전체 {posts.length}개</p>
      </div>

      <div className={s.card}>
        <div className={s.searchBar}>
          <div className={s.searchWrap}>
            <Search size={16} className={s.searchIcon} />
            <input className={s.searchInput} placeholder="제목·내용 검색..."
              value={query} onChange={(e) => setQuery(e.target.value)} />
          </div>
        </div>

        {loading ? <p className={s.loading}>불러오는 중...</p> : (
          <div className={s.tableWrap}>
            <table className={s.table}>
              <thead>
                <tr>
                  <th>카테고리</th><th>제목</th><th>작성자</th>
                  <th>통계</th><th>등록일</th><th></th>
                </tr>
              </thead>
              <tbody>
                {posts.length === 0 && (
                  <tr><td colSpan={6}><p className={s.empty}>검색 결과가 없어요</p></td></tr>
                )}
                {posts.map((p) => (
                  <tr key={p.id}>
                    <td>
                      <span className={`${s.badge} ${BADGE_COLOR[p.category] ?? s.badgeGray}`}>
                        {p.category}
                      </span>
                    </td>
                    <td style={{ maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {p.title}
                    </td>
                    <td style={{ color: '#888', fontSize: 13 }}>{p.authorId}</td>
                    <td>
                      <span style={{ display: 'flex', gap: 10, fontSize: 12, color: '#888', alignItems: 'center' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                          <Heart size={11} /> {p.likeCount}
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                          <MessageCircle size={11} /> {p.commentCount}
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                          <Eye size={11} /> {p.viewCount}
                        </span>
                      </span>
                    </td>
                    <td style={{ color: '#aaa', fontSize: 12 }}>
                      {p.createdAt ? formatRelativeTime(p.createdAt) : '-'}
                    </td>
                    <td>
                      <button className={s.deleteBtn} onClick={() => setPendingDelete(p)}>
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
    </div>
  );
}
