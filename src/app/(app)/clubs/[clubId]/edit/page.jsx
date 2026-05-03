import { use } from 'react';
import { ClubEditPage } from '../../../../../views/club/ClubEditPage';

export default function Page({ params }) {
  const { clubId } = use(params);
  return <ClubEditPage clubId={clubId} />;
}

export function generateStaticParams() {
  // 정적 빌드용 샘플 ID — 실제 서비스에서는 서버사이드 렌더링 권장
  return ['club-1','club-2','club-3','club-4','club-5','club-6'].map((clubId) => ({ clubId }));
}
