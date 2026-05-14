'use client';

import { Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import { adminPosts, reportInbox } from './adminDemoData';
import s from './admin.module.css';

const filters = ['전체', '정상', '검토', '숨김'];

export function AdminPostsPage() {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('전체');
  const [posts, setPosts] = useState(adminPosts);
  const [selectedReport, setSelectedReport] = useState(null);

  const visiblePosts = useMemo(() => {
    const q = query.trim().toLowerCase();
    return posts.filter((post) => {
      const matched = !q || post.title.toLowerCase().includes(q) || post.author.toLowerCase().includes(q);
      const statusMatched = filter === '전체' || post.status === filter;
      return matched && statusMatched;
    });
  }, [posts, query, filter]);

  const updatePostStatus = (id, status) => {
    setPosts((prev) => prev.map((post) => post.id === id ? { ...post, status } : post));
  };

  return (
    <div>
      <div className={s.pageHeader}>
        <div>
          <p className={s.eyebrow}>COMMUNITY & REPORTS</p>
          <h1 className={s.pageTitle}>커뮤니티 · 신고 관리</h1>
          <p className={s.pageDesc}>신고된 게시글과 댓글 내용을 확인하고 숨김 또는 반려 처리를 진행합니다.</p>
        </div>
      </div>

      <div className={s.statGrid}>
        <Metric label="전체 게시글" value="1,234" />
        <Metric label="신고 접수" value={`${reportInbox.length}건`} />
        <Metric label="검토 중" value={`${posts.filter((post) => post.status === '검토').length}건`} />
        <Metric label="숨김 처리" value={`${posts.filter((post) => post.status === '숨김').length}건`} />
      </div>

      <div className={s.grid2}>
        <section className={s.card}>
          <p className={s.cardTitle}>게시글 · 댓글 목록</p>
          <div className={s.searchBar}>
            <div className={s.searchWrap}>
              <Search size={16} className={s.searchIcon} />
              <input className={s.searchInput} placeholder="작성자, 제목 검색" value={query} onChange={(e) => setQuery(e.target.value)} />
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
                  <th>ID</th>
                  <th>작성자</th>
                  <th>카테고리</th>
                  <th>제목</th>
                  <th>신고</th>
                  <th>상태</th>
                  <th>작성일</th>
                  <th>액션</th>
                </tr>
              </thead>
              <tbody>
                {visiblePosts.map((post) => (
                  <tr key={post.id}>
                    <td>{post.id}</td>
                    <td>{post.author}</td>
                    <td><span className={`${s.badge} ${s.badgeBlue}`}>{post.category}</span></td>
                    <td><strong>{post.title}</strong></td>
                    <td>{post.reports}</td>
                    <td><span className={`${s.badge} ${statusClass(post.status)}`}>{post.status}</span></td>
                    <td>{post.createdAt}</td>
                    <td>
                      <button className={s.smallBtn} onClick={() => setSelectedReport(post)}>신고 내용</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <aside>
          <section className={s.card}>
            <p className={s.cardTitle}>신고 접수함 <span className={s.sectionNote}>{reportInbox.length}건</span></p>
            <div className={s.queueList}>
              {reportInbox.map((item) => (
                <button key={item.title} className={s.queueItem} onClick={() => setSelectedReport(item)}>
                  <div>
                    <p className={s.itemTitle}>{item.title}</p>
                    <p className={s.itemMeta}>{item.time} · {item.reason}</p>
                  </div>
                  <span className={`${s.badge} ${item.severity === '높음' ? s.badgeRed : s.badgeOrange}`}>{item.severity}</span>
                </button>
              ))}
            </div>
          </section>
        </aside>
      </div>

      {selectedReport && (
        <div className={s.modalBackdrop} role="presentation">
          <div className={s.modal} role="dialog" aria-modal="true">
            <div className={s.modalHeader}>
              <h2 className={s.modalTitle}>신고 내용 확인</h2>
              <button className={s.iconBtn} onClick={() => setSelectedReport(null)} aria-label="닫기">×</button>
            </div>
            <div className={s.modalBody}>
              <div className={s.detailGrid}>
                <Detail label="대상" value={selectedReport.targetTitle ?? selectedReport.title} />
                <Detail label="작성자" value={selectedReport.targetAuthor ?? selectedReport.author} />
                <Detail label="신고 사유" value={selectedReport.reason ?? selectedReport.reportReason} />
                <Detail label="신고자" value={selectedReport.reporter ?? '-'} />
              </div>
              <div className={s.textPanel}>{selectedReport.content}</div>
              {selectedReport.id && (
                <div className={s.modalFooter}>
                  <button className={s.ghostBtn} onClick={() => { updatePostStatus(selectedReport.id, '정상'); setSelectedReport(null); }}>신고 반려</button>
                  <button className={s.primaryBtn} onClick={() => { updatePostStatus(selectedReport.id, '숨김'); setSelectedReport(null); }}>게시글 숨김</button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
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

function Detail({ label, value }) {
  return (
    <div className={s.detailItem}>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function statusClass(status) {
  if (status === '정상') return s.badgeGreen;
  if (status === '검토') return s.badgeOrange;
  if (status === '숨김') return s.badgeRed;
  return s.badgeGray;
}
