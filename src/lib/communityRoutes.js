export const STATIC_POST_IDS = [
  'post-1',
  'post-2',
  'post-3',
  'post-4',
  'post-5',
  'post-6',
  'post-7',
  'post-8',
];

export const LOCAL_POST_ROUTE_ID = 'post-local';

export function getPostLookupId(routePostId, queryPostId) {
  return routePostId === LOCAL_POST_ROUTE_ID && queryPostId ? queryPostId : routePostId;
}

export function getPostDetailPath(postId) {
  if (STATIC_POST_IDS.includes(postId)) return `/community/${postId}`;
  return `/community/${LOCAL_POST_ROUTE_ID}?postId=${encodeURIComponent(postId)}`;
}

export function getPostEditPath(postId) {
  if (STATIC_POST_IDS.includes(postId)) return `/community/${postId}/edit`;
  return `/community/${LOCAL_POST_ROUTE_ID}/edit?postId=${encodeURIComponent(postId)}`;
}
