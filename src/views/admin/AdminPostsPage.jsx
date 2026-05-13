'use client';

import { AlertTriangle, Plus, Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import { adminPosts, reportInbox } from './adminDemoData';
import s from './admin.module.css';

const filters = ['전체', '노출', '숨김', '삭제', '대기'];
const initialBannedWords = [
  ['욕설', 12],
  ['비방', 8],
  ['스팸', 5],
  ['광고', 3],
  ['정치', 2],
];

export function AdminPostsPage() {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('전체');
  const [posts, setPosts] = useState(adminPosts);
  const [reports, setReports] = useState(reportInbox);
  const [bannedWords, setBannedWords] = useState(initialBannedWords);

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

  const resolveFirstReport = () => {
    setReports((prev) => prev.slice(1));
    setPosts((prev) => prev.map((post, index) => index === 0 ? { ...post, status: '숨김' } : post));
  };

  const addBannedWord = () => {
    const nextIndex = bannedWords.length + 1;
    setBannedWords((prev) => [...prev, [`운영키워드${nextIndex}`, 0]]);
  };

  return (
    <div>
      <div className={s.pageHeader}>
        <div>
          <p className={s.eyebrow}>COMMUNITY & REPORTS</p>
          <h1 className={s.pageTitle}>커뮤니티 · 신고 관리</h1>
          <p className={s.pageDesc}>게시글·댓글 관리와 신고 접수를 한 화면에서 처리합니다.</p>
        </div>
        <div className={s.headerActions}>
          <button className={s.ghostBtn} onClick={resolveFirstReport}><AlertTriangle size={16} /> 신고 처리</button>
          <button className={s.primaryBtn} onClick={addBannedWord}><Plus size={16} /> 금칙어 추가</button>
        </div>
      </div>

      <div className={s.statGrid}>
        <Metric label="총 게시글" value="1,234" trend="▲ 5.2%" />
        <Metric label="신고 접수" value={String(reports.length)} trend="대기 큐" />
        <Metric label="처리 완료" value={String(45 - reports.length)} trend="즉시 반영" />
        <Metric label="대기 중" value={String(posts.filter((post) => post.status === '대기').length)} trend="평균 15분" />
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
                    <td><span className={`${s.badge} ${post.status === '숨김' ? s.badgeOrange : post.status === '대기' ? s.badgeRed : post.status === '삭제' ? s.badgeGray : s.badgeGreen}`}>{post.status}</span></td>
                    <td>{post.createdAt}</td>
                    <td>
                      <div className={s.actionGroup}>
                        <button className={s.smallBtn} onClick={() => updatePostStatus(post.id, '노출')}>노출</button>
                        <button className={s.rejectBtn} onClick={() => updatePostStatus(post.id, '숨김')}>숨김</button>
                        <button className={s.deleteBtn} onClick={() => updatePostStatus(post.id, '삭제')}>삭제</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <aside>
          <section className={s.card}>
            <p className={s.cardTitle}>신고 접수함 <span className={s.sectionNote}>{reports.length}건</span></p>
            <div className={s.queueList}>
              {reports.length === 0 ? <p className={s.empty}>대기 중인 신고가 없습니다.</p> : reports.map((item) => (
                <div key={item.title} className={s.queueItem}>
                  <div>
                    <p className={s.itemTitle}>{item.title}</p>
                    <p className={s.itemMeta}>{item.time}</p>
                  </div>
                  <span className={`${s.badge} ${item.severity === '높음' ? s.badgeRed : s.badgeOrange}`}>{item.severity}</span>
                </div>
              ))}
            </div>
          </section>
          <section className={s.card}>
            <p className={s.cardTitle}>금칙어 관리</p>
            <div className={s.keywordList}>
              {bannedWords.map(([word, count]) => (
                <div key={word} className={s.keywordItem}>
                  <span className={s.itemTitle}>{word}</span>
                  <span className={s.badge + ' ' + s.badgeGray}>{count}</span>
                </div>
              ))}
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}

function Metric({ label, value, trend }) {
  return (
    <div className={s.statCard}>
      <p className={s.statNum}>{value}</p>
      <p className={s.statLabel}>{label}</p>
      <p className={s.itemMeta}>{trend}</p>
    </div>
  );
}
