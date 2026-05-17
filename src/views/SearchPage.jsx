'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Search, X, Clock, TrendingUp } from 'lucide-react';
import { useClubStore } from '../store/clubStore';
import { useCommunityStore } from '../store/communityStore';
import { useAuthStore } from '../store/authStore';
import { searchApi } from '../api/searchApi';
import { tokenStorage } from '../api/apiClient';
import { CATEGORY_COLORS, SAMPLE_CLUB_IMAGES } from '../data/sampleData';
import { REGION_OPTIONS, matchesRegion } from '../data/regions';
import { isSuperAdmin } from '../utils/permissions';
import { assetPath } from '../lib/assetPath';
import { getPostDetailPath } from '../lib/communityRoutes';
import styles from './SearchPage.module.css';

const TRENDING = ['러닝', '독서모임', '풋살', '맛집탐방', '사진', '밴드'];
const DEBOUNCE_MS = 350;

export function SearchPage() {
  const router = useRouter();
  const inputRef = useRef(null);
  const timerRef = useRef(null);

  const [query, setQuery] = useState('');
  const [tab, setTab] = useState('all');
  const [apiClubs, setApiClubs] = useState(null);
  const [apiPosts, setApiPosts] = useState(null);
  const [searching, setSearching] = useState(false);
  const [recentSearches, setRecentSearches] = useState(
    () => JSON.parse(typeof window !== 'undefined' ? localStorage.getItem('linkit-recent-searches') || '[]' : '[]')
  );

  const clubs = useClubStore((s) => s.clubs);
  const selectedRegion = useClubStore((s) => s.selectedRegion);
  const setRegion = useClubStore((s) => s.setRegion);
  const posts = useCommunityStore((s) => s.posts);
  const user = useAuthStore((s) => s.user);
  const showRegionFilter = isSuperAdmin(user);

  useEffect(() => { inputRef.current?.focus(); }, []);

  const fetchSearch = useCallback(async (q) => {
    if (!q.trim()) { setApiClubs(null); setApiPosts(null); return; }
    if (!tokenStorage.get()) { setApiClubs(null); setApiPosts(null); setSearching(false); return; }
    setSearching(true);
    try {
      const result = await searchApi.search(q.trim());
      setApiClubs(result.clubs ?? []);
      setApiPosts(result.posts ?? []);
    } catch {
      setApiClubs(null);
      setApiPosts(null);
    } finally {
      setSearching(false);
    }
  }, []);

  useEffect(() => {
    clearTimeout(timerRef.current);
    if (!query.trim()) { setApiClubs(null); setApiPosts(null); setSearching(false); return; }
    setSearching(true);
    timerRef.current = setTimeout(() => fetchSearch(query), DEBOUNCE_MS);
    return () => clearTimeout(timerRef.current);
  }, [query, fetchSearch]);

  const q = query.trim().toLowerCase();
  const localClubs = q
    ? clubs.filter(
        (c) => c.name.toLowerCase().includes(q) ||
               c.category?.toLowerCase().includes(q) ||
               c.tags?.some((t) => t.toLowerCase().includes(q))
      )
    : [];
  const localPosts = q
    ? posts.filter(
        (p) => p.title.toLowerCase().includes(q) ||
               p.content.toLowerCase().includes(q) ||
               p.category?.toLowerCase().includes(q)
      )
    : [];

  const matchedClubs = (apiClubs ?? localClubs).filter((club) => matchesRegion(club, selectedRegion));
  const matchedPosts = (apiPosts ?? localPosts).filter((post) => matchesRegion(post, selectedRegion));

  const saveRecent = (term) => {
    const next = [term, ...recentSearches.filter((r) => r !== term)].slice(0, 8);
    setRecentSearches(next);
    localStorage.setItem('linkit-recent-searches', JSON.stringify(next));
  };
  const removeRecent = (term) => {
    const next = recentSearches.filter((r) => r !== term);
    setRecentSearches(next);
    localStorage.setItem('linkit-recent-searches', JSON.stringify(next));
  };
  const handleSearch = (term) => { setQuery(term); saveRecent(term); };
  const handleSubmit = (e) => { e.preventDefault(); if (q) saveRecent(q); };

  const showResults = q.length > 0;

  return (
    <div className={styles.page}>
      <div className={styles.searchBar}>
        <form className={styles.inputWrap} onSubmit={handleSubmit}>
          <Search size={18} color="var(--ink-3)" className={styles.searchIcon} />
          <input
            ref={inputRef}
            className={styles.input}
            placeholder="클럽, 게시글 검색..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          {query && (
            <button type="button" className={styles.clearBtn} onClick={() => setQuery('')}>
              <X size={16} color="var(--ink-4)" />
            </button>
          )}
        </form>
        <button className={styles.cancelBtn} onClick={() => router.back()}>취소</button>
      </div>

      {showRegionFilter && (
        <div className={`${styles.regionRow} hide-scrollbar`}>
          {REGION_OPTIONS.map((region) => (
            <button
              key={region}
              className={`${styles.regionChip} ${selectedRegion === region ? styles.regionChipActive : ''}`}
              onClick={() => setRegion(region)}
            >
              {region}
            </button>
          ))}
        </div>
      )}

      {!showResults ? (
        <div className={styles.body}>
          {recentSearches.length > 0 && (
            <section className={styles.section}>
              <div className={styles.sectionHeader}>
                <span className={styles.sectionTitle}>최근 검색어</span>
                <button className={styles.clearAll} onClick={() => { setRecentSearches([]); localStorage.removeItem('linkit-recent-searches'); }}>전체 삭제</button>
              </div>
              <div className={styles.recentList}>
                {recentSearches.map((term) => (
                  <div key={term} className={styles.recentRow}>
                    <button className={styles.recentTerm} onClick={() => handleSearch(term)}>
                      <Clock size={14} color="var(--ink-4)" />
                      <span>{term}</span>
                    </button>
                    <button className={styles.recentDel} onClick={() => removeRecent(term)}>
                      <X size={13} color="var(--ink-4)" />
                    </button>
                  </div>
                ))}
              </div>
            </section>
          )}

          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <span className={styles.sectionTitle}>인기 검색어</span>
            </div>
            <div className={styles.trendingGrid}>
              {TRENDING.map((term, i) => (
                <button key={term} className={styles.trendingChip} onClick={() => handleSearch(term)}>
                  <span className={styles.trendingRank}>{i + 1}</span>
                  <span>{term}</span>
                  <TrendingUp size={12} color="var(--pink)" />
                </button>
              ))}
            </div>
          </section>
        </div>
      ) : (
        <div className={styles.body}>
          <div className={styles.tabRow}>
            {[
              { id: 'all', label: `전체 ${matchedClubs.length + matchedPosts.length}` },
              { id: 'clubs', label: `클럽 ${matchedClubs.length}` },
              { id: 'posts', label: `게시글 ${matchedPosts.length}` },
            ].map(({ id, label }) => (
              <button
                key={id}
                className={`${styles.tabBtn} ${tab === id ? styles.tabActive : ''}`}
                onClick={() => setTab(id)}
              >
                {label}
              </button>
            ))}
          </div>

          {searching && (
            <div style={{ padding: '8px 0', display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[1, 2, 3, 4].map((i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '4px 0' }}>
                  <div className="skeleton" style={{ width: 48, height: 48, borderRadius: 14, flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <div className="skeleton skeleton-title" style={{ width: `${50 + i * 10}%` }} />
                    <div className="skeleton skeleton-text" style={{ width: '40%' }} />
                  </div>
                </div>
              ))}
            </div>
          )}

          {!searching && matchedClubs.length === 0 && matchedPosts.length === 0 && (
            <div className={styles.empty}>
              <p className={styles.emptyIcon}>🔎</p>
              <p className={styles.emptyTitle}>검색 결과가 없어요</p>
              <p className={styles.emptyDesc}>선택한 지역 또는 다른 검색어로 다시 찾아보세요.</p>
            </div>
          )}

          {!searching && (tab === 'all' || tab === 'clubs') && matchedClubs.length > 0 && (
            <section className={styles.section}>
              {tab === 'all' && <p className={styles.sectionTitle}>클럽</p>}
              {matchedClubs.map((club) => {
                const colors = CATEGORY_COLORS[club.category] ?? ['#8EC6FF', '#0088FF'];
                const coverImage = club.coverImage ?? club.posterImages?.[0] ?? SAMPLE_CLUB_IMAGES[club.id];
                const coverSrc = coverImage?.startsWith('/') ? assetPath(coverImage) : coverImage;
                return (
                  <button
                    key={club.id}
                    className={styles.clubRow}
                    onClick={() => { saveRecent(q); router.push(`/clubs/${club.id}`); }}
                  >
                    <div
                      className={styles.clubEmoji}
                      style={coverSrc
                        ? { backgroundImage: `url("${coverSrc}")`, backgroundSize: 'cover', backgroundPosition: 'center' }
                        : { background: `linear-gradient(135deg,${colors[0]} 0%,${colors[1]} 100%)` }
                      }
                    />
                    <div className={styles.clubInfo}>
                      <p className={styles.clubName}>
                        <Highlight text={club.name} query={q} />
                      </p>
                      <p className={styles.clubMeta}>{club.category} · {(club.memberCount ?? 0).toLocaleString()}명</p>
                    </div>
                    {club.isPrivate && <span className={styles.privateBadge}>비공개</span>}
                  </button>
                );
              })}
            </section>
          )}

          {!searching && (tab === 'all' || tab === 'posts') && matchedPosts.length > 0 && (
            <section className={styles.section}>
              {tab === 'all' && <p className={styles.sectionTitle}>게시글</p>}
              {matchedPosts.map((post) => (
                <button
                  key={post.id}
                  className={styles.postRow}
                  onClick={() => { saveRecent(q); router.push(getPostDetailPath(post.id)); }}
                >
                  <div className={styles.postTop}>
                    <span className={styles.postBadge}>{post.category}</span>
                    <span className={styles.postAuthor}>{post.authorEmoji} {post.authorNickname}</span>
                  </div>
                  <p className={`${styles.postTitle} truncate-1`}>
                    <Highlight text={post.title} query={q} />
                  </p>
                  <p className={`${styles.postPreview} truncate-2`}>{post.content}</p>
                </button>
              ))}
            </section>
          )}
        </div>
      )}
    </div>
  );
}

function Highlight({ text, query }) {
  if (!query || !text) return text ?? '';
  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const parts = text.split(new RegExp(`(${escaped})`, 'gi'));
  return parts.map((part, i) =>
    part.toLowerCase() === query.toLowerCase()
      ? <mark key={i} style={{ background: 'var(--blue-soft)', color: 'var(--blue)', borderRadius: 3, padding: '0 2px' }}>{part}</mark>
      : part
  );
}
