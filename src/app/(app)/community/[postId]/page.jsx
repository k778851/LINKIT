import { PostDetailPage } from '../../../../views/community/PostDetailPage';

export default function Page({ params }) {
  return <PostDetailPage postId={params.postId} />;
}

export function generateStaticParams() {
  return ['post-1','post-2','post-3','post-4','post-5','post-6','post-7','post-8']
    .map((postId) => ({ postId }));
}
