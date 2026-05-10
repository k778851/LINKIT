import { use } from 'react';
import { ClubDetailPage } from '../../../../views/club/ClubDetailPage';

export default function Page({ params }) {
  const { clubId } = use(params);
  return <ClubDetailPage clubId={clubId} />;
}

export function generateStaticParams() {
  return ['club-1','club-2','club-3','club-4','club-5','club-6'].map((clubId) => ({ clubId }));
}
