import { use } from 'react';
import { PostEditPage } from '../../../../../views/community/PostEditPage';
import { STATIC_POST_IDS, LOCAL_POST_ROUTE_ID } from '../../../../../lib/communityRoutes';

export default function Page({ params }) {
  const { postId } = use(params);
  return <PostEditPage postId={postId} />;
}

export function generateStaticParams() {
  return [...STATIC_POST_IDS, LOCAL_POST_ROUTE_ID].map((postId) => ({ postId }));
}
