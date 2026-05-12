import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { samplePosts, sampleComments, sampleClubPosts } from '../data/sampleData';
import { useNotificationStore } from './notificationStore';
import { postApi } from '../api/postApi';
import { clubApi } from '../api/clubApi';
import { ApiError } from '../api/apiClient';
import { getPostDetailPath } from '../lib/communityRoutes';

/** 백엔드 미연결 or 미인증 상태 — 로컬 fallback 허용 */
const shouldFallback = (e) =>
  e instanceof ApiError && (e.status === 0 || e.status === 401 || e.status === 403);

export const useCommunityStore = create(
  persist(
    (set, get) => ({
      posts:            samplePosts,
      comments:         sampleComments,
      clubPosts:        sampleClubPosts,
      likedClubPosts:   [],
      selectedCategory: '전체',
      likedPosts:       [],

      setCategory: (category) => set({ selectedCategory: category }),

      /* ── API: 게시글 목록 로드 ────────────────────────── */
      fetchPosts: async (category) => {
        const cat = category ?? get().selectedCategory;
        try {
          const posts = await postApi.getAll(cat);
          // 백엔드 DB가 비어 있으면 sampleData 유지
          if (posts && posts.length > 0) set({ posts });
        } catch (e) {
          if (!shouldFallback(e)) throw e;
          // 오프라인/미인증 → sampleData 유지
        }
      },

      getFilteredPosts: () => {
        const { posts, selectedCategory } = get();
        if (selectedCategory === '전체') return posts;
        if (selectedCategory === '인기') return [...posts].sort((a, b) => b.likeCount - a.likeCount);
        return posts.filter((p) => p.category === selectedCategory);
      },

      getPostById:         (id)     => get().posts.find((p) => p.id === id),
      getCommentsByPostId: (postId) => get().comments.filter((c) => c.postId === postId),

      /* ── API: 게시글 작성 ─────────────────────────────── */
      addPost: async (post) => {
        try {
          const created = await postApi.create(post);
          set((s) => ({ posts: [created, ...s.posts] }));
          return created;
        } catch (e) {
          if (shouldFallback(e)) {
            const localPost = {
              ...post,
              id: `post-${Date.now()}`,
              viewCount: 0, likeCount: 0, commentCount: 0,
              createdAt: new Date().toISOString(),
            };
            set((s) => ({ posts: [localPost, ...s.posts] }));
            return localPost;
          }
          throw e;
        }
      },

      /* ── API: 좋아요 토글 ─────────────────────────────── */
      toggleLike: (postId) =>
        set((s) => {
          const liked = s.likedPosts.includes(postId);
          const delta = liked ? -1 : 1;

          if (!liked) {
            const post = s.posts.find((p) => p.id === postId);
            if (post && post.authorId !== 'user-me') {
              useNotificationStore.getState().addNotification({
                type: 'like', icon: '❤️',
                title: '내 게시글에 좋아요가 달렸어요',
                body: `"${post.title}"`,
                path: getPostDetailPath(postId),
              });
            }
          }

          // API 호출 (낙관적 업데이트 후 비동기)
          postApi.toggleLike(postId).catch(() => {});

          return {
            likedPosts: liked
              ? s.likedPosts.filter((id) => id !== postId)
              : [...s.likedPosts, postId],
            posts: s.posts.map((p) =>
              p.id === postId ? { ...p, likeCount: p.likeCount + delta } : p
            ),
          };
        }),

      /* ── API: 댓글 등록 ───────────────────────────────── */
      addComment: (comment) =>
        set((s) => {
          const newComment = {
            ...comment,
            id: `c-${Date.now()}`,
            likeCount: 0,
            createdAt: new Date().toISOString(),
          };

          const post = s.posts.find((p) => p.id === comment.postId);
          if (post && post.authorId === 'user-me' && comment.authorId !== 'user-me') {
            useNotificationStore.getState().addNotification({
              type: 'comment', icon: '💬',
              title: '내 게시글에 댓글이 달렸어요',
              body: `${comment.authorNickname}: ${comment.content.slice(0, 30)}`,
              path: getPostDetailPath(comment.postId),
            });
          }

          // API 호출 (비동기)
          postApi.addComment(comment.postId, { content: comment.content }).catch(() => {});

          return {
            comments: [...s.comments, newComment],
            posts: s.posts.map((p) =>
              p.id === comment.postId ? { ...p, commentCount: p.commentCount + 1 } : p
            ),
          };
        }),

      incrementView: (postId) =>
        set((s) => ({
          posts: s.posts.map((p) =>
            p.id === postId ? { ...p, viewCount: p.viewCount + 1 } : p
          ),
        })),

      /* ── API: 게시글 수정 ─────────────────────────────── */
      updatePost: async (postId, patch) => {
        try {
          const updated = await postApi.update(postId, patch);
          set((s) => ({ posts: s.posts.map((p) => p.id === postId ? updated : p) }));
        } catch (e) {
          if (shouldFallback(e)) {
            set((s) => ({ posts: s.posts.map((p) => p.id === postId ? { ...p, ...patch } : p) }));
          } else throw e;
        }
      },

      /* ── API: 게시글 삭제 ─────────────────────────────── */
      deletePost: async (postId) => {
        try {
          await postApi.remove(postId);
        } catch (e) {
          if (!shouldFallback(e)) throw e;
        }
        set((s) => ({
          posts:     s.posts.filter((p) => p.id !== postId),
          comments:  s.comments.filter((c) => c.postId !== postId),
          likedPosts: s.likedPosts.filter((id) => id !== postId),
        }));
      },

      getMyPosts: (userId) => get().posts.filter((p) => p.authorId === userId),

      /* ── 클럽 게시판 ──────────────────────────────────── */
      getClubPosts:    (clubId) => get().clubPosts.filter((p) => p.clubId === clubId),
      getClubPostById: (id)     => get().clubPosts.find((p) => p.id === id),

      fetchClubPosts: async (clubId) => {
        try {
          const posts = await clubApi.getPosts(clubId);
          set((s) => ({
            clubPosts: [
              ...s.clubPosts.filter((p) => p.clubId !== clubId),
              ...posts,
            ],
          }));
        } catch (e) {
          if (!shouldFallback(e)) throw e;
        }
      },

      addClubPost: async (post) => {
        try {
          const created = await clubApi.createPost(post.clubId, post);
          set((s) => ({ clubPosts: [created, ...s.clubPosts] }));
          return created;
        } catch (e) {
          if (shouldFallback(e)) {
            const local = {
              ...post,
              id: `cp-${Date.now()}`,
              likeCount: 0, commentCount: 0, viewCount: 0,
              createdAt: new Date().toISOString(),
            };
            set((s) => ({ clubPosts: [local, ...s.clubPosts] }));
            return local;
          }
          throw e;
        }
      },

      toggleClubPostLike: (postId) =>
        set((s) => {
          const liked = s.likedClubPosts.includes(postId);
          return {
            likedClubPosts: liked
              ? s.likedClubPosts.filter((id) => id !== postId)
              : [...s.likedClubPosts, postId],
            clubPosts: s.clubPosts.map((p) =>
              p.id === postId ? { ...p, likeCount: p.likeCount + (liked ? -1 : 1) } : p
            ),
          };
        }),

      addClubComment: (comment) =>
        set((s) => ({
          comments: [
            ...s.comments,
            { ...comment, id: `cc-${Date.now()}`, likeCount: 0, createdAt: new Date().toISOString() },
          ],
          clubPosts: s.clubPosts.map((p) =>
            p.id === comment.postId ? { ...p, commentCount: p.commentCount + 1 } : p
          ),
        })),
    }),
    {
      name: 'linkit-posts',
      merge: (persisted, initial) => ({
        ...initial,
        ...persisted,
        // 사용자 작성 게시글 유지 + samplePosts 항상 포함
        posts: (() => {
          const sampleIds = new Set(initial.posts.map((p) => p.id));
          const userPosts = (persisted.posts ?? []).filter((p) => !sampleIds.has(p.id));
          return [...initial.posts, ...userPosts];
        })(),
        comments: persisted.comments?.length > 0 ? persisted.comments : initial.comments,
      }),
    }
  )
);
