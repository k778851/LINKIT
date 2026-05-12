import { use } from 'react';
import { PostDetailPage } from '../../../../views/community/PostDetailPage';
import { STATIC_POST_IDS, LOCAL_POST_ROUTE_ID } from '../../../../lib/communityRoutes';

export default function Page({ params }) {
  const { postId } = use(params);
  return <PostDetailPage postId={postId} />;
}

export function generateStaticParams() {
  return [...STATIC_POST_IDS, LOCAL_POST_ROUTE_ID].map((postId) => ({ postId }));
}
