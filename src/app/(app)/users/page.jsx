'use client';
import { useSearchParams } from 'next/navigation';
import { UserProfilePage } from '../../../views/mypage/UserProfilePage';

export default function Page() {
  const params = useSearchParams();
  const userId = params.get('userId') ?? '';
  return <UserProfilePage userId={userId} />;
}
