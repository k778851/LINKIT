'use client';
import { ClubEditPage } from '../../../../../views/club/ClubEditPage';

export default function Page({ params }) {
  return <ClubEditPage clubId={params.clubId} />;
}

export function generateStaticParams() {
  return [
    { clubId: 'club-1' },
    { clubId: 'club-2' },
    { clubId: 'club-3' },
    { clubId: 'club-4' },
    { clubId: 'club-5' },
    { clubId: 'club-6' },
  ];
}
