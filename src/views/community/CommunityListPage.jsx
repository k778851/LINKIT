'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus } from 'lucide-react';
import { useCommunityStore } from '../../store/communityStore';
import { Chip } from '../../components/common/Chip';
import { PostCard } from '../../components/community/PostCard';
import { FAB } from '../../components/common/FAB';
import { EmptyState } from '../../components/common/EmptyState';
import { PostCardSkeleton } from '../../components/common/SkeletonList';
import styles from './CommunityListPage.module.css';

const CATEGORIES = ['전체', '인기', '일상', '질문', '모임', '나눔', '생활정보'];

export function CommunityListPage() {
  const router = useRouter();
  const { selectedCategory, setCategory, getFilteredPosts, fetchPosts } = useCommunityStore();
  const posts = getFilteredPosts();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetchPosts(selectedCategory)
      .catch(() => {})
      .finally(() => setLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCategory]);

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>커뮤니티</h1>
      </header>

      <div className={`${styles.chipRow} hide-scrollbar`}>
        {CATEGORIES.map((cat) => (
          <Chip key={cat} active={selectedCategory === cat} onClick={() => setCategory(cat)}>
            {cat}
          </Chip>
        ))}
      </div>

      <div className={styles.list}>
        {loading
          ? Array.from({ length: 5 }).map((_, i) => <PostCardSkeleton key={i} />)
          : posts.length === 0
            ? <EmptyState
                emoji="📭"
                title="게시글이 없어요"
                description="첫 번째 글을 작성해 보세요!"
                action={
                  <button
                    onClick={() => router.push('/community/new')}
                    style={{
                      marginTop: 4, padding: '10px 24px', borderRadius: 999,
                      background: 'var(--blue)', color: '#fff',
                      fontSize: 14, fontWeight: 700,
                    }}
                  >
                    글쓰기
                  </button>
                }
              />
            : posts.map((post, idx) => (
                <div
                  key={post.id}
                  className="card-animate"
                  style={{ animationDelay: `${Math.min(idx * 40, 280)}ms` }}
                >
                  <PostCard post={post} onClick={() => router.push(`/community/${post.id}`)} />
                </div>
              ))
        }
      </div>

      <div style={{ height: 88 }} />
      <FAB
        label="글쓰기"
        icon={<Plus size={16} />}
        onClick={() => router.push('/community/new')}
      />
    </div>
  );
}
