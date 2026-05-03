'use client';

import { useRouter } from 'next/navigation';
import { Plus } from 'lucide-react';
import { useCommunityStore } from '../../store/communityStore';
import { Chip } from '../../components/common/Chip';
import { PostCard } from '../../components/community/PostCard';
import { FAB } from '../../components/common/FAB';
import { EmptyState } from '../../components/common/EmptyState';
import styles from './CommunityListPage.module.css';

const CATEGORIES = ['전체', '인기', '일상', '질문', '모임', '나눔', '생활정보'];

export function CommunityListPage() {
  const router = useRouter();
  const { selectedCategory, setCategory, getFilteredPosts } = useCommunityStore();
  const posts = getFilteredPosts();

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
        {posts.length === 0
          ? <EmptyState emoji="📭" title="게시글이 없어요" description="첫 번째 글을 작성해 보세요!" />
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

      <FAB
        label="글쓰기"
        icon={<Plus size={16} />}
        onClick={() => router.push('/community/new')}
      />
    </div>
  );
}
