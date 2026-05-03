'use client';
import { useSearchParams } from 'next/navigation';
import { FollowListPage } from '../../../../views/mypage/FollowListPage';

export default function Page() {
  const params = useSearchParams();
  const userId = params.get('userId') ?? '';
  return <FollowListPage userId={userId} mode="following" />;
}
