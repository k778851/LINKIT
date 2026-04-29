'use client';
import { PostDetailPage } from '../../../../views/community/PostDetailPage';

export default function Page({ params }) {
  return <PostDetailPage postId={params.postId} />;
}

export function generateStaticParams() {
  return [
    { postId: 'post-1' },
    { postId: 'post-2' },
    { postId: 'post-3' },
    { postId: 'post-4' },
    { postId: 'post-5' },
    { postId: 'post-6' },
    { postId: 'post-7' },
    { postId: 'post-8' },
  ];
}
