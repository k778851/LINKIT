'use client';
import { PostEditPage } from '../../../../../views/community/PostEditPage';

export default function Page({ params }) {
  return <PostEditPage postId={params.postId} />;
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
