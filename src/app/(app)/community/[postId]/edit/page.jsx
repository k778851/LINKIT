import { PostEditPage } from '../../../../../views/community/PostEditPage';

export default function Page({ params }) {
  return <PostEditPage postId={params.postId} />;
}

export function generateStaticParams() {
  return ['post-1','post-2','post-3','post-4','post-5','post-6','post-7','post-8']
    .map((postId) => ({ postId }));
}
